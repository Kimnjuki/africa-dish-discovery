import {
  AFRICA_OR_FILTER as AFRICA_OR_FILTER_JS,
  isAfricanRecipe as isAfricanRecipeJs,
} from "./africaFilter.mjs";

export const AFRICA_OR_FILTER = AFRICA_OR_FILTER_JS as string;

export function isAfricanRecipe(row?: {
  is_african?: boolean | null;
  continent?: string | null;
} | null): boolean {
  return isAfricanRecipeJs(row);
}
