/**
 * Facet URL indexation policy (S1-07).
 *
 * Allow-list for indexable facet URLs on /recipe-index:
 *  - Bare /recipe-index (no filters)          → index, self-canonical
 *  - Single facet from: country | continent | category | diet | ingredient
 *                                              → index, self-canonical (stable param order)
 *  - `q` alone                                → noindex (search-intent, ephemeral)
 *  - Multi-facet combos or unrecognised params → noindex, follow
 *
 * Canonical for multi-facet or noindex URLs is always the bare index URL.
 * Canonical for allow-listed single-facet URLs is the self-URL with stable param order.
 *
 * Stable param order follows FACET_KEYS: q, country, continent, category, diet, difficulty, time, ingredient.
 */

const SITE_ORIGIN = "https://www.ladhaquest.com";
const INDEX_PATH = "/recipe-index";

/** Canonical param insertion order. */
const FACET_KEYS = [
  "q",
  "country",
  "continent",
  "category",
  "diet",
  "difficulty",
  "time",
  "ingredient",
] as const;

/** Facets whose single-facet URL is indexable. */
const INDEXABLE_SINGLE_FACETS = new Set<string>([
  "country",
  "continent",
  "category",
  "diet",
  "ingredient",
]);

/**
 * Returns true when the facet URL combination is in the allow-list for indexing.
 *
 * @param params - URLSearchParams from the current /recipe-index URL.
 */
export function shouldIndexFacetUrl(params: URLSearchParams): boolean {
  // Collect which known facets are active (non-empty value).
  const active = FACET_KEYS.filter((k) => {
    const v = params.get(k);
    return v !== null && v.trim() !== "";
  });

  // No active facets — bare index is always indexable.
  if (active.length === 0) return true;

  // Exactly one active facet in the allow-list → indexable.
  if (active.length === 1 && INDEXABLE_SINGLE_FACETS.has(active[0])) return true;

  // Everything else (multi-facet, q alone, difficulty/time alone, etc.) → noindex.
  return false;
}

/**
 * Returns the canonical URL for a /recipe-index facet combination.
 *
 * - Multi-facet or noindex combos → bare index URL.
 * - Allow-listed single-facet → self-canonical with stable param order.
 *
 * @param params - URLSearchParams from the current /recipe-index URL.
 */
export function canonicalForFacetUrl(params: URLSearchParams): string {
  if (!shouldIndexFacetUrl(params)) {
    return `${SITE_ORIGIN}${INDEX_PATH}`;
  }

  // Bare index → canonical without query string.
  const active = FACET_KEYS.filter((k) => {
    const v = params.get(k);
    return v !== null && v.trim() !== "";
  });
  if (active.length === 0) {
    return `${SITE_ORIGIN}${INDEX_PATH}`;
  }

  // Single allow-listed facet → stable ordered params.
  const ordered = new URLSearchParams();
  for (const k of FACET_KEYS) {
    const v = params.get(k);
    if (v && v.trim()) ordered.set(k, v.trim());
  }
  return `${SITE_ORIGIN}${INDEX_PATH}?${ordered.toString()}`;
}
