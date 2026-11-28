/**
 * Absolute recipe images for JSON-LD / Google Recipe Gallery.
 * Shared by RecipeSchema (via TS wrapper) and prerender-seo.mjs.
 */

const SITE = "https://www.ladhaquest.com";
const FALLBACK = `${SITE}/og-image.jpg`;

/**
 * @param {string|null|undefined} url
 * @param {string} [siteOrigin]
 */
export function toAbsoluteImageUrl(url, siteOrigin = SITE) {
  const fallback = `${siteOrigin}/og-image.jpg`;
  if (!url) return fallback;
  const raw = String(url).trim();
  if (!raw || raw === "/placeholder.svg" || raw.endsWith("/placeholder.svg")) {
    return fallback;
  }
  try {
    return new URL(raw, siteOrigin).toString();
  } catch {
    return fallback;
  }
}

/**
 * Build a Gallery-friendly image list: absolute URLs, multi-size for Unsplash.
 * @param {string|null|undefined} url
 * @param {string} [siteOrigin]
 * @returns {string[]}
 */
export function recipeSchemaImageList(url, siteOrigin = SITE) {
  const absolute = toAbsoluteImageUrl(url, siteOrigin);
  if (!absolute.includes("unsplash.com")) {
    return [absolute];
  }
  try {
    const widths = [1200, 800, 400];
    return widths.map((w) => {
      const u = new URL(absolute);
      const clean = new URL(`${u.origin}${u.pathname}`);
      clean.searchParams.set("w", String(w));
      clean.searchParams.set("q", "75");
      clean.searchParams.set("auto", "format");
      clean.searchParams.set("fit", "crop");
      return clean.toString();
    });
  } catch {
    return [absolute];
  }
}

export { SITE as RECIPE_SCHEMA_SITE, FALLBACK as RECIPE_IMAGE_FALLBACK };
