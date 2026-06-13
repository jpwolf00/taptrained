import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  calcStreak,
  calcAvgPct,
  trainedOnDay,
  lastSevenDays,
  shortDay,
} from "@/lib/stats";

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
    .select("id, title, published_at, menu_items(id, is_new)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  const newCount = menu
    ? (menu.menu_items as { is_new: boolean }[]).filter((i) => i.is_new).length
    : 0;

  // All MY attempts, ever (for streak + history)
  const { data: myAttempts } = await supabase
    .from("quiz_attempts")
    .select("score, total, completed_at, menu_id")
    .eq("profile_id", profile.id)
    .order("completed_at", { ascending: false });

  const attempts = myAttempts ?? [];
  const streak = calcStreak(attempts);
  const avgPct = calcAvgPct(attempts);
  const days = lastSevenDays(); // [today, yesterday, …]
  const trainedToday = trainedOnDay(attempts, days[0]);

  // All attempts for the current menu — for the team scoreboard
  const { data: teamAttempts } = menu
    ? await supabase
        .from("quiz_attempts")
        .select("profile_id, score, total, completed_at, profiles(display_name)")
        .eq("menu_id", menu.id)
        .order("completed_at", { ascending: false })
    : { data: [] };

  // Build scoreboard: per person → { completions, avgPct, streak, lastSeen }
  type PersonStats = {
    name: string;
    completions: number;
    avgPct: number;
    streak: number;
    isMe: boolean;
  };
  const personMap = new Map<string, { name: string; attempts: { score: number; total: number; completed_at: string }[] }>();

  for (const row of teamAttempts ?? []) {
    const profilesVal = row.profiles;
    const prof = Array.isArray(profilesVal) ? profilesVal[0] : profilesVal;
    const name = prof?.display_name ?? "Unknown";
    if (!personMap.has(row.profile_id)) {
      personMap.set(row.profile_id, { name, attempts: [] });
    }
    personMap.get(row.profile_id)!.attempts.push({
      score: row.score,
      total: row.total,
      completed_at: row.completed_at,
    });
  }

  const scoreboard: PersonStats[] = [...personMap.entries()]
    .map(([pid, { name, attempts: pa }]) => ({
      name,
      completions: pa.length,
      avgPct: calcAvgPct(pa),
      streak: calcStreak(pa),
      isMe: pid === profile.id,
    }))
    // Sort: streak desc → completions desc → avgPct desc
    .sort(
      (a, b) =>
        b.streak - a.streak ||
        b.completions - a.completions ||
        b.avgPct - a.avgPct
    );

  return (
    <div className="flex flex-col gap-6">

      {/* ── Personal stats ─────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {profile.display_name}
        </h1>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-bold text-amber">
              {streak > 0 ? `🔥 ${streak}` : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {streak === 1 ? "day streak" : streak > 1 ? "day streak" : "No streak"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{attempts.length}</p>
            <p className="mt-0.5 text-xs text-muted">
              {attempts.length === 1 ? "session" : "sessions"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {attempts.length ? `${avgPct}%` : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted">avg score</p>
          </div>
        </div>

        {/* 7-day activity strip */}
        <div className="mt-3 flex justify-between rounded-xl border border-border bg-surface px-4 py-3">
          {[...days].reverse().map((d) => {
            const done = trainedOnDay(attempts, d);
            const isToday = d === days[0];
            return (
              <div key={d} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
                    ${done
                      ? "bg-amber text-[#1a1209] font-bold"
                      : isToday
                      ? "border-2 border-amber/40 text-muted"
                      : "bg-surface-2 text-muted/40"
                    }`}
                >
                  {done ? "✓" : "·"}
                </div>
                <p className={`text-[10px] ${isToday ? "text-amber font-medium" : "text-muted"}`}>
                  {shortDay(d)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Current quiz ───────────────────────────────────────── */}
      {!menu ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-3xl">🕐</p>
          <p className="mt-2 font-semibold">No quiz yet</p>
          <p className="mt-1 text-sm text-muted">
            Your manager hasn&apos;t published a menu yet.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Now on tap</p>
              <p className="mt-0.5 font-semibold">{menu.title}</p>
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
            {trainedToday ? "Go again →" : "Start quiz →"}
          </Link>
          {trainedToday && (
            <p className="mt-2 text-center text-xs text-muted">
              ✓ Trained today — nice work
            </p>
          )}
        </div>
      )}

      {/* ── Recent sessions ────────────────────────────────────── */}
      {attempts.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Recent sessions
          </h2>
          <div className="rounded-xl border border-border bg-surface divide-y divide-border">
            {attempts.slice(0, 7).map((a, i) => {
              const pct = Math.round((a.score / a.total) * 100);
              const date = new Date(a.completed_at);
              const isToday =
                date.toLocaleDateString("en-CA") === days[0];
              const isYesterday =
                date.toLocaleDateString("en-CA") === days[1];
              const label = isToday
                ? "Today"
                : isYesterday
                ? "Yesterday"
                : date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted">
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        pct === 100
                          ? "text-hop"
                          : pct >= 66
                          ? "text-amber"
                          : "text-muted"
                      }`}
                    >
                      {a.score}/{a.total}
                    </span>
                    <span className="text-xs text-muted">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Team scoreboard ────────────────────────────────────── */}
      {scoreboard.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Team — {menu?.title ?? "current menu"}
          </h2>
          <div className="rounded-xl border border-border bg-surface divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              <span>Name</span>
              <span className="text-right">Streak</span>
              <span className="text-right">Sessions</span>
              <span className="text-right">Avg</span>
            </div>
            {scoreboard.map((s, rank) => (
              <div
                key={s.name}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 ${
                  s.isMe ? "bg-amber/5" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-muted w-4 shrink-0">
                    {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`}
                  </span>
                  <span
                    className={`text-sm font-medium truncate ${
                      s.isMe ? "text-amber" : ""
                    }`}
                  >
                    {s.name}
                    {s.isMe && <span className="ml-1 text-xs font-normal text-muted">(you)</span>}
                  </span>
                </div>
                <span className="text-sm text-right">
                  {s.streak > 0 ? `🔥 ${s.streak}` : "—"}
                </span>
                <span className="text-sm text-right text-muted">{s.completions}</span>
                <span className="text-sm font-semibold text-right">{s.avgPct}%</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
