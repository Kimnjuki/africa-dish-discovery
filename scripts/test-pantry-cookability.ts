/**
 * Cookability-first unit checks for pantry matching.
 * Run: npm run test:pantry-cookability
 */
import {
  calculateRecipeMatch,
  namesOverlap,
  findMatchingRecipes,
  preparationCompatible,
} from "../src/utils/recipeMatching.ts";

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

console.log("namesOverlap — weak solo tokens");
{
  assert(!namesOverlap("olive oil", "palm oil"), "olive oil ≠ palm oil");
  assert(!namesOverlap("oil", "palm oil"), "bare oil ≠ palm oil");
  assert(!namesOverlap("paprika", "pap"), "paprika ≠ pap");
  assert(namesOverlap("sukuma wiki", "sukuma wiki"), "exact sukuma");
  assert(namesOverlap("scotch bonnet", "scotch bonnet pepper"), "compound scotch bonnet");
}

console.log("canMakeNow — zero essential missing");
{
  const pantry = [
    { id: "1", name: "onion", ingredient_name: "onion" },
    { id: "2", name: "tomato", ingredient_name: "tomato" },
    { id: "3", name: "oil", ingredient_name: "oil" },
    { id: "4", name: "salt", ingredient_name: "salt" },
  ];
  const full = {
    id: "r1",
    name: "Relish",
    ingredients: [{ name: "onion" }, { name: "tomato" }, { name: "oil" }, { name: "salt" }],
  };
  const missing = {
    id: "r2",
    name: "Chicken stew",
    ingredients: [
      { name: "onion" },
      { name: "tomato" },
      { name: "oil" },
      { name: "salt" },
      { name: "chicken" },
    ],
  };
  const m1 = calculateRecipeMatch(pantry, full);
  const m2 = calculateRecipeMatch(pantry, missing);
  assert(m1.canMakeNow === true, "full pantry → ready");
  assert(m2.canMakeNow === false, "missing chicken → not ready");
  assert(m2.missingIngredients.some((x) => /chicken/i.test(x)), "discloses chicken");
}

console.log("preparationCompatible — flour vs grain / fresh vs dried");
{
  assert(!preparationCompatible("teff flour", "whole teff grain"), "whole grain ≠ flour");
  assert(preparationCompatible("teff flour", "teff flour"), "flour = flour");
  assert(!preparationCompatible("stockfish", "fresh tilapia"), "fresh ≠ stockfish");
  assert(!preparationCompatible("fresh fish", "stockfish"), "stockfish ≠ fresh");
}

console.log("teff grain must not make injera ready");
{
  const m = calculateRecipeMatch(
    [
      { id: "1", name: "whole teff grain", ingredient_name: "whole teff grain" },
      { id: "2", name: "water", ingredient_name: "water" },
      { id: "3", name: "salt", ingredient_name: "salt" },
    ],
    {
      id: "injera",
      name: "Injera",
      ingredients: [{ name: "teff flour" }, { name: "water" }, { name: "salt" }],
    }
  );
  assert(m.canMakeNow === false, "injera not ready from whole grain");
  assert(m.missingIngredients.some((x) => /flour/i.test(x)), "discloses teff flour missing");
}

console.log("constraints — peanut allergy blocks mafe");
{
  const pantry = [
    { id: "1", name: "chicken", ingredient_name: "chicken" },
    { id: "2", name: "onion", ingredient_name: "onion" },
    { id: "3", name: "peanut butter", ingredient_name: "peanut butter" },
    { id: "4", name: "tomato", ingredient_name: "tomato" },
    { id: "5", name: "oil", ingredient_name: "oil" },
    { id: "6", name: "salt", ingredient_name: "salt" },
  ];
  const recipes = [
    {
      id: "mafe",
      name: "Mafé",
      ingredients: [
        { name: "chicken" },
        { name: "peanut butter" },
        { name: "onion" },
        { name: "tomato" },
        { name: "oil" },
        { name: "salt" },
      ],
      allergens: ["peanut"],
    },
    {
      id: "yassa",
      name: "Yassa",
      ingredients: [
        { name: "chicken" },
        { name: "onion" },
        { name: "oil" },
        { name: "salt" },
      ],
    },
  ];
  const ranked = findMatchingRecipes(pantry, recipes, {
    mode: "cook_now",
    constraints: { allergies: ["peanut"], equipment: ["stove"] },
  });
  assert(!ranked.some((m) => m.recipe.id === "mafe"), "mafe excluded under peanut allergy");
  assert(ranked.some((m) => m.recipe.id === "yassa" && m.canMakeNow), "yassa still cookable");
}

