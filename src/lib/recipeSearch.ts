/**
 * Africa-first recipe search helpers: synonym / alias expansion + light typo tolerance.
 * Practical stand-in for Meilisearch until a dedicated search service is deployed.
 */

/** Groups of interchangeable dish / staple spellings and local names. */
export const DISH_ALIAS_GROUPS: string[][] = [
  ["jollof", "jolof", "jellof", "djolof", "jollof rice", "jolof rice"],
  ["ugali", "ngali", "ogali", "posho", "nsima", "nshima", "sadza", "pap", "mealie meal", "mealiepap"],
  ["injera", "enjera", "injera bread", "taita"],
  ["fufu", "foufou", "foofoo", "fufuo", "pounded yam"],
  ["egusi", "egushi", "egusi soup", "melon seed soup"],
  ["suya", "tsire", "kilishi"],
  ["bobotie", "boboti"],
  ["tagine", "tajine", "tajin"],
  ["couscous", "kusksi", "seksu"],
  ["chapati", "chapatti", "chappati", "roti"],
  ["pilau", "pilaf", "pulao", "pilao"],
  ["biryani", "biriyani", "briyani"],
  ["nyama choma", "nyamachoma", "roast meat"],
  ["sukuma wiki", "sukuma", "collard greens", "kale"],
  ["matoke", "matooke", "cooked banana", "plantain stew"],
  ["koshari", "koshary", "kosheri", "kushari"],
  ["ful medames", "ful", "foul", "foul medames", "fūl"],
  ["shakshuka", "shakshouka", "chakchouka"],
  ["harira", "hareera"],
  ["thieboudienne", "thieb", "ceebu jen", "chebu jen", "thiebou dieune"],
  ["mafe", "mafé", "maffe", "groundnut stew", "peanut stew"],
  ["yassa", "poulet yassa", "chicken yassa"],
  ["waakye", "waache", "wakye"],
  ["banku", "akple"],
  ["kenkey", "komi"],
  ["kelewele", "kelewelle"],
  ["githeri", "githere"],
  ["irio", "mukimo"],
  ["mandazi", "mandaazi", "mahamri"],
  ["samosa", "sambusa", "samousa"],
  ["bunny chow", "bunnychow"],
  ["biltong", "dry meat"],
  ["peri peri", "piri piri", "pili pili", "pepe"],
  ["berbere", "berberé"],
  ["doro wat", "doro wot", "dorowat", "chicken wat"],
  ["kitfo", "ketfo"],
  ["tibs", "tipsi"],
  ["asyenda", "asida", "aseeda"],
  ["gari", "garri"],
  ["ogi", "akamu"],
  ["moin moin", "moi moi", "moimoi", "olele"],
  ["akara", "acara", "bean cake", "kosai"],
  ["pepper soup", "peppersoup", "point and kill"],
  ["ewedu", "ayoyo"],
  ["okra soup", "okro soup", "okro"],
  ["draw soup", "ogbono", "ogbolo"],
  ["efo riro", "eforiro", "spinach stew"],
  ["afang", "afang soup"],
  ["edikang ikong", "edikaikong"],
  ["banga", "banga soup", "palm nut soup", "ofe akwu"],
  ["ofada", "ofada rice", "ayamashe"],
  ["asaro", "yam porridge", "pottage"],
  ["tuwo", "tuwo shinkafa", "tuwo masara"],
  ["miyan kuka", "kuka soup"],
  ["nkwobi", "nkwo bi"],
  ["isi ewu", "isiewu"],
];

/** Ingredient aliases used when filtering by ingredient facet / query tokens. */
export const INGREDIENT_ALIAS_GROUPS: string[][] = [
  ["egusi", "egushi", "melon seeds", "melon seed"],
  ["scotch bonnet", "scotchbonnet", "habanero", "ata rodo"],
  ["palm oil", "red palm oil", "zomi", "ire"],
  ["cassava", "manioc", "yuca", "mhogo"],
  ["plantain", "plantains", "matoke", "gonja"],
  ["okra", "okro", "lady finger"],
  ["teff", "tef"],
  ["fonio", "acha"],
  ["sorghum", "mtama", "guinea corn"],
  ["millet", "bajra", "bulrush millet"],
  ["groundnut", "groundnuts", "peanut", "peanuts", "arachide"],
  ["irú", "iru", "locust beans", "dawadawa", "ogiri"],
  ["crayfish", "dried crayfish", "dried shrimp"],
  ["stockfish", "panla", "okporoko"],
  ["yam", "puna yam", "white yam", "ji"],
  ["cocoyam", "taro", "edo", "aroid"],
  ["ugu", "fluted pumpkin", "pumpkin leaves"],
  ["bitterleaf", "bitter leaf", "onugbu"],
  ["uziza", "ashanti pepper"],
  ["ogbono", "ogbolo", "bush mango"],
  ["garri", "gari", "cassava flakes"],
  ["semolina", "semovita", "semo"],
  ["fufu flour", "fufu", "poundo", "poundo yam"],
  ["suet", "tallow"],
  ["ghee", "clarified butter", "samn"],
  ["tahini", "tahina", "sesame paste"],
  ["freekeh", "frikeh", "faro"],
  ["bulgur", "bulgar", "burghul"],
];

