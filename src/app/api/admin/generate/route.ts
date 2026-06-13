import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateQuestions } from "@/lib/ai/generate";
import type { MenuItem } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Auth + role check via RLS client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, venue_id")
    .single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let title = "";
  let sourceType: "text" | "photo" = "text";
  let rawInput = "";
  let items: MenuItem[] = [];
  try {
    const body = await req.json();
    title = String(body?.title ?? "").trim();
    sourceType = body?.sourceType === "photo" ? "photo" : "text";
    rawInput = String(body?.rawInput ?? "");
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!title || items.length === 0) {
    return NextResponse.json({ error: "title and items are required" }, { status: 400 });
  }

  try {
    // Generate questions
    const questions = await generateQuestions(items);

    // Persist using service client (bypasses RLS for insert)
    const svc = createServiceClient();

    // 1. Create menu
    const { data: menu, error: menuErr } = await svc
      .from("menus")
      .insert({
        venue_id: profile.venue_id,
        title,
        source_type: sourceType,
        raw_input: rawInput,
        status: "draft",
      })
      .select("id")
      .single();
    if (menuErr || !menu) throw menuErr ?? new Error("Failed to create menu");

    // 2. Insert menu items
    const { data: savedItems, error: itemsErr } = await svc
      .from("menu_items")
      .insert(
        items.map((item) => ({
          menu_id: menu.id,
          name: item.name,
          style: item.style,
          abv: item.abv,
          description: item.description ?? "",
          selling_points: item.selling_points ?? "",
        }))
      )
      .select("id");
    if (itemsErr || !savedItems) throw itemsErr ?? new Error("Failed to save items");

    // 3. Insert questions — map item_index back to saved item ids
    const { error: qErr } = await svc.from("questions").insert(
      questions.map((q) => ({
        menu_id: menu.id,
        menu_item_id:
          q.item_index !== null && savedItems[q.item_index]
            ? savedItems[q.item_index].id
            : null,
        category: q.category,
        prompt: q.prompt,
        choices: q.choices,
        correct_index: q.correct_index,
        explanation: q.explanation,
      }))
    );
    if (qErr) throw qErr;

    return NextResponse.json({ menuId: menu.id, questionCount: questions.length });
  } catch (err) {
    console.error("generate/save failed:", err);
    return NextResponse.json({ error: "Failed to generate or save questions." }, { status: 502 });
  }
}
