/**
 * Pantry → recipe matching via recipe_ingredients + ingredient_aliases.
 * Prefer this over JSON-blob matching when the join table is populated.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeAlias } from "@/lib/aliasResolver";
import { getSubstituteNames } from "@/lib/substitutionGraph";
import type { MatchResult } from "@/utils/recipeMatching";

export interface PantryNameItem {
  id: string;
  name: string;
  ingredient_name?: string;
  expires_at?: string;
}

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

async function resolvePantryToIngredientIds(
  pantry: PantryNameItem[]
): Promise<{
  pantryIdToIngredientIds: Map<string, string[]>;
  ingredientIdToName: Map<string, string>;
  resolvedCount: number;
}> {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id,name,slug,canonical_name");
  const { data: aliases } = await supabase
    .from("ingredient_aliases")
    .select("ingredient_id,alias,alias_normalized")
    .neq("review_status", "rejected");

  const exact = new Map<string, string>();
  const idToName = new Map<string, string>();
  for (const ing of ingredients || []) {
    idToName.set(ing.id, ing.name);
    for (const key of [ing.name, ing.canonical_name, ing.slug]) {
      const n = normalizeAlias(key || "");
      if (n && !exact.has(n)) exact.set(n, ing.id);
    }
  }
  for (const a of aliases || []) {
    const n = normalizeAlias(a.alias_normalized || a.alias);
    if (n && !exact.has(n)) exact.set(n, a.ingredient_id);
  }

  const pantryIdToIngredientIds = new Map<string, string[]>();
  let resolvedCount = 0;

  for (const item of pantry) {
    const raw = item.ingredient_name || item.name || "";
    const n = normalizeAlias(raw);
    const ids = new Set<string>();
    const direct = exact.get(n);
    if (direct) ids.add(direct);

    // Try substitute names as alternate pantry coverage
    for (const sub of getSubstituteNames(raw).slice(0, 6)) {
      const sid = exact.get(normalizeAlias(sub));
      if (sid) ids.add(sid);
    }

    // Token contains: longest ingredient name inside pantry string
    if (!ids.size && n.length >= 3) {
      for (const [key, id] of exact) {
        if (key.length < 4) continue;
        if (n === key || n.includes(key)) {
          ids.add(id);
          break;
        }
      }
    }

    if (ids.size) resolvedCount++;
    pantryIdToIngredientIds.set(item.id, [...ids]);
  }

  return { pantryIdToIngredientIds, ingredientIdToName: idToName, resolvedCount };
}

/**
 * Match pantry items against recipe_ingredients. Returns [] if graph is empty
 * or pantry cannot resolve to any ingredient IDs (caller should fall back).
 */
