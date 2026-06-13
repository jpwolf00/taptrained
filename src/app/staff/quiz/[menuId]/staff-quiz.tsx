"use client";

import { useState } from "react";
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

  // Always include questions about new items first
  const newQ = shuffled.filter(
    (q) => q.menu_item_id && newItemIds.includes(q.menu_item_id)
  );
  const otherQ = shuffled.filter(
    (q) => !q.menu_item_id || !newItemIds.includes(q.menu_item_id)
  );

  // Fill: new arrivals up front, then one of each category, then fill to size
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
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "done">("quiz");
  const [saving, setSaving] = useState(false);

  async function saveScore(finalScore: number) {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("quiz_attempts").insert({
      venue_id: venueId,
      menu_id: menuId,
      profile_id: profileId,
      mode: "quick",
      score: finalScore,
      total: quiz.length,
    });
    setSaving(false);
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === quiz[idx].shuffled_correct) setScore((s) => s + 1);
  }

  async function next() {
    if (idx + 1 >= quiz.length) {
      const finalScore = score + (selected === quiz[idx].shuffled_correct ? 0 : 0);
      // score is already updated by choose()
      await saveScore(score + (selected === quiz[idx].shuffled_correct ? 1 : 0));
      setPhase("done");
    } else {
      setIdx((n) => n + 1);
      setSelected(null);
    }
  }

  const current = quiz[idx];

  if (phase === "done") {
    const finalScore = score;
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="text-sm uppercase tracking-wide text-muted">Quiz complete</p>
        <p className="mt-2 text-5xl font-bold text-amber">
          {finalScore}/{quiz.length}
        </p>
        <p className="mt-1 text-sm text-muted">{menuTitle}</p>
        <p className="mt-3 max-w-xs text-sm text-muted">
          {finalScore === quiz.length
            ? "Perfect pour. You're floor-ready."
            : finalScore >= quiz.length - 1
            ? "Strong — one to brush up on before service."
            : "Good start — a couple more reps and you've got it."}
        </p>
        {saving && <p className="mt-2 text-xs text-muted">Saving score…</p>}
        <div className="mt-8 flex w-full flex-col gap-2.5 max-w-xs">
          <button
            onClick={() => router.push("/staff")}
            className="rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep transition"
          >
            Back to scoreboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Question {idx + 1} of {quiz.length}
          </span>
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
