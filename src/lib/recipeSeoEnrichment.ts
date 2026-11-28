/**
 * Typed accessors for recipeSeoEnrichment.mjs (shared with prerender-seo).
 */
import {
  RECIPE_SEO_ENRICHMENT as RECIPE_SEO_ENRICHMENT_JS,
  dishToRecipePath as dishToRecipePathJs,
  getRecipeSeoEnrichment as getRecipeSeoEnrichmentJs,
} from "./recipeSeoEnrichment.mjs";

export type FaqItem = { q: string; a: string };
export type InternalLink = { href: string; label: string };
export type RecipeEnrichment = {
  faqs: FaqItem[];
  internalLinks: InternalLink[];
  dishSlug?: string;
  keyPhrases?: string[];
};

export const RECIPE_SEO_ENRICHMENT = RECIPE_SEO_ENRICHMENT_JS as Record<
  string,
  RecipeEnrichment
>;

export function getRecipeSeoEnrichment(slug?: string | null): RecipeEnrichment | null {
  return getRecipeSeoEnrichmentJs(slug);
}

export function dishToRecipePath(input: {
  recipeSlug?: string | null;
  dishSlug?: string | null;
}): string | null {
  return dishToRecipePathJs(input);
}
