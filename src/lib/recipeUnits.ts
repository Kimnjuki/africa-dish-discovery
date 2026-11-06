import type { IngredientValue, StepValue } from "@/types/content";

// Ingredient quantity scaling + metric/US unit conversion helpers.

const FRACTIONS: Record<string, number> = {
  "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
  "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

const NUMBER_RE = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/;

export type UnitSystem = "original" | "metric" | "us";

/** Parse a leading quantity token into a number. */
export function parseQuantity(token: string): number {
  if (FRACTIONS[token] !== undefined) return FRACTIONS[token];
  if (/\s/.test(token)) {
    const [whole, frac] = token.split(/\s+/);
    const [n, d] = frac.split("/").map(Number);
    return parseInt(whole, 10) + n / d;
  }
  if (token.includes("/")) {
    const [n, d] = token.split("/").map(Number);
    return n / d;
  }
  return parseFloat(token);
}

/** Render a number using cooking-friendly fractions where possible. */
export function formatQuantity(value: number): string {
  if (!isFinite(value)) return "";
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);

  const whole = Math.floor(rounded);
  const rest = rounded - whole;
  const nice: [number, string][] = [
    [0.125, "⅛"], [0.25, "¼"], [1 / 3, "⅓"], [0.375, "⅜"], [0.5, "½"],
    [0.625, "⅝"], [2 / 3, "⅔"], [0.75, "¾"], [0.875, "⅞"],
  ];
  for (const [v, glyph] of nice) {
    if (Math.abs(rest - v) < 0.03) return whole > 0 ? `${whole}${glyph}` : glyph;
  }
  return String(Math.round(rounded * 10) / 10);
}

/** Scale every quantity found in an ingredient line by `multiplier`. */
export function scaleIngredientText(text: string, multiplier: number): string {
  if (!text || multiplier === 1) return text;
  const match = text.match(NUMBER_RE);
  if (!match) return text;
  const token = match[0];
  const scaled = parseQuantity(token) * multiplier;
  return text.replace(token, formatQuantity(scaled));
}

type Conversion = { match: RegExp; factor: number; unit: string; round?: number };

// US customary -> metric
const TO_METRIC: Conversion[] = [
  { match: /\b(cups?|c)\b/i, factor: 240, unit: "ml", round: 5 },
  { match: /\b(tablespoons?|tbsp|tbs)\b/i, factor: 15, unit: "ml", round: 1 },
  { match: /\b(teaspoons?|tsp)\b/i, factor: 5, unit: "ml", round: 1 },
  { match: /\b(fl\.?\s?oz|fluid ounces?)\b/i, factor: 30, unit: "ml", round: 5 },
  { match: /\b(pounds?|lbs?|lb)\b/i, factor: 454, unit: "g", round: 5 },
  { match: /\b(ounces?|oz)\b/i, factor: 28, unit: "g", round: 1 },
  { match: /\b(inch(es)?|in)\b/i, factor: 2.54, unit: "cm", round: 0.5 },
];

// Metric -> US customary
const TO_US: Conversion[] = [
  { match: /\b(kilograms?|kgs?|kg)\b/i, factor: 2.205, unit: "lb", round: 0.25 },
  { match: /\b(grams?|gr|g)\b/i, factor: 0.0353, unit: "oz", round: 0.25 },
  { match: /\b(litres?|liters?|l)\b/i, factor: 4.227, unit: "cups", round: 0.25 },
  { match: /\b(millilitres?|milliliters?|mls?|ml)\b/i, factor: 0.00423, unit: "cups", round: 0.125 },
  { match: /\b(centimet(re|er)s?|cm)\b/i, factor: 0.394, unit: "in", round: 0.25 },
];

function roundTo(value: number, step?: number) {
  if (!step) return value;
  return Math.round(value / step) * step;
}

/**
 * Convert the first quantity+unit pair of an ingredient line into the target
 * system. Lines without a recognised unit are returned untouched.
 */
export function convertIngredientUnits(text: string, system: UnitSystem): string {
  if (!text || system === "original") return text;
  const numMatch = text.match(NUMBER_RE);
  if (!numMatch) return text;
  const qty = parseQuantity(numMatch[0]);
  const table = system === "metric" ? TO_METRIC : TO_US;

  for (const conv of table) {
    const unitMatch = text.match(conv.match);
    if (!unitMatch) continue;
    const converted = roundTo(qty * conv.factor, conv.round);
    if (!converted || converted <= 0) continue;
    return text
      .replace(numMatch[0], formatQuantity(converted))
      .replace(conv.match, conv.unit);
  }
  return text;
}

/** Normalise an ingredient entry (string or object) into a readable line. */
export function ingredientToText(ingredient: IngredientValue): string {
  if (typeof ingredient === "string") return ingredient;
  if (!ingredient || typeof ingredient !== "object") return "";
  const name = ingredient.name || ingredient.ingredient || ingredient.item || "";
  const qty = ingredient.quantity ?? ingredient.amount ?? "";
  const unit = ingredient.unit || "";
  const notes = ingredient.notes ? ` (${ingredient.notes})` : "";
  return [qty, unit, name].filter(Boolean).join(" ").trim() + notes;
}

/** Normalise a step entry (string or object) into a readable line. */
export function stepToText(step: StepValue): string {
  if (typeof step === "string") return step;
  if (!step || typeof step !== "object") return "";
  return String(step.instruction || step.text || step.description || step.step || "");
}

/** Apply scaling then unit conversion in one pass. */
export function prepareIngredientLine(
  ingredient: IngredientValue,
  multiplier: number,
  system: UnitSystem
): string {
  return convertIngredientUnits(
    scaleIngredientText(ingredientToText(ingredient), multiplier),
    system
  );
}
