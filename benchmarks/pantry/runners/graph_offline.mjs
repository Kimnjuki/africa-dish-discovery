/**
 * Offline graph-style set overlap using candidate ingredient names + alias expansion
 * from the substitution graph (no Supabase). Ablation vs JSON production matcher.
 */
import {
  normalizeIngredientName,
  namesOverlap,
  preparationCompatible,
} from "../../../src/utils/recipeMatching.ts";
import { getSubstituteNames } from "../../../src/lib/substitutionGraph.ts";

export const name = "graph_offline";

function extractLabels(ingredients) {
  return (ingredients || [])
    .map((ing) => {
      if (typeof ing === "string") return ing;
      if (ing && typeof ing === "object") return String(ing.name || ing.ingredient || "");
      return "";
    })
    .filter(Boolean);
}

function ownedKeys(pantry) {
  const keys = new Set();
  for (const p of pantry) {
    const n = normalizeIngredientName(p.name);
    if (!n) continue;
    keys.add(n);
    for (const sub of getSubstituteNames(p.name).slice(0, 6)) {
      keys.add(normalizeIngredientName(sub));
    }
  }
  return keys;
}

export function runCase(c, options = {}) {
  const mode = options.mode || c.mode || "cook_now";
  const pantry = c.pantry || [];
  if (!pantry.length) return { ranked: [], predictions: [], latencyMs: 0 };

  const owned = ownedKeys(pantry);
  const allergies = new Set((c.constraints?.allergies || []).map((a) => a.toLowerCase()));
  const t0 = performance.now();

  const scored = (c.candidates || []).map((rec) => {
    const labels = extractLabels(rec.ingredients);
    const matched = [];
    const missing = [];
    for (const label of labels) {
      const n = normalizeIngredientName(label);
      let hit = false;
      for (const o of owned) {
        if (!preparationCompatible(label, o)) continue;
        if (namesOverlap(o, n) || namesOverlap(o, label)) {
          hit = true;
          break;
        }
      }
      if (hit) matched.push(label);
      else missing.push(label);
    }
    const total = labels.length || 1;
    const score = matched.length / total;
    let blocked = false;
    if (allergies.has("peanut")) {
      const blob = JSON.stringify(rec.ingredients || []).toLowerCase();
      if (blob.includes("peanut") || blob.includes("groundnut")) blocked = true;
    }
    const canMakeNow = !blocked && missing.length === 0 && matched.length > 0;
    return {
      recipeId: rec.id,
      labeledReady: mode === "cook_now" ? canMakeNow : canMakeNow,
      productionCanMakeNow: canMakeNow,
      missingIngredients: missing,
      matchedIngredients: matched,
      matchPercentage: Math.round(score * 100),
      goldRelevance: c.gold?.relevance?.[rec.id] ?? 0,
      safetyFail: blocked ? false : (c.gold?.critical_safety_ids || []).includes(rec.id) && canMakeNow,
      blocked,
      score: blocked ? -1 : score,
    };
  });

  scored.sort((a, b) => {
    if (a.blocked !== b.blocked) return Number(a.blocked) - Number(b.blocked);
    if (Number(b.labeledReady) !== Number(a.labeledReady)) {
      return Number(b.labeledReady) - Number(a.labeledReady);
    }
    return b.score - a.score;
  });

  return {
    ranked: scored.filter((s) => !s.blocked).map((s) => s.recipeId),
    predictions: scored,
    latencyMs: performance.now() - t0,
  };
}
