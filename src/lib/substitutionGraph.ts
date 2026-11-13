/**
 * Africa-first ingredient substitution graph.
 * Client-side bootstrap for pantry matching, cook-mode popovers, and pantry modal
 * when the DB `ingredient_substitutions` table is thin or unavailable.
 */

export type Authenticity = "high" | "medium" | "low";

export interface SubstitutionSuggestion {
  name: string;
  ratio: string;
  notes: string;
  reason: string;
  regions: string[];
  flavorRole: string;
  authenticity: Authenticity;
  compatibilityScore: number;
  source: "graph";
}

interface SubstitutionEdgeDef {
  /** Canonical / common name of the original ingredient */
  from: string;
  /** Local-language and spelling aliases for `from` */
  fromAliases?: string[];
  /** Substitute ingredient name */
  to: string;
  /** Aliases for the substitute (improves pantry reverse matching) */
  toAliases?: string[];
  /** Quantity multiplier: substitute_qty ≈ original_qty * ratio */
  ratio?: number;
  reason: string;
  notes?: string;
  regions?: string[];
  flavorRole?: string;
  authenticity?: Authenticity;
  compatibilityScore?: number;
  /** When true, also index to→from with the same metadata */
  bidirectional?: boolean;
}

/** Seed edges — African staples + practical diaspora swaps with flavor notes. */
export const SUBSTITUTION_EDGE_DEFS: SubstitutionEdgeDef[] = [
  // Leafy greens
  {
    from: "ugwu",
    fromAliases: ["ugu", "fluted pumpkin", "fluted pumpkin leaves", "pumpkin leaves"],
    to: "spinach",
    toAliases: ["baby spinach", "english spinach"],
    reason: "Similar soft leafy texture for soups and stews",
    notes: "Spinach wilts faster — add near the end; milder than ugwu.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 88,
    bidirectional: true,
  },
  {
    from: "ugwu",
    fromAliases: ["ugu", "fluted pumpkin leaves"],
    to: "kale",
    toAliases: ["curly kale", "tuscan kale"],
    reason: "Sturdier green with comparable body in egusi / vegetable soups",
    notes: "Strip stems and chop fine; cook a bit longer than ugwu.",
    regions: ["Nigeria", "Diaspora"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 82,
  },
  {
    from: "sukuma wiki",
    fromAliases: ["sukuma", "sukumawiki", "collard greens kenya"],
    to: "collard greens",
    toAliases: ["collards", "collard"],
    reason: "Same brassica family; classic East African sukuma swap abroad",
    notes: "Slice thin ribbons; longer simmer softens bitterness.",
    regions: ["Kenya", "Tanzania", "Uganda", "East Africa"],
    flavorRole: "leafy green",
    authenticity: "high",
    compatibilityScore: 95,
    bidirectional: true,
  },
  {
    from: "sukuma wiki",
    fromAliases: ["sukuma", "sukumawiki"],
    to: "kale",
    reason: "Widely available brassica; works in ugali + greens plates",
    notes: "Slightly sweeter; reduce cook time vs mature sukuma.",
    regions: ["East Africa", "Diaspora"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 86,
  },
  {
    from: "bitterleaf",
    fromAliases: ["bitter leaf", "onugbu", "ewuro"],
    to: "kale",
    reason: "Bitter green body for soups when onugbu is scarce",
    notes: "Won't match true bitterleaf bite — add a pinch of bitter herbs if available.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "bitter leafy",
    authenticity: "low",
    compatibilityScore: 62,
  },
  {
    from: "morogo",
    fromAliases: ["amaranth leaves", "imifino", "african spinach"],
    to: "spinach",
    reason: "Soft cooked green for Southern African relish dishes",
    notes: "Spinach is milder; season boldly with onion and tomato.",
    regions: ["South Africa", "Southern Africa"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 80,
    bidirectional: true,
  },
  {
    from: "molokhia",
    fromAliases: ["mulukhiyah", "jute leaf", "egyptian spinach"],
    to: "spinach",
    reason: "Viscous green stew filler when jute leaf is unavailable",
    notes: "Texture won't be as mucilaginous; okra can help thicken.",
    regions: ["Egypt", "North Africa", "Sudan"],
    flavorRole: "leafy green",
    authenticity: "low",
    compatibilityScore: 58,
  },

  // Seeds & thickeners
  {
    from: "egusi",
    fromAliases: ["egusi seeds", "egushi", "melon seeds", "melon seed"],
    to: "pumpkin seeds",
    toAliases: ["pepitas", "hulled pumpkin seeds"],
    reason: "Closest oilseed stand-in for ground egusi soups",
    notes: "Toast and grind; flavor is nuttier and less earthy than true egusi.",
    regions: ["Nigeria", "Ghana", "West Africa", "Diaspora"],
    flavorRole: "oilseed thickener",
    authenticity: "medium",
    compatibilityScore: 84,
    bidirectional: true,
  },
  {
    from: "egusi",
    fromAliases: ["egusi seeds", "egushi"],
    to: "sunflower seeds",
    reason: "Budget oilseed thickener for egusi-style soups",
    notes: "Grind fine; color will be paler — palm oil restores hue.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "oilseed thickener",
    authenticity: "low",
    compatibilityScore: 70,
  },
  {
    from: "ogbono",
    fromAliases: ["ogbolo", "bush mango", "dika nut"],
    to: "okra",
    toAliases: ["okro", "lady finger"],
    reason: "Draw / mucilage thickener when ogbono is unavailable",
    notes: "Chop or blend okra for stretch; flavor differs from bush mango.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "draw thickener",
    authenticity: "medium",
    compatibilityScore: 72,
  },

  // Oils & fats
  {
    from: "palm oil",
    fromAliases: ["red palm oil", "zomi", "ire", "palm fruit oil"],
    to: "vegetable oil",
    toAliases: ["canola oil", "sunflower oil"],
    reason: "Neutral cooking fat when red palm oil is unavailable",
    notes: "Loses color and palm aroma — add paprika or annatto for hue; won't taste the same.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "cooking fat / color",
    authenticity: "low",
    compatibilityScore: 55,
  },
  {
    from: "palm oil",
    fromAliases: ["red palm oil", "zomi"],
    to: "coconut oil",
    reason: "Tropical fat alternative with some aroma",
    notes: "Coconut notes change the dish; use sparingly in stews.",
    regions: ["West Africa", "East Africa", "Diaspora"],
    flavorRole: "cooking fat",
    authenticity: "low",
    compatibilityScore: 60,
  },
  {
    from: "palm oil",
    fromAliases: ["red palm oil"],
    to: "ghee",
    toAliases: ["clarified butter", "samn"],
    reason: "Rich fat for North / East African adaptations",
    notes: "Better for suqaar/stews than for classic Nigerian palm-oil soups.",
    regions: ["North Africa", "Horn of Africa", "Diaspora"],
    flavorRole: "cooking fat",
    authenticity: "low",
    compatibilityScore: 48,
  },

  // Heat / peppers
  {
    from: "scotch bonnet",
    fromAliases: ["scotchbonnet", "bonnet pepper", "ata rodo"],
    to: "habanero",
    toAliases: ["habanero pepper", "habaneros"],
    reason: "Near-identical heat and fruity aroma",
    notes: "Use 1:1; seed to dial heat. Closest diaspora swap.",
    regions: ["Caribbean", "West Africa", "Diaspora"],
    flavorRole: "heat / fruity chili",
    authenticity: "high",
    compatibilityScore: 96,
    bidirectional: true,
  },
  {
    from: "scotch bonnet",
    fromAliases: ["ata rodo", "bonnet pepper"],
    to: "cayenne",
    toAliases: ["cayenne pepper", "ground cayenne"],
    reason: "Heat without the fresh fruity top notes",
    notes: "Start with 1/4–1/2 the amount by volume if using dried powder.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "heat",
    authenticity: "medium",
    compatibilityScore: 74,
    ratio: 0.35,
  },
  {
    from: "piri piri",
    fromAliases: ["peri peri", "pili pili", "african bird's eye"],
    to: "cayenne",
    reason: "Sharp dried heat for peri-peri style sauces",
    notes: "Add lemon/garlic to mimic peri-peri brightness.",
    regions: ["Mozambique", "South Africa", "East Africa"],
    flavorRole: "heat",
    authenticity: "medium",
    compatibilityScore: 78,
    bidirectional: true,
  },

  // Tubers, flours, staples
  {
    from: "cassava flour",
    fromAliases: ["manioc flour", "yuca flour", "mhogo flour"],
    to: "tapioca flour",
    toAliases: ["tapioca starch"],
    reason: "Same root family; similar gluten-free binding",
    notes: "Slightly more elastic; blend with other flours for fufu-like doughs.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "starch / binder",
    authenticity: "high",
    compatibilityScore: 90,
    bidirectional: true,
  },
  {
    from: "plantain",
    fromAliases: ["plantains", "matoke", "gonja", "green plantain"],
    to: "banana",
    toAliases: ["ripe banana", "cooking banana"],
    reason: "Sweet/ripe plantain stand-in only",
    notes: "Use ripe bananas for sweets; green plantain needs potato/yam instead.",
    regions: ["West Africa", "East Africa", "Caribbean"],
    flavorRole: "starch / sweet",
    authenticity: "low",
    compatibilityScore: 50,
  },
  {
    from: "plantain",
    fromAliases: ["green plantain", "matoke"],
    to: "sweet potato",
    toAliases: ["yam potato", "orange sweet potato"],
    reason: "Starchy roasted/fried side when green plantain is scarce",
    notes: "Sweeter and softer; season with salt and spice.",
    regions: ["East Africa", "Diaspora"],
    flavorRole: "starch",
    authenticity: "medium",
    compatibilityScore: 68,
  },
  {
    from: "yam",
    fromAliases: ["puna yam", "white yam", "ji"],
    to: "sweet potato",
    reason: "Accessible tuber for pounding / boiling contexts",
    notes: "Sweeter and wetter than true African yam — drain well for pounded dishes.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "tuber",
    authenticity: "medium",
    compatibilityScore: 65,
  },
  {
    from: "fonio",
    fromAliases: ["acha"],
    to: "quinoa",
    reason: "Tiny gluten-free grain with similar cook method",
    notes: "Quinoa is nuttier; rinse well. Good diaspora swap for salads/porridge.",
    regions: ["West Africa", "Sahel", "Diaspora"],
    flavorRole: "grain",
    authenticity: "medium",
    compatibilityScore: 75,
  },
  {
    from: "teff",
    fromAliases: ["tef"],
    to: "sorghum flour",
    toAliases: ["sorghum", "mtama flour"],
    reason: "Gluten-free flour for injera-adjacent flatbreads",
    notes: "Won't sour the same as fermented teff; mix with wheat if needed.",
    regions: ["Ethiopia", "Eritrea", "Horn of Africa"],
    flavorRole: "grain / flour",
    authenticity: "medium",
    compatibilityScore: 70,
  },

  // Umami / aromatics
  {
    from: "crayfish",
    fromAliases: ["dried crayfish", "dried shrimp", "ground crayfish"],
    to: "dried shrimp",
    toAliases: ["shrimp powder", "prawn powder"],
    reason: "Same dried seafood umami role in West African stews",
    notes: "Grind and bloom in oil; adjust salt (both are salty).",
    regions: ["Nigeria", "Ghana", "West Africa"],
    flavorRole: "umami / seafood",
    authenticity: "high",
    compatibilityScore: 92,
    bidirectional: true,
  },
  {
    from: "iru",
    fromAliases: ["irú", "locust beans", "dawadawa", "ogiri", "soumbala"],
    to: "miso",
    toAliases: ["white miso", "fermented soybean paste"],
    reason: "Fermented savory depth when locust bean is unavailable",
    notes: "Use sparingly; soy profile differs from irú — still adds funk.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "fermented umami",
    authenticity: "low",
    compatibilityScore: 58,
  },
  {
    from: "stockfish",
    fromAliases: ["panla", "okporoko", "dried cod"],
    to: "salted cod",
    toAliases: ["bacalao", "saltfish"],
    reason: "Preserved white fish for soups and stews",
    notes: "Soak to desalinate; texture is softer than dried stockfish.",
    regions: ["West Africa", "Caribbean", "Diaspora"],
    flavorRole: "preserved fish",
    authenticity: "medium",
    compatibilityScore: 80,
  },
  {
    from: "groundnut",
    fromAliases: ["groundnuts", "peanut", "peanuts", "arachide"],
    to: "peanut butter",
    toAliases: ["natural peanut butter", "unsweetened peanut butter"],
    reason: "Ready-ground peanut base for maafe / groundnut stews",
    notes: "Use unsweetened; thin with stock. Skip added sugar brands.",
    regions: ["West Africa", "Sahel", "Diaspora"],
    flavorRole: "nut paste",
    authenticity: "high",
    compatibilityScore: 90,
  },

  // Common pantry fallbacks retained from prior matcher
  {
    from: "okra",
    fromAliases: ["okro", "lady finger"],
    to: "zucchini",
    reason: "Vegetable bulk when okra mucilage is not required",
    notes: "No draw — add a spoon of cornstarch if you need thickness.",
    regions: ["Global", "Diaspora"],
    flavorRole: "vegetable",
    authenticity: "low",
    compatibilityScore: 45,
  },
  {
    from: "tomato paste",
    fromAliases: ["tomato puree"],
    to: "tomato sauce",
    toAliases: ["passata", "crushed tomatoes"],
    reason: "Tomato body and color for stews",
    notes: "Reduce longer to concentrate; ratio ~3:1 sauce to paste.",
    regions: ["Global"],
    flavorRole: "tomato concentrate",
    authenticity: "medium",
    compatibilityScore: 78,
    ratio: 3,
  },
  {
    from: "stock cube",
    fromAliases: ["bouillon", "stock powder", "maggi cube"],
    to: "chicken stock",
    toAliases: ["vegetable stock", "broth", "beef stock"],
    reason: "Liquid stock instead of concentrated cube",
    notes: "Reduce other salt; ~250ml stock ≈ 1 cube depending on brand.",
    regions: ["Global", "Africa"],
    flavorRole: "savory base",
    authenticity: "medium",
    compatibilityScore: 85,
  },
  {
    from: "cilantro",
    fromAliases: ["coriander leaves", "fresh coriander"],
    to: "parsley",
    reason: "Fresh green garnish when cilantro is disliked or unavailable",
    notes: "Missing citrusy cilantro note.",
    regions: ["North Africa", "Global"],
    flavorRole: "fresh herb",
    authenticity: "medium",
    compatibilityScore: 70,
    bidirectional: true,
  },
  {
    from: "tahini",
    fromAliases: ["tahina", "sesame paste"],
    to: "peanut butter",
    reason: "Nutty paste for North African / Levantine sauces",
    notes: "Stronger peanut flavor; thin with lemon and water.",
    regions: ["North Africa", "Diaspora"],
    flavorRole: "seed/nut paste",
    authenticity: "low",
    compatibilityScore: 55,
  },
  {
    from: "ghee",
    fromAliases: ["clarified butter", "samn"],
    to: "butter",
    reason: "Dairy fat for finishing and frying",
    notes: "Butter browns faster and has more water — lower heat slightly.",
    regions: ["North Africa", "Horn of Africa", "Global"],
    flavorRole: "cooking fat",
    authenticity: "high",
    compatibilityScore: 88,
    bidirectional: true,
  },
];

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip leading qty/unit noise: "2 cups ugwu leaves" → "ugwu leaves" */
export function stripIngredientNoise(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^\d+([./]\d+)?(\s*-\s*\d+([./]\d+)?)?\s*/, "");
  s = s.replace(
    /^(cups?|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|cloves?|pieces?|cans?|bunches?|handfuls?)\s+/i,
    ""
  );
  s = s.replace(/\s*\(.*?\)\s*/g, " ");
  s = s.replace(/,.*$/, "");
  return s.trim();
}

interface IndexedEdge {
  substitute: string;
  ratio: number;
  reason: string;
  notes: string;
  regions: string[];
  flavorRole: string;
  authenticity: Authenticity;
  compatibilityScore: number;
}

function buildIndexes(defs: SubstitutionEdgeDef[]) {
  const aliasToCanonical = new Map<string, string>();
  const edges = new Map<string, IndexedEdge[]>();

  const registerAlias = (alias: string, canonical: string) => {
    const key = normalizeKey(alias);
    if (!key) return;
    if (!aliasToCanonical.has(key)) aliasToCanonical.set(key, normalizeKey(canonical));
  };

  const pushEdge = (from: string, edge: IndexedEdge) => {
    const key = normalizeKey(from);
    const list = edges.get(key) ?? [];
    if (!list.some((e) => normalizeKey(e.substitute) === normalizeKey(edge.substitute))) {
      list.push(edge);
      edges.set(key, list);
    }
  };

  for (const def of defs) {
    const fromCanon = normalizeKey(def.from);
    registerAlias(def.from, def.from);
    for (const a of def.fromAliases ?? []) registerAlias(a, def.from);
    registerAlias(def.to, def.to);
    for (const a of def.toAliases ?? []) registerAlias(a, def.to);

    const forward: IndexedEdge = {
      substitute: def.to,
      ratio: def.ratio ?? 1,
      reason: def.reason,
      notes: def.notes ?? def.reason,
      regions: def.regions ?? [],
      flavorRole: def.flavorRole ?? "",
      authenticity: def.authenticity ?? "medium",
      compatibilityScore: def.compatibilityScore ?? 70,
    };
    pushEdge(fromCanon, forward);
    for (const a of def.fromAliases ?? []) pushEdge(a, forward);

    if (def.bidirectional) {
      const reverse: IndexedEdge = {
        ...forward,
        substitute: def.from,
      };
      pushEdge(def.to, reverse);
      for (const a of def.toAliases ?? []) pushEdge(a, reverse);
    }
  }

  return { aliasToCanonical, edges };
}

const { aliasToCanonical, edges: edgeIndex } = buildIndexes(SUBSTITUTION_EDGE_DEFS);

function resolveCanonical(normalized: string): string {
  return aliasToCanonical.get(normalized) ?? normalized;
}

function lookupKeys(ingredient: string): string[] {
  const stripped = normalizeKey(stripIngredientNoise(ingredient));
  if (!stripped) return [];
  const keys = new Set<string>([stripped, resolveCanonical(stripped)]);
  // try dropping trailing "leaves/seeds/oil/pepper/flour"
  const withoutTail = stripped.replace(/\b(leaves|leaf|seeds|seed|pepper|peppers|oil|flour|powder|fresh|dried)\b/g, " ").replace(/\s+/g, " ").trim();
  if (withoutTail && withoutTail !== stripped) {
    keys.add(withoutTail);
    keys.add(resolveCanonical(withoutTail));
  }
  return [...keys].filter(Boolean);
}

/**
 * Resolve ranked substitutions for an ingredient name (with notes / regions).
 */
export function lookupSubstitutions(
  ingredient: string,
  options?: { regionHint?: string; limit?: number }
): SubstitutionSuggestion[] {
  const limit = options?.limit ?? 6;
  const regionHint = options?.regionHint ? normalizeKey(options.regionHint) : "";
  const seen = new Set<string>();
  const results: SubstitutionSuggestion[] = [];

  for (const key of lookupKeys(ingredient)) {
    const list = edgeIndex.get(key) ?? [];
    for (const edge of list) {
      const subKey = normalizeKey(edge.substitute);
      if (seen.has(subKey) || subKey === key) continue;
      seen.add(subKey);

      let score = edge.compatibilityScore;
      if (regionHint && edge.regions.some((r) => normalizeKey(r).includes(regionHint) || regionHint.includes(normalizeKey(r)))) {
        score = Math.min(100, score + 6);
      }

      const ratioStr =
        edge.ratio === 1 ? "1:1" : edge.ratio < 1 ? `${edge.ratio}:1` : `${edge.ratio}:1 (sub:orig vol)`;

      results.push({
        name: edge.substitute,
        ratio: ratioStr,
        notes: edge.notes,
        reason: edge.reason,
        regions: edge.regions,
        flavorRole: edge.flavorRole,
        authenticity: edge.authenticity,
        compatibilityScore: score,
        source: "graph",
      });
    }
  }

  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return results.slice(0, limit);
}

/**
 * Flat substitute names for pantry / recipe matching (includes aliases of substitutes).
 */
export function getSubstituteNames(ingredient: string): string[] {
  const names = new Set<string>();
  for (const s of lookupSubstitutions(ingredient, { limit: 12 })) {
    names.add(normalizeKey(s.name));
    // include aliases that map to this substitute
    for (const [alias, canon] of aliasToCanonical) {
      if (canon === normalizeKey(s.name)) names.add(alias);
    }
  }
  // also: if ingredient is an alias, include other aliases in its group as soft matches
  for (const key of lookupKeys(ingredient)) {
    const canon = resolveCanonical(key);
    for (const [alias, c] of aliasToCanonical) {
      if (c === canon) names.add(alias);
    }
  }
  names.delete(normalizeKey(stripIngredientNoise(ingredient)));
  return [...names];
}

/** Exportable name list for tests / diagnostics */
export function listGraphCanonicalIngredients(): string[] {
  const set = new Set<string>();
  for (const def of SUBSTITUTION_EDGE_DEFS) {
    set.add(normalizeKey(def.from));
    set.add(normalizeKey(def.to));
  }
  return [...set].sort();
}

export function graphEdgeCount(): number {
  return SUBSTITUTION_EDGE_DEFS.length;
}
