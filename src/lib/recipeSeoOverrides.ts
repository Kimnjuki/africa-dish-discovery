/**
 * Typed accessors for recipeSeoOverrides.mjs (shared with prerender-seo).
 */
import {
  DISH_SEO_OVERRIDES as DISH_SEO_OVERRIDES_JS,
  RECIPE_SEO_OVERRIDES as RECIPE_SEO_OVERRIDES_JS,
  resolveDishSeo as resolveDishSeoJs,
  resolveRecipeSeo as resolveRecipeSeoJs,
  stripTrailingSlash as stripTrailingSlashJs,
  toCanonicalUrl as toCanonicalUrlJs,
} from "./recipeSeoOverrides.mjs";

export type SeoOverride = { title: string; description: string };

export const RECIPE_SEO_OVERRIDES = RECIPE_SEO_OVERRIDES_JS as Record<string, SeoOverride>;
export const DISH_SEO_OVERRIDES = DISH_SEO_OVERRIDES_JS as Record<string, SeoOverride>;

export function resolveRecipeSeo(input: {
  slug?: string | null;
  name?: string | null;
  country?: string | null;
  summary?: string | null;
  briefDescription?: string | null;
}): { title: string; description: string; overridden: boolean } {
  return resolveRecipeSeoJs(input);
}

export function resolveDishSeo(input: {
  slug?: string | null;
  name?: string | null;
  country?: string | null;
  summary?: string | null;
}): { title: string; description: string; overridden: boolean } {
  return resolveDishSeoJs(input);
}

export function stripTrailingSlash(pathname: string): string {
  return stripTrailingSlashJs(pathname);
}

export function toCanonicalUrl(pathOrUrl: string): string {
  return toCanonicalUrlJs(pathOrUrl);
}
