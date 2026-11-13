/**
 * Acceptance checks for synonym / typo-tolerant recipe search.
 * Run: node --experimental-strip-types scripts/test-recipe-search.ts
 */
import {
  expandSearchQuery,
  haystackContainsTerm,
  recipeMatchesQuery,
  searchRecipes,
} from "../src/lib/recipeSearch.ts";

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

console.log("expandSearchQuery — jollof aliases");
{
  const e = expandSearchQuery("jolof");
  assert(e.terms.includes("jollof"), "jolof expands to jollof");
  assert(e.expanded, "jolof marked expanded");
  assert(!!e.suggestion, "jolof has suggestion");
}

console.log("expandSearchQuery — ugali family");
{
  const e = expandSearchQuery("nsima");
  assert(e.terms.includes("ugali") || e.terms.includes("sadza"), "nsima links to ugali/sadza");
}

console.log("expandSearchQuery — typo tolerance");
{
  const e = expandSearchQuery("jellof");
  assert(e.terms.includes("jollof"), "jellof → jollof");
  const e2 = expandSearchQuery("ugalii");
  assert(e2.terms.includes("ugali"), "ugalii → ugali");
  const e3 = expandSearchQuery("injra");
  assert(e3.terms.includes("injera"), "injra → injera");
}

console.log("haystackContainsTerm — no pap/paprika false positive");
{
  assert(haystackContainsTerm("south african pap with gravy", "pap"), "pap matches word pap");
  assert(!haystackContainsTerm("smoked paprika powder", "pap"), "pap does not match paprika");
}

console.log("recipeMatchesQuery — dish samples");
{
  const jollof = { name: "Nigerian Jollof Rice", country: "Nigeria", summary: "Party rice", tags: ["rice"] };
  const ugali = { name: "Ugali and Sukuma Wiki", country: "Kenya", summary: "Maize staple", tags: [] };
  const injera = { name: "Ethiopian Injera", country: "Ethiopia", summary: "Teff flatbread", tags: ["bread"] };
  const paprikaSoup = { name: "Paprika Chicken Soup", country: "Global", summary: "Smoked paprika", tags: [] };

  assert(recipeMatchesQuery(jollof, "jolof"), "jolof matches Jollof Rice");
  assert(recipeMatchesQuery(jollof, "djolof"), "djolof matches Jollof Rice");
  assert(recipeMatchesQuery(ugali, "nshima"), "nshima matches Ugali");
  assert(recipeMatchesQuery(ugali, "sadza"), "sadza matches Ugali dish");
  assert(recipeMatchesQuery(injera, "enjera"), "enjera matches Injera");
  assert(!recipeMatchesQuery(paprikaSoup, "pap"), "pap does not match paprika soup");
}

console.log("searchRecipes — ranking");
{
  const recipes = [
    { name: "Tomato Stew", country: "Nigeria" },
    { name: "Party Jollof Rice", country: "Ghana" },
    { name: "Vegetable Soup", country: "Kenya" },
  ];
  const ranked = searchRecipes(recipes, "jolof");
  assert(ranked.length >= 1, "at least one jollof hit");
  assert(ranked[0].name.includes("Jollof"), "Jollof ranks first for jolof");
}

console.log("\n" + "=".repeat(40));
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
