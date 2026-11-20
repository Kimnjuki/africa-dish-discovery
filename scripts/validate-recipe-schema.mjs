/**
 * validate-recipe-schema.mjs (S1-08)
 *
 * Checks that a schema.org/Recipe JSON-LD object contains the required fields
 * that Google's Rich Results Test and the blueprint mandate:
 *   name, image, author, recipeIngredient, recipeInstructions
 *
 * Run: npm run test:schema
 */

let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passes++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failures++;
  }
}

function validateRecipeSchema(label, schema) {
  console.log(`\n[${label}]`);

  // @context
  assert(
    schema["@context"] === "https://schema.org/" || schema["@context"] === "https://schema.org",
    "@context is https://schema.org/"
  );

  // @type
  assert(schema["@type"] === "Recipe", '@type is "Recipe"');

  // name
  assert(typeof schema.name === "string" && schema.name.trim().length > 0, "name is non-empty string");

  // image
  const hasImage =
    (typeof schema.image === "string" && schema.image.trim().length > 0) ||
    (Array.isArray(schema.image) && schema.image.length > 0 && typeof schema.image[0] === "string");
  assert(hasImage, "image is present and non-empty");

  // author
  const hasAuthor =
    schema.author &&
    typeof schema.author === "object" &&
    typeof schema.author["@type"] === "string" &&
    typeof schema.author.name === "string" &&
    schema.author.name.trim().length > 0;
  assert(hasAuthor, "author has @type and name");

  // recipeIngredient
  assert(
    Array.isArray(schema.recipeIngredient) && schema.recipeIngredient.length > 0,
    "recipeIngredient is a non-empty array"
  );

  // recipeInstructions
  const hasInstructions =
    Array.isArray(schema.recipeInstructions) && schema.recipeInstructions.length > 0;
  assert(hasInstructions, "recipeInstructions is a non-empty array");

  // recipeYield (recommended)
  assert(schema.recipeYield != null, "recipeYield is present (recommended)");

  // description (recommended)
  assert(
    typeof schema.description === "string" && schema.description.trim().length > 0,
    "description is present (recommended)"
  );
}

// ── Fixture 1: Minimal valid recipe (Organization author) ──────────────────
validateRecipeSchema("Minimal — Organization author", {
  "@context": "https://schema.org/",
  "@type": "Recipe",
  name: "Jollof Rice",
  image: ["https://www.ladhaquest.com/images/jollof.jpg"],
  author: {
    "@type": "Organization",
    name: "LadhaQuest",
    url: "https://www.ladhaquest.com",
  },
  description: "Classic West African Jollof Rice cooked with tomatoes and spices.",
  recipeYield: "4 servings",
  recipeIngredient: ["2 cups long-grain rice", "1 cup tomato purée", "1 onion"],
  recipeInstructions: [
    { "@type": "HowToStep", position: 1, text: "Fry onion until softened." },
    { "@type": "HowToStep", position: 2, text: "Add tomato purée and simmer." },
    { "@type": "HowToStep", position: 3, text: "Add rice and stock, cook covered." },
  ],
});

// ── Fixture 2: Recipe with Person author ──────────────────────────────────
validateRecipeSchema("Person author", {
  "@context": "https://schema.org/",
  "@type": "Recipe",
  name: "Injera",
  image: "https://www.ladhaquest.com/images/injera.jpg",
  author: {
    "@type": "Person",
    name: "Amara Tesfaye",
    url: "https://www.ladhaquest.com/creators/amara-tesfaye",
  },
  description: "Traditional Ethiopian sourdough flatbread made from teff flour.",
  recipeYield: "8 pieces",
  recipeIngredient: ["2 cups teff flour", "2 cups water", "1/2 tsp salt"],
  recipeInstructions: [
    { "@type": "HowToStep", position: 1, text: "Mix teff flour with water and ferment for 2–3 days." },
    { "@type": "HowToStep", position: 2, text: "Cook on a large flat pan." },
  ],
});

// ── Fixture 3: Intentionally invalid — missing recipeIngredient ───────────
let expectedFailures = 0;
try {
  const badSchema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: "Egusi Soup",
    image: ["https://www.ladhaquest.com/images/egusi.jpg"],
    author: { "@type": "Organization", name: "LadhaQuest" },
    description: "Rich Nigerian soup.",
    recipeYield: "6 servings",
    // recipeIngredient intentionally missing
    recipeInstructions: [{ "@type": "HowToStep", position: 1, text: "Fry egusi seeds." }],
  };

  // Count how many fields would fail
  const tempFails = failures;
  validateRecipeSchema("Invalid — missing recipeIngredient (expect 1 failure)", badSchema);
  const newFails = failures - tempFails;
  if (newFails === 1) {
    console.log("  → Expected exactly 1 failure — PASS");
    // Undo the extra failure count so the exit code reflects real failures only
    failures -= 1;
    expectedFailures = 1;
  } else {
    console.error(`  → Expected 1 failure, got ${newFails} — schema test accounting is off`);
  }
} catch (e) {
  console.error("Unexpected error in invalid-fixture test:", e);
  failures++;
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(
  `\nResult: ${passes - expectedFailures} passed, ${failures} failed` +
    (expectedFailures > 0 ? ` (${expectedFailures} expected failure excluded from count)` : "")
);

if (failures > 0) {
  process.exit(1);
} else {
  console.log("All schema checks passed ✓");
}
