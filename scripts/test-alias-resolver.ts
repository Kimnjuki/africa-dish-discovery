/**
 * Alias resolver + substitution engine hard-filter tests.
 * Run: npm run test:alias
 */
import {
  conflictsWithAllergies,
  normalizeAlias,
  resolveAlias,
  satisfiesAllDiets,
} from "../src/lib/aliasResolver.ts";
import {
  findSubstitutions,
  passesHardFilters,
  scoreCandidate,
  DEFAULT_WEIGHTS,
} from "../src/lib/substitutionEngine.ts";

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

console.log("normalizeAlias");
{
  assert(normalizeAlias("Sukuma Wiki") === "sukuma wiki", "lowercases");
  assert(normalizeAlias("Irú") === "iru", "strips diacritics");
  assert(normalizeAlias("  egusi!! ") === "egusi", "strips punctuation");
}

console.log("resolveAlias — local names");
{
  const sukuma = resolveAlias("sukuma wiki");
  assert(!sukuma.ambiguous, "sukuma wiki not ambiguous");
  assert(sukuma.matches.some((m) => m.slug === "sukuma-wiki"), "resolves sukuma-wiki");

  const collard = resolveAlias("collard greens");
  assert(collard.matches.some((m) => /collard/i.test(m.name)), "collards resolve");

  const ugwu = resolveAlias("ugu");
  assert(ugwu.matches.some((m) => m.slug === "ugwu"), "ugu → ugwu");

  const ndizi = resolveAlias("ndizi");
  assert(ndizi.matches.some((m) => m.slug === "banana"), "ndizi → banana not plantain");
}

console.log("resolveAlias — ambiguity (morogo family)");
{
  const morogo = resolveAlias("african spinach");
  assert(morogo.ambiguous || morogo.matches.length >= 1, "african spinach flagged or multi-match");
  assert(Boolean(morogo.disambiguationPrompt) || morogo.matches.length >= 1, "prompt or matches");
}

console.log("diet + allergen helpers");
{
  assert(satisfiesAllDiets(["vegan"], ["vegetarian", "vegan", "halal"]), "vegan ok");
  assert(!satisfiesAllDiets(["vegan"], ["vegetarian", "halal"]), "non-vegan rejected");
  assert(satisfiesAllDiets(["vegan", "gluten_free"], ["vegan", "gluten_free", "halal"]), "all required");
  assert(conflictsWithAllergies(["peanut"], ["groundnut"]), "peanut↔groundnut");
  assert(conflictsWithAllergies(["dairy"], ["milk"]), "dairy↔milk");
  assert(!conflictsWithAllergies(["peanut"], ["dairy"]), "unrelated allergy ok");
}

console.log("hard filters");
{
  assert(
    passesHardFilters(
      { dietary_tags: ["vegan", "dairy_free"], allergens: [] },
      ["vegan"],
      []
    ),
    "vegan candidate kept"
  );
  assert(
    !passesHardFilters(
      { dietary_tags: ["vegetarian"], allergens: ["dairy"] },
      ["vegan"],
      []
    ),
    "non-vegan rejected"
  );
  assert(
    !passesHardFilters(
      { dietary_tags: ["vegan"], allergens: ["peanut"] },
      ["vegan"],
      ["groundnut"]
    ),
    "peanut allergy rejects groundnut paste candidate"
  );
}

console.log("scoring — unknown availability");
{
  const known = scoreCandidate({
    curatedConfidence: 0.9,
    flavorSimilarity: 0.8,
    textureSimilarity: 0.8,
    availability: 0.9,
    budgetFit: 0.7,
    dietPreferenceFit: 1,
    userPreference: 0.5,
  });
  const unknown = scoreCandidate({
    curatedConfidence: 0.9,
    flavorSimilarity: 0.8,
    textureSimilarity: 0.8,
    availability: null,
    budgetFit: 0.7,
    dietPreferenceFit: 1,
    userPreference: 0.5,
  });
  assert(known.availabilityKnown === true, "known availability");
  assert(unknown.availabilityKnown === false, "unknown availability");
  assert(unknown.availabilityScore === 0.3, "unknown = 0.3");
  assert(known.score > unknown.score, "known scores higher than unknown");
  const sum = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
  assert(Math.abs(sum - 1) < 1e-9, "weights sum to 1");
}

console.log("engine — coconut milk vegan must not suggest evaporated milk");
{
  const vegan = findSubstitutions({
    ingredient: "coconut milk",
    dietTags: ["vegan", "dairy_free"],
    allergies: ["dairy"],
  });
  assert(!vegan.resolved_ingredient.ambiguous, "coconut milk resolves");
  assert(vegan.substitutions.length >= 1, "has vegan-safe substitutes");
  assert(
    !vegan.substitutions.some((s) => /evaporated/i.test(s.name)),
    "evaporated milk filtered for vegan"
  );
  assert(
    vegan.substitutions.some((s) => /cashew|groundnut|coconut flesh/i.test(s.name)),
    "suggests plant cream alternatives"
  );
  assert(vegan.meta.llm_used === false, "no LLM");
}

console.log("engine — sukuma wiki");
{
  const res = findSubstitutions({ ingredient: "sukuma wiki", countryCode: "KE" });
  assert(res.substitutions.some((s) => /collard|kale/i.test(s.name)), "sukuma → collard/kale");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
