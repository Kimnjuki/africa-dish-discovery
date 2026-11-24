/**
 * Ingredient-resolution scoring.
 * exact_or_alias ≠ broader_category ≠ possible_substitute ≠ ambiguous
 */

import { normalizeIngredientName } from "../../../src/utils/recipeMatching.ts";

export function scoreResolution(pantryItem, gold, systemCanonical) {
  if (!gold) return { scored: false };
  const outcome = gold.outcome;
  const predicted = systemCanonical ? normalizeIngredientName(systemCanonical) : null;
  const expected = gold.canonical ? normalizeIngredientName(gold.canonical) : null;

  if (outcome === "clarify" || outcome === "reject_guess") {
    // Pass if system did not force a specific wrong ready claim (caller checks ready)
    return {
      scored: true,
      correct: predicted == null || predicted === expected,
      relation_ok: true,
      kind: outcome,
    };
  }

  if (outcome === "resolved") {
    const correct = Boolean(predicted && expected && (predicted === expected || predicted.includes(expected) || expected.includes(predicted)));
    return {
      scored: true,
      correct,
      relation_ok: gold.relation === "exact_or_alias" || gold.relation === "possible_substitute",
      kind: "resolved",
    };
  }

  return { scored: false };
}
