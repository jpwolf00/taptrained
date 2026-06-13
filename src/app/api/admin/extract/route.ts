import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFromText, extractFromImage } from "@/lib/ai/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let menuText = "";
  let imageDataUrl = "";
  try {
    const body = await req.json();
    menuText = typeof body?.menuText === "string" ? body.menuText : "";
    imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const items = imageDataUrl
      ? await extractFromImage(imageDataUrl)
      : await extractFromText(menuText);

    if (items.length === 0) {
      return NextResponse.json(
        { error: imageDataUrl
          ? "No beers found in that photo. Try a clearer, better-lit shot."
          : "No beers found in that text. Try a clearer tap list." },
        { status: 422 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("extract failed:", err);
    return NextResponse.json({ error: "AI extraction failed." }, { status: 502 });
  }
}
