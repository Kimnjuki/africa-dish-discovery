/** Shared shapes for recipe ingredients, steps, and cookable recipes. */

export interface LooseItem {
  name?: string;
  ingredient?: string;
  item?: string;
  quantity?: string | number;
  amount?: string | number;
  unit?: string;
  notes?: string;
  instruction?: string;
  text?: string;
  step?: string | number;
  description?: string;
  title?: string;
  optional?: boolean;
  duration?: number | string;
  time?: number | string;
  temperature?: string;
  tips?: string[];
}

export type IngredientValue = string | LooseItem;
export type StepValue = string | LooseItem;

/** A recipe object the UI can render, cook, or print. Fields stay optional because selects vary. */
export interface CookableRecipe {
  id?: string;
  name: string;
  slug?: string | null;
  country?: string | null;
  continent?: string | null;
  region?: string | null;
  category?: string | null;
  cuisine_type?: string | null;
  summary?: string | null;
  brief_description?: string | null;
  description?: string | null;
  history?: string | null;
  local_names?: string[] | null;
  ethnic_group?: string | null;
  occasion_tags?: string[] | null;
  image_url?: string | null;
  ingredients?: IngredientValue[] | null;
  steps?: StepValue[] | null;
  prep_time?: number | null;
  cook_time?: number | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  tags?: string[] | null;
  dietary_tags?: string[] | null;
  allergen_tags?: string[] | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  verification_status?: string | null;
  safety_notes?: string | null;
  item_type?: string | null;
  heat_level?: number | null;
  created_at?: string | null;
  cultural_significance?: string | null;
  cultural_sources?: unknown;
  history_sources?: unknown;
  world_equivalent_dish?: string | null;
  is_african?: boolean | null;
}

export interface VenueRecord {
  id: string;
  name: string;
  type?: string | null;
  address?: string | null;
}

export function isLooseItem(value: unknown): value is LooseItem {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asIngredientList(value: unknown): IngredientValue[] {
  if (Array.isArray(value)) {
    return value.flatMap((item): IngredientValue[] => {
      if (typeof item === "string" || typeof item === "number") return [String(item)];
      if (isLooseItem(item)) return [item];
      return [];
    });
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return asIngredientList(parsed);
    } catch {
      /* plain text list */
    }
    return trimmed.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  }
  return [];
}

export function asStepList(value: unknown): StepValue[] {
  return asIngredientList(value);
}

/** Copy a recipe row and normalise JSON ingredient/step columns into lists. */
export function withParsedRecipeFields<T extends { ingredients?: unknown; steps?: unknown }>(
  row: T
): Omit<T, "ingredients" | "steps"> & { ingredients: IngredientValue[]; steps: StepValue[] } {
  return {
    ...row,
    ingredients: asIngredientList(row.ingredients),
    steps: asStepList(row.steps),
  };
}

export function displayName(value: unknown, fallback = "Unknown"): string {
  if (typeof value === "string" && value.trim()) return value;
  if (isLooseItem(value) && typeof value.name === "string" && value.name.trim()) return value.name;
  return fallback;
}
