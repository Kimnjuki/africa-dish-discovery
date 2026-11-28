/**
 * One indexable URL per country.
 *
 * Short codes (`/country/it`) and fusion labels (`/country/greece-usa`) were
 * self-canonicalizing next to the real country page. Google then picked a
 * different canonical and dropped the extras from the index.
 */

/** @typedef {{ slug: string, name: string, aliases: string[] }} CountryRecord */

/** @type {CountryRecord[]} */
export const COUNTRIES = [
  { slug: "argentina", name: "Argentina", aliases: ["AR", "Ar"] },
  { slug: "australia", name: "Australia", aliases: ["AU", "Au"] },
  { slug: "china", name: "China", aliases: ["CN", "Cn"] },
  { slug: "cyprus", name: "Cyprus", aliases: ["CY", "Cy"] },
  { slug: "denmark", name: "Denmark", aliases: ["DK", "Dk"] },
  { slug: "france", name: "France", aliases: ["FR", "Fr"] },
  { slug: "greece", name: "Greece", aliases: ["GR", "Gr"] },
  { slug: "india", name: "India", aliases: ["IN", "In"] },
  { slug: "indonesia", name: "Indonesia", aliases: ["ID", "Id"] },
  { slug: "iran", name: "Iran", aliases: ["IR", "Ir"] },
  { slug: "italy", name: "Italy", aliases: ["IT", "It", "Italia"] },
  { slug: "japan", name: "Japan", aliases: ["JP", "Jp"] },
  { slug: "lebanon", name: "Lebanon", aliases: ["LB", "Lb"] },
  { slug: "mexico", name: "Mexico", aliases: ["MX", "Mx"] },
  { slug: "new-zealand", name: "New Zealand", aliases: ["NZ", "Nz"] },
  { slug: "pakistan", name: "Pakistan", aliases: ["PK", "Pk"] },
  { slug: "peru", name: "Peru", aliases: ["PE", "Pe"] },
  { slug: "south-korea", name: "South Korea", aliases: ["KR", "Kr", "Korea"] },
  { slug: "spain", name: "Spain", aliases: ["ES", "Es"] },
  { slug: "sweden", name: "Sweden", aliases: ["SE", "Se"] },
  { slug: "syria", name: "Syria", aliases: ["SY", "Sy"] },
  { slug: "thailand", name: "Thailand", aliases: ["TH", "Th"] },
  { slug: "turkey", name: "Turkey", aliases: ["TR", "Tr"] },
  { slug: "united-arab-emirates", name: "United Arab Emirates", aliases: ["UAE", "Uae"] },
  { slug: "united-kingdom", name: "United Kingdom", aliases: ["UK", "Uk", "GB", "Gb", "Great Britain"] },
  {
    slug: "united-states",
    name: "United States",
    aliases: ["USA", "Usa", "US", "Us", "United States of America"],
  },
  { slug: "venezuela", name: "Venezuela", aliases: ["VE", "Ve"] },
  { slug: "vietnam", name: "Vietnam", aliases: ["VN", "Vn"] },
];

/**
 * Labels that are not a single place. They produced near-empty country pages
 * that Google clustered with a real country or with each other.
 */
export const NON_PLACE_COUNTRY_SLUGS = [
  "caribbean",
  "china-global-chinese-american",
  "global",
  "global-fusion",
  "global-modern",
  "greece-usa",
  "hawaii",
  "india-italy",
  "india-mexico",
  "india-uk",
  "italy-usa",
  "japan-italy",
  "japan-usa",
  "mediterranean",
  "mexico-united-states",
  "mexico-usa",
  "nigeria-japan",
  "southeast-asia-thailand-vietnam",
  "thailand-usa",
  "turkey-middle-east",
  "uk-mexico",
  "uk-usa",
  "united-states-hawaii",
  "united-states-louisiana",
  "usa-asian-fusion",
];

const nonPlace = new Set(NON_PLACE_COUNTRY_SLUGS);

/** @type {Map<string, string>} alias slug → canonical slug */
const aliasToCanonical = new Map();
/** @type {Map<string, string>} canonical slug → display name */
const displayBySlug = new Map();
/** @type {Map<string, string[]>} canonical slug → DB country strings to query */
const queryNamesBySlug = new Map();

export function toCountrySlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCaseSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

for (const country of COUNTRIES) {
  displayBySlug.set(country.slug, country.name);
  const names = new Set([country.name, ...country.aliases]);
  queryNamesBySlug.set(country.slug, [...names]);
  for (const alias of country.aliases) {
    const aliasSlug = toCountrySlug(alias);
    if (aliasSlug && aliasSlug !== country.slug) aliasToCanonical.set(aliasSlug, country.slug);
  }
}

/**
 * Preferred country slug, or null when the slug should not be an indexable page.
 * Unknown place-like slugs pass through unchanged.
 * @param {string} slug
 * @returns {string | null}
 */
export function canonicalCountrySlug(slug) {
  const s = toCountrySlug(slug);
  if (!s || nonPlace.has(s)) return null;
  return aliasToCanonical.get(s) || s;
}

/** @param {string} slug */
export function countryDisplayName(slug) {
  const canonical = canonicalCountrySlug(slug) || toCountrySlug(slug);
  return displayBySlug.get(canonical) || titleCaseSlug(canonical);
}

/** Raw `recipes.country` values that belong on this canonical page. @param {string} slug */
export function countryQueryNames(slug) {
  const canonical = canonicalCountrySlug(slug);
  if (!canonical) return [];
  const listed = queryNamesBySlug.get(canonical);
  if (listed) return listed;
  return [countryDisplayName(canonical)];
}

/**
 * PostgREST `or` filter matching every stored label for this country.
 * @param {string} slug
 */
export function countryPostgrestOr(slug) {
  return countryQueryNames(slug)
    .map((name) => `country.ilike."${String(name).replace(/"/g, "")}"`)
    .join(",");
}

/** @param {string} rawCountryName */
export function countryPath(rawCountryName) {
  const slug = canonicalCountrySlug(toCountrySlug(rawCountryName));
  if (!slug) return "/countries";
  return `/country/${slug}`;
}

/**
 * Facet chip / `?country=` value. Non-places keep their raw label.
 * @param {string} rawCountryName
 */
export function facetCountryLabel(rawCountryName) {
  const raw = String(rawCountryName || "").trim();
  const slug = canonicalCountrySlug(toCountrySlug(raw));
  if (!slug) return raw;
  return countryDisplayName(slug);
}

/** @param {string} a @param {string} b */
export function sameCountry(a, b) {
  const sa = canonicalCountrySlug(toCountrySlug(a));
  const sb = canonicalCountrySlug(toCountrySlug(b));
  if (sa && sb) return sa === sb;
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

/**
 * Permanent redirects that collapse duplicate country URLs and `/index.html`.
 * @returns {{ from: string, to: string }[]}
 */
export function listCanonicalRedirects() {
  /** @type {{ from: string, to: string }[]} */
  const redirects = [{ from: "/index.html", to: "/" }];
  const seen = new Set(redirects.map((r) => r.from));
  for (const [alias, slug] of aliasToCanonical) {
    const from = `/country/${alias}`;
    if (seen.has(from)) continue;
    seen.add(from);
    redirects.push({ from, to: `/country/${slug}` });
  }
  for (const slug of NON_PLACE_COUNTRY_SLUGS) {
    const from = `/country/${slug}`;
    if (seen.has(from)) continue;
    seen.add(from);
    redirects.push({ from, to: "/countries" });
  }
  return redirects;
}
