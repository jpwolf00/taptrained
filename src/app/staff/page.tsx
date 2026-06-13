import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StaffHome() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, venue_id")
    .single();

  if (!profile) return null;

  // Current published menu
  const { data: menu } = await supabase
    .from("menus")
    .select(`
      id, title, published_at,
      menu_items ( id, is_new )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  const newCount = menu
    ? (menu.menu_items as { is_new: boolean }[]).filter((i) => i.is_new).length
    : 0;

  // Scoreboard: best score per staff per current menu
  const { data: scores } = menu
    ? await supabase
        .from("quiz_attempts")
        .select("profile_id, score, total, profiles(display_name)")
        .eq("menu_id", menu.id)
        .order("score", { ascending: false })
    : { data: [] };

  // Collapse to best score per person
  const bestByPerson = new Map<string, { name: string; score: number; total: number }>();
  for (const attempt of scores ?? []) {
    const profilesVal = attempt.profiles;
    const prof = Array.isArray(profilesVal) ? profilesVal[0] : profilesVal;
    const name = prof?.display_name ?? "Unknown";
    const existing = bestByPerson.get(attempt.profile_id);
    if (!existing || attempt.score > existing.score) {
      bestByPerson.set(attempt.profile_id, {
        name,
        score: attempt.score,
        total: attempt.total,
      });
    }
  }
  const scoreboard = [...bestByPerson.values()].sort((a, b) => b.score - a.score);

  // Has current user attempted the current menu?
  const myBest = profile ? bestByPerson.get(profile.id) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Hey, {profile.display_name} 👋
      </h1>

      {!menu ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">🕐</p>
          <p className="mt-3 font-semibold">No quiz yet</p>
          <p className="mt-1 text-sm text-muted">
            Your manager hasn&apos;t published a menu yet. Check back after your
            next briefing.
          </p>
        </div>
      ) : (
        <>
          {/* Current menu card */}
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Current tap list</p>
                <p className="mt-0.5 font-semibold">{menu.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {new Date(menu.published_at).toLocaleDateString()}
                </p>
              </div>
              {newCount > 0 && (
                <span className="rounded-full bg-amber/20 px-2.5 py-1 text-xs font-semibold text-amber">
                  {newCount} new 🆕
                </span>
              )}
            </div>

            <Link
              href={`/staff/quiz/${menu.id}`}
              className="mt-4 flex items-center justify-center rounded-xl bg-amber py-3.5 font-semibold text-[#1a1209] transition hover:bg-amber-deep"
            >
              {myBest ? "Retake quiz →" : "Start quiz →"}
            </Link>

            {myBest && (
              <p className="mt-2 text-center text-xs text-muted">
                Your best: {myBest.score}/{myBest.total}
              </p>
            )}
          </div>

          {/* Scoreboard */}
          {scoreboard.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                Scoreboard
              </h2>
              <div className="rounded-xl border border-border bg-surface divide-y divide-border">
                {scoreboard.map((s, rank) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm text-muted">
                        {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`}
                      </span>
                      <span
                        className={`font-medium ${
                          s.name === profile.display_name ? "text-amber" : ""
                        }`}
                      >
                        {s.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {s.score}/{s.total}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
