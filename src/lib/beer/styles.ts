/**
 * Condensed beer-style reference, grounded in the BJCP 2021 Style Guidelines
 * (https://www.bjcp.org/style/2021/) plus common service knowledge.
 *
 * This is the POC's "source of truth" beyond the menu itself. At question
 * generation time we look up the menu item's `style`, find the closest entry
 * here, and inject its facts into the prompt — so recall answers (ABV, IBU,
 * flavor), substitution suggestions, and pairings trace to a real reference
 * instead of being invented by the model.
 *
 * BJCP guidelines are copyrighted by the BJCP and freely available; fine for a
 * POC. Review licensing before commercial use. Extend this list freely — it is
 * deliberately editable.
 */

export type BeerStyle = {
  /** Canonical style name. */
  name: string;
  /** Lowercased aliases / partial names a menu might use, for fuzzy matching. */
  aliases: string[];
  /** Typical alcohol-by-volume range, % (BJCP). */
  abv: [number, number];
  /** Typical bitterness range, IBU (BJCP). null = not a meaningful axis. */
  ibu: [number, number] | null;
  /** One-line "what it tastes like" in guest-friendly language. */
  profile: string;
  /** Short descriptor keywords a server might use. */
  descriptors: string[];
  /** Styles to suggest as a step toward / away from this one. */
  similarTo: string[];
  /** Good food pairings. */
  pairings: string[];
  /** Service / responsible-service note where relevant. */
  serving?: string;
};

