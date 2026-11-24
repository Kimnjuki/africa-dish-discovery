/**
 * Production matcher: JSON cookability path + constraints (deterministic, no LLM).
 */
import { findMatchingRecipes, calculateRecipeMatch } from "../../../src/utils/recipeMatching.ts";

export const name = "production_matcher";

export function runCase(c, options = {}) {
  const mode = options.mode || c.mode || "cook_now";
  const pantry = (c.pantry || []).map((p) => ({
    id: p.id,
    name: p.name,
    ingredient_name: p.name,
    quantity: p.quantity ?? undefined,
    unit: p.unit ?? undefined,
    quantity_known: p.quantity_known,
    expires_at: p.expires_at ?? undefined,
  }));

  if (!pantry.length) {
    return { ranked: [], predictions: [], latencyMs: 0 };
  }

  const constraints = {
    allergies: c.constraints?.allergies || [],
    diets: c.constraints?.diets || [],
    equipment: c.constraints?.equipment || [],
    maxTotalMinutes: c.constraints?.max_total_minutes ?? null,
    servings: c.constraints?.servings ?? null,
  };

  const t0 = performance.now();
  const matches = findMatchingRecipes(pantry, c.candidates || [], {
    mode,
    constraints,
    excludeBlocked: true,
    minMatchPercentage: 10,
  });
  const latencyMs = performance.now() - t0;
  const byId = new Map(matches.map((m) => [m.recipe.id, m]));

  const predictions = (c.candidates || []).map((rec) => {
    const m =
      byId.get(rec.id) ||
      calculateRecipeMatch(pantry, rec);
    const inResults = byId.has(rec.id);
    const labeledReady = Boolean(m.canMakeNow) && inResults;
    return {
      recipeId: rec.id,
      labeledReady,
      // Only count Ready when the recipe survives constraint filtering.
      productionCanMakeNow: labeledReady,
      missingIngredients: m.missingIngredients,
      matchedIngredients: m.matchedIngredients,
      matchPercentage: m.matchPercentage,
      goldRelevance: c.gold?.relevance?.[rec.id] ?? 0,
      safetyFail: (c.gold?.critical_safety_ids || []).includes(rec.id) && labeledReady,
      blocked: !inResults && (c.gold?.critical_safety_ids || []).includes(rec.id),
      score: inResults ? m.matchPercentage : -1,
      quantityWarning: m.quantityWarning || null,
    };
  });

  return {
    ranked: matches.map((m) => m.recipe.id),
    predictions,
    latencyMs,
  };
}
