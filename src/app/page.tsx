import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-5 py-10">
      <div className="flex flex-1 flex-col justify-center">
        <span className="text-sm font-medium uppercase tracking-widest text-amber">
          🍺 TapTrained
        </span>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
          Turn your tap list into a{" "}
          <span className="text-amber">2-minute</span> staff quiz.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Paste a menu. The AI writes a short, recommendation-focused quiz so
          your staff know the difference between a Hazy and a West Coast IPA —
          and which one to pour when a guest says &ldquo;something not too
          bitter.&rdquo;
        </p>

        <ul className="mt-6 flex flex-col gap-3 text-sm">
          {[
            ["🍻", "Trains real floor skills — recommending beers, not trivia"],
            ["🔄", "Flags new arrivals and quizzes staff on what's changed"],
            ["🔥", "Daily streaks and team scoreboard keep habits alive"],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-3">
              <span aria-hidden>{icon}</span>
              <span className="text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/signup/admin"
            className="rounded-xl bg-amber px-4 py-3.5 text-center font-semibold text-[#1a1209] transition hover:bg-amber-deep active:scale-[.99]"
          >
            Set up your venue →
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border px-4 py-3.5 text-center font-semibold text-foreground transition hover:border-amber/60"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-muted">
          Have an invite code?{" "}
          <Link href="/signup/staff" className="text-amber underline">
            Join your team
          </Link>
        </p>

        {/* Demo as secondary option */}
        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            Just want to see it first?{" "}
            <Link href="/demo" className="text-amber underline">
              Try the demo →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
