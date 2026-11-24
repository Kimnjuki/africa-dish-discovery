/**
 * Exact / name-overlap baseline using production recipeMatching (JSON path).
 * Intentionally does NOT apply allergy/equipment filters — ablation vs production.
 */
import {
  findMatchingRecipes,
  calculateRecipeMatch,
} from "../../../src/utils/recipeMatching.ts";

export const name = "overlap_baseline";

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

  const ranked = matches.map((m) => m.recipe.id);
  const byId = new Map(matches.map((m) => [m.recipe.id, m]));

  const predictions = (c.candidates || []).map((rec) => {
    const m = byId.get(rec.id) || calculateRecipeMatch(pantry, rec);
    const labeledReady =
      mode === "cook_now"
        ? m.missingIngredients.length === 0 && m.matchedCount > 0
        : Boolean(m.canMakeNow);
    // Overlap ablation: still count allergy-ready as safetyFail for visibility
    const allergyHit =
      (c.constraints?.allergies || []).some((a) => {
        const al = String(a).toLowerCase();
        const blob = JSON.stringify(rec.ingredients || []).toLowerCase();
        if (al === "peanut") return blob.includes("peanut") || blob.includes("groundnut");
        return (rec.allergens || []).map(String).map((x) => x.toLowerCase()).includes(al);
      }) && labeledReady;
    return {
      recipeId: rec.id,
      labeledReady,
      productionCanMakeNow: m.canMakeNow,
      missingIngredients: m.missingIngredients,
      matchedIngredients: m.matchedIngredients,
      matchPercentage: m.matchPercentage,
      goldRelevance: c.gold?.relevance?.[rec.id] ?? 0,
      safetyFail: allergyHit || ((c.gold?.critical_safety_ids || []).includes(rec.id) && labeledReady),
      score: m.matchPercentage,
    };
  });

  predictions.sort((a, b) => {
    if (mode === "cook_now" && Number(b.labeledReady) !== Number(a.labeledReady)) {
      return Number(b.labeledReady) - Number(a.labeledReady);
    }
    return b.score - a.score;
  });

  return {
    ranked: predictions.map((p) => p.recipeId),
    predictions,
    latencyMs,
    productionRanked: ranked,
  };
}
