/**
 * Constraint checks for pantry → recipe cookability.
 * Allergies / diet / equipment / time are hard filters for cook_now.
 */

export interface PantryMatchConstraints {
  allergies?: string[];
  diets?: string[];
  /** Equipment the household has (e.g. stove, blender, oven). */
  equipment?: string[];
  maxTotalMinutes?: number | null;
  servings?: number | null;
}

export interface ConstrainedRecipeFields {
  allergens?: string[] | null;
  allergen_tags?: string[] | null;
  dietary_tags?: string[] | null;
  tags?: string[] | null;
  ingredients?: unknown;
  prep_time?: number | null;
  cook_time?: number | null;
  requires_equipment?: string[] | null;
  name?: string | null;
  summary?: string | null;
}

const PEANUT_RE = /\b(peanut|groundnut|arachis|mafé|mafe)\b/i;
const DAIRY_RE = /\b(milk|butter|cream|cheese|yogurt|yoghurt|ghee)\b/i;
const GLUTEN_RE = /\b(wheat|flour|bread|pasta|semolina|gluten)\b/i;
const SHELLFISH_RE = /\b(shrimp|prawn|crab|lobster|crayfish|shellfish)\b/i;

function blobOf(recipe: ConstrainedRecipeFields): string {
  return [
    recipe.name || "",
    recipe.summary || "",
    JSON.stringify(recipe.ingredients || []),
    ...(recipe.tags || []),
    ...(recipe.dietary_tags || []),
    ...(recipe.allergens || []),
    ...(recipe.allergen_tags || []),
  ]
    .join(" ")
    .toLowerCase();
}

function allergyConflict(allergy: string, recipe: ConstrainedRecipeFields): boolean {
  const a = allergy.toLowerCase().trim();
  if (!a) return false;
  const listed = [...(recipe.allergens || []), ...(recipe.allergen_tags || [])].map((x) =>
    String(x).toLowerCase()
  );
  if (listed.includes(a)) return true;
  const blob = blobOf(recipe);
  if (a === "peanut" || a === "groundnut") return PEANUT_RE.test(blob);
  if (a === "dairy" || a === "milk") return DAIRY_RE.test(blob);
  if (a === "gluten" || a === "wheat") return GLUTEN_RE.test(blob);
  if (a === "shellfish" || a === "crustacean" || a === "crayfish") return SHELLFISH_RE.test(blob);
  return listed.some((x) => x.includes(a) || a.includes(x)) || blob.includes(a);
}

export function recipeViolatesConstraints(
  recipe: ConstrainedRecipeFields,
  constraints: PantryMatchConstraints | null | undefined
): { blocked: boolean; reasons: string[] } {
  if (!constraints) return { blocked: false, reasons: [] };
  const reasons: string[] = [];

  for (const allergy of constraints.allergies || []) {
    if (allergyConflict(allergy, recipe)) {
      reasons.push(`Conflicts with ${allergy} allergy`);
    }
  }

  const have = new Set((constraints.equipment || []).map((e) => e.toLowerCase()));
  if (have.size > 0 && Array.isArray(recipe.requires_equipment)) {
    for (const need of recipe.requires_equipment) {
      if (!have.has(String(need).toLowerCase())) {
        reasons.push(`Needs ${need}`);
      }
    }
  }

  if (constraints.maxTotalMinutes != null && constraints.maxTotalMinutes > 0) {
    const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    if (total > constraints.maxTotalMinutes) {
      reasons.push(`Takes ${total} min (budget ${constraints.maxTotalMinutes})`);
    }
  }

  return { blocked: reasons.length > 0, reasons };
}

const PREFS_KEY = "ladhaquest_pantry_constraints";

export function loadPantryConstraints(): PantryMatchConstraints {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { allergies: [], diets: [], equipment: ["stove"], maxTotalMinutes: null };
    return JSON.parse(raw) as PantryMatchConstraints;
  } catch {
    return { allergies: [], diets: [], equipment: ["stove"], maxTotalMinutes: null };
  }
}

export function savePantryConstraints(c: PantryMatchConstraints): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}
