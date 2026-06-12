/**
 * Guest-request taxonomy.
 *
 * Guests don't ask in BJCP terms — they say "something light", "a wheat beer",
 * "nothing too hoppy". The core floor skill is mapping that loose request to
 * what's ACTUALLY on tap, including adjacent styles (a "wheat beer" request is
 * satisfied by a Hefeweizen, a Witbier, an American Wheat, OR a wheat shandy),
 * and pitching it well.
 *
 * This drives the "selling" and "scenario" questions: at generation time we
 * compute which of these requests the current menu can satisfy and feed the
 * model concrete "guest asks X → recommend these beers" mappings, so questions
 * are correct and tied to the real tap list.
 *
 * `matches` values are style names from BEER_STYLES (src/lib/beer/styles.ts).
 */

import { BEER_STYLES, matchStyle, type BeerStyle } from "./styles";
import type { MenuItem } from "../ai/types";

export type GuestRequest = {
  /** Canonical label for the request. */
  request: string;
  /** Things a guest might actually say. */
  cues: string[];
  /** Style names that satisfy this request (a family, not one style). */
  matches: string[];
  /** How a server should bridge the request to a recommendation. */
  guidance: string;
};

export const GUEST_REQUESTS: GuestRequest[] = [
  {
    request: "Something light / easy-drinking",
    cues: ["something light", "light beer", "easy drinking", "not too heavy", "sessionable", "low alcohol"],
    matches: ["American Light Lager", "Kölsch", "Cream Ale", "Blonde Ale", "Helles", "Shandy / Radler"],
    guidance:
      "Lead with low-ABV, low-bitterness, crisp options. Confirm whether they mean light in body/flavor or low in alcohol — they often mean both.",
  },
  {
    request: "A wheat beer",
    cues: ["wheat beer", "hefe", "weissbier", "white beer", "wit"],
    matches: ["Hefeweizen", "Witbier", "Shandy / Radler"],
    guidance:
      "A 'wheat beer' request covers a family: classic Hefeweizen (banana/clove), spiced Belgian Witbier (orange/coriander), or a wheat-based shandy. Ask if they like it spiced or fruity to steer between them.",
  },
  {
    request: "Something hoppy",
    cues: ["something hoppy", "ipa", "hoppy", "bitter", "west coast"],
    matches: ["American Pale Ale", "American IPA", "Hazy IPA", "Double IPA"],
    guidance:
      "Gauge intensity: Pale Ale (gentle) → IPA → Double IPA (intense). Ask bitter-and-piney (West Coast) vs juicy-and-soft (Hazy) to nail the pick.",
  },
  {
    request: "Not too bitter / nothing hoppy",
    cues: ["not bitter", "no hops", "not hoppy", "hate ipas", "smooth"],
    matches: ["Hefeweizen", "Witbier", "Cream Ale", "Blonde Ale", "Amber Ale", "Brown Ale", "Stout", "Shandy / Radler"],
    guidance:
      "Steer away from IPAs toward malt- or wheat-forward beers. Reassure that dark beers like a Stout are roasty and smooth, not bitter.",
  },
  {
    request: "Something dark",
    cues: ["something dark", "dark beer", "stout", "porter", "roasty"],
    matches: ["Brown Ale", "Porter", "Stout", "Imperial Stout"],
    guidance:
      "Set expectations: dark doesn't mean heavy or high-alcohol. A dry Stout is lighter than it looks; an Imperial Stout is the big sipper.",
  },
  {
    request: "Something fruity",
    cues: ["fruity", "fruit beer", "something sweet", "juicy"],
    matches: ["Hefeweizen", "Witbier", "Hazy IPA", "Sour Ale", "Fruited / Pastry / Specialty", "Shandy / Radler"],
    guidance:
      "Distinguish fruit-flavored (fruited sour, fruit beer) from fruity-from-yeast/hops (Hefe banana, Hazy tropical). Check if they want actual sweetness or just fruity aroma.",
  },
  {
    request: "Something sour / tart",
    cues: ["sour", "tart", "gose", "funky"],
    matches: ["Sour Ale", "Fruited / Pastry / Specialty"],
    guidance:
      "Confirm sour-tolerance — offer a fruited/kettle sour as an approachable entry rather than a bracing one.",
  },
  {
    request: "Something strong",
    cues: ["something strong", "high abv", "boozy", "high alcohol", "strongest"],
    matches: ["Double IPA", "Imperial Stout", "Belgian Tripel", "Barleywine"],
    guidance:
      "Recommend the high-ABV pours but practice responsible service: mention strength, suggest a smaller pour, offer water. Note the Tripel hides its alcohol.",
  },
  {
    request: "Crisp / refreshing",
    cues: ["crisp", "refreshing", "thirst quenching", "clean"],
    matches: ["Pilsner", "Helles", "Kölsch", "American Light Lager", "Shandy / Radler"],
    guidance:
      "Lead with clean lagers and crisp golden ales; a Pilsner adds a hop snap if they want a little more character.",
  },
  {
    request: "Malty / smooth / amber",
    cues: ["malty", "smooth", "amber", "caramel", "red ale"],
    matches: ["Amber Ale", "Märzen", "Brown Ale", "Helles"],
    guidance:
      "Point to caramel/toasty malt-forward beers with low bitterness — a comfortable middle ground for mixed groups.",
  },
  {
    request: "I usually drink light domestics (Bud/Coors/Miller Light)",
    cues: ["bud light", "coors", "miller lite", "michelob", "domestic", "macro"],
    matches: ["American Light Lager", "Kölsch", "Cream Ale", "Blonde Ale", "Helles"],
    guidance:
      "Meet them where they are: start with our closest crisp, clean option, then offer a Kölsch or Cream Ale as a small step up — a gentle gateway, not a hard sell.",
  },
];

export type MatchedRequest = {
  request: GuestRequest;
  /** Menu items (by display name) on THIS menu that satisfy the request. */
  items: string[];
};

/**
 * For the given menu, return each guest request that at least one beer on the
 * menu can satisfy, with the matching beer names. Used to ground selling /
 * scenario questions in the actual tap list.
 */
export function matchableRequests(items: MenuItem[]): MatchedRequest[] {
  // Resolve each menu item to its canonical style once.
  const resolved: { name: string; style: BeerStyle | null }[] = items.map((it) => ({
    name: it.name,
    style: matchStyle(it.style),
  }));

  const out: MatchedRequest[] = [];
  for (const req of GUEST_REQUESTS) {
    const matchSet = new Set(req.matches);
    const hits = resolved.filter((r) => r.style && matchSet.has(r.style.name)).map((r) => r.name);
    if (hits.length > 0) out.push({ request: req, items: hits });
  }
  return out;
}

/** Render the matchable requests as a compact block for prompt injection. */
export function guestRequestBlock(matched: MatchedRequest[]): string {
  if (matched.length === 0) return "";
  return matched
    .map(
      (m) =>
        `- Guest asks: "${m.request.request}" → on this menu recommend: ${m.items.join(
          ", "
        )}.\n  Coaching: ${m.request.guidance}`
    )
    .join("\n");
}

// Exported so the styles list and request matches can be sanity-checked in tests.
export function unknownStyleNamesInRequests(): string[] {
  const known = new Set(BEER_STYLES.map((s) => s.name));
  const bad = new Set<string>();
  for (const r of GUEST_REQUESTS) for (const m of r.matches) if (!known.has(m)) bad.add(m);
  return [...bad];
}