export interface ExpandedQuery {
  original: string;
  normalized: string;
  /** Substrings / phrases to try against recipe haystacks (longest first). */
  terms: string[];
  /** Suggested canonical spelling when the query looked like a typo. */
  suggestion: string | null;
  /** True when expansion added synonyms or typo corrections beyond the raw query. */
  expanded: boolean;
}

export interface SearchableRecipe {
  name?: string | null;
  country?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  category?: string | null;
  ingredients?: unknown;
}

const MAX_EDIT_SHORT = 1;
const MAX_EDIT_LONG = 2;

function buildAliasIndex(groups: string[][]): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const group of groups) {
    const normalizedGroup = [...new Set(group.map((g) => normalizeSearchText(g)).filter(Boolean))];
    if (normalizedGroup.length === 0) continue;
    for (const alias of normalizedGroup) {
      const existing = index.get(alias);
      if (existing) {
        for (const a of normalizedGroup) {
          if (!existing.includes(a)) existing.push(a);
        }
      } else {
        index.set(alias, [...normalizedGroup]);
      }
    }
  }
  return index;
}

const dishAliasIndex = buildAliasIndex(DISH_ALIAS_GROUPS);
const ingredientAliasIndex = buildAliasIndex(INGREDIENT_ALIAS_GROUPS);

/** All known single-token keys used for fuzzy typo correction. */
const DISH_DICTIONARY = [...dishAliasIndex.keys()].sort((a, b) => b.length - a.length);

export function normalizeSearchText(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);
  for (let j = 0; j < cols; j++) prev[j] = j;
  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j < cols; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j++) prev[j] = curr[j];
  }
  return prev[cols - 1];
}

function maxEditsFor(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return MAX_EDIT_SHORT;
  return MAX_EDIT_LONG;
}

function preferredCanonical(group: string[]): string {
  return [...group].sort((a, b) => a.length - b.length || a.localeCompare(b))[0] || group[0];
}

function findFuzzyDishGroup(token: string): { group: string[]; canonical: string; distance: number } | null {
  if (token.length < 4) return null;
  const limit = maxEditsFor(token);
  if (limit === 0) return null;

  let best: { group: string[]; canonical: string; distance: number } | null = null;
  for (const key of DISH_DICTIONARY) {
    if (Math.abs(key.length - token.length) > limit) continue;
    // Prefer comparable length keys (avoid matching short tokens to long phrases badly)
    if (key.includes(" ") && token.length < 6) continue;
    const d = levenshtein(token, key);
    if (d === 0) {
      const group = dishAliasIndex.get(key)!;
      return { group, canonical: preferredCanonical(group), distance: 0 };
    }
    if (d <= limit && (!best || d < best.distance)) {
      const group = dishAliasIndex.get(key)!;
      best = { group, canonical: preferredCanonical(group), distance: d };
    }
  }
  return best;
}

function addGroupTerms(terms: Set<string>, group: string[]) {
  for (const alias of group) {
    terms.add(alias);
    for (const part of alias.split(/\s+/)) {
      if (part.length >= 3) terms.add(part);
    }
  }
}

/**
 * Expand a free-text query with African dish synonyms and light typo corrections.
 */
export function expandSearchQuery(raw: string): ExpandedQuery {
  const original = String(raw || "");
  const normalized = normalizeSearchText(original);
  if (!normalized) {
    return { original, normalized: "", terms: [], suggestion: null, expanded: false };
  }

  const terms = new Set<string>([normalized]);
  let suggestion: string | null = null;
  let expanded = false;

  // Whole-phrase alias hit (e.g. "jolof rice", "nyama choma")
  const phraseGroup = dishAliasIndex.get(normalized);
  if (phraseGroup) {
    addGroupTerms(terms, phraseGroup);
    expanded = phraseGroup.some((a) => a !== normalized);
    if (expanded) suggestion = preferredCanonical(phraseGroup);
  } else {
    const fuzzyPhrase = findFuzzyDishGroup(normalized);
    if (fuzzyPhrase && fuzzyPhrase.distance > 0) {
      addGroupTerms(terms, fuzzyPhrase.group);
      suggestion = fuzzyPhrase.canonical;
      expanded = true;
    }
  }

  const tokens = normalized.split(/\s+/).filter((t) => t.length > 0);
  for (const token of tokens) {
    terms.add(token);
    const exact = dishAliasIndex.get(token);
    if (exact) {
      addGroupTerms(terms, exact);
      if (exact.some((a) => a !== token)) {
        expanded = true;
        if (!suggestion) suggestion = preferredCanonical(exact);
      }
      continue;
    }
    const fuzzy = findFuzzyDishGroup(token);
    if (fuzzy) {
      addGroupTerms(terms, fuzzy.group);
      expanded = true;
      if (fuzzy.distance > 0 && !suggestion) suggestion = fuzzy.canonical;
    }
  }

  // Ingredient aliases when the query looks like a single ingredient word
  if (tokens.length === 1) {
    const ing = ingredientAliasIndex.get(tokens[0]);
    if (ing) {
      addGroupTerms(terms, ing);
      expanded = true;
    } else {
      // light fuzzy on ingredient keys
      let bestIng: string[] | null = null;
      let bestD = 99;
      for (const key of ingredientAliasIndex.keys()) {
        if (Math.abs(key.length - tokens[0].length) > 2) continue;
        if (key.includes(" ")) continue;
        const d = levenshtein(tokens[0], key);
        if (d > 0 && d <= maxEditsFor(tokens[0]) && d < bestD) {
          bestD = d;
          bestIng = ingredientAliasIndex.get(key)!;
        }
      }
      if (bestIng) {
        addGroupTerms(terms, bestIng);
        expanded = true;
        if (!suggestion) suggestion = preferredCanonical(bestIng);
      }
    }
  }

  const sortedTerms = [...terms].sort((a, b) => b.length - a.length || a.localeCompare(b));
  return { original, normalized, terms: sortedTerms, suggestion, expanded };
}

