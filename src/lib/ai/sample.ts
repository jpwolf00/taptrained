import type { MenuItem, Question } from "./types";

/**
 * Canned extraction + question bank used by the /demo page when no
 * OPENROUTER_API_KEY is set, so the prototype is fully viewable before keys are
 * wired. The moment a key is present, the demo route runs the real pipeline
 * instead. These mirror what the live pipeline produces, including the
 * recommendation-focused scenario questions.
 */

export const SAMPLE_MENU_TEXT = `TAP LIST — Week of Jun 9

1. Sunny Daze — Kölsch — 4.8% — crisp, light, German-style golden ale
2. Hazy Little Thing — Hazy IPA — 6.7% — juicy, tropical, low bitterness
3. Field Day — American Light Lager — 4.2% — clean, crisp, easy-drinking
4. County Line — West Coast IPA — 7.0% — piney, resinous, firm bitter finish
5. Midnight Oil — Imperial Stout — 10.5% — barrel-aged, chocolate, vanilla`;

export const SAMPLE_ITEMS: MenuItem[] = [
  { name: "Sunny Daze", style: "Kölsch", abv: 4.8, description: "Crisp, light, German-style golden ale", selling_points: "Easy gateway for light-lager drinkers" },
  { name: "Hazy Little Thing", style: "Hazy IPA", abv: 6.7, description: "Juicy, tropical, low bitterness", selling_points: "Approachable IPA — fruity, not bitter" },
  { name: "Field Day", style: "American Light Lager", abv: 4.2, description: "Clean, crisp, easy-drinking", selling_points: "Familiar and refreshing" },
  { name: "County Line", style: "West Coast IPA", abv: 7.0, description: "Piney, resinous, firm bitter finish", selling_points: "For the hop lover" },
  { name: "Midnight Oil", style: "Imperial Stout", abv: 10.5, description: "Barrel-aged, chocolate, vanilla", selling_points: "Big, decadent nightcap sipper" },
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    item_index: 1,
    category: "scenario",
    prompt: "A guest says they normally drink Bud Light but want to 'try something local.' Which is the smartest first pour?",
    choices: ["County Line (West Coast IPA)", "Field Day (American Light Lager)", "Midnight Oil (Imperial Stout)", "A flight of all five"],
    correct_index: 1,
    explanation: "Meet them where they are: Field Day is the closest crisp, clean step from a light domestic. Pitch it as familiar but local, then offer the Kölsch as a small step up.",
  },
  {
    item_index: null,
    category: "scenario",
    prompt: "A guest asks for 'a wheat beer' but we don't have a Hefeweizen on tap right now. Best move?",
    choices: ["Tell them we have nothing like that", "Offer the Hazy Little Thing — it's hazy so it's basically a wheat beer", "Acknowledge the request and offer the closest soft, fruity option while explaining the difference", "Recommend the Imperial Stout"],
    correct_index: 2,
    explanation: "A 'wheat beer' request is about a soft, approachable, often fruity profile. Don't mislabel a Hazy IPA as a wheat beer — instead steer to the closest fit and explain it honestly so the guest trusts you.",
  },
  {
    item_index: 1,
    category: "recall",
    prompt: "What best describes the Hazy Little Thing (Hazy IPA) to a guest worried about bitterness?",
    choices: ["Very bitter and piney", "Juicy and tropical with low bitterness", "Dark and roasty", "Sour and tart"],
    correct_index: 1,
    explanation: "Hazy IPAs are soft and juicy with low bitterness — the perfect 'IPA for people who think they don't like IPAs.'",
  },
  {
    item_index: 4,
    category: "scenario",
    prompt: "A guest wants the Midnight Oil (Imperial Stout, 10.5%) as their third pint. What's the responsible-service move?",
    choices: ["Pour a full pint, no comment", "Mention it's 10.5%, suggest a smaller pour, and offer water", "Refuse and suggest water only", "Upsell them a second one"],
    correct_index: 1,
    explanation: "At 10.5% this is nearly double a session beer. Flag the strength, offer a smaller pour, and bring water — good service and responsible service at once.",
  },
  {
    item_index: 3,
    category: "selling",
    prompt: "A guest loves bold, bitter, piney IPAs. Which do you pour and how do you pitch it?",
    choices: ["County Line — 'classic West Coast: piney, resinous, with a firm bitter finish'", "Sunny Daze — 'light and crisp'", "Field Day — 'clean and easy'", "Midnight Oil — 'chocolate and vanilla'"],
    correct_index: 0,
    explanation: "County Line is the West Coast IPA — lead with the piney, resinous, firm-bitter description that a hop lover is looking for.",
  },
  {
    item_index: 0,
    category: "recall",
    prompt: "The Sunny Daze is a Kölsch. What's the one-line description for a guest?",
    choices: ["Dark, roasty, and full-bodied", "Crisp, light, German-style golden ale", "Sour and fruity", "Hoppy and bitter"],
    correct_index: 1,
    explanation: "A Kölsch is a delicate, crisp golden ale — a great bridge for light-lager drinkers ready to try craft.",
  },
  {
    item_index: null,
    category: "scenario",
    prompt: "Two guests: one wants 'something light,' the other 'something dark.' Quickest correct pair?",
    choices: ["County Line + Hazy Little Thing", "Field Day + Midnight Oil", "Sunny Daze + Field Day", "Midnight Oil + County Line"],
    correct_index: 1,
    explanation: "Field Day (light lager) answers 'something light'; Midnight Oil (Imperial Stout) answers 'something dark.' Reading both requests at once keeps the table moving.",
  },
];
