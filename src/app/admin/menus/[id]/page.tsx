import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublishButton } from "./publish-button";

type Props = { params: Promise<{ id: string }> };

export default async function MenuReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: menu, error } = await supabase
    .from("menus")
    .select(`
      id, title, status, published_at, source_type,
      menu_items ( id, name, style, abv, description, selling_points, is_new ),
      questions ( id, category, prompt, choices, correct_index, explanation, menu_item_id )
    `)
    .eq("id", id)
    .single();

  if (error || !menu) notFound();

  const items = menu.menu_items ?? [];
  const questions = (menu.questions ?? []).sort(
    (a: { category: string }, b: { category: string }) => a.category.localeCompare(b.category)
  );

  const counts = {
    recall: questions.filter((q: { category: string }) => q.category === "recall").length,
    selling: questions.filter((q: { category: string }) => q.category === "selling").length,
    scenario: questions.filter((q: { category: string }) => q.category === "scenario").length,
  };

  async function publishAction() {
    "use server";
    const sb = await createClient(true);
    const { error } = await sb.rpc("publish_menu", { p_menu_id: id });
    if (error) throw error;
    redirect(`/admin/menus/${id}`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-muted hover:text-foreground text-sm transition">
          ← Menus
        </Link>
        <span className="text-border">|</span>
        <h1 className="text-lg font-bold truncate">{menu.title}</h1>
        <span
          className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${
            menu.status === "published"
              ? "bg-hop/20 text-hop"
              : "bg-surface-2 text-muted"
          }`}
        >
          {menu.status}
        </span>
      </div>

      {/* Beer list */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {items.length} beers
        </h2>
        <div className="rounded-xl border border-border bg-surface divide-y divide-border">
          {items.map((item: { id: string; name: string; style: string; abv: number | null; is_new: boolean }) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-xs text-muted">{item.style}</span>
                {item.abv && <span className="ml-1 text-xs text-muted">{item.abv}%</span>}
              </div>
              {item.is_new && (
                <span className="rounded-full bg-amber/20 px-2 py-0.5 text-xs font-medium text-amber">
                  new
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Question counts */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {questions.length} questions
        </h2>
        <div className="mb-3 flex gap-2 text-xs">
          {(["scenario", "selling", "recall"] as const).map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-muted capitalize"
            >
              {counts[cat]} {cat}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {questions.map((q: {
            id: string;
            category: string;
            prompt: string;
            choices: string[];
            correct_index: number;
            explanation: string;
          }) => (
            <div key={q.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-amber capitalize">
                  {q.category}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{q.prompt}</p>
              <ul className="mt-2 space-y-1">
                {q.choices.map((c: string, i: number) => (
                  <li
                    key={i}
                    className={`text-xs px-3 py-1.5 rounded-lg ${
                      i === q.correct_index
                        ? "bg-hop/10 text-hop font-medium"
                        : "text-muted"
                    }`}
                  >
                    {i === q.correct_index ? "✓ " : "  "}{c}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted italic">{q.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Publish */}
      {menu.status === "draft" && (
        <div className="sticky bottom-4">
          <PublishButton action={publishAction} />
        </div>
      )}

      {menu.status === "published" && (
        <div className="rounded-xl border border-hop/30 bg-hop/5 p-4 text-center text-sm text-muted">
          Published {new Date(menu.published_at).toLocaleDateString()} · Staff can take this quiz now.
          <div className="mt-3">
            <Link
              href="/admin/menus/new"
              className="inline-block rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-[#1a1209] hover:bg-amber-deep transition"
            >
              Upload next tap list →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
