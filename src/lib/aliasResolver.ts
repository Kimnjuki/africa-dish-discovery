/**
 * Alias-aware ingredient resolver.
 * Normalises free text, matches local/English aliases, and surfaces ambiguity
 * when one alias maps to several ingredients (e.g. morogo).
 *
 * Client bootstrap uses curated CSV-derived groups; once `ingredient_aliases`
 * is migrated, callers can pass DB rows via `resolveAliasFromRows`.
 */

export interface AliasRecord {
  ingredientId: string;
  slug: string;
  canonicalName: string;
  alias: string;
  aliasNormalized: string;
  language?: string;
  countryCode?: string;
  matchConfidence: number;
  isAmbiguous: boolean;
  dietaryTags?: string[];
  allergens?: string[];
}

export interface ResolvedIngredient {
  ingredientId: string;
  slug: string;
  name: string;
  matchConfidence: number;
  matchedAlias: string;
  dietaryTags: string[];
  allergens: string[];
}

export interface AliasResolveResult {
  query: string;
  normalized: string;
  ambiguous: boolean;
  matches: ResolvedIngredient[];
  /** Present when multiple distinct ingredients share the alias. */
  disambiguationPrompt?: string;
}

/** Strip diacritics and collapse noise for matching. */
export function normalizeAlias(input: string): string {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance — small strings only (alias tokens). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function typoThreshold(len: number): number {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  return 2;
}

/** Built-in seed covering Sprint 1 priority aliases (mirrors CSV + recipeSearch). */
const BUILTIN_GROUPS: Array<{
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  ambiguousAliases?: string[];
  dietaryTags?: string[];
  allergens?: string[];
}> = [
  {
    id: "ing-ugwu",
    slug: "ugwu",
    name: "Ugwu",
    aliases: ["ugwu", "ugu", "fluted pumpkin", "fluted pumpkin leaves", "pumpkin leaves"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-sukuma-wiki",
    slug: "sukuma-wiki",
    name: "Sukuma Wiki",
    aliases: ["sukuma wiki", "sukuma", "sukumawiki", "collard greens kenya"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-collard-greens",
    slug: "collard-greens",
    name: "Collard Greens",
    aliases: ["collard greens", "collards", "collard"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-kale",
    slug: "kale",
    name: "Kale",
    aliases: ["kale", "curly kale", "tuscan kale"],
    ambiguousAliases: ["sukuma diaspora"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-spinach",
    slug: "spinach",
    name: "Spinach",
    aliases: ["spinach", "baby spinach", "english spinach", "mchicha"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-morogo",
    slug: "morogo",
    name: "Morogo",
    aliases: ["morogo", "amaranth leaves", "imifino", "bonongwe"],
    ambiguousAliases: ["african spinach", "terere"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-amaranth",
    slug: "amaranth-leaves",
    name: "Amaranth Leaves",
    aliases: ["amaranth", "amaranth leaves", "terere ke"],
    ambiguousAliases: ["morogo", "african spinach"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-egusi",
    slug: "egusi",
    name: "Egusi",
    aliases: ["egusi", "egushi", "melon seeds", "melon seed"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-palm-oil",
    slug: "palm-oil",
    name: "Palm Oil",
    aliases: ["palm oil", "red palm oil", "zomi", "ire"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-scotch-bonnet",
    slug: "scotch-bonnet",
    name: "Scotch Bonnet",
    aliases: ["scotch bonnet", "scotchbonnet", "ata rodo"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-habanero",
    slug: "habanero",
    name: "Habanero",
    aliases: ["habanero"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-plantain",
    slug: "plantain",
    name: "Plantain",
    aliases: ["plantain", "plantains", "matoke", "gonja"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-banana",
    slug: "banana",
    name: "Banana",
    aliases: ["banana", "bananas", "ndizi"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-cassava",
    slug: "cassava",
    name: "Cassava",
    aliases: ["cassava", "manioc", "yuca", "mhogo"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-groundnut",
    slug: "groundnut",
    name: "Groundnut",
    aliases: ["groundnut", "groundnuts", "peanut", "peanuts", "arachide"],
    allergens: ["peanut"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
  },
  {
    id: "ing-iru",
    slug: "iru",
    name: "Iru",
    aliases: ["iru", "irú", "locust beans", "dawadawa", "ogiri"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-ogbono",
    slug: "ogbono",
    name: "Ogbono",
    aliases: ["ogbono", "ogbolo", "bush mango", "dika nut"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-coconut-milk",
    slug: "coconut-milk",
    name: "Coconut Milk",
    aliases: ["coconut milk", "thick coconut milk"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    id: "ing-evaporated-milk",
    slug: "evaporated-milk",
    name: "Evaporated Milk",
    aliases: ["evaporated milk", "tinned milk"],
    allergens: ["dairy", "milk"],
    dietaryTags: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  {
    id: "ing-cashew-cream",
    slug: "cashew-cream",
    name: "Cashew Cream",
    aliases: ["cashew cream", "ground cashew", "cashew paste"],
    allergens: ["tree_nut", "cashew"],
    dietaryTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
  },
];

function buildBuiltinRecords(): AliasRecord[] {
  const rows: AliasRecord[] = [];
  for (const g of BUILTIN_GROUPS) {
    const all = new Set([...g.aliases, g.name, g.slug.replace(/-/g, " ")]);
    for (const alias of all) {
      const normalized = normalizeAlias(alias);
      if (!normalized) continue;
      rows.push({
        ingredientId: g.id,
        slug: g.slug,
        canonicalName: g.name,
        alias,
        aliasNormalized: normalized,
        matchConfidence: 1,
        isAmbiguous: false,
        dietaryTags: g.dietaryTags,
        allergens: g.allergens,
      });
    }
    for (const alias of g.ambiguousAliases ?? []) {
      const normalized = normalizeAlias(alias);
      if (!normalized) continue;
      rows.push({
        ingredientId: g.id,
        slug: g.slug,
        canonicalName: g.name,
        alias,
        aliasNormalized: normalized,
        matchConfidence: 0.7,
        isAmbiguous: true,
        dietaryTags: g.dietaryTags,
        allergens: g.allergens,
      });
    }
  }
  return rows;
}

const BUILTIN_RECORDS = buildBuiltinRecords();

function dedupeMatches(matches: ResolvedIngredient[]): ResolvedIngredient[] {
  const byId = new Map<string, ResolvedIngredient>();
  for (const m of matches) {
    const prev = byId.get(m.ingredientId);
    if (!prev || m.matchConfidence > prev.matchConfidence) byId.set(m.ingredientId, m);
  }
  return [...byId.values()].sort((a, b) => b.matchConfidence - a.matchConfidence || a.name.localeCompare(b.name));
}

function scoreRecord(query: string, record: AliasRecord, countryCode?: string): number | null {
  const q = normalizeAlias(query);
  if (!q) return null;
  const alias = record.aliasNormalized;
  if (alias === q) {
    let score = record.matchConfidence;
    if (countryCode && record.countryCode && record.countryCode.toUpperCase() === countryCode.toUpperCase()) {
      score = Math.min(1, score + 0.05);
    }
    return score;
  }
  if (alias.startsWith(q) || q.startsWith(alias)) {
    return Math.min(record.matchConfidence, 0.92) * 0.95;
  }
  const dist = editDistance(q, alias);
  const maxDist = typoThreshold(Math.max(q.length, alias.length));
  if (dist <= maxDist && maxDist > 0) {
    return Math.min(record.matchConfidence, 0.85) * (1 - dist / (maxDist + 1));
  }
  return null;
}

/**
 * Resolve free-text ingredient against provided alias rows (DB or builtin).
 */
export function resolveAliasFromRows(
  query: string,
  rows: AliasRecord[],
  options?: { countryCode?: string; language?: string; limit?: number }
): AliasResolveResult {
  const normalized = normalizeAlias(query);
  const limit = options?.limit ?? 8;
  const scored: ResolvedIngredient[] = [];

  for (const row of rows) {
    if (options?.language && row.language && row.language !== options.language && row.language !== "en") {
      // Prefer requested language but still allow English fallbacks below via score
    }
    const score = scoreRecord(query, row, options?.countryCode);
    if (score == null) continue;
    scored.push({
      ingredientId: row.ingredientId,
      slug: row.slug,
      name: row.canonicalName,
      matchConfidence: score,
      matchedAlias: row.alias,
      dietaryTags: row.dietaryTags ?? [],
      allergens: row.allergens ?? [],
    });
  }

  const matches = dedupeMatches(scored).slice(0, limit);
  const flaggedAmbiguous = rows.some(
    (r) => r.isAmbiguous && normalizeAlias(r.alias) === normalized
  );
  const ambiguous = flaggedAmbiguous || matches.length > 1 && matches[0].matchConfidence < 0.95 && matches.filter((m) => m.matchConfidence >= matches[0].matchConfidence - 0.05).length > 1;

  // Special case: exact ambiguous family names like morogo / african spinach
  const multiExact = matches.filter((m) => normalizeAlias(m.matchedAlias) === normalized || normalizeAlias(m.name) === normalized);
  const isAmbiguousFamily = flaggedAmbiguous || multiExact.length > 1;

  return {
    query,
    normalized,
    ambiguous: Boolean(isAmbiguousFamily || (ambiguous && matches.length > 1)),
    matches,
    disambiguationPrompt:
      isAmbiguousFamily || (ambiguous && matches.length > 1)
        ? `“${query}” can mean more than one ingredient (${matches
            .slice(0, 4)
            .map((m) => m.name)
            .join(", ")}). Pick the one you have, or tell us your country.`
        : undefined,
  };
}

/** Resolve using the built-in Sprint 1 alias seed. */
export function resolveAlias(
  query: string,
  options?: { countryCode?: string; language?: string; limit?: number }
): AliasResolveResult {
  return resolveAliasFromRows(query, BUILTIN_RECORDS, options);
}

/** True when every required diet tag is present on the candidate. */
export function satisfiesAllDiets(required: string[], candidateTags: string[]): boolean {
  if (!required.length) return true;
  const set = new Set(candidateTags.map((t) => t.toLowerCase().replace(/-/g, "_")));
  return required.every((d) => set.has(d.toLowerCase().replace(/-/g, "_")));
}

/** True when candidate allergens intersect user allergies (including peanut↔groundnut). */
export function conflictsWithAllergies(userAllergies: string[], candidateAllergens: string[]): boolean {
  if (!userAllergies.length || !candidateAllergens.length) return false;
  const expand = (a: string) => {
    const n = a.toLowerCase().replace(/-/g, "_");
    if (n === "peanut" || n === "groundnut" || n === "peanuts") return ["peanut", "groundnut"];
    if (n === "dairy" || n === "milk" || n === "lactose") return ["dairy", "milk"];
    if (n === "tree_nut" || n === "cashew" || n === "almond") return ["tree_nut", "cashew", "almond"];
    return [n];
  };
  const user = new Set(userAllergies.flatMap(expand));
  return candidateAllergens.flatMap(expand).some((a) => user.has(a));
}
