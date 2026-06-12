import { NextResponse } from "next/server";
import { extractFromText, extractFromImage } from "@/lib/ai/extract";
import { generateQuestions } from "@/lib/ai/generate";
import { SAMPLE_ITEMS, SAMPLE_QUESTIONS } from "@/lib/ai/sample";
import { DEFAULT_MODEL, VISION_MODEL } from "@/lib/ai/config";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Demo endpoint — exercises the real extraction + generation pipeline with no
 * database. Accepts either pasted `menuText` or an `imageDataUrl` (a base64
 * data: URL of a menu photo). If OPENROUTER_API_KEY isn't set, returns the
 * canned sample so the UI is fully usable before keys are wired.
 */
export async function POST(req: Request) {
  let menuText = "";
  let imageDataUrl = "";
  try {
    const body = await req.json();
    menuText = typeof body?.menuText === "string" ? body.menuText : "";
    imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
  } catch {
    // ignore — treated as empty
  }

  const hasKey = !!process.env.OPENROUTER_API_KEY;

  if (!hasKey) {
    return NextResponse.json({
      live: false,
      model: null,
      source: imageDataUrl ? "photo" : "text",
      items: SAMPLE_ITEMS,
      questions: SAMPLE_QUESTIONS,
      note: "Sample mode — add OPENROUTER_API_KEY to .env.local to generate live from any menu (text or photo).",
    });
  }

  const usingPhoto = !!imageDataUrl;
  if (!usingPhoto && !menuText.trim()) {
    return NextResponse.json({ error: "Paste a menu or upload a photo first." }, { status: 400 });
  }

  try {
    const items = usingPhoto
      ? await extractFromImage(imageDataUrl)
      : await extractFromText(menuText);

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: usingPhoto
            ? "Couldn't read any beers from that photo. Try a clearer, better-lit shot."
            : "No beers found in that text. Try a clearer tap list.",
        },
        { status: 422 }
      );
    }
    const questions = await generateQuestions(items);
    return NextResponse.json({
      live: true,
      model: DEFAULT_MODEL, // model that wrote the questions
      visionModel: usingPhoto ? VISION_MODEL : null, // model that read the photo
      source: usingPhoto ? "photo" : "text",
      items,
      questions,
    });
  } catch (err) {
    console.error("demo pipeline failed:", err);
    return NextResponse.json(
      { error: "AI call failed. Check the model id and your OpenRouter key/credits." },
      { status: 502 }
    );
  }
}
