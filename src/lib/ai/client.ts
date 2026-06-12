import OpenAI from "openai";

/**
 * OpenRouter client. OpenRouter speaks the OpenAI Chat Completions API, so we
 * use the official `openai` SDK pointed at OpenRouter's base URL. The key never
 * leaves the server — this module must only be imported from server code
 * (API routes / server actions).
 */
export function getOpenRouter(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local (dev) and Vercel (prod)."
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      // OpenRouter uses these for its dashboard/rankings; harmless if unset.
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "TapTrained",
    },
  });
}

/**
 * Run a chat completion that must return a single JSON object, and parse it
 * defensively. Handles the common failure modes (markdown fences, leading
 * prose, trailing commentary) before giving up.
 */
export async function chatJSON<T>(opts: {
  model: string;
  system: string;
  user: OpenAI.Chat.Completions.ChatCompletionContentPart[] | string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const client = getOpenRouter();
  const userContent =
    typeof opts.user === "string"
      ? opts.user
      : opts.user; // array form supports image parts for vision

  const completion = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return parseJsonLoose<T>(raw);
}

/** Best-effort JSON extraction from a model response. */
export function parseJsonLoose<T>(raw: string): T {
  const text = raw.trim();
  // 1. Straight parse.
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through
  }
  // 2. Strip ```json ... ``` fences.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as T;
    } catch {
      // fall through
    }
  }
  // 3. Grab the outermost {...} or [...] span.
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start =
    firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr);
  if (start !== -1) {
    const open = text[start];
    const close = open === "{" ? "}" : "]";
    const end = text.lastIndexOf(close);
    if (end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        // fall through
      }
    }
  }
  throw new Error(
    `Model did not return valid JSON. First 300 chars: ${text.slice(0, 300)}`
  );
}
