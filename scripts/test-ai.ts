/**
 * Smoke test for the OpenRouter AI pipeline — no database or UI needed.
 *
 * Usage:
 *   1. Put OPENROUTER_API_KEY (and optionally OPENROUTER_MODEL) in .env.local
 *   2. npm run test:ai
 *   3. Try other models:  OPENROUTER_MODEL=openai/gpt-4o-mini npm run test:ai
 *
 * It extracts beers from a sample menu, then generates the question bank, and
 * prints both so you can eyeball question quality across models.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { extractFromText } from "../src/lib/ai/extract";
import { generateQuestions } from "../src/lib/ai/generate";
import { DEFAULT_MODEL } from "../src/lib/ai/config";

const SAMPLE_MENU = `
TAP LIST — Week of Jun 9

1. Sunny Daze — Kölsch — 4.8% — crisp, light, German-style golden ale
2. Hazy Little Thing — Hazy IPA — 6.7% — juicy, tropical, low bitterness
3. Midnight Oil — Imperial Stout — 10.5% — barrel-aged, chocolate, vanilla
4. Field Day — American Light Lager — 4.2% — clean and easy
5. County Line — West Coast IPA — 7.0% — piney, resinous, bitter finish
`;

async function main() {
  console.log(`\n=== Model: ${DEFAULT_MODEL} ===\n`);

  console.log("1) Extracting menu items...");
  const items = await extractFromText(SAMPLE_MENU);
  console.log(JSON.stringify(items, null, 2));

  console.log(`\n2) Generating questions for ${items.length} beers...`);
  const questions = await generateQuestions(items);
  console.log(`Generated ${questions.length} questions.\n`);
  for (const q of questions) {
    const about = q.item_index === null ? "menu-wide" : items[q.item_index]?.name;
    console.log(`[${q.category}] (${about})`);
    console.log(`  Q: ${q.prompt}`);
    q.choices.forEach((c, i) => {
      console.log(`    ${i === q.correct_index ? "✓" : " "} ${c}`);
    });
    console.log(`  → ${q.explanation}\n`);
  }
}

main().catch((err) => {
  console.error("test:ai failed:", err);
  process.exit(1);
});
