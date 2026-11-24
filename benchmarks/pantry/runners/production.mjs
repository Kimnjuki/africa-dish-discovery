/**
 * Production matcher semantics on fixture candidates (JSON path + production canMakeNow).
 * Does not call Supabase / LLM — deterministic offline mirror of JSON fallback.
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
    expires_at: p.expires_at ?? undefined,
  }));

  if (!pantry.length) {
    return { ranked: [], predictions: [], latencyMs: 0 };
  }

  const t0 = performance.now();
  const matches = findMatchingRecipes(pantry, c.candidates || [], 10);
  const latencyMs = performance.now() - t0;
  const byId = new Map(matches.map((m) => [m.recipe.id, m]));

  // Apply allergy / equipment / time soft filters when constraints present
  const allergies = new Set((c.constraints?.allergies || []).map((a) => a.toLowerCase()));
  const equipment = new Set((c.constraints?.equipment || []).map((e) => e.toLowerCase()));
  const maxMin = c.constraints?.max_total_minutes;

  const predictions = (c.candidates || []).map((rec) => {
    const m = byId.get(rec.id) || calculateRecipeMatch(pantry, rec);
    let blocked = false;
    if (allergies.size) {
      for (const a of rec.allergens || []) {
        if (allergies.has(String(a).toLowerCase())) blocked = true;
      }
      // Also block if peanut allergy and recipe/pantry match peanut butter ingredient
      if (allergies.has("peanut")) {
        const blob = JSON.stringify(rec.ingredients || []).toLowerCase();
        if (blob.includes("peanut") || blob.includes("groundnut")) blocked = true;
      }
    }
    if (equipment.size && Array.isArray(rec.requires_equipment)) {
      for (const need of rec.requires_equipment) {
        if (!equipment.has(String(need).toLowerCase())) blocked = true;
      }
    }
    if (maxMin != null) {
      const total = (rec.prep_time || 0) + (rec.cook_time || 0);
      if (total > maxMin) blocked = true;
    }

    // Production ready flag (legacy soft) vs cookability-first
    const productionReady = m.canMakeNow && !blocked;
    const strictReady = m.missingIngredients.length === 0 && m.matchedCount > 0 && !blocked;
    const labeledReady = mode === "cook_now" ? strictReady : productionReady && !blocked;

    return {
      recipeId: rec.id,
      labeledReady,
      productionCanMakeNow: productionReady,
      missingIngredients: m.missingIngredients,
      matchedIngredients: m.matchedIngredients,
      matchPercentage: m.matchPercentage,
      goldRelevance: c.gold?.relevance?.[rec.id] ?? 0,
      safetyFail: blocked
        ? false
        : (c.gold?.critical_safety_ids || []).includes(rec.id) && labeledReady,
      blocked,
      score: blocked ? -1 : m.matchPercentage,
    };
  });

  predictions.sort((a, b) => {
    if (a.blocked !== b.blocked) return Number(a.blocked) - Number(b.blocked);
    if (Number(b.labeledReady) !== Number(a.labeledReady)) {
      return Number(b.labeledReady) - Number(a.labeledReady);
    }
    return b.score - a.score;
  });

  return {
    ranked: predictions.filter((p) => !p.blocked).map((p) => p.recipeId),
    predictions,
    latencyMs,
  };
}
