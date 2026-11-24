/**
 * Unit conversion graph tests (cups↔g).
 * Run: npm run test:unit-conversion
 */
import {
  toGrams,
  toMl,
  compareQuantities,
  normalizeUnit,
} from "../src/lib/unitConversion.ts";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("normalizeUnit");
{
  assert(normalizeUnit("Cups") === "cup", "Cups → cup");
  assert(normalizeUnit("tbsp.") === "tbsp", "tbsp. → tbsp");
  assert(normalizeUnit("grams") === "g", "grams → g");
}

console.log("toGrams / toMl");
{
  assert(Math.abs((toGrams(1, "kg", "rice") || 0) - 1000) < 0.01, "1 kg → 1000 g");
  assert(Math.abs((toMl(1, "cup") || 0) - 240) < 0.01, "1 cup → 240 ml");
  const riceCup = toGrams(1, "cup", "rice");
  assert(riceCup != null && Math.abs(riceCup - 185) < 1, "1 cup rice ≈ 185 g");
  const flourG = toGrams(250, "g", "flour");
  assert(flourG === 250, "250 g flour stays 250");
}

console.log("compareQuantities — cups↔g");
{
  const enough = compareQuantities({
    pantryAmount: 500,
    pantryUnit: "g",
    pantryKnown: true,
    requiredAmount: 2,
    requiredUnit: "cups",
    ingredientName: "rice",
  });
  assert(enough.ok && enough.comparable, "500 g rice ≥ 2 cups");

  const short = compareQuantities({
    pantryAmount: 100,
    pantryUnit: "g",
    pantryKnown: true,
    requiredAmount: 2,
    requiredUnit: "cups",
    ingredientName: "rice",
  });
  assert(!short.ok && short.comparable, "100 g rice < 2 cups");

  const flourOk = compareQuantities({
    pantryAmount: 2,
    pantryUnit: "cups",
    pantryKnown: true,
    requiredAmount: 200,
    requiredUnit: "g",
    ingredientName: "flour",
  });
  assert(flourOk.ok && flourOk.comparable, "2 cups flour ≥ 200 g");

  const unknown = compareQuantities({
    pantryAmount: null,
    pantryUnit: "g",
    pantryKnown: false,
    requiredAmount: 1,
    requiredUnit: "cup",
    ingredientName: "rice",
  });
  assert(!unknown.comparable && unknown.reason === "unknown_quantity", "unknown qty not comparable");
}

console.log("\n" + "=".repeat(40));
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
