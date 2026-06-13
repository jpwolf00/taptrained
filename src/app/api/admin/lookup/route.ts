import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatJSON } from "@/lib/ai/client";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

// Optional: set OPENROUTER_SEARCH_MODEL=perplexity/sonar in .env.local
// to use real-time web search instead of training-data knowledge.
const LOOKUP_MODEL =
  process.env.OPENROUTER_SEARCH_MODEL?.trim() ||
  process.env.OPENROUTER_MODEL?.trim() ||
  "google/gemini-2.5-flash-lite";

const BeerLookupSchema = z.object({
  style: z.string().nullable().optional(),
  abv: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  selling_points: z.string().nullable().optional(),
});

/** Strip HTML tags and collapse whitespace — good enough for POC page parsing. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Fetch a URL server-side and return cleaned plain text (max ~4000 chars). */
async function fetchPageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TapTrainedBot/1.0; beer staff training app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = stripHtml(html);
    // Keep first 4000 chars — enough to cover most beer pages
    return text.slice(0, 4000);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let beerName = "";
  let url = "";
  try {
    const body = await req.json();
    beerName = String(body?.beerName ?? "").trim();
    url = String(body?.url ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!beerName) {
    return NextResponse.json({ error: "beerName is required" }, { status: 400 });
  }

  // Build the prompt based on what we have
  let systemPrompt: string;
  let userContent: string;

  if (url) {
    // URL path: fetch the page and let AI extract from it
    const pageText = await fetchPageText(url);

    if (pageText) {
      systemPrompt =
        "You are a beer data extractor. Given text from a beer product page, " +
        "extract structured information about the specific beer. " +
        "Return ONLY valid JSON with keys: style, abv (number, e.g. 5.2), " +
        "description (1-2 sentences, flavour-focused), selling_points (one sentence, " +
        "what a bartender would say to sell it). Use null for any field you cannot " +
        "find on the page.";
      userContent = `Beer name: ${beerName}\n\nPage content:\n${pageText}`;
    } else {
      // URL fetch failed — fall back silently to AI knowledge
      url = "";
    }
  }

  if (!url) {
    // AI knowledge path (also Perplexity web search if OPENROUTER_SEARCH_MODEL is set)
    systemPrompt =
      "You are a beer expert. Return ONLY valid JSON with these keys about the named beer: " +
      "style (BJCP style name), abv (number, e.g. 5.2), " +
      "description (1-2 sentences on flavour and character), " +
      "selling_points (one sentence a bartender would use to sell it). " +
      "Use null for any field you are not confident about. " +
      "Do not invent details — if you don't know the beer, return all nulls.";
    userContent = `Beer: ${beerName}`;
  }

  try {
    const result = await chatJSON<z.infer<typeof BeerLookupSchema>>({
      model: LOOKUP_MODEL,
      system: systemPrompt!,
      user: userContent!,
      maxTokens: 512,
    });

    // If everything came back null, the model doesn't know this beer
    const hasData = Object.values(result).some((v) => v !== null && v !== undefined);
    if (!hasData) {
      return NextResponse.json(
        { error: `No data found for "${beerName}". Try pasting a URL to the beer's page.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      source: url ? "url" : "ai",
      model: LOOKUP_MODEL,
    });
  } catch (err) {
    console.error("lookup failed:", err);
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }
}
