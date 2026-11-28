import {
  RECIPE_IMAGE_FALLBACK as FALLBACK_JS,
  RECIPE_SCHEMA_SITE as SITE_JS,
  recipeSchemaImageList as recipeSchemaImageListJs,
  toAbsoluteImageUrl as toAbsoluteImageUrlJs,
} from "./recipeSchemaImages.mjs";

export const RECIPE_SCHEMA_SITE = SITE_JS as string;
export const RECIPE_IMAGE_FALLBACK = FALLBACK_JS as string;

export function toAbsoluteImageUrl(
  url?: string | null,
  siteOrigin = RECIPE_SCHEMA_SITE
): string {
  return toAbsoluteImageUrlJs(url, siteOrigin);
}

export function recipeSchemaImageList(
  url?: string | null,
  siteOrigin = RECIPE_SCHEMA_SITE
): string[] {
  return recipeSchemaImageListJs(url, siteOrigin);
}
