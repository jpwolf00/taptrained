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
// Slugs + prices verified against the live OpenRouter /models list (Jun 2026).
// Re-check at https://openrouter.ai/models — slugs drift over time.
export const RECOMMENDED_MODELS: ModelInfo[] = [
  {
    id: "google/gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    vision: true,
    note: "Recommended default — cheapest vision ($0.10/$0.40 per M), fast",
  },
  {
    id: "qwen/qwen3.6-flash",
    label: "Qwen 3.6 Flash",
    vision: true,
    note: "Fast flash model with strong reasoning ($0.19/$1.13 per M); vision+JSON",
  },
  {
    id: "xiaomi/mimo-v2.5",
    label: "Xiaomi MiMo v2.5",
    vision: true,
    note: "Strong quality for the price ($0.14/$0.28 per M); 1M ctx, image+JSON",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o mini",
    vision: true,
    note: "Best enforced JSON output; solid vision ($0.15/$0.60 per M)",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    vision: true,
    note: "Stronger reasoning for question generation ($0.30/$2.50 per M)",
  },
  {
    id: "google/gemini-3-flash-preview",
    label: "Gemini 3 Flash (preview)",
    vision: true,
    note: "Newest Gemini flash; higher quality, pricier ($0.50/$3.00 per M)",
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct",
    label: "Llama 3.2 11B Vision",
    vision: true,
    note: "Cheap open vision option; JSON less reliable",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    vision: true,
    note: "Strongest of the cheap tier; priciest here ($1/$5 per M)",
  },
];

/** Fallback when nothing else is specified. */
export const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.5-flash-lite";

/** Used for menu-photo OCR/extraction. Must be a vision-capable model. */
export const VISION_MODEL =
  process.env.OPENROUTER_VISION_MODEL?.trim() || DEFAULT_MODEL;

export function isKnownVisionModel(id: string): boolean {
  return RECOMMENDED_MODELS.some((m) => m.id === id && m.vision);
}
