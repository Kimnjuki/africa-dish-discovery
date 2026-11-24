/**
 * Quantity-aware wrapper: starts from overlap, then demotes ready when qty shortfall / unknown.
 */
import { runCase as overlapRun } from "./overlap.mjs";
import { quantityOk } from "../metrics/cookability.mjs";

export const name = "quantity_aware_baseline";

function requiredFromIngredient(ing) {
  if (ing && typeof ing === "object") {
    return {
      name: ing.name || ing.ingredient || "",
      quantity: ing.quantity ?? null,
      unit: ing.unit ?? null,
    };
  }
  return { name: String(ing || ""), quantity: null, unit: null };
}

export function runCase(c, options = {}) {
  const base = overlapRun(c, options);
  const pantryByNorm = new Map();
  for (const p of c.pantry || []) {
    const key = String(p.name || "")
      .toLowerCase()
      .trim();
    pantryByNorm.set(key, p);
  }

  const predictions = base.predictions.map((pred) => {
    const recipe = (c.candidates || []).find((r) => r.id === pred.recipeId);
    if (!recipe || !pred.labeledReady) return pred;

    let qtyFail = false;
    for (const raw of recipe.ingredients || []) {
      const req = requiredFromIngredient(raw);
      if (req.quantity == null) continue;
      // Find pantry item that matched this ingredient name loosely
      let pantryItem = pantryByNorm.get(req.name.toLowerCase());
      if (!pantryItem) {
        for (const [k, v] of pantryByNorm) {
          if (k.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(k)) {
            pantryItem = v;
            break;
          }
        }
      }
      if (!pantryItem) continue;
      const check = quantityOk(pantryItem, req.quantity, req.unit);
      if (!check.ok && (check.reason === "insufficient_quantity" || check.reason === "quantity_unknown")) {
        qtyFail = true;
        break;
      }
    }

    // Unknown qty on any staple used → not cook_now ready
    if ((c.mode || options.mode) === "cook_now") {
      for (const p of c.pantry || []) {
        if (p.quantity_known === false && pred.matchedIngredients?.some((m) =>
          String(m).toLowerCase().includes(String(p.name).toLowerCase().split(/\s+/).pop())
        )) {
          // soft: only if recipe has quantitative staple requirement
          const hasQty = (recipe.ingredients || []).some(
            (ing) => typeof ing === "object" && ing && ing.quantity != null
          );
          if (hasQty) qtyFail = true;
        }
      }
    }

    if (!qtyFail) return pred;
    return {
      ...pred,
      labeledReady: false,
      quantityFail: true,
      safetyFail: pred.safetyFail,
    };
  });

  predictions.sort((a, b) => {
    if (Number(b.labeledReady) !== Number(a.labeledReady)) {
      return Number(b.labeledReady) - Number(a.labeledReady);
    }
    return b.score - a.score;
  });

  return { ...base, ranked: predictions.map((p) => p.recipeId), predictions };
}
