"use client";

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_MENU_TEXT } from "@/lib/ai/sample";
import type { MenuItem, Question } from "@/lib/ai/types";

type Phase = "edit" | "loading" | "quiz" | "done";

const QUIZ_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle a question's answer choices, keeping correct_index in sync. */
function shuffleChoices(q: Question): Question {
  const order = shuffle(q.choices.map((_, i) => i));
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    correct_index: order.indexOf(q.correct_index),
  };
}

/** Sample a short quiz with a spread across categories. */
function sampleQuiz(all: Question[]): Question[] {
  const byCat = shuffle(all);
  // Prefer at least one of each category, then fill to QUIZ_SIZE.
  const picked: Question[] = [];
  for (const cat of ["scenario", "selling", "recall"] as const) {
    const q = byCat.find((x) => x.category === cat && !picked.includes(x));
    if (q) picked.push(q);
  }
  for (const q of byCat) {
    if (picked.length >= QUIZ_SIZE) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return shuffle(picked).slice(0, QUIZ_SIZE).map(shuffleChoices);
}

const CATEGORY_LABEL: Record<Question["category"], string> = {
  recall: "Recall",
  selling: "Selling",
  scenario: "Scenario",
};

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>("edit");
  const [inputMode, setInputMode] = useState<"text" | "photo">("text");
  const [menuText, setMenuText] = useState(SAMPLE_MENU_TEXT);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [, setItems] = useState<MenuItem[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Question[]>([]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Downscale a chosen photo client-side (max 1400px, JPEG ~0.82) so the upload
  // stays small and well under request-body limits.
  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
      setImageDataUrl(canvas.toDataURL("image/jpeg", 0.82));
    } catch {
      setError("Couldn't read that image. Try another photo.");
    }
  }

  async function generate() {
    if (inputMode === "photo" && !imageDataUrl) {
      setError("Choose a menu photo first.");
      return;
    }
    setPhase("loading");
    setError(null);
    try {
      const payload =
        inputMode === "photo" ? { imageDataUrl } : { menuText };
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        setPhase("edit");
        return;
      }
      setItems(data.items ?? []);
      setLive(!!data.live);
      setNote(data.note ?? null);
      setAllQuestions(data.questions ?? []);
      const sampled = sampleQuiz(data.questions ?? []);
      if (sampled.length === 0) {
        setError("No questions were generated. Try a fuller menu.");
        setPhase("edit");
        return;
      }
      setQuiz(sampled);
      setIdx(0);
      setSelected(null);
      setScore(0);
      setPhase("quiz");
    } catch {
      setError("Network error. Is the dev server running?");
      setPhase("edit");
    }
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === quiz[idx].correct_index) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= quiz.length) {
      setPhase("done");
    } else {
      setIdx((n) => n + 1);
      setSelected(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-amber font-semibold tracking-tight">
          🍺 TapTrained
        </Link>
        {live !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              live ? "bg-hop/20 text-hop" : "bg-surface-2 text-muted"
            }`}
          >
            {live ? "live AI" : "sample mode"}
          </span>
        )}
      </header>

      {phase === "edit" && (
        <section className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Build a shift quiz</h1>
          <p className="mt-1 text-sm text-muted">
            Paste a tap list or snap a photo of the menu. The AI extracts the
            beers and writes a short, recommendation-focused quiz.
          </p>

          {/* Text / Photo toggle */}
          <div className="mt-4 flex rounded-xl border border-border bg-surface p-1 text-sm">
            {(["text", "photo"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setInputMode(m);
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2 font-medium capitalize transition ${
                  inputMode === m ? "bg-amber text-[#1a1209]" : "text-muted hover:text-foreground"
                }`}
              >
                {m === "text" ? "Paste text" : "Upload photo"}
              </button>
            ))}
          </div>

          {inputMode === "text" ? (
            <textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              rows={10}
              className="mt-3 w-full resize-none rounded-xl border border-border bg-surface p-3 font-mono text-sm leading-relaxed outline-none focus:border-amber"
            />
          ) : (
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center transition hover:border-amber/60">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                {imageDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageDataUrl}
                    alt="Selected menu"
                    className="max-h-64 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="mt-2 text-sm font-medium text-foreground">
                      Tap to take or choose a photo
                    </span>
                    <span className="mt-1 text-xs text-muted">
                      A clear, well-lit shot of the tap list works best
                    </span>
                  </>
                )}
              </label>
              {imageDataUrl && (
                <button
                  onClick={() => setImageDataUrl(null)}
                  className="mt-2 text-xs text-muted underline hover:text-foreground"
                >
                  Choose a different photo
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={generate}
            className="mt-4 rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] transition active:scale-[.99] hover:bg-amber-deep"
          >
            Generate quiz →
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            No key yet? You&apos;ll get a realistic sample quiz. Add an OpenRouter
            key to generate from any menu live.
          </p>
        </section>
      )}

      {phase === "loading" && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-amber" />
          <p className="mt-4 text-sm text-muted">Reading the menu and writing questions…</p>
        </section>
      )}

      {phase === "quiz" && quiz[idx] && (
        <section className="flex flex-1 flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Question {idx + 1} of {quiz.length}
              </span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-amber">
                {CATEGORY_LABEL[quiz[idx].category]}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: `${((idx + (selected !== null ? 1 : 0)) / quiz.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold leading-snug">{quiz[idx].prompt}</h2>

          <div className="mt-4 flex flex-col gap-2.5">
            {quiz[idx].choices.map((c, i) => {
              const isCorrect = i === quiz[idx].correct_index;
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
              <p className="text-sm leading-relaxed text-foreground">
                <span className="font-semibold text-amber">
                  {selected === quiz[idx].correct_index ? "Nice. " : "Good to know. "}
                </span>
                {quiz[idx].explanation}
              </p>
            </div>
          )}

          <div className="mt-auto pt-5">
            <button
              onClick={next}
              disabled={selected === null}
              className="w-full rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] transition active:scale-[.99] enabled:hover:bg-amber-deep disabled:opacity-40"
            >
              {idx + 1 >= quiz.length ? "See result" : "Next question →"}
            </button>
          </div>
        </section>
      )}

      {phase === "done" && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm uppercase tracking-wide text-muted">Quiz complete</p>
          <p className="mt-2 text-5xl font-bold text-amber">
            {score}/{quiz.length}
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            {score === quiz.length
              ? "Perfect pour. You're floor-ready."
              : score >= quiz.length - 1
              ? "Strong — one to brush up on before service."
              : "Good start — a couple more reps and you've got it."}
          </p>
          {note && <p className="mt-4 max-w-xs text-xs text-muted">{note}</p>}
          <div className="mt-8 flex w-full flex-col gap-2.5">
            <button
              onClick={() => {
                setQuiz(sampleQuiz(allQuestions));
                setIdx(0);
                setSelected(null);
                setScore(0);
                setPhase("quiz");
              }}
              className="rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep"
            >
              Retake
            </button>
            <button
              onClick={() => setPhase("edit")}
              className="rounded-xl border border-border px-4 py-3.5 font-medium text-foreground hover:border-amber/60"
            >
              Try another menu
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