export const BEER_STYLES: BeerStyle[] = [
  {
    name: "American Light Lager",
    aliases: ["light lager", "light domestic", "american lager", "macro lager"],
    abv: [3.5, 4.5],
    ibu: [8, 12],
    profile: "Crisp, clean, very light-bodied and easy-drinking with little hop or malt character.",
    descriptors: ["crisp", "clean", "refreshing", "easy"],
    similarTo: ["Kölsch", "Cream Ale", "Helles"],
    pairings: ["wings", "burgers", "pretzels"],
  },
  {
    name: "Kölsch",
    aliases: ["kolsch", "koelsch"],
    abv: [4.4, 5.2],
    ibu: [18, 30],
    profile: "Delicate, crisp golden ale — soft maltiness with a subtle fruity note and dry finish.",
    descriptors: ["crisp", "delicate", "golden", "soft"],
    similarTo: ["American Light Lager", "Cream Ale", "Helles"],
    pairings: ["salads", "grilled chicken", "fish"],
  },
  {
    name: "Cream Ale",
    aliases: ["cream ale"],
    abv: [4.2, 5.6],
    ibu: [8, 20],
    profile: "Smooth, mild and well-balanced — a gentle gateway from light lagers into craft.",
    descriptors: ["smooth", "mild", "balanced", "approachable"],
    similarTo: ["American Light Lager", "Kölsch", "Blonde Ale"],
    pairings: ["burgers", "fried foods", "mild cheeses"],
  },
  {
    name: "Helles",
    aliases: ["helles", "munich helles", "pale lager"],
    abv: [4.7, 5.4],
    ibu: [16, 22],
    profile: "Malt-forward but clean German lager — soft bready sweetness, gentle bitterness.",
    descriptors: ["bready", "clean", "smooth", "malty"],
    similarTo: ["Kölsch", "American Light Lager", "Pilsner"],
    pairings: ["pretzels", "sausage", "roast chicken"],
  },
  {
    name: "Pilsner",
    aliases: ["pilsner", "pils", "czech pilsner", "german pilsner"],
    abv: [4.2, 5.8],
    ibu: [25, 45],
    profile: "Crisp golden lager with a noticeable floral/spicy hop snap and dry, bitter finish.",
    descriptors: ["crisp", "hoppy", "dry", "floral"],
    similarTo: ["Helles", "Kölsch", "Pale Ale"],
    pairings: ["shellfish", "salads", "spicy food"],
  },
  {
    name: "Blonde Ale",
    aliases: ["blonde", "golden ale"],
    abv: [3.8, 5.5],
    ibu: [15, 28],
    profile: "Easygoing, lightly malty ale with a touch of hop — a crowd-pleasing entry craft beer.",
    descriptors: ["easy", "balanced", "light", "approachable"],
    similarTo: ["Cream Ale", "Kölsch", "Pale Ale"],
    pairings: ["salads", "chicken", "light pasta"],
  },
  {
    name: "American Pale Ale",
    aliases: ["pale ale", "apa"],
    abv: [4.5, 6.2],
    ibu: [30, 50],
    profile: "Balanced but hop-leaning — citrus/pine hop character over a moderate malt backbone.",
    descriptors: ["citrusy", "hoppy", "balanced", "piney"],
    similarTo: ["IPA", "Pilsner", "Amber Ale"],
    pairings: ["burgers", "tacos", "sharp cheddar"],
  },
  {
    name: "American IPA",
    aliases: ["ipa", "india pale ale", "west coast ipa"],
    abv: [5.5, 7.5],
    ibu: [40, 70],
    profile: "Bold and hop-forward — assertive citrus, pine and resin with a firm bitter finish.",
    descriptors: ["hoppy", "bitter", "citrusy", "resinous"],
    similarTo: ["American Pale Ale", "Hazy IPA", "Double IPA"],
    pairings: ["spicy food", "burgers", "carrot cake"],
    serving: "Moderately strong — pace heavier than a light lager.",
  },
  {
    name: "Hazy IPA",
    aliases: ["hazy ipa", "neipa", "new england ipa", "juicy ipa"],
    abv: [6.0, 7.5],
    ibu: [25, 60],
    profile: "Soft, juicy and low-bitterness — pillowy mouthfeel bursting with tropical/citrus fruit.",
    descriptors: ["juicy", "tropical", "soft", "low-bitterness"],
    similarTo: ["American IPA", "American Pale Ale", "Double IPA"],
    pairings: ["fried chicken", "fish tacos", "mango salsa"],
    serving: "Drinks 'easy' but is strong — easy to under-estimate the ABV.",
  },
  {
    name: "Double IPA",
    aliases: ["double ipa", "dipa", "imperial ipa"],
    abv: [7.5, 10.0],
    ibu: [60, 100],
    profile: "Big, intense hop bomb with elevated alcohol — concentrated bitterness and fruit.",
    descriptors: ["intense", "boozy", "very hoppy", "bitter"],
    similarTo: ["American IPA", "Hazy IPA"],
    pairings: ["blue cheese", "rich BBQ", "carrot cake"],
    serving: "High ABV — a responsible-service flag; offer water, watch pacing.",
  },
  {
    name: "Amber Ale",
    aliases: ["amber", "amber ale", "red ale"],
    abv: [4.5, 6.2],
    ibu: [25, 40],
    profile: "Malt-forward and caramel-toasty with a balancing hop bite; smooth and sessionable.",
    descriptors: ["caramel", "toasty", "smooth", "malty"],
    similarTo: ["Pale Ale", "Brown Ale", "Märzen"],
    pairings: ["burgers", "grilled meats", "pizza"],
  },
  {
    name: "Märzen",
    aliases: ["marzen", "oktoberfest", "festbier"],
    abv: [5.6, 6.3],
    ibu: [18, 24],
    profile: "Rich, bready-toasty amber lager — smooth malt sweetness, clean lager finish.",
    descriptors: ["toasty", "bready", "smooth", "malty"],
    similarTo: ["Amber Ale", "Helles", "Brown Ale"],
    pairings: ["sausage", "roast pork", "pretzels"],
  },
  {
    name: "Brown Ale",
    aliases: ["brown ale", "nut brown"],
    abv: [4.2, 6.2],
    ibu: [20, 30],
    profile: "Nutty, chocolatey and malt-driven with low bitterness — cozy and easy-drinking.",
    descriptors: ["nutty", "chocolatey", "malty", "smooth"],
    similarTo: ["Amber Ale", "Porter", "Märzen"],
    pairings: ["roast chicken", "sausages", "nutty cheeses"],
  },
  {
    name: "Porter",
    aliases: ["porter", "robust porter"],
    abv: [4.8, 6.5],
    ibu: [25, 50],
    profile: "Dark and roasty with chocolate and coffee notes; fuller body but still drinkable.",
    descriptors: ["roasty", "chocolate", "coffee", "smooth"],
    similarTo: ["Brown Ale", "Stout"],
    pairings: ["BBQ", "chocolate dessert", "smoked meats"],
  },
  {
    name: "Stout",
    aliases: ["stout", "dry stout", "irish stout"],
    abv: [4.0, 5.5],
    ibu: [25, 45],
    profile: "Roasty and creamy with coffee and dark-chocolate notes; lighter-bodied than it looks.",
    descriptors: ["roasty", "creamy", "coffee", "dry"],
    similarTo: ["Porter", "Oatmeal Stout"],
    pairings: ["oysters", "chocolate", "beef stew"],
  },
  {
    name: "Imperial Stout",
    aliases: ["imperial stout", "russian imperial stout", "pastry stout"],
    abv: [8.0, 12.0],
    ibu: [50, 90],
    profile: "Huge, viscous and intense — dark chocolate, roast, dark fruit and warming alcohol.",
    descriptors: ["intense", "boozy", "rich", "roasty"],
    similarTo: ["Stout", "Porter", "Barleywine"],
    pairings: ["chocolate cake", "blue cheese", "vanilla ice cream"],
    serving: "Very high ABV — strong responsible-service flag; often a sipper/smaller pour.",
  },
  {
    name: "Hefeweizen",
    aliases: ["hefeweizen", "hefe", "wheat beer", "weissbier"],
    abv: [4.3, 5.6],
    ibu: [8, 15],
    profile: "Cloudy wheat ale with signature banana-and-clove yeast character; soft and refreshing.",
    descriptors: ["banana", "clove", "cloudy", "refreshing"],
    similarTo: ["Witbier", "Blonde Ale"],
    pairings: ["brunch", "salads", "light seafood"],
  },
  {
    name: "Witbier",
    aliases: ["witbier", "wit", "belgian white"],
    abv: [4.5, 5.5],
    ibu: [8, 20],
    profile: "Belgian wheat ale spiced with coriander and orange peel; bright, zesty and light.",
    descriptors: ["citrusy", "spiced", "zesty", "light"],
    similarTo: ["Hefeweizen", "Blonde Ale"],
    pairings: ["mussels", "salads", "ceviche"],
  },
  {
    name: "Saison",
    aliases: ["saison", "farmhouse ale"],
    abv: [3.5, 9.0],
    ibu: [20, 35],
    profile: "Dry, peppery and fruity Belgian farmhouse ale — effervescent and complex.",
    descriptors: ["peppery", "dry", "fruity", "effervescent"],
    similarTo: ["Witbier", "Belgian Pale Ale"],
    pairings: ["roast chicken", "soft cheese", "charcuterie"],
  },
  {
    name: "Sour Ale",
    aliases: ["sour", "kettle sour", "gose", "berliner weisse", "fruited sour"],
    abv: [3.5, 6.0],
    ibu: [3, 12],
    profile: "Tart and refreshing, often fruited; bracing acidity with low bitterness.",
    descriptors: ["tart", "fruity", "refreshing", "acidic"],
    similarTo: ["Witbier", "Fruit Beer"],
    pairings: ["goat cheese", "salads", "fruit desserts"],
  },
  {
    name: "Belgian Tripel",
    aliases: ["tripel", "belgian tripel"],
    abv: [7.5, 9.5],
    ibu: [20, 40],
    profile: "Golden, deceptively strong Belgian ale — spicy, fruity, with a dangerously smooth finish.",
    descriptors: ["spicy", "fruity", "strong", "smooth"],
    similarTo: ["Saison", "Belgian Pale Ale", "Double IPA"],
    pairings: ["mussels", "roast pork", "creamy cheese"],
    serving: "High ABV that hides well — responsible-service flag.",
  },
  {
    name: "Barleywine",
    aliases: ["barleywine", "barley wine"],
    abv: [8.0, 12.0],
    ibu: [35, 100],
    profile: "Rich, malty and warming with caramel, dark fruit and big alcohol; a sipping beer.",
    descriptors: ["rich", "boozy", "caramel", "warming"],
    similarTo: ["Imperial Stout", "Double IPA"],
    pairings: ["aged cheese", "rich desserts", "nuts"],
    serving: "Very high ABV — sipper, small pour, responsible-service flag.",
  },
  {
    name: "Shandy / Radler",
    aliases: ["shandy", "radler", "wheat shandy", "lemon shandy"],
    abv: [2.0, 4.5],
    ibu: [5, 15],
    profile: "Beer (often wheat or lager) blended with lemonade, citrus or soda — light, sweet-tart and very refreshing.",
    descriptors: ["citrusy", "refreshing", "light", "sweet-tart"],
    similarTo: ["Hefeweizen", "Witbier", "American Light Lager"],
    pairings: ["brunch", "salads", "patio/warm-weather"],
    serving: "Low ABV and approachable — a strong pick for non-beer-drinkers and hot days.",
  },
  {
    name: "Fruited / Pastry / Specialty",
    aliases: ["fruit beer", "pastry", "milkshake", "smoothie sour", "specialty"],
    abv: [4.0, 8.0],
    ibu: [5, 30],
    profile: "Dessert-leaning or fruit-forward beers built around adjuncts (fruit, lactose, vanilla).",
    descriptors: ["fruity", "sweet", "dessert", "rich"],
    similarTo: ["Sour Ale", "Hazy IPA", "Imperial Stout"],
    pairings: ["desserts", "brunch", "cheesecake"],
  },
];

