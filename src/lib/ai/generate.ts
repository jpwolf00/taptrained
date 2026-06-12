import { chatJSON } from "./client";
import { DEFAULT_MODEL } from "./config";
import { generationSystem, generationUserPayload } from "./prompts";
import { GenerationResultSchema, type MenuItem, type Question } from "./types";
import { matchStyle, styleFactBlock } from "../beer/styles";
import { matchableRequests, guestRequestBlock } from "../beer/guestRequests";

/**
 * Build the grounding fact block for the unique styles present on this menu,
 * pulled from the BJCP-grounded reference.
 */
function buildStyleFacts(items: MenuItem[]): string {
  const seen = new Set<string>();
  const blocks: string[] = [];
  for (const item of items) {
    const match = matchStyle(item.style);
    if (match && !seen.has(match.name)) {
      seen.add(match.name);
      blocks.push(styleFactBlock(match));
    }
  }
  return blocks.join("\n\n");
}

/**
 * Call 2 — Question generation. Bakes the reusable question bank from the
 * structured menu items. Run ONCE per menu at ingestion, never per quiz attempt.
 * `model` overrides the configured default.
 */
export async function generateQuestions(
  items: MenuItem[],
  model: string = DEFAULT_MODEL
): Promise<Question[]> {
  if (items.length === 0) return [];
  const styleFacts = buildStyleFacts(items);
  const guestRequests = guestRequestBlock(matchableRequests(items));
  const result = await chatJSON<unknown>({
    model,
    system: generationSystem(styleFacts, guestRequests),
    user: generationUserPayload(items),
    temperature: 0.5,
    maxTokens: 6000,
  });
  const parsed = GenerationResultSchema.parse(result);

  // Defensive cleanup: drop questions whose correct_index is out of range or
  // whose item_index points outside the menu.
  return parsed.questions.filter((q) => {
    if (q.correct_index < 0 || q.correct_index >= q.choices.length) return false;
    if (q.item_index !== null && (q.item_index < 0 || q.item_index >= items.length))
      return false;
    return true;
  });
}