console.log("ranking — ready above missing-main");
{
  const pantry = [
    { id: "1", name: "rice", ingredient_name: "rice" },
    { id: "2", name: "onion", ingredient_name: "onion" },
    { id: "3", name: "tomato", ingredient_name: "tomato" },
    { id: "4", name: "oil", ingredient_name: "oil" },
    { id: "5", name: "salt", ingredient_name: "salt" },
  ];
  const recipes = [
    {
      id: "almost",
      name: "Almost Egusi",
      ingredients: [
        { name: "egusi" },
        { name: "palm oil" },
        { name: "onion" },
        { name: "salt" },
      ],
    },
    {
      id: "tomato-rice",
      name: "Tomato Rice",
      ingredients: [
        { name: "rice" },
        { name: "onion" },
        { name: "tomato" },
        { name: "oil" },
        { name: "salt" },
      ],
    },
  ];
  const ranked = findMatchingRecipes(pantry, recipes, 10);
  assert(ranked[0]?.recipe.id === "tomato-rice", "tomato rice ranks first");
  assert(ranked.find((m) => m.recipe.id === "tomato-rice")?.canMakeNow === true, "tomato rice ready");
  assert(ranked.find((m) => m.recipe.id === "almost")?.canMakeNow === false, "almost egusi not ready");
}

console.log("quantity — cups↔g conversion blocks shortfall");
{
  const short = calculateRecipeMatch(
    [
      { id: "1", name: "rice", ingredient_name: "rice", quantity: 100, unit: "g", quantity_known: true },
      { id: "2", name: "onion", ingredient_name: "onion", quantity: 2, unit: "piece", quantity_known: true },
      { id: "3", name: "tomato", ingredient_name: "tomato", quantity: 3, unit: "piece", quantity_known: true },
      { id: "4", name: "oil", ingredient_name: "oil", quantity: 3, unit: "tbsp", quantity_known: true },
      { id: "5", name: "salt", ingredient_name: "salt", quantity: 1, unit: "tsp", quantity_known: true },
    ],
    {
      id: "jollof",
      name: "Jollof",
      ingredients: [
        { name: "rice", quantity: 2, unit: "cups" },
        { name: "onion", quantity: 1, unit: "piece" },
        { name: "tomato", quantity: 2, unit: "piece" },
        { name: "oil", quantity: 2, unit: "tbsp" },
        { name: "salt", quantity: 1, unit: "tsp" },
      ],
    }
  );
  assert(short.canMakeNow === false, "100 g rice < 2 cups → not ready");
  assert(!!short.quantityWarning, "quantity warning present");

  const enough = calculateRecipeMatch(
    [
      { id: "1", name: "rice", ingredient_name: "rice", quantity: 500, unit: "g", quantity_known: true },
      { id: "2", name: "onion", ingredient_name: "onion", quantity: 2, unit: "piece", quantity_known: true },
      { id: "3", name: "tomato", ingredient_name: "tomato", quantity: 3, unit: "piece", quantity_known: true },
      { id: "4", name: "oil", ingredient_name: "oil", quantity: 3, unit: "tbsp", quantity_known: true },
      { id: "5", name: "salt", ingredient_name: "salt", quantity: 1, unit: "tsp", quantity_known: true },
    ],
    {
      id: "jollof2",
      name: "Jollof",
      ingredients: [
        { name: "rice", quantity: 2, unit: "cups" },
        { name: "onion", quantity: 1, unit: "piece" },
        { name: "tomato", quantity: 2, unit: "piece" },
        { name: "oil", quantity: 2, unit: "tbsp" },
        { name: "salt", quantity: 1, unit: "tsp" },
      ],
    }
  );
  assert(enough.canMakeNow === true, "500 g rice ≥ 2 cups → ready");
}

console.log("\n" + "=".repeat(40));
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
