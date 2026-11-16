/**
 * Recipe import parser checks.
 * Run: npm run test:import
 */
import {
  adaptDraftForMarket,
  draftFromPlainText,
  extractJsonLdRecipes,
  draftFromJsonLd,
} from "../src/lib/recipeImport.ts";

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

console.log("JSON-LD extract");
{
  const html = `<html><script type="application/ld+json">{"@type":"Recipe","name":"Jollof Rice","recipeIngredient":["2 cups rice","1 scotch bonnet"],"recipeInstructions":[{"@type":"HowToStep","text":"Parboil rice"},{"text":"Fry stew"}],"prepTime":"PT20M","cookTime":"PT45M","recipeYield":"6"}</script></html>`;
  const recipes = extractJsonLdRecipes(html);
  assert(recipes.length === 1, "found one recipe");
  const draft = draftFromJsonLd(recipes[0], { sourceUrl: "https://example.com/jollof", marketId: "ng" });
  assert(draft.name.toLowerCase().includes("jollof"), "name parsed");
  assert(draft.ingredients.some((i) => /rice/i.test(i)), "ingredients parsed");
  assert(draft.steps.length >= 2, "steps parsed");
  assert(draft.prep_time === 20, "prep PT20M");
  assert(draft.cook_time === 45, "cook PT45M");
  assert(/example.com/.test(draft.source_attribution), "attribution kept");
}

console.log("plain text family note");
{
  const draft = draftFromPlainText(
    `Egusi Soup\nIngredients\n2 cups egusi\n1 bunch ugwu\nSteps\nGrind egusi\nAdd greens`,
    { method: "voice", marketId: "ke" }
  );
  assert(draft.name.includes("Egusi"), "title");
  assert(draft.ingredients.length >= 2, "ingredients block");
  assert(draft.steps.length >= 2, "steps block");
  assert(draft.local_adaptations.length >= 0, "adaptations array present");
  // ugwu scarce in KE → should suggest adaptation when graph hits
  const adapted = adaptDraftForMarket(draft, "ke");
  assert(adapted.local_adaptations.some((a) => /ugwu/i.test(a.original)), "ugwu flagged for KE");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
