/**
 * Pantry quantity unit conversion graph.
 * Converts between culinary volume/mass units using ingredient densities where needed.
 * Unknown density + incompatible dimensions → null (caller must not claim Ready).
 */

export type UnitKind = "mass" | "volume" | "count" | "unknown";

const ALIASES: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  mg: "mg",
  ml: "ml",
  milliliter: "ml",
  millilitre: "ml",
  milliliters: "ml",
  millilitres: "ml",
  l: "l",
  liter: "l",
  litre: "l",
  liters: "l",
  litres: "l",
  cup: "cup",
  cups: "cup",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  piece: "piece",
  pieces: "piece",
  pc: "piece",
  bunch: "bunch",
  bunches: "bunch",
  clove: "clove",
  cloves: "clove",
  can: "can",
  tin: "can",
  pinch: "pinch",
  handful: "handful",
};

/** g per cup (US cup ≈ 240 ml) for common African / pantry staples. */
const DENSITY_G_PER_CUP: Record<string, number> = {
  water: 240,
  milk: 245,
  oil: 218,
  "palm oil": 218,
  "vegetable oil": 218,
  "olive oil": 216,
  "coconut oil": 218,
  flour: 125,
  "maize flour": 120,
  "maize meal": 120,
  "cornmeal": 120,
  "all purpose flour": 125,
  "wheat flour": 125,
  "cassava flour": 120,
  "teff flour": 120,
  rice: 185,
  "white rice": 185,
  "brown rice": 190,
  sugar: 200,
  salt: 273,
  butter: 227,
  "peanut butter": 258,
  "groundnut paste": 258,
  beans: 200,
  "black-eyed peas": 200,
  lentils: 190,
  fonio: 180,
  sorghum: 180,
  millet: 180,
  egusi: 140,
  "egusi seeds": 140,
  garri: 100,
  yogurt: 245,
};

const MASS_TO_G: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 240,
  pinch: 0.3,
};

export function normalizeUnit(unit: string | null | undefined): string | null {
  if (!unit) return null;
  const key = String(unit).toLowerCase().trim().replace(/\./g, "");
  return ALIASES[key] || key || null;
}

export function unitKind(unit: string | null | undefined): UnitKind {
  const u = normalizeUnit(unit);
  if (!u) return "unknown";
  if (u in MASS_TO_G) return "mass";
  if (u in VOLUME_TO_ML) return "volume";
  if (["piece", "bunch", "clove", "can", "handful"].includes(u)) return "count";
  return "unknown";
}

function densityFor(ingredientName: string): number | null {
  const n = String(ingredientName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!n) return null;
  if (DENSITY_G_PER_CUP[n] != null) return DENSITY_G_PER_CUP[n];
  for (const [key, dens] of Object.entries(DENSITY_G_PER_CUP)) {
    if (n.includes(key) || key.includes(n)) return dens;
  }
  // Generic flour / oil / rice heuristics
  if (/\bflour\b|\bmeal\b/.test(n)) return 120;
  if (/\boil\b/.test(n)) return 218;
  if (/\brice\b/.test(n)) return 185;
  if (/\bbean/.test(n) || /\bpea/.test(n)) return 200;
  return null;
}

/** Convert amount to grams when possible. */
export function toGrams(
  amount: number,
  unit: string | null | undefined,
  ingredientName: string
): number | null {
  if (!Number.isFinite(amount)) return null;
  const u = normalizeUnit(unit);
  if (!u) return null;
  if (u in MASS_TO_G) return amount * MASS_TO_G[u];
  if (u in VOLUME_TO_ML) {
    const ml = amount * VOLUME_TO_ML[u];
    const dens = densityFor(ingredientName); // g per cup
    if (dens == null) return null;
    const gPerMl = dens / 240;
    return ml * gPerMl;
  }
  return null;
}

/** Convert amount to millilitres when possible (volume-only). */
export function toMl(amount: number, unit: string | null | undefined): number | null {
  if (!Number.isFinite(amount)) return null;
  const u = normalizeUnit(unit);
  if (!u || !(u in VOLUME_TO_ML)) return null;
  return amount * VOLUME_TO_ML[u];
}

export type QuantityCompareResult =
  | { ok: true; comparable: true; available: number; required: number; basis: "g" | "ml" | "count" | "same_unit" }
  | { ok: false; comparable: true; available: number; required: number; basis: "g" | "ml" | "count" | "same_unit"; reason: "insufficient" }
  | { ok: false; comparable: false; reason: "incompatible_units" | "unknown_density" | "unknown_quantity" };

/**
 * Compare pantry quantity vs recipe requirement with unit conversion.
 */
export function compareQuantities(args: {
  pantryAmount: number | null | undefined;
  pantryUnit: string | null | undefined;
  pantryKnown?: boolean;
  requiredAmount: number | null | undefined;
  requiredUnit: string | null | undefined;
  ingredientName: string;
}): QuantityCompareResult {
  if (args.pantryKnown === false || args.pantryAmount == null) {
    return { ok: false, comparable: false, reason: "unknown_quantity" };
  }
  if (args.requiredAmount == null) {
    return { ok: true, comparable: true, available: args.pantryAmount, required: 0, basis: "same_unit" };
  }

  const pu = normalizeUnit(args.pantryUnit);
  const ru = normalizeUnit(args.requiredUnit);
  const pk = unitKind(pu);
  const rk = unitKind(ru);

  // Same count units
  if (pk === "count" && rk === "count" && pu === ru) {
    const ok = args.pantryAmount + 1e-9 >= args.requiredAmount;
    return ok
      ? { ok: true, comparable: true, available: args.pantryAmount, required: args.requiredAmount, basis: "count" }
      : {
          ok: false,
          comparable: true,
          available: args.pantryAmount,
          required: args.requiredAmount,
          basis: "count",
          reason: "insufficient",
        };
  }

  // Prefer mass basis
  const panG = toGrams(args.pantryAmount, pu, args.ingredientName);
  const reqG = toGrams(args.requiredAmount, ru, args.ingredientName);
  if (panG != null && reqG != null) {
    const ok = panG + 1e-6 >= reqG;
    return ok
      ? { ok: true, comparable: true, available: panG, required: reqG, basis: "g" }
      : { ok: false, comparable: true, available: panG, required: reqG, basis: "g", reason: "insufficient" };
  }

  // Volume-only
  const panMl = toMl(args.pantryAmount, pu);
  const reqMl = toMl(args.requiredAmount, ru);
  if (panMl != null && reqMl != null) {
    const ok = panMl + 1e-6 >= reqMl;
    return ok
      ? { ok: true, comparable: true, available: panMl, required: reqMl, basis: "ml" }
      : { ok: false, comparable: true, available: panMl, required: reqMl, basis: "ml", reason: "insufficient" };
  }

  // Same unit string fallback
  if (pu && ru && pu === ru) {
    const ok = args.pantryAmount + 1e-9 >= args.requiredAmount;
    return ok
      ? {
          ok: true,
          comparable: true,
          available: args.pantryAmount,
          required: args.requiredAmount,
          basis: "same_unit",
        }
      : {
          ok: false,
          comparable: true,
          available: args.pantryAmount,
          required: args.requiredAmount,
          basis: "same_unit",
          reason: "insufficient",
        };
  }

  if ((pk === "mass" || pk === "volume") && (rk === "mass" || rk === "volume")) {
    return { ok: false, comparable: false, reason: "unknown_density" };
  }
  return { ok: false, comparable: false, reason: "incompatible_units" };
}

export function listDensityKeys(): string[] {
  return Object.keys(DENSITY_G_PER_CUP).sort();
}
