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
          Paste a menu. The AI extracts every beer and writes a short,
          recommendation-focused quiz — so your servers know the difference
          between a Hazy and a West Coast IPA, and which one to pour when a guest
          says &ldquo;something not too bitter.&rdquo;
        </p>

        <ul className="mt-7 flex flex-col gap-3 text-sm">
          {[
            ["🍻", "Trains real floor skills — recommending the right beer, not trivia"],
            ["🔄", "Flags new beers on rotating taps and quizzes staff on what's new"],
            ["📱", "Built for a quick check before shift or during downtime"],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-3">
              <span aria-hidden>{icon}</span>
              <span className="text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/demo"
          className="mt-9 rounded-xl bg-amber px-4 py-3.5 text-center font-semibold text-[#1a1209] transition hover:bg-amber-deep active:scale-[.99]"
        >
          Try the quiz demo →
        </Link>
        <p className="mt-3 text-center text-xs text-muted">
          No signup needed — runs on a sample tap list.
        </p>
      </div>
    </main>
  );
}
