/**
 * Shared Africa-first filter for Supabase queries, sitemaps, and PageMeta.
 * Prefer keeping Global recipes in the DB, but demote them in crawl + defaults.
 */

/** PostgREST `.or(...)` clause used across Featured/Trending/lists/sitemaps. */
export const AFRICA_OR_FILTER = "is_african.eq.true,continent.eq.Africa";

/**
 * @param {{ is_african?: boolean|null, continent?: string|null }|null|undefined} row
 */
export function isAfricanRecipe(row) {
  if (!row) return false;
  if (row.is_african === true) return true;
  const continent = String(row.continent || "").trim().toLowerCase();
  return continent === "africa";
}
