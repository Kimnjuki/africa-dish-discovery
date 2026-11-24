/**
 * Cookability / false-ready / missing-ingredient metrics.
 * Keep overlap ≠ cookability — these score the second.
 */

import { compareQuantities } from "./unitConversion.mjs";

export function falseReadyRate(predictions) {
  // predictions: [{ labeledReady, goldRelevance, safetyFail }]
  const ready = predictions.filter((p) => p.labeledReady);
  if (!ready.length) return { rate: 0, readyCount: 0, falseReady: 0 };
  const falseReady = ready.filter(
    (p) => p.safetyFail || (p.goldRelevance ?? 0) < 2
  ).length;
  return { rate: falseReady / ready.length, readyCount: ready.length, falseReady };
}

export function missingIngredientStats(predMissing, goldMissing) {
  const pred = new Set((predMissing || []).map(norm));
  const gold = new Set((goldMissing || []).map(norm));
  let tp = 0;
  for (const m of pred) if (gold.has(m) || fuzzyIn(m, gold)) tp++;
  let recalled = 0;
  for (const g of gold) if (pred.has(g) || fuzzyIn(g, pred)) recalled++;
  const precision = pred.size ? tp / pred.size : gold.size === 0 ? 1 : 0;
  const recall = gold.size ? recalled / gold.size : 1;
  return { precision, recall, predCount: pred.size, goldCount: gold.size };
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyIn(token, set) {
  for (const x of set) {
    if (!x || !token) continue;
    if (x.includes(token) || token.includes(x)) return true;
  }
  return false;
}

/**
 * Quantity-aware cookability: available usable qty >= required for servings.
 * Unknown pantry qty → not "ready"; may be "check quantity".
 * Cups↔g via unit conversion graph when density is known.
 */
export function quantityOk(pantryItem, requiredAmount, requiredUnit) {
  const cmp = compareQuantities({
    pantryAmount: pantryItem.quantity,
    pantryUnit: pantryItem.unit,
    pantryKnown: pantryItem.quantity_known,
    requiredAmount,
    requiredUnit,
    ingredientName: pantryItem.name || pantryItem.ingredient_name || "",
  });
  if (!cmp.comparable) {
    if (cmp.reason === "unknown_quantity") return { ok: false, reason: "quantity_unknown" };
    if (cmp.reason === "unknown_density") return { ok: false, reason: "unit_mismatch" };
    return { ok: false, reason: "unit_mismatch" };
  }
  if (!cmp.ok) return { ok: false, reason: "insufficient_quantity", basis: cmp.basis };
  return { ok: true, reason: "ok", basis: cmp.basis };
}