/** Lowercase, strip punctuation, collapse whitespace. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Find the best-matching style entry for a free-text style string from a menu.
 * Returns null if nothing reasonable matches (caller can fall back to model
 * general knowledge).
 */
export function matchStyle(styleText: string | null | undefined): BeerStyle | null {
  if (!styleText) return null;
  const q = norm(styleText);
  if (!q) return null;

  // Exact name / alias hit.
  for (const s of BEER_STYLES) {
    if (norm(s.name) === q) return s;
    if (s.aliases.some((a) => norm(a) === q)) return s;
  }
  // Substring / token-overlap scoring.
  let best: { style: BeerStyle; score: number } | null = null;
  for (const s of BEER_STYLES) {
    const candidates = [s.name, ...s.aliases].map(norm);
    let score = 0;
    for (const c of candidates) {
      if (q.includes(c) || c.includes(q)) score = Math.max(score, c.length);
      const overlap = c.split(" ").filter((t) => t.length > 2 && q.includes(t)).length;
      score = Math.max(score, overlap * 3);
    }
    if (score > 0 && (!best || score > best.score)) best = { style: s, score };
  }
  return best?.style ?? null;
}

/** Render a style entry as a compact fact block for prompt injection. */
export function styleFactBlock(s: BeerStyle): string {
  const ibu = s.ibu ? `${s.ibu[0]}–${s.ibu[1]} IBU` : "n/a";
  return [
    `Style: ${s.name}`,
    `Typical ABV: ${s.abv[0]}–${s.abv[1]}%  |  Bitterness: ${ibu}`,
    `Profile: ${s.profile}`,
    `Descriptors: ${s.descriptors.join(", ")}`,
    `Similar styles (for substitutions): ${s.similarTo.join(", ")}`,
    `Food pairings: ${s.pairings.join(", ")}`,
    s.serving ? `Service note: ${s.serving}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
