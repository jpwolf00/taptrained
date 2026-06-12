/**
 * AI model configuration.
 *
 * Everything routes through OpenRouter (OpenAI-compatible API), so swapping
 * models is a slug change — no code edits. Three layers of control, most
 * specific wins:
 *   1. A `model` argument passed directly to extract()/generate()
 *   2. Env vars (OPENROUTER_MODEL / OPENROUTER_VISION_MODEL) — change in
 *      Vercel or .env.local and redeploy/restart
 *   3. The DEFAULT_MODEL fallback below
 *
 * RECOMMENDED_MODELS powers the admin "AI Settings" dropdown (added later) so
 * you can switch models live while testing, without touching env or code.
 */

export type ModelInfo = {
  id: string;
  label: string;
  vision: boolean;
  note?: string;
};

/**
 * Curated shortlist for the POC. Slugs are OpenRouter model ids — verify the
 * exact current slug/pricing at https://openrouter.ai/models before relying on
 * one. Add/remove freely; this list is just the picker, not a hard constraint.
 */
export const RECOMMENDED_MODELS: ModelInfo[] = [
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
    vision: true,
    note: "Recommended default — cheap, fast, native vision, generous free tier",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    vision: true,
    note: "Stronger reasoning for question generation; slightly pricier",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o mini",
    vision: true,
    note: "Best enforced JSON output; solid vision",
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct",
    label: "Llama 3.2 11B Vision",
    vision: true,
    note: "Cheapest vision option; JSON less reliable",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    label: "Claude 3.5 Haiku",
    vision: false,
    note: "Text-only here — fine for generation, not for photo extraction",
  },
];

/** Fallback when nothing else is specified. */
export const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.0-flash-001";

/** Used for menu-photo OCR/extraction. Must be a vision-capable model. */
export const VISION_MODEL =
  process.env.OPENROUTER_VISION_MODEL?.trim() || DEFAULT_MODEL;

export function isKnownVisionModel(id: string): boolean {
  return RECOMMENDED_MODELS.some((m) => m.id === id && m.vision);
}
