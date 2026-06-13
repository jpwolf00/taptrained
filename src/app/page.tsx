import Link from "next/link";
import { PhoneFrame, BrowserFrame } from "@/components/marketing/frames";
import {
  StaffHomeScreen,
  QuizScreen,
  ResultScreen,
  AdminBuilderScreen,
} from "@/components/marketing/screens";

export const metadata = {
  title: "TapTrained — turn your tap list into a 2-minute staff quiz",
  description:
    "AI-built, recommendation-focused training for craft beer venues. Paste your menu, get a quiz that teaches staff what to pour when a guest says 'something not too bitter.' Streaks, scoreboards, and new-arrival detection keep the habit alive.",
};

/* ─────────────────────────────────────────────────────────────── */

export default function MarketingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <FeatureRecommend />
      <FeatureBuilder />
      <FeatureHabit />
      <HowItWorks />
      <FeatureGrid />
      <Screenshots />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ───────────────────────── Nav ───────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <span className="text-lg font-bold tracking-tight text-amber">
          🍺 TapTrained
        </span>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="#screens" className="transition hover:text-foreground">
            Screens
          </a>
          <Link href="/demo" className="transition hover:text-foreground">
            Live demo
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup/admin"
            className="rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-[#1a1209] transition hover:bg-amber-deep"
          >
            Set up your venue
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <section className="relative mkt-hero-glow">
      <div className="absolute inset-0 mkt-grid opacity-60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-8 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        {/* copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-hop" />
            Staff training built for craft beer
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Turn your tap list into a{" "}
            <span className="mkt-amber-text">2-minute</span> staff quiz.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Paste a menu or snap a photo. TapTrained writes a short,
            recommendation-focused quiz so your team knows the difference between
            a Hazy and a West Coast IPA — and exactly what to pour when a guest
            says <span className="text-foreground">&ldquo;something not too bitter.&rdquo;</span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup/admin"
              className="rounded-xl bg-amber px-6 py-3.5 text-center font-semibold text-[#1a1209] transition hover:bg-amber-deep active:scale-[.99]"
            >
              Set up your venue — free
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-border bg-surface/50 px-6 py-3.5 text-center font-semibold text-foreground transition hover:border-amber/60"
            >
              Try the live demo →
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            No credit card. Staff join with a single invite code.
          </p>
        </div>

        {/* hero device */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="mkt-float">
            <PhoneFrame>
              <StaffHomeScreen />
            </PhoneFrame>
          </div>
          {/* floating quiz card peeking behind */}
          <div className="absolute -left-2 bottom-6 hidden w-44 rotate-[-6deg] mkt-float-slow rounded-2xl border border-border mkt-card p-3 shadow-xl shadow-black/40 sm:block lg:-left-6">
            <p className="text-[10px] uppercase tracking-wide text-amber">Scenario</p>
            <p className="mt-1 text-xs font-medium leading-snug">
              &ldquo;Try something local&rdquo; — what&apos;s the smartest first
              pour?
            </p>
            <div className="mt-2 rounded-lg border border-hop bg-hop/15 px-2 py-1.5 text-[11px]">
              Field Day (Light Lager) <span className="text-hop">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Trust strip ───────────────────────── */

function TrustStrip() {
  const items = [
    ["~10s", "to generate a full quiz"],
    ["2 min", "per shift to stay sharp"],
    ["BJCP 2021", "style-grounded answers"],
    ["1 code", "for the whole team to join"],
  ];
  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-8 sm:grid-cols-4">
        {items.map(([big, small]) => (
          <div key={small} className="text-center">
            <p className="text-2xl font-bold text-amber sm:text-3xl">{big}</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Problem ───────────────────────── */

function ProblemSection() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 text-center">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Your menu changes every week. Your training doesn&apos;t.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        New taps roll on Tuesday. New hires start Friday. Most &ldquo;training&rdquo;
        is a laminated sheet and a shrug. Meanwhile the guest at table six just
        wants to know what to drink — and a confident recommendation is the
        difference between one pint and three.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["📋", "Static sheets go stale", "Printed notes are out of date the moment a keg blows."],
          ["🔁", "Constant turnover", "Every new server starts from zero with no easy way to ramp."],
          ["🤷", "“I’m not sure”", "The worst answer a guest can hear — and a lost upsell."],
        ].map(([icon, title, body]) => (
          <div key={title} className="rounded-2xl border border-border mkt-card p-5 text-left">
            <span className="text-2xl">{icon}</span>
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Feature rows ───────────────────────── */

function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  visual,
  reverse,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2">
      <div className={reverse ? "lg:order-2" : ""}>
        <span className="text-sm font-semibold uppercase tracking-widest text-amber">
          {eyebrow}
        </span>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>
        <ul className="mt-6 flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px]">
              <span className="mt-0.5 text-hop">✓</span>
              <span className="text-foreground/90">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`flex justify-center ${reverse ? "lg:order-1" : ""}`}>
        {visual}
      </div>
    </div>
  );
}

function FeatureRecommend() {
  return (
    <section id="features" className="border-t border-border">
      <FeatureRow
        eyebrow="Real floor skills"
        title={
          <>
            Trains recommendations,{" "}
            <span className="mkt-amber-text">not trivia.</span>
          </>
        }
        body="Every quiz mixes recall, selling, and real guest scenarios. Staff practice the exact conversations they have on the floor — translating what a guest says into the right pour, and explaining why."
        bullets={[
          "Scenario questions turn a vague request into the right beer and a confident pitch",
          "Selling questions: how to describe a beer to someone who's never heard of it",
          "Built-in responsible-service prompts on high-ABV pours",
          "Every answer comes with a one-line explanation staff can repeat to a guest",
        ]}
        visual={
          <PhoneFrame label="The staff quiz — a real guest scenario">
            <QuizScreen />
          </PhoneFrame>
        }
      />
    </section>
  );
}

function FeatureBuilder() {
  return (
    <section className="border-t border-border bg-surface/20">
      <FeatureRow
        reverse
        eyebrow="Zero busywork"
        title={
          <>
            Paste a menu. Get a quiz in{" "}
            <span className="mkt-amber-text">ten seconds.</span>
          </>
        }
        body="Type your tap list, paste it, or snap a photo of the chalkboard. TapTrained reads it, identifies each beer and style, fills in the details, and writes the whole question bank — grounded in real BJCP 2021 style data so answers are accurate."
        bullets={[
          "Photo OCR reads printed menus and chalkboards",
          "One click enriches every beer from your brewery's own pages",
          "New arrivals are auto-flagged and staff get quizzed on what changed",
          "Review and edit everything before you publish",
        ]}
        visual={
          <BrowserFrame
            url="taptrained.app/admin/menus/new"
            label="The manager builder — review before publishing"
          >
            <AdminBuilderScreen />
          </BrowserFrame>
        }
      />
    </section>
  );
}

function FeatureHabit() {
  return (
    <section className="border-t border-border">
      <FeatureRow
        eyebrow="Built to be a habit"
        title={
          <>
            Streaks and a scoreboard{" "}
            <span className="mkt-amber-text">that bring them back.</span>
          </>
        }
        body="One-and-done training doesn't stick. TapTrained borrows from fitness apps: a daily streak, a 7-day activity ring, and a friendly team scoreboard turn 'study the menu' into a 2-minute habit before every shift."
        bullets={[
          "Daily streaks that tolerate shift timing — open or close, you still count",
          "Personal history: sessions, average score, and trend over time",
          "Team scoreboard ranked by streak, sessions, and accuracy",
          "Progress saved per venue so managers can see who's floor-ready",
        ]}
        visual={
          <PhoneFrame label="Personal stats + team scoreboard">
            <StaffHomeScreen />
          </PhoneFrame>
        }
      />
    </section>
  );
}

/* ───────────────────────── How it works ───────────────────────── */

function HowItWorks() {
  const steps = [
    [
      "1",
      "Set up your venue",
      "Create an account in seconds. You get an invite code your whole team uses to join — no per-seat admin.",
    ],
    [
      "2",
      "Drop in your menu",
      "Paste your tap list or photograph the board. The AI extracts beers, styles, and ABVs and writes the quiz.",
    ],
    [
      "3",
      "Staff train in 2 minutes",
      "Servers open it on their phone before a shift, run a 6-question quiz, and build a streak. You watch the scoreboard.",
    ],
  ];
  return (
    <section id="how" className="border-t border-border bg-surface/20">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From tap list to floor-ready in minutes
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([n, title, body]) => (
            <div key={n} className="relative rounded-2xl border border-border mkt-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber text-lg font-bold text-[#1a1209]">
                {n}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Feature grid ───────────────────────── */

function FeatureGrid() {
  const features = [
    ["📸", "Photo + paste ingestion", "Read a chalkboard photo or pasted text — whatever's fastest for you."],
    ["🧠", "BJCP-grounded answers", "Questions and explanations are anchored to real 2021 style guidelines, not guesses."],
    ["🆕", "New-arrival detection", "Publish a new menu and TapTrained diffs it, flagging fresh taps and quizzing on them."],
    ["🔗", "Brewery URL enrichment", "Save your menu pages once; fill in every beer's details with one click."],
    ["🍷", "Guest-language mapping", "Vague requests like a “wheat beer” map to the right family of styles on your menu."],
    ["🔥", "Streaks & scoreboard", "Habit mechanics that keep staff coming back before every shift."],
    ["🏢", "Multi-venue ready", "Each location is its own tenant with its own menu, team, and stats."],
    ["📱", "Works on any phone", "No app to install. Staff open a link and train in the browser."],
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything in the box
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          A complete training loop for a craft beer floor — from menu in to
          floor-ready out.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([icon, title, body]) => (
          <div
            key={title}
            className="rounded-2xl border border-border mkt-card p-5 transition hover:border-amber/40"
          >
            <span className="text-2xl">{icon}</span>
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Screenshots gallery ───────────────────────── */

function Screenshots() {
  return (
    <section id="screens" className="border-t border-border bg-surface/20">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber">
            Take a look
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            The whole experience, in your pocket
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Built mobile-first for the floor, with a clean manager view for setup.
          </p>
        </div>
        <div className="mt-14 flex flex-wrap items-start justify-center gap-8">
          <PhoneFrame label="Home — streaks & scoreboard">
            <StaffHomeScreen />
          </PhoneFrame>
          <PhoneFrame label="Quiz — guest scenario">
            <QuizScreen />
          </PhoneFrame>
          <PhoneFrame label="Result — session score">
            <ResultScreen />
          </PhoneFrame>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <BrowserFrame
            url="taptrained.app/admin/menus/new"
            label="Manager — build a quiz from your menu"
          >
            <AdminBuilderScreen />
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */

function FinalCTA() {
  return (
    <section className="relative border-t border-border mkt-hero-glow">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your next shift could be your{" "}
          <span className="mkt-amber-text">best-trained one.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Set up your venue, drop in this week&apos;s menu, and send your team one
          invite code. They&apos;ll be recommending like regulars by the weekend.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup/admin"
            className="rounded-xl bg-amber px-7 py-4 font-semibold text-[#1a1209] transition hover:bg-amber-deep active:scale-[.99]"
          >
            Set up your venue — free
          </Link>
          <Link
            href="/demo"
            className="rounded-xl border border-border bg-surface/50 px-7 py-4 font-semibold text-foreground transition hover:border-amber/60"
          >
            Try the live demo first →
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          Already have an invite code?{" "}
          <Link href="/signup/staff" className="text-amber underline">
            Join your team
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <span className="text-lg font-bold tracking-tight text-amber">
            🍺 TapTrained
          </span>
          <p className="mt-1 text-sm text-muted">
            Recommendation-focused staff training for craft beer.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a href="#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition hover:text-foreground">
            Features
          </a>
          <Link href="/demo" className="transition hover:text-foreground">
            Demo
          </Link>
          <Link href="/login" className="transition hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} TapTrained · A proof-of-concept · Please
        drink responsibly.
      </div>
    </footer>
  );
}
