"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MenuItem } from "@/lib/ai/types";

type Step = "input" | "extracting" | "review" | "generating" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
shuffle; // keep lint happy — used in quiz, not here

export default function NewMenuPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<"text" | "photo">("text");
  const [menuText, setMenuText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

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

  async function extract() {
    if (!title.trim()) {
      setError("Give this menu a title first.");
      return;
    }
    if (inputMode === "photo" && !imageDataUrl) {
      setError("Choose a menu photo first.");
      return;
    }
    if (inputMode === "text" && !menuText.trim()) {
      setError("Paste your tap list first.");
      return;
    }
    setError(null);
    setStep("extracting");

    const payload = inputMode === "photo" ? { imageDataUrl } : { menuText };
    const res = await fetch("/api/admin/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error ?? "Extraction failed.");
      setStep("input");
      return;
    }
    setItems(data.items);
    setStep("review");
  }

  function updateItem(index: number, field: keyof MenuItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "abv" ? parseFloat(value) || 0 : value } : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function generate() {
    if (items.length === 0) {
      setError("You need at least one beer to generate questions.");
      return;
    }
    setError(null);
    setStep("generating");

    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sourceType: inputMode,
        rawInput: inputMode === "text" ? menuText : "(photo upload)",
        items,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error ?? "Generation failed.");
      setStep("review");
      return;
    }
    setMenuId(data.menuId);
    setStep("done");
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-muted hover:text-foreground text-sm transition">
          ← Menus
        </Link>
        <span className="text-border">|</span>
        <h1 className="text-lg font-bold">New menu</h1>
      </div>

      {/* ── Step 1: Input ─────────────────────────────────────────── */}
      {step === "input" && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Menu title</label>
            <input
              type="text"
              placeholder="e.g. Week of June 16"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-amber"
            />
          </div>

          <div className="flex rounded-xl border border-border bg-surface p-1 text-sm">
            {(["text", "photo"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setInputMode(m); setError(null); }}
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
              placeholder="Paste your tap list here — beer names, styles, ABV…"
              className="w-full resize-none rounded-xl border border-border bg-surface p-3 font-mono text-sm leading-relaxed outline-none focus:border-amber"
            />
          ) : (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center transition hover:border-amber/60">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageDataUrl} alt="Menu" className="max-h-64 rounded-lg object-contain" />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="mt-2 text-sm font-medium">Tap to take or choose a photo</span>
                    <span className="mt-1 text-xs text-muted">A clear, well-lit shot works best</span>
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={extract}
            className="rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep transition"
          >
            Extract beers →
          </button>
        </div>
      )}

      {/* ── Step 2: Extracting ────────────────────────────────────── */}
      {step === "extracting" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-amber" />
          <p className="mt-4 text-sm text-muted">Reading the menu…</p>
        </div>
      )}

      {/* ── Step 3: Review items ──────────────────────────────────── */}
      {step === "review" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{items.length} beers extracted</h2>
            <p className="text-xs text-muted">Edit or remove anything that looks wrong.</p>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2">
                      <label className="mb-0.5 block text-xs text-muted">Name</label>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm outline-none focus:border-amber"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted">Style</label>
                      <input
                        value={item.style}
                        onChange={(e) => updateItem(i, "style", e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm outline-none focus:border-amber"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted">ABV %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.abv ?? ""}
                        onChange={(e) => updateItem(i, "abv", e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm outline-none focus:border-amber"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-0.5 block text-xs text-muted">Description</label>
                      <input
                        value={item.description ?? ""}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm outline-none focus:border-amber"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="mt-1 text-muted hover:text-red-400 transition text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setStep("input")}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted hover:text-foreground hover:border-amber/60 transition"
            >
              ← Re-upload
            </button>
            <button
              onClick={generate}
              className="flex-[2] rounded-xl bg-amber px-4 py-3 font-semibold text-[#1a1209] hover:bg-amber-deep transition"
            >
              Generate questions →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Generating ───────────────────────────────────── */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-amber" />
          <p className="mt-4 text-sm text-muted">Writing quiz questions…</p>
          <p className="mt-1 text-xs text-muted">Usually takes about 10 seconds</p>
        </div>
      )}

      {/* ── Step 5: Done ─────────────────────────────────────────── */}
      {step === "done" && menuId && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-3 text-xl font-bold">Questions ready!</h2>
          <p className="mt-2 text-sm text-muted max-w-xs">
            Review the questions, edit anything you want, then publish to make
            it live for your staff.
          </p>
          <button
            onClick={() => router.push(`/admin/menus/${menuId}`)}
            className="mt-6 rounded-xl bg-amber px-6 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep transition"
          >
            Review &amp; publish →
          </button>
        </div>
      )}
    </div>
  );
}