export async function matchPantryViaIngredientGraph(
  pantryItems: PantryNameItem[],
  limit = 40
): Promise<{ matches: MatchResult[]; meta: { resolvedPantry: number; joinHits: number; usedGraph: boolean } }> {
  if (!pantryItems.length) {
    return { matches: [], meta: { resolvedPantry: 0, joinHits: 0, usedGraph: false } };
  }

  const { pantryIdToIngredientIds, ingredientIdToName, resolvedCount } =
    await resolvePantryToIngredientIds(pantryItems);

  const ownedIngredientIds = new Set<string>();
  const expiringIngredientIds = new Set<string>();
  for (const item of pantryItems) {
    const ids = pantryIdToIngredientIds.get(item.id) || [];
    const days = daysUntil(item.expires_at);
    for (const id of ids) {
      ownedIngredientIds.add(id);
      if (days != null && days <= 3) expiringIngredientIds.add(id);
    }
  }

  if (!ownedIngredientIds.size) {
    return { matches: [], meta: { resolvedPantry: resolvedCount, joinHits: 0, usedGraph: false } };
  }

  const ownedList = [...ownedIngredientIds];
  // PostgREST .in() batches
  const joinRows: Array<{ recipe_id: string; ingredient_id: string; display_text: string | null }> = [];
  for (let i = 0; i < ownedList.length; i += 80) {
    const batch = ownedList.slice(i, i + 80);
    const { data, error } = await supabase
      .from("recipe_ingredients")
      .select("recipe_id,ingredient_id,display_text")
      .in("ingredient_id", batch);
    if (error) throw error;
    for (const row of data || []) {
      joinRows.push({
        recipe_id: row.recipe_id,
        ingredient_id: row.ingredient_id,
        display_text: (row as { display_text?: string | null }).display_text ?? null,
      });
    }
  }

  if (!joinRows.length) {
    return { matches: [], meta: { resolvedPantry: resolvedCount, joinHits: 0, usedGraph: true } };
  }

  // Aggregate matched ingredient IDs per recipe
  const byRecipe = new Map<string, Set<string>>();
  for (const row of joinRows) {
    if (!byRecipe.has(row.recipe_id)) byRecipe.set(row.recipe_id, new Set());
    byRecipe.get(row.recipe_id)!.add(row.ingredient_id);
  }

  // Total ingredient counts for candidate recipes
  const recipeIds = [...byRecipe.keys()];
  const totals = new Map<string, number>();
  const allNames = new Map<string, Map<string, string>>(); // recipe → ingredientId → label

  for (let i = 0; i < recipeIds.length; i += 80) {
    const batch = recipeIds.slice(i, i + 80);
    const { data, error } = await supabase
      .from("recipe_ingredients")
      .select("recipe_id,ingredient_id,display_text")
      .in("recipe_id", batch);
    if (error) throw error;
    for (const row of data || []) {
      totals.set(row.recipe_id, (totals.get(row.recipe_id) || 0) + 1);
      if (!allNames.has(row.recipe_id)) allNames.set(row.recipe_id, new Map());
      const label =
        (row as { display_text?: string | null }).display_text ||
        ingredientIdToName.get(row.ingredient_id) ||
        "ingredient";
      allNames.get(row.recipe_id)!.set(row.ingredient_id, label);
    }
  }

  type Scored = {
    recipeId: string;
    matched: Set<string>;
    total: number;
    score: number;
    urgency: number;
  };

  const scored: Scored[] = [];
  for (const [recipeId, matched] of byRecipe) {
    const total = totals.get(recipeId) || matched.size;
    if (total === 0) continue;
    const score = matched.size / total;
    if (score < 0.25 && matched.size < 2) continue;
    let urgency = 0;
    for (const id of matched) {
      if (expiringIngredientIds.has(id)) urgency += 1;
    }
    scored.push({ recipeId, matched, total, score, urgency });
  }

  scored.sort((a, b) => b.score + b.urgency * 0.05 - (a.score + a.urgency * 0.05));
  const top = scored.slice(0, limit);

  if (!top.length) {
    return { matches: [], meta: { resolvedPantry: resolvedCount, joinHits: joinRows.length, usedGraph: true } };
  }

  const { data: recipes, error: recErr } = await supabase
    .from("recipes")
    .select(
      "id,name,country,summary,prep_time,cook_time,servings,difficulty,image_url,tags,ingredients,cuisine_type,category"
    )
    .in(
      "id",
      top.map((t) => t.recipeId)
    );
  if (recErr) throw recErr;

  const recipeById = new Map((recipes || []).map((r) => [r.id, r]));
  const matches: MatchResult[] = [];

  for (const s of top) {
    const recipe = recipeById.get(s.recipeId);
    if (!recipe) continue;
    const nameMap = allNames.get(s.recipeId) || new Map();
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];
    for (const [ingId, label] of nameMap) {
      if (s.matched.has(ingId)) matchedIngredients.push(label);
      else missingIngredients.push(label);
    }

    const matchPercentage = Math.round(s.score * 100);
    const canMakeNow = matchPercentage >= 85 || (s.matched.size >= s.total - 1 && s.total > 0);
    let priority: "high" | "medium" | "low" = "low";
    let priorityReason: string | undefined;
    if (s.urgency > 0) {
      priority = "high";
      priorityReason = "Uses expiring pantry items";
    } else if (matchPercentage >= 75) {
      priority = "high";
      priorityReason = "Strong pantry coverage";
    } else if (matchPercentage >= 50) {
      priority = "medium";
    }

    matches.push({
      recipe: {
        id: recipe.id,
        name: recipe.name,
        country: recipe.country || undefined,
        ingredients: recipe.ingredients as MatchResult["recipe"]["ingredients"],
        prep_time: recipe.prep_time || undefined,
        cook_time: recipe.cook_time || undefined,
        servings: recipe.servings || undefined,
        difficulty: recipe.difficulty || undefined,
        tags: recipe.tags || undefined,
        image_url: recipe.image_url || undefined,
        summary: recipe.summary || undefined,
        cuisine_type: recipe.cuisine_type || undefined,
        category: recipe.category || undefined,
      },
      matchPercentage,
      matchedCount: s.matched.size,
      totalIngredients: s.total,
      missingIngredients,
      matchedIngredients,
      substitutableIngredients: [],
      canMakeNow,
      needsShopping: missingIngredients.length > 0,
      urgencyBoost: s.urgency,
      pantryCoverage: matchPercentage,
      priority,
      priorityReason,
    });
  }

  return {
    matches,
    meta: { resolvedPantry: resolvedCount, joinHits: joinRows.length, usedGraph: true },
  };
}
