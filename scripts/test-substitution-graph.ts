/**
 * Acceptance checks for F06 Africa-first substitution graph.
 * Run: node --experimental-strip-types scripts/test-substitution-graph.ts
 *  or: npm run test:substitutions
 */
import {
  getSubstituteNames,
  graphEdgeCount,
  listGraphCanonicalIngredients,
  lookupSubstitutions,
  stripIngredientNoise,
} from "../src/lib/substitutionGraph.ts";

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

function namesOf(ingredient: string): string[] {
  return lookupSubstitutions(ingredient).map((s) => s.name.toLowerCase());
}

console.log("graph bootstrap size");
{
  assert(graphEdgeCount() >= 25, `edge defs >= 25 (got ${graphEdgeCount()})`);
  assert(listGraphCanonicalIngredients().length >= 20, "canonical ingredients seeded");
}

console.log("stripIngredientNoise");
{
  assert(stripIngredientNoise("2 cups ugwu leaves").toLowerCase().includes("ugwu"), "strips qty from ugwu");
  assert(stripIngredientNoise("1 tbsp palm oil").toLowerCase().includes("palm"), "strips unit from palm oil");
}

console.log("ugwu ↔ spinach / kale");
{
  const names = namesOf("ugwu");
  assert(names.some((n) => n.includes("spinach")), "ugwu → spinach");
  assert(names.some((n) => n.includes("kale")), "ugwu → kale");
  const reverse = namesOf("ugu");
  assert(reverse.some((n) => n.includes("spinach")), "ugu alias → spinach");
  const back = namesOf("spinach");
  assert(back.some((n) => n.includes("ugwu")), "spinach → ugwu (bidirectional)");
}

console.log("sukuma wiki ↔ collard / kale");
{
  const names = namesOf("sukuma wiki");
  assert(names.some((n) => n.includes("collard")), "sukuma wiki → collard");
  assert(names.some((n) => n.includes("kale")), "sukuma wiki → kale");
  const alias = namesOf("sukumawiki");
  assert(alias.some((n) => n.includes("collard")), "sukumawiki alias resolves");
}

console.log("egusi ↔ pumpkin seeds");
{
  const hits = lookupSubstitutions("egusi seeds");
  assert(hits.some((h) => h.name.toLowerCase().includes("pumpkin")), "egusi → pumpkin seeds");
  assert(hits.some((h) => /nuttier|earthy|grind|toast/i.test(h.notes)), "egusi notes mention flavor/prep");
}

console.log("palm oil alternatives");
{
  const names = namesOf("red palm oil");
  assert(names.some((n) => n.includes("vegetable")), "palm oil → vegetable oil");
  assert(names.some((n) => n.includes("coconut")), "palm oil → coconut oil");
}

console.log("scotch bonnet ↔ habanero");
{
  const names = namesOf("scotch bonnet");
  assert(names.some((n) => n.includes("habanero")), "scotch bonnet → habanero");
  const back = namesOf("habanero");
  assert(back.some((n) => n.includes("scotch")), "habanero → scotch bonnet");
  const ata = namesOf("ata rodo");
  assert(ata.some((n) => n.includes("habanero")), "ata rodo alias → habanero");
}

console.log("pantry name expansion");
{
  const subs = getSubstituteNames("egusi");
  assert(subs.some((s) => s.includes("pumpkin")), "getSubstituteNames includes pumpkin");
  const sukuma = getSubstituteNames("sukuma");
  assert(sukuma.some((s) => s.includes("collard") || s.includes("kale")), "sukuma expands for pantry match");
}

console.log("region / flavor metadata");
{
  const hits = lookupSubstitutions("ugwu", { regionHint: "Nigeria" });
  assert(hits.length > 0, "ugwu returns hits");
  assert(hits[0].regions.length > 0 || hits[0].flavorRole.length > 0, "has region or flavor role");
  assert(hits[0].source === "graph", "source is graph");
}

console.log("\n" + "=".repeat(40));
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
