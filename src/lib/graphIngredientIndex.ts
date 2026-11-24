/**
 * Build per-recipe searchable ingredient text from recipe_ingredients + aliases.
 * Powers Recipe Index "Has ingredient" beyond free-text JSON blobs.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeSearchText } from "@/lib/recipeSearch";

type JoinRow = {
  recipe_id: string;
  ingredient_id: string;
  ingredients: {
    name: string | null;
    slug: string | null;
    canonical_name: string | null;
  } | null;
};

type AliasRow = {
  ingredient_id: string;
  alias: string;
  alias_normalized: string | null;
};

async function fetchPaged<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const page = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += page) {
    const { data, error } = await build(from, from + page - 1);
    if (error) throw new Error(error.message);
    const chunk = data || [];
    out.push(...chunk);
    if (chunk.length < page) break;
  }
  return out;
}

/**
 * Returns Map<recipeId, normalized haystack of canonical names + approved aliases>.
 * Empty map when the join table is unavailable.
 */
export async function loadRecipeGraphIngredientText(): Promise<Map<string, string>> {
  try {
    const [joins, aliases] = await Promise.all([
      fetchPaged<JoinRow>((from, to) =>
        supabase
          .from("recipe_ingredients")
          .select("recipe_id,ingredient_id,ingredients(name,slug,canonical_name)")
          .range(from, to)
      ),
      fetchPaged<AliasRow>((from, to) =>
        supabase
          .from("ingredient_aliases")
          .select("ingredient_id,alias,alias_normalized")
          .neq("review_status", "rejected")
          .range(from, to)
      ),
    ]);

    if (!joins.length) return new Map();

    const aliasByIngredient = new Map<string, string[]>();
    for (const a of aliases) {
      const list = aliasByIngredient.get(a.ingredient_id) || [];
      list.push(a.alias_normalized || a.alias);
      aliasByIngredient.set(a.ingredient_id, list);
    }

    const tokensByRecipe = new Map<string, Set<string>>();
    for (const row of joins) {
      const set = tokensByRecipe.get(row.recipe_id) || new Set<string>();
      const ing = row.ingredients;
      if (ing) {
        for (const t of [ing.name, ing.slug, ing.canonical_name]) {
          const n = normalizeSearchText(t || "");
          if (n) set.add(n);
        }
      }
      for (const alias of aliasByIngredient.get(row.ingredient_id) || []) {
        const n = normalizeSearchText(alias);
        if (n) set.add(n);
      }
      tokensByRecipe.set(row.recipe_id, set);
    }

    const out = new Map<string, string>();
    for (const [recipeId, tokens] of tokensByRecipe) {
      out.set(recipeId, [...tokens].join(" "));
    }
    return out;
  } catch {
    return new Map();
  }
}