/**
 * Expand an ingredient filter string with local aliases.
 */
export function expandIngredientQuery(raw: string): string[] {
  const normalized = normalizeSearchText(raw);
  if (!normalized) return [];
  const terms = new Set<string>([normalized]);
  const exact = ingredientAliasIndex.get(normalized);
  if (exact) addGroupTerms(terms, exact);
  for (const token of normalized.split(/\s+/)) {
    const g = ingredientAliasIndex.get(token);
    if (g) addGroupTerms(terms, g);
  }
  return [...terms].sort((a, b) => b.length - a.length);
}

function recipeHaystack(recipe: SearchableRecipe): string {
  const ingText = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ing) => {
          if (typeof ing === "string") return ing;
          if (ing && typeof ing === "object") {
            const o = ing as Record<string, unknown>;
            return String(o.name || o.ingredient || o.item || o.text || "");
          }
          return "";
        })
        .join(" ")
    : typeof recipe.ingredients === "string"
      ? recipe.ingredients
      : "";

  return normalizeSearchText(
    [
      recipe.name || "",
      recipe.country || "",
      recipe.summary || "",
      recipe.category || "",
      ...(recipe.tags || []),
      ingText,
    ].join(" ")
  );
}

/** Avoid short-term false positives (e.g. "pap" inside "paprika"). */
export function haystackContainsTerm(haystack: string, term: string): boolean {
  if (!term || term.length < 2) return false;
  if (term.length >= 5) return haystack.includes(term);
  if (haystack === term) return true;
  const padded = ` ${haystack} `;
  if (padded.includes(` ${term} `)) return true;
  // Allow prefix of a word for medium tokens ("jollo" → "jollof") only when term length ≥ 4
  if (term.length >= 4) {
    return padded.split(/\s+/).some((w) => w === term || w.startsWith(term));
  }
  return false;
}

/**
 * Returns true when any expanded term appears in the recipe haystack.
 */
export function recipeMatchesExpanded(recipe: SearchableRecipe, expanded: ExpandedQuery): boolean {
  if (!expanded.normalized) return true;
  const haystack = recipeHaystack(recipe);
  for (const term of expanded.terms) {
    if (haystackContainsTerm(haystack, term)) return true;
  }
  return false;
}

export function recipeMatchesQuery(recipe: SearchableRecipe, rawQuery: string): boolean {
  return recipeMatchesExpanded(recipe, expandSearchQuery(rawQuery));
}

export function ingredientMatchesQuery(ingredientBlob: string, rawQuery: string): boolean {
  const terms = expandIngredientQuery(rawQuery);
  if (!terms.length) return true;
  const hay = normalizeSearchText(ingredientBlob);
  return terms.some((t) => haystackContainsTerm(hay, t));
}

/**
 * Simple relevance score for ranking client-side results (higher is better).
 */
export function scoreRecipeMatch(recipe: SearchableRecipe, expanded: ExpandedQuery): number {
  if (!expanded.normalized) return 0;
  const name = normalizeSearchText(recipe.name || "");
  const haystack = recipeHaystack(recipe);
  let score = 0;
  for (const term of expanded.terms) {
    if (term.length < 2) continue;
    if (name === term) score += 100;
    else if (name.startsWith(term)) score += 60;
    else if (haystackContainsTerm(name, term)) score += 40;
    else if (haystackContainsTerm(haystack, term)) score += 10;
  }
  if (expanded.suggestion && name.includes(expanded.suggestion)) score += 15;
  return score;
}

/** Filter + rank a recipe list for a free-text query. */
export function searchRecipes<T extends SearchableRecipe>(recipes: T[], rawQuery: string): T[] {
  const expanded = expandSearchQuery(rawQuery);
  if (!expanded.normalized) return recipes;
  return recipes
    .filter((r) => recipeMatchesExpanded(r, expanded))
    .map((r) => ({ r, s: scoreRecipeMatch(r, expanded) }))
    .sort((a, b) => b.s - a.s || (a.r.name || "").localeCompare(b.r.name || ""))
    .map((x) => x.r);
}
