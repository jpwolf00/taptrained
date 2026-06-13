"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const QUIZ_SIZE = 6;

type RawQuestion = {
  id: string;
  category: "recall" | "selling" | "scenario";
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string;
  menu_item_id: string | null;
};

type Question = RawQuestion & { shuffled_correct: number; shuffled_choices: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleChoices(q: RawQuestion): Question {
  const order = shuffle(q.choices.map((_, i) => i));
  return {
    ...q,
    shuffled_choices: order.map((i) => q.choices[i]),
    shuffled_correct: order.indexOf(q.correct_index),
  };
}

function sampleQuiz(all: RawQuestion[], newItemIds: string[]): Question[] {
  const shuffled = shuffle(all);
  const newQ = shuffled.filter(
    (q) => q.menu_item_id && newItemIds.includes(q.menu_item_id)
  );
  const otherQ = shuffled.filter(
    (q) => !q.menu_item_id || !newItemIds.includes(q.menu_item_id)
  );

  const picked: RawQuestion[] = [...newQ.slice(0, Math.min(newQ.length, 2))];
  for (const cat of ["scenario", "selling", "recall"] as const) {
    const q = otherQ.find((x) => x.category === cat && !picked.includes(x));
    if (q && picked.length < QUIZ_SIZE) picked.push(q);
  }
  for (const q of otherQ) {
    if (picked.length >= QUIZ_SIZE) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return shuffle(picked).slice(0, QUIZ_SIZE).map(shuffleChoices);
}

const CATEGORY_LABEL: Record<RawQuestion["category"], string> = {
  recall: "Recall",
  selling: "Selling",
  scenario: "Scenario",
};

export function StaffQuiz({
  menuId,
  menuTitle,
  questions,
  newItemIds,
  profileId,
  venueId,
}: {
  menuId: string;
  menuTitle: string;
  questions: RawQuestion[];
  newItemIds: string[];
  profileId: string;
  venueId: string;
}) {
  const router = useRouter();
  const [quiz] = useState<Question[]>(() => sampleQuiz(questions, newItemIds));
  const [idx, setIdx] = useState(0);
  // Track selections in a ref so final score calculation is always accurate
  // (no async state flush issues when saving on the last question).
  const selectionsRef = useRef<(number | null)[]>(
    new Array(Math.min(QUIZ_SIZE, questions.length)).fill(null)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"quiz" | "done">("quiz");
  const [finalScore, setFinalScore] = useState(0);
  const [saving, setSaving] = useState(false);

  function computeScore(): number {
    return selectionsRef.current.reduce<number>(
      (acc, sel, i) => acc + (sel === quiz[i]?.shuffled_correct ? 1 : 0),
      0
    );
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    selectionsRef.current[idx] = i;
  }

  async function next() {
    const isLast = idx + 1 >= quiz.length;
    if (isLast) {
      const score = computeScore();
      setFinalScore(score);
      setSaving(true);
      const supabase = createClient();
      await supabase.from("quiz_attempts").insert({
        venue_id: venueId,
        menu_id: menuId,
        profile_id: profileId,
        mode: "quick",
        score,
        total: quiz.length,
      });
      setSaving(false);
      setPhase("done");
    } else {
      setIdx((n) => n + 1);
      setSelected(null);
    }
  }

  const current = quiz[idx];
  const pct = Math.round((finalScore / quiz.length) * 100);

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-2">
        <p className="text-sm uppercase tracking-widest text-muted">Session complete</p>

        {/* Score ring */}
        <div className="relative mt-5 flex h-36 w-36 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="var(--amber)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - finalScore / quiz.length)}`}
              className="transition-all duration-700"
            />
          </svg>
          <div>
            <p className="text-3xl font-bold text-amber">{pct}%</p>
            <p className="text-xs text-muted">{finalScore}/{quiz.length}</p>
          </div>
        </div>

        <p className="mt-4 font-semibold">
          {pct === 100
            ? "Perfect pour. Floor-ready! 🍺"
            : pct >= 83
            ? "Strong shift. One to brush up on."
            : pct >= 66
            ? "Good start. Keep at it."
            : "A few to review — you've got this."}
        </p>
        <p className="mt-1 text-sm text-muted">{menuTitle}</p>

        {saving && <p className="mt-3 text-xs text-muted animate-pulse">Saving…</p>}

        <button
          onClick={() => router.push("/staff")}
          disabled={saving}
          className="mt-8 w-full max-w-xs rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep transition disabled:opacity-50"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Question {idx + 1} of {quiz.length}</span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-amber">
            {CATEGORY_LABEL[current.category]}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-amber transition-all"
            style={{
              width: `${((idx + (selected !== null ? 1 : 0)) / quiz.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold leading-snug">{current.prompt}</h2>

      <div className="mt-4 flex flex-col gap-2.5">
        {current.shuffled_choices.map((c, i) => {
          const isCorrect = i === current.shuffled_correct;
          const isChosen = i === selected;
          let cls = "border-border bg-surface hover:border-amber/60";
          if (selected !== null) {
            if (isCorrect) cls = "border-hop bg-hop/15 text-foreground";
            else if (isChosen) cls = "border-red-500 bg-red-500/10 text-foreground";
            else cls = "border-border bg-surface opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition ${cls}`}
            >
              {c}
              {selected !== null && isCorrect && <span className="ml-2 text-hop">✓</span>}
              {selected !== null && isChosen && !isCorrect && (
                <span className="ml-2 text-red-400">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3.5">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-amber">
              {selected === current.shuffled_correct ? "Nice. " : "Good to know. "}
            </span>
            {current.explanation}
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={next}
          disabled={selected === null}
          className="w-full rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] transition enabled:hover:bg-amber-deep disabled:opacity-40"
        >
          {idx + 1 >= quiz.length ? "See result" : "Next question →"}
        </button>
      </div>
    </div>
  );
}
