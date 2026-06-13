/**
 * Pixel-faithful recreations of the real TapTrained app screens, populated with
 * the canned demo content (the same beers and questions the live /demo uses).
 * These are presentational only — used as "screenshots" on the marketing page.
 */

/* ───────────────────────── Staff home ───────────────────────── */

const SEVEN_DAYS = [
  { d: "Th", done: true },
  { d: "Fr", done: true },
  { d: "Sa", done: false },
  { d: "Su", done: true },
  { d: "Mo", done: true },
  { d: "Tu", done: true },
  { d: "We", done: true, today: true },
];

const RECENT = [
  { label: "Today", time: "4:12 PM", score: "6/6", pct: 100 },
  { label: "Yesterday", time: "3:48 PM", score: "5/6", pct: 83 },
  { label: "Jun 10", time: "5:01 PM", score: "5/6", pct: 83 },
];

const TEAM = [
  { rank: "🥇", name: "Maya R.", me: true, streak: 5, sessions: 12, avg: 88 },
  { rank: "🥈", name: "Diego S.", streak: 4, sessions: 9, avg: 84 },
  { rank: "🥉", name: "Priya N.", streak: 3, sessions: 8, avg: 91 },
  { rank: "4.", name: "Sam W.", streak: 1, sessions: 5, avg: 72 },
];

