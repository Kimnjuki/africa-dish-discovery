/**
 * Typed accessors for countryCanonical.mjs.
 * The .mjs module is the source of truth so Node sitemap/prerender scripts
 * and nginx tests can import it without a TypeScript loader.
 */
import {
  canonicalCountrySlug as canonicalCountrySlugJs,
  countryDisplayName as countryDisplayNameJs,
  countryPath as countryPathJs,
  countryPostgrestOr as countryPostgrestOrJs,
  countryQueryNames as countryQueryNamesJs,
  facetCountryLabel as facetCountryLabelJs,
  listCanonicalRedirects as listCanonicalRedirectsJs,
  sameCountry as sameCountryJs,
  toCountrySlug as toCountrySlugJs,
} from "./countryCanonical.mjs";

export function toCountrySlug(name: string): string {
  return toCountrySlugJs(name);
}

export function canonicalCountrySlug(slug: string): string | null {
  return canonicalCountrySlugJs(slug);
}

export function countryDisplayName(slug: string): string {
  return countryDisplayNameJs(slug);
}

export function countryQueryNames(slug: string): string[] {
  return countryQueryNamesJs(slug);
}

export function countryPostgrestOr(slug: string): string {
  return countryPostgrestOrJs(slug);
}

export function countryPath(rawCountryName: string): string {
  return countryPathJs(rawCountryName);
}

export function facetCountryLabel(rawCountryName: string): string {
  return facetCountryLabelJs(rawCountryName);
}

export function sameCountry(a: string, b: string): boolean {
  return sameCountryJs(a, b);
}

export function listCanonicalRedirects(): { from: string; to: string }[] {
  return listCanonicalRedirectsJs();
}
