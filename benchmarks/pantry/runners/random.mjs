/** Sanity baseline: shuffle candidates; never marks ready. */
export const name = "random_baseline";

export function runCase(c) {
  const ids = (c.candidates || []).map((r) => r.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const predictions = ids.map((recipeId) => ({
    recipeId,
    labeledReady: false,
    productionCanMakeNow: false,
    missingIngredients: c.gold?.essential_missing_by_recipe?.[recipeId] || [],
    matchedIngredients: [],
    matchPercentage: 0,
    goldRelevance: c.gold?.relevance?.[recipeId] ?? 0,
    safetyFail: false,
    score: Math.random(),
  }));
  return { ranked: ids, predictions, latencyMs: 0 };
}