export function StaffHomeScreen() {
  return (
    <div className="flex flex-col gap-4 text-foreground">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Maya R.</h1>
        {/* stat cards */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <Stat big="🔥 5" small="day streak" amber />
          <Stat big="12" small="sessions" />
          <Stat big="88%" small="avg score" />
        </div>
        {/* 7-day strip */}
        <div className="mt-2.5 flex justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
          {SEVEN_DAYS.map((x) => (
            <div key={x.d} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  x.done
                    ? "bg-amber font-bold text-[#1a1209]"
                    : x.today
                    ? "border-2 border-amber/40 text-muted"
                    : "bg-surface-2 text-muted/40"
                }`}
              >
                {x.done ? "✓" : "·"}
              </div>
              <p
                className={`text-[9px] ${
                  x.today ? "font-medium text-amber" : "text-muted"
                }`}
              >
                {x.d}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* now on tap */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Now on tap
            </p>
            <p className="mt-0.5 text-sm font-semibold">Tap List — Week of Jun 9</p>
          </div>
          <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-semibold text-amber">
            2 new 🆕
          </span>
        </div>
        <div className="mt-3 flex items-center justify-center rounded-lg bg-amber py-2.5 text-sm font-semibold text-[#1a1209]">
          Go again →
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted">
          ✓ Trained today — nice work
        </p>
      </div>

      {/* team scoreboard */}
      <div>
        <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Team — Tap List Wk of Jun 9
        </h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wide text-muted">
            <span>Name</span>
            <span className="text-right">🔥</span>
            <span className="text-right">Done</span>
            <span className="text-right">Avg</span>
          </div>
          {TEAM.map((t) => (
            <div
              key={t.name}
              className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2 ${
                t.me ? "bg-amber/5" : ""
              }`}
            >
              <span className="flex items-center gap-1.5 truncate text-xs">
                <span className="w-4 shrink-0 text-muted">{t.rank}</span>
                <span className={`truncate font-medium ${t.me ? "text-amber" : ""}`}>
                  {t.name}
                  {t.me && (
                    <span className="ml-1 text-[10px] font-normal text-muted">
                      (you)
                    </span>
                  )}
                </span>
              </span>
              <span className="text-right text-xs">🔥 {t.streak}</span>
              <span className="text-right text-xs text-muted">{t.sessions}</span>
              <span className="text-right text-xs font-semibold">{t.avg}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  big,
  small,
  amber,
}: {
  big: string;
  small: string;
  amber?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-2.5 text-center">
      <p className={`text-xl font-bold ${amber ? "text-amber" : "text-foreground"}`}>
        {big}
      </p>
      <p className="mt-0.5 text-[10px] text-muted">{small}</p>
    </div>
  );
}

/* ───────────────────────── Quiz (answered scenario) ───────────────────────── */

export function QuizScreen() {
  const choices = [
    { t: "County Line (West Coast IPA)" },
    { t: "Field Day (American Light Lager)", correct: true },
    { t: "Midnight Oil (Imperial Stout)" },
    { t: "A flight of all five" },
  ];
  return (
    <div className="flex flex-col text-foreground">
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>Question 2 of 6</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-amber">
            Scenario
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full w-1/3 bg-amber" />
        </div>
      </div>

      <h2 className="text-[15px] font-semibold leading-snug">
        A guest says they normally drink Bud Light but want to &ldquo;try
        something local.&rdquo; Which is the smartest first pour?
      </h2>

      <div className="mt-3 flex flex-col gap-2">
        {choices.map((c) => (
          <div
            key={c.t}
            className={`rounded-xl border px-3 py-2.5 text-[13px] leading-snug ${
              c.correct
                ? "border-hop bg-hop/15"
                : "border-border bg-surface opacity-60"
            }`}
          >
            {c.t}
            {c.correct && <span className="ml-1.5 text-hop">✓</span>}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
        <p className="text-[12px] leading-relaxed">
          <span className="font-semibold text-amber">Nice. </span>
          Meet them where they are: Field Day is the closest crisp, clean step
          from a light domestic. Pitch it as familiar but local, then offer the
          Kölsch as a small step up.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center rounded-xl bg-amber py-2.5 text-sm font-semibold text-[#1a1209]">
        Next question →
      </div>
    </div>
  );
}

/* ───────────────────────── Quiz result (score ring) ───────────────────────── */

export function ResultScreen() {
  const pct = 83;
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-foreground">
      <p className="text-[11px] uppercase tracking-widest text-muted">
        Session complete
      </p>
      <div className="relative mt-4 flex h-32 w-32 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
          />
        </svg>
        <div>
          <p className="text-3xl font-bold text-amber">{pct}%</p>
          <p className="text-[11px] text-muted">5/6</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold">Strong shift. One to brush up on.</p>
      <p className="mt-1 text-xs text-muted">Tap List — Week of Jun 9</p>
      <div className="mt-6 w-44 rounded-xl bg-amber py-2.5 text-center text-sm font-semibold text-[#1a1209]">
        Back to home
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber">
        <span>🔥</span>
        <span>Streak extended to 5 days</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Admin menu builder (review step) ───────────────────────── */

const REVIEW_BEERS = [
  { name: "Sunny Daze", style: "Kölsch", abv: "4.8%" },
  { name: "Hazy Little Thing", style: "Hazy IPA", abv: "6.7%", isNew: true },
  { name: "Field Day", style: "American Light Lager", abv: "4.2%" },
  { name: "County Line", style: "West Coast IPA", abv: "7.0%" },
  { name: "Midnight Oil", style: "Imperial Stout", abv: "10.5%", isNew: true },
];

export function AdminBuilderScreen() {
  return (
    <div className="text-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Review extracted beers</h2>
          <p className="mt-0.5 text-sm text-muted">
            5 beers found · 2 new arrivals flagged. Edit anything, then generate.
          </p>
        </div>
        <span className="rounded-full bg-hop/15 px-3 py-1 text-xs font-medium text-hop">
          ✓ Read from photo
        </span>
      </div>

      {/* enrich chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">⚡ Fill all details from:</span>
        {["Our tap menu", "New arrivals"].map((c) => (
          <span
            key={c}
            className="rounded-full border border-amber/40 bg-amber/10 px-3 py-1 text-xs font-medium text-amber"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {REVIEW_BEERS.map((b) => (
          <div
            key={b.name}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="truncate">{b.name}</span>
                {b.isNew && (
                  <span className="rounded-full bg-amber/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                    NEW
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted">{b.style}</p>
            </div>
            <span className="shrink-0 font-mono text-sm text-amber">{b.abv}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-amber py-3 text-center text-sm font-semibold text-[#1a1209]">
          Generate quiz from these 5 beers →
        </div>
        <div className="rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted">
          + Add beer
        </div>
      </div>
      <p className="mt-2.5 text-center text-xs text-muted">
        Grounded in BJCP 2021 style data · ~10 seconds · recommendation-focused
      </p>
    </div>
  );
}
