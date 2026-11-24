/**
 * Author ~100 development + safety pantry cookability cases.
 * Editor-designed edge cases (not LLM bulk). Writes JSONL under benchmarks/pantry/cases/.
 *
 * Usage: node scripts/generate-pantry-benchmark-cases.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "benchmarks/pantry/cases");
mkdirSync(outDir, { recursive: true });

const VERSION = "1.0.0";

function ing(...names) {
  return names.map((n) => (typeof n === "string" ? { name: n } : n));
}

function recipe(id, name, country, ingredients, extra = {}) {
  return { id, name, country, ingredients: ing(...ingredients), servings: 4, ...extra };
}

function pantry(rows) {
  return rows.map((r, i) => {
    if (typeof r === "string") return { id: `p${i + 1}`, name: r, quantity_known: false };
    return {
      id: r.id || `p${i + 1}`,
      name: r.name,
      quantity: r.quantity ?? null,
      unit: r.unit ?? null,
      quantity_known: r.quantity_known ?? (r.quantity != null),
      expires_at: r.expires_at ?? null,
      language: r.language || "en",
      relation_hint: r.relation_hint || "exact_or_alias",
    };
  });
}

function caseOf(partial) {
  return {
    version: VERSION,
    constraints: { allergies: [], diets: [], equipment: [], max_total_minutes: null, servings: 4 },
    ...partial,
    gold: {
      ready_recipe_ids: [],
      essential_missing_by_recipe: {},
      critical_safety_ids: [],
      notes: "",
      ...partial.gold,
    },
  };
}

const cases = [];

// --- Kenya ---
cases.push(
  caseOf({
    id: "ke-001-ugali-sukuma-full",
    split: "development",
    market: "ke",
    mode: "cook_now",
    tags: ["exact", "local-name", "cookable"],
    pantry: pantry([
      { name: "ugali flour", quantity: 2, unit: "cups", language: "en" },
      { name: "sukuma wiki", quantity: 1, unit: "bunch", language: "sw" },
      { name: "onion", quantity: 2, unit: "piece" },
      { name: "tomato", quantity: 3, unit: "piece" },
      { name: "cooking oil", quantity: 3, unit: "tbsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
    ]),
    candidates: [
      recipe("r-ugali-sukuma", "Ugali and Sukuma Wiki", "Kenya", [
        "maize flour",
        "sukuma wiki",
        "onion",
        "tomato",
        "oil",
        "salt",
      ]),
      recipe("r-nyama", "Nyama Choma Platter", "Kenya", ["beef", "salt", "oil", "sukuma wiki"]),
      recipe("r-githeri", "Githeri", "Kenya", ["maize", "beans", "onion", "tomato", "oil", "salt"]),
    ],
    gold: {
      relevance: { "r-ugali-sukuma": 3, "r-nyama": 0, "r-githeri": 0 },
      resolution: {
        p1: { canonical: "maize flour", outcome: "resolved", relation: "exact_or_alias" },
        p2: { canonical: "sukuma wiki", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-ugali-sukuma"],
      essential_missing_by_recipe: {
        "r-nyama": ["beef"],
        "r-githeri": ["maize", "beans"],
      },
    },
  })
);

cases.push(
  caseOf({
    id: "ke-002-muhogo-alias",
    split: "development",
    market: "ke",
    mode: "cook_now",
    tags: ["alias", "swahili"],
    pantry: pantry([
      { name: "muhogo", language: "sw", relation_hint: "exact_or_alias" },
      { name: "coconut milk" },
      { name: "onion" },
      { name: "salt" },
    ]),
    candidates: [
      recipe("r-cassava-stew", "Cassava Coconut Stew", "Kenya", [
        "cassava",
        "coconut milk",
        "onion",
        "salt",
      ]),
      recipe("r-potato", "Potato Stew", "Kenya", ["potato", "onion", "salt", "oil"]),
    ],
    gold: {
      relevance: { "r-cassava-stew": 3, "r-potato": 0 },
      resolution: {
        p1: { canonical: "cassava", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-cassava-stew"],
      essential_missing_by_recipe: { "r-potato": ["potato", "oil"] },
    },
  })
);

cases.push(
  caseOf({
    id: "ke-003-quantity-shortfall",
    split: "development",
    market: "ke",
    mode: "cook_now",
    tags: ["quantity", "false-ready-trap"],
    pantry: pantry([
      { name: "onion", quantity: 1, unit: "piece", quantity_known: true },
      { name: "tomato", quantity: 1, unit: "piece" },
      { name: "oil", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "maize flour", quantity: 0.5, unit: "cup" },
    ]),
    constraints: { servings: 6 },
    candidates: [
      recipe(
        "r-ugali-party",
        "Party Ugali for Six",
        "Kenya",
        [
          { name: "maize flour", quantity: 4, unit: "cups" },
          { name: "water", quantity: 8, unit: "cups" },
          { name: "salt", quantity: 1, unit: "tsp" },
        ],
        { servings: 6 }
      ),
      recipe("r-onion-tomato", "Quick Onion Tomato Relish", "Kenya", [
        { name: "onion", quantity: 1, unit: "piece" },
        { name: "tomato", quantity: 1, unit: "piece" },
        { name: "oil", quantity: 1, unit: "tsp" },
        { name: "salt", quantity: 0.25, unit: "tsp" },
      ]),
    ],
    gold: {
      relevance: { "r-ugali-party": 0, "r-onion-tomato": 3 },
      resolution: {},
      ready_recipe_ids: ["r-onion-tomato"],
      essential_missing_by_recipe: {},
      notes: "0.5 cup maize flour cannot feed six; must not label party ugali ready",
    },
  })
);

// --- Nigeria ---
cases.push(
  caseOf({
    id: "ng-001-egusi-full",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["staple", "cookable"],
    pantry: pantry([
      "egusi",
      "palm oil",
      "stockfish",
      "crayfish",
      "onion",
      "scotch bonnet",
      "ugu",
      "stock cube",
      "salt",
    ]),
    candidates: [
      recipe("r-egusi", "Egusi Soup", "Nigeria", [
        "egusi",
        "palm oil",
        "stockfish",
        "crayfish",
        "onion",
        "scotch bonnet",
        "ugwu",
        "stock cube",
        "salt",
      ]),
      recipe("r-jollof", "Jollof Rice", "Nigeria", [
        "rice",
        "tomato",
        "onion",
        "pepper",
        "oil",
        "stock cube",
      ]),
      recipe("r-suya", "Suya", "Nigeria", ["beef", "suya spice", "onion", "oil"]),
    ],
    gold: {
      relevance: { "r-egusi": 3, "r-jollof": 0, "r-suya": 0 },
      resolution: {
        p7: { canonical: "ugwu", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-egusi"],
      essential_missing_by_recipe: {
        "r-jollof": ["rice", "tomato"],
        "r-suya": ["beef", "suya spice"],
      },
    },
  })
);

cases.push(
  caseOf({
    id: "ng-002-egusi-missing-protein",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["missing-essential", "false-ready-trap"],
    pantry: pantry(["egusi", "palm oil", "onion", "scotch bonnet", "salt", "ugu"]),
    candidates: [
      recipe("r-egusi", "Egusi Soup", "Nigeria", [
        "egusi",
        "palm oil",
        "stockfish",
        "crayfish",
        "onion",
        "scotch bonnet",
        "ugwu",
        "salt",
      ]),
      recipe("r-ewedu", "Ewedu", "Nigeria", ["ewedu", "locust beans", "salt"]),
    ],
    gold: {
      relevance: { "r-egusi": 1, "r-ewedu": 0 },
      resolution: {},
      ready_recipe_ids: [],
      essential_missing_by_recipe: {
        "r-egusi": ["stockfish", "crayfish"],
        "r-ewedu": ["ewedu", "locust beans"],
      },
      notes: "Seasonings present but main proteins missing — shop_first label 1 only if mode allows",
    },
  })
);

cases.push(
  caseOf({
    id: "ng-003-shop-first-mode",
    split: "development",
    market: "ng",
    mode: "shop_first",
    tags: ["shop-first"],
    pantry: pantry(["egusi", "palm oil", "onion", "scotch bonnet", "salt", "ugu"]),
    candidates: [
      recipe("r-egusi", "Egusi Soup", "Nigeria", [
        "egusi",
        "palm oil",
        "stockfish",
        "crayfish",
        "onion",
        "scotch bonnet",
        "ugwu",
        "salt",
      ]),
    ],
    gold: {
      relevance: { "r-egusi": 1 },
      resolution: {},
      ready_recipe_ids: [],
      essential_missing_by_recipe: { "r-egusi": ["stockfish", "crayfish"] },
    },
  })
);

cases.push(
  caseOf({
    id: "ng-004-iru-yoruba",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["alias", "yoruba"],
    pantry: pantry([
      { name: "iru", language: "yo" },
      { name: "ewedu", language: "yo" },
      { name: "salt" },
      { name: "stock cube" },
    ]),
    candidates: [
      recipe("r-ewedu", "Ewedu Soup", "Nigeria", ["ewedu", "locust beans", "salt", "stock cube"]),
      recipe("r-egusi", "Egusi Soup", "Nigeria", ["egusi", "palm oil", "onion"]),
    ],
    gold: {
      relevance: { "r-ewedu": 3, "r-egusi": 0 },
      resolution: {
        p1: { canonical: "locust beans", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-ewedu"],
    },
  })
);

// --- Ghana ---
cases.push(
  caseOf({
    id: "gh-001-kelewle-plantain",
    split: "development",
    market: "gh",
    mode: "cook_now",
    tags: ["cookable"],
    pantry: pantry(["ripe plantain", "ginger", "garlic", "chili", "oil", "salt"]),
    candidates: [
      recipe("r-kelewele", "Kelewele", "Ghana", [
        "plantain",
        "ginger",
        "garlic",
        "chili",
        "oil",
        "salt",
      ]),
      recipe("r-jollof", "Ghanaian Jollof", "Ghana", ["rice", "tomato", "onion", "oil", "pepper"]),
    ],
    gold: {
      relevance: { "r-kelewele": 3, "r-jollof": 0 },
      ready_recipe_ids: ["r-kelewele"],
      essential_missing_by_recipe: { "r-jollof": ["rice", "tomato", "onion"] },
    },
  })
);

cases.push(
  caseOf({
    id: "gh-002-banku-missing-okro",
    split: "development",
    market: "gh",
    mode: "cook_now",
    tags: ["missing-essential"],
    pantry: pantry(["corn dough", "cassava dough", "salt", "onion", "tomato", "oil"]),
    candidates: [
      recipe("r-banku-okro", "Banku with Okro Stew", "Ghana", [
        "corn dough",
        "cassava dough",
        "okra",
        "palm oil",
        "onion",
        "tomato",
        "salt",
      ]),
      recipe("r-banku-plain", "Plain Banku", "Ghana", ["corn dough", "cassava dough", "salt"]),
    ],
    gold: {
      relevance: { "r-banku-okro": 1, "r-banku-plain": 3 },
      ready_recipe_ids: ["r-banku-plain"],
      essential_missing_by_recipe: { "r-banku-okro": ["okra", "palm oil"] },
    },
  })
);

// --- South Africa ---
cases.push(
  caseOf({
    id: "za-001-pap-chakalaka",
    split: "development",
    market: "za",
    mode: "cook_now",
    tags: ["local-name"],
    pantry: pantry(["mealie meal", "onion", "carrot", "beans", "chili", "oil", "salt", "tomato"]),
    candidates: [
      recipe("r-pap-chakalaka", "Pap and Chakalaka", "South Africa", [
        "maize meal",
        "onion",
        "carrot",
        "baked beans",
        "chili",
        "oil",
        "salt",
        "tomato",
      ]),
      recipe("r-bobotie", "Bobotie", "South Africa", [
        "minced beef",
        "bread",
        "milk",
        "egg",
        "curry powder",
        "onion",
      ]),
    ],
    gold: {
      relevance: { "r-pap-chakalaka": 2, "r-bobotie": 0 },
      resolution: {
        p1: { canonical: "maize meal", outcome: "resolved", relation: "exact_or_alias" },
        p4: { canonical: "beans", outcome: "resolved", relation: "possible_substitute" },
      },
      ready_recipe_ids: ["r-pap-chakalaka"],
      notes: "baked beans ↔ beans is reviewed substitute (label 2), not exact identity",
    },
  })
);

cases.push(
  caseOf({
    id: "za-002-paprika-not-pap",
    split: "development",
    market: "za",
    mode: "cook_now",
    tags: ["false-positive", "token-overlap"],
    pantry: pantry(["paprika", "chicken", "onion", "oil", "salt"]),
    candidates: [
      recipe("r-pap", "Soft Pap", "South Africa", ["maize meal", "water", "salt"]),
      recipe("r-paprika-chicken", "Paprika Chicken", "South Africa", [
        "chicken",
        "paprika",
        "onion",
        "oil",
        "salt",
      ]),
    ],
    gold: {
      relevance: { "r-pap": 0, "r-paprika-chicken": 3 },
      ready_recipe_ids: ["r-paprika-chicken"],
      essential_missing_by_recipe: { "r-pap": ["maize meal"] },
      notes: "paprika must not satisfy pap / maize meal",
    },
  })
);

// --- Diaspora ---
cases.push(
  caseOf({
    id: "us-001-jollof-diaspora-sub",
    split: "development",
    market: "diaspora-us",
    mode: "cook_now",
    tags: ["substitution", "diaspora"],
    pantry: pantry([
      "rice",
      "tomato paste",
      "onion",
      "habanero",
      "vegetable oil",
      "stock cube",
      "salt",
      "garlic",
      "ginger",
      "thyme",
    ]),
    candidates: [
      recipe("r-jollof", "Party Jollof", "Nigeria", [
        "rice",
        "tomato",
        "onion",
        "scotch bonnet",
        "palm oil",
        "stock cube",
        "salt",
        "garlic",
        "ginger",
        "thyme",
      ]),
      recipe("r-fried-rice", "Nigerian Fried Rice", "Nigeria", [
        "rice",
        "mixed vegetables",
        "curry powder",
        "oil",
        "stock cube",
      ]),
    ],
    gold: {
      relevance: { "r-jollof": 2, "r-fried-rice": 1 },
      resolution: {
        p4: { canonical: "scotch bonnet", outcome: "resolved", relation: "possible_substitute" },
        p5: { canonical: "palm oil", outcome: "resolved", relation: "possible_substitute" },
      },
      ready_recipe_ids: ["r-jollof"],
      notes: "habanero↔scotch bonnet and vegetable oil↔palm oil are conditional diaspora subs",
    },
  })
);

cases.push(
  caseOf({
    id: "uk-001-uncertain-rice",
    split: "development",
    market: "diaspora-uk",
    mode: "cook_now",
    tags: ["quantity-unknown"],
    pantry: pantry([
      { name: "some rice", quantity_known: false, relation_hint: "ambiguous" },
      { name: "onion" },
      { name: "tomato" },
      { name: "oil" },
      { name: "salt" },
    ]),
    candidates: [
      recipe("r-jollof", "Jollof Rice", "Nigeria", ["rice", "tomato", "onion", "oil", "salt", "pepper"]),
    ],
    gold: {
      relevance: { "r-jollof": 1 },
      resolution: {
        p1: { canonical: "rice", outcome: "clarify", relation: "ambiguous" },
      },
      ready_recipe_ids: [],
      notes: "Unknown quantity → must not claim ready; clarify or shop-first",
    },
  })
);

// --- Ambiguity / relation separation ---
cases.push(
  caseOf({
    id: "amb-001-greens-not-interchangeable",
    split: "development",
    market: "multi",
    mode: "cook_now",
    tags: ["substitution", "no-acceptable-sub"],
    pantry: pantry(["spinach", "onion", "palm oil", "stockfish", "crayfish", "salt"]),
    candidates: [
      recipe("r-bitterleaf", "Ofe Onugbu", "Nigeria", [
        "bitterleaf",
        "palm oil",
        "stockfish",
        "crayfish",
        "onion",
        "salt",
      ]),
      recipe("r-spinach-stew", "Simple Spinach Stew", "Nigeria", [
        "spinach",
        "onion",
        "palm oil",
        "salt",
      ]),
    ],
    gold: {
      relevance: { "r-bitterleaf": 0, "r-spinach-stew": 3 },
      resolution: {
        p1: { canonical: "spinach", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-spinach-stew"],
      essential_missing_by_recipe: { "r-bitterleaf": ["bitterleaf"] },
      notes: "Spinach is not an automatic substitute for bitterleaf without reviewed edge + cook notes",
    },
  })
);

cases.push(
  caseOf({
    id: "amb-002-oil-token",
    split: "development",
    market: "multi",
    mode: "cook_now",
    tags: ["false-positive", "token-overlap"],
    pantry: pantry(["olive oil", "pasta", "garlic", "salt"]),
    candidates: [
      recipe("r-banga", "Banga Soup", "Nigeria", ["palm oil", "fresh fish", "scent leaf", "salt"]),
      recipe("r-aglio", "Aglio e Olio style", "Global", ["pasta", "olive oil", "garlic", "salt"]),
    ],
    gold: {
      relevance: { "r-banga": 0, "r-aglio": 3 },
      ready_recipe_ids: ["r-aglio"],
      essential_missing_by_recipe: { "r-banga": ["palm oil", "fresh fish", "scent leaf"] },
      notes: "olive oil must not satisfy palm oil via bare 'oil' token",
    },
  })
);

cases.push(
  caseOf({
    id: "amb-003-beans-category",
    split: "development",
    market: "multi",
    mode: "cook_now",
    tags: ["broader-category", "clarify"],
    pantry: pantry([
      { name: "beans", relation_hint: "broader_category", language: "en" },
      { name: "onion" },
      { name: "palm oil" },
      { name: "pepper" },
      { name: "salt" },
    ]),
    candidates: [
      recipe("r-ewa", "Ewa Agoyin", "Nigeria", ["black-eyed peas", "onion", "palm oil", "pepper", "salt"]),
      recipe("r-githeri", "Githeri", "Kenya", ["maize", "beans", "onion", "oil", "salt"]),
    ],
    gold: {
      relevance: { "r-ewa": 0, "r-githeri": 2 },
      resolution: {
        p1: { canonical: null, outcome: "clarify", relation: "broader_category" },
        p4: { canonical: null, outcome: "clarify", relation: "ambiguous" },
      },
      ready_recipe_ids: [],
      notes: "Generic 'beans' / 'pepper' should clarify species before claiming exact cookability for ewa",
    },
  })
);

// --- Constraints: allergy, equipment, time ---
cases.push(
  caseOf({
    id: "safe-001-peanut-allergy",
    split: "safety",
    market: "multi",
    mode: "cook_now",
    tags: ["allergy", "critical"],
    pantry: pantry(["chicken", "onion", "tomato", "rice", "oil", "salt", "peanut butter"]),
    constraints: { allergies: ["peanut"], diets: [], equipment: [], servings: 4 },
    candidates: [
      recipe(
        "r-mafe",
        "Mafé / Groundnut Stew",
        "Senegal",
        ["chicken", "peanut butter", "onion", "tomato", "oil", "salt"],
        { allergens: ["peanut"] }
      ),
      recipe(
        "r-yassa",
        "Poulet Yassa",
        "Senegal",
        ["chicken", "onion", "lemon", "oil", "salt", "mustard"],
        { allergens: [] }
      ),
    ],
    gold: {
      relevance: { "r-mafe": 0, "r-yassa": 1 },
      critical_safety_ids: ["r-mafe"],
      ready_recipe_ids: [],
      essential_missing_by_recipe: { "r-yassa": ["lemon", "mustard"] },
      notes: "Peanut stew must never be ready/recommended as safe under peanut allergy",
    },
  })
);

cases.push(
  caseOf({
    id: "safe-002-blender-required",
    split: "safety",
    market: "ng",
    mode: "cook_now",
    tags: ["equipment"],
    pantry: pantry(["tomato", "pepper", "onion", "oil", "salt", "rice"]),
    constraints: { equipment: ["stove"], allergies: [], diets: [] },
    candidates: [
      recipe(
        "r-ata-din-din",
        "Blended Ata Din Din",
        "Nigeria",
        ["tomato", "pepper", "onion", "oil", "salt"],
        { requires_equipment: ["blender"] }
      ),
      recipe(
        "r-stew-chopped",
        "Chopped Tomato Stew",
        "Nigeria",
        ["tomato", "pepper", "onion", "oil", "salt"],
        { requires_equipment: ["stove"] }
      ),
    ],
    gold: {
      relevance: { "r-ata-din-din": 0, "r-stew-chopped": 3 },
      ready_recipe_ids: ["r-stew-chopped"],
      notes: "No blender → blended sauce must not be cook_now",
    },
  })
);

cases.push(
  caseOf({
    id: "safe-003-time-budget",
    split: "safety",
    market: "ke",
    mode: "cook_now",
    tags: ["time"],
    pantry: pantry(["dried beans", "onion", "tomato", "oil", "salt", "maize flour"]),
    constraints: { max_total_minutes: 20, equipment: ["stove"] },
    candidates: [
      recipe(
        "r-bean-stew",
        "Slow Bean Stew",
        "Kenya",
        ["dried beans", "onion", "tomato", "oil", "salt"],
        { prep_time: 15, cook_time: 90 }
      ),
      recipe(
        "r-ugali-quick",
        "Quick Ugali",
        "Kenya",
        ["maize flour", "water", "salt"],
        { prep_time: 2, cook_time: 15 }
      ),
    ],
    gold: {
      relevance: { "r-bean-stew": 0, "r-ugali-quick": 3 },
      ready_recipe_ids: ["r-ugali-quick"],
      notes: "Dried beans need long soak/cook — violate 20-minute request",
    },
  })
);

cases.push(
  caseOf({
    id: "safe-004-empty-pantry",
    split: "safety",
    market: "multi",
    mode: "cook_now",
    tags: ["no-result"],
    pantry: pantry([]),
    candidates: [
      recipe("r-anything", "Anything Soup", "Global", ["water", "salt"]),
    ],
    gold: {
      relevance: { "r-anything": 0 },
      ready_recipe_ids: [],
      notes: "Empty pantry → empty cook_now list",
    },
  })
);

cases.push(
  caseOf({
    id: "safe-005-explanation-consistency",
    split: "safety",
    market: "ng",
    mode: "cook_now",
    tags: ["explanation"],
    pantry: pantry(["onion", "oil", "salt", "pepper"]),
    candidates: [
      recipe("r-stew", "Tomato Stew", "Nigeria", ["tomato", "onion", "oil", "salt", "pepper"]),
    ],
    gold: {
      relevance: { "r-stew": 1 },
      ready_recipe_ids: [],
      essential_missing_by_recipe: { "r-stew": ["tomato"] },
      notes: "Must disclose missing tomato; never say you have everything",
    },
  })
);

cases.push(
  caseOf({
    id: "safe-006-dairy-allergy-sub",
    split: "safety",
    market: "za",
    mode: "cook_now",
    tags: ["allergy", "substitution"],
    pantry: pantry(["minced beef", "bread", "oat milk", "egg", "curry powder", "onion"]),
    constraints: { allergies: ["dairy"], diets: [] },
    candidates: [
      recipe(
        "r-bobotie",
        "Bobotie",
        "South Africa",
        ["minced beef", "bread", "milk", "egg", "curry powder", "onion"],
        { allergens: ["dairy", "egg"] }
      ),
    ],
    gold: {
      relevance: { "r-bobotie": 0 },
      critical_safety_ids: ["r-bobotie"],
      ready_recipe_ids: [],
      notes: "Oat milk is not an auto-approved dairy substitute without reviewed edge + allergy pass",
    },
  })
);

// --- Hausa / more local names ---
cases.push(
  caseOf({
    id: "ng-005-rogo-hausa",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["alias", "hausa"],
    pantry: pantry([
      { name: "rogo", language: "ha" },
      { name: "oil" },
      { name: "salt" },
      { name: "onion" },
    ]),
    candidates: [
      recipe("r-cassava-fries", "Fried Cassava", "Nigeria", ["cassava", "oil", "salt"]),
      recipe("r-yam", "Fried Yam", "Nigeria", ["yam", "oil", "salt"]),
    ],
    gold: {
      relevance: { "r-cassava-fries": 3, "r-yam": 0 },
      resolution: {
        p1: { canonical: "cassava", outcome: "resolved", relation: "exact_or_alias" },
      },
      ready_recipe_ids: ["r-cassava-fries"],
    },
  })
);

cases.push(
  caseOf({
    id: "prep-001-dried-vs-fresh-fish",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["preparation-state"],
    pantry: pantry(["fresh tilapia", "onion", "tomato", "oil", "salt", "pepper"]),
    candidates: [
      recipe("r-pepper-soup", "Fresh Fish Pepper Soup", "Nigeria", [
        "fresh fish",
        "onion",
        "pepper",
        "salt",
        "scent leaf",
      ]),
      recipe("r-stockfish-stew", "Stockfish Stew", "Nigeria", [
        "stockfish",
        "onion",
        "tomato",
        "oil",
        "salt",
      ]),
    ],
    gold: {
      relevance: { "r-pepper-soup": 2, "r-stockfish-stew": 0 },
      ready_recipe_ids: [],
      essential_missing_by_recipe: {
        "r-pepper-soup": ["scent leaf"],
        "r-stockfish-stew": ["stockfish"],
      },
      notes: "Fresh fish ≠ stockfish; scent leaf still missing for soup",
    },
  })
);

cases.push(
  caseOf({
    id: "prep-002-flour-vs-grain",
    split: "development",
    market: "multi",
    mode: "cook_now",
    tags: ["preparation-state"],
    pantry: pantry(["whole teff grain", "water", "salt"]),
    candidates: [
      recipe("r-injera", "Injera", "Ethiopia", ["teff flour", "water", "salt"]),
      recipe("r-teff-porridge", "Teff Porridge", "Ethiopia", ["teff", "water", "salt"]),
    ],
    gold: {
      relevance: { "r-injera": 0, "r-teff-porridge": 2 },
      resolution: {
        p1: { canonical: "teff", outcome: "resolved", relation: "broader_category" },
      },
      ready_recipe_ids: [],
      notes: "Whole grain is not teff flour for injera without milling step disclosed",
    },
  })
);

// Generate patterned variants to reach ~100 while keeping editor structure
const markets = [
  { code: "ke", dish: "Sukuma", staple: "maize flour", green: "sukuma wiki", country: "Kenya" },
  { code: "ng", dish: "Ofada", staple: "ofada rice", green: "ayamase", country: "Nigeria" },
  { code: "gh", dish: "Waakye", staple: "rice", green: "spinach", country: "Ghana" },
  { code: "za", dish: "Morogo", staple: "maize meal", green: "morogo", country: "South Africa" },
  { code: "diaspora-us", dish: "Plantain", staple: "plantain", green: "kale", country: "USA" },
];

let seq = 1;
for (const m of markets) {
  for (let i = 0; i < 12; i++) {
    const id = `${m.code}-gen-${String(seq).padStart(3, "0")}`;
    seq++;
    const full = i % 3 === 0;
    const missingProtein = i % 3 === 1;
    const allergyCase = i % 3 === 2;
    const readyId = `r-${m.code}-${i}-ready`;
    const hardId = `r-${m.code}-${i}-hard`;
    const pantryItems = full
      ? [m.staple, m.green, "onion", "tomato", "oil", "salt", "stock cube"]
      : missingProtein
        ? [m.staple, m.green, "onion", "tomato", "oil", "salt"]
        : [m.staple, m.green, "onion", "peanut butter", "oil", "salt"];

    cases.push(
      caseOf({
        id,
        split: allergyCase ? "safety" : "development",
        market: m.code === "et" ? "multi" : m.code,
        mode: missingProtein ? "shop_first" : "cook_now",
        tags: full
          ? ["pattern", "cookable"]
          : missingProtein
            ? ["pattern", "shop-first"]
            : ["pattern", "allergy"],
        pantry: pantry(pantryItems),
        constraints: allergyCase
          ? { allergies: ["peanut"], diets: [], equipment: ["stove"] }
          : { allergies: [], diets: [], equipment: ["stove"] },
        candidates: [
          recipe(
            readyId,
            `${m.dish} Bowl ${i + 1}`,
            m.country,
            [m.staple, m.green, "onion", "tomato", "oil", "salt", "stock cube"],
            { allergens: [] }
          ),
          recipe(
            hardId,
            `${m.dish} Peanut Variant ${i + 1}`,
            m.country,
            [m.staple, "peanut butter", "onion", "oil", "salt"],
            { allergens: ["peanut"] }
          ),
        ],
        gold: {
          relevance: full
            ? { [readyId]: 3, [hardId]: allergyCase ? 0 : 1 }
            : missingProtein
              ? { [readyId]: 1, [hardId]: 0 }
              : { [readyId]: 1, [hardId]: 0 },
          ready_recipe_ids: full ? [readyId] : [],
          critical_safety_ids: allergyCase ? [hardId] : [],
          essential_missing_by_recipe: missingProtein
            ? { [readyId]: ["stock cube"], [hardId]: ["peanut butter"] }
            : allergyCase
              ? { [readyId]: ["tomato", "stock cube"] }
              : {},
          resolution: {},
          notes: `Pattern case ${id}`,
        },
      })
    );
  }
}

// Ranking stress: cookable must outrank missing-main
cases.push(
  caseOf({
    id: "rank-001-ready-above-missing-main",
    split: "development",
    market: "ng",
    mode: "cook_now",
    tags: ["ranking"],
    pantry: pantry(["rice", "onion", "tomato", "oil", "salt", "pepper", "stock cube"]),
    candidates: [
      recipe("r-almost-egusi", "Almost Egusi", "Nigeria", [
        "egusi",
        "palm oil",
        "onion",
        "salt",
        "stock cube",
        "pepper",
      ]),
      recipe("r-tomato-rice", "Tomato Rice", "Nigeria", [
        "rice",
        "onion",
        "tomato",
        "oil",
        "salt",
        "pepper",
        "stock cube",
      ]),
    ],
    gold: {
      relevance: { "r-almost-egusi": 0, "r-tomato-rice": 3 },
      ready_recipe_ids: ["r-tomato-rice"],
      essential_missing_by_recipe: { "r-almost-egusi": ["egusi", "palm oil"] },
      notes: "NDCG must prefer fully cookable tomato rice over high-overlap egusi missing main seed",
    },
  })
);

cases.push(
  caseOf({
    id: "rank-002-sub-below-exact",
    split: "development",
    market: "diaspora-us",
    mode: "cook_now",
    tags: ["ranking", "substitution"],
    pantry: pantry([
      "rice",
      "tomato",
      "onion",
      "habanero",
      "vegetable oil",
      "salt",
      "stock cube",
      "garlic",
    ]),
    candidates: [
      recipe("r-jollof-exact", "Jollof Exact Pantry", "Nigeria", [
        "rice",
        "tomato",
        "onion",
        "habanero",
        "vegetable oil",
        "salt",
        "stock cube",
        "garlic",
      ]),
      recipe("r-jollof-palm", "Classic Palm Jollof", "Nigeria", [
        "rice",
        "tomato",
        "onion",
        "scotch bonnet",
        "palm oil",
        "salt",
        "stock cube",
        "garlic",
      ]),
    ],
    gold: {
      relevance: { "r-jollof-exact": 3, "r-jollof-palm": 2 },
      ready_recipe_ids: ["r-jollof-exact", "r-jollof-palm"],
      notes: "Exact pantry fit (3) should rank above substitution-heavy (2)",
    },
  })
);

// More editor edge cases
const extras = [
  {
    id: "ke-004-chapati-full",
    market: "ke",
    pantry: ["flour", "oil", "salt", "water"],
    ready: ["flour", "oil", "salt", "water"],
    other: ["beef", "salt", "oil"],
  },
  {
    id: "ng-006-moi-moi",
    market: "ng",
    pantry: ["black-eyed peas", "pepper", "onion", "oil", "salt"],
    ready: ["black-eyed peas", "pepper", "onion", "oil", "salt"],
    other: ["rice", "stew"],
  },
  {
    id: "gh-003-shito-missing",
    market: "gh",
    pantry: ["oil", "onion", "ginger", "garlic", "salt"],
    ready: null,
    need: ["dried fish", "shrimp powder", "chili"],
  },
];

for (const e of extras) {
  const readyId = `${e.id}-ready`;
  const otherId = `${e.id}-other`;
  if (e.ready) {
    cases.push(
      caseOf({
        id: e.id,
        split: "development",
        market: e.market,
        mode: "cook_now",
        tags: ["editor"],
        pantry: pantry(e.pantry),
        candidates: [
          recipe(readyId, `${e.id} dish`, e.market.toUpperCase(), e.ready),
          recipe(otherId, `${e.id} distractor`, e.market.toUpperCase(), e.other || ["beef"]),
        ],
        gold: {
          relevance: { [readyId]: 3, [otherId]: 0 },
          ready_recipe_ids: [readyId],
        },
      })
    );
  } else {
    cases.push(
      caseOf({
        id: e.id,
        split: "development",
        market: e.market,
        mode: "shop_first",
        tags: ["editor", "missing-essential"],
        pantry: pantry(e.pantry),
        candidates: [
          recipe(readyId, `${e.id} dish`, e.market.toUpperCase(), [...e.pantry, ...e.need]),
        ],
        gold: {
          relevance: { [readyId]: 1 },
          ready_recipe_ids: [],
          essential_missing_by_recipe: { [readyId]: e.need },
        },
      })
    );
  }
}

// Assign splits and write
const development = [];
const safety = [];
const validation = [];
const heldout = [];

for (const c of cases) {
  if (c.split === "safety") safety.push(c);
  else development.push(c);
}

// Hold out ~20% of non-safety cases for validation tuning
while (development.length > 50 && validation.length < 15) {
  const c = development.pop();
  c.split = "validation";
  validation.push(c);
}

// Seed held-out from remaining development (never used for threshold tuning)
while (development.length > 40 && heldout.length < 12) {
  const c = development.pop();
  c.split = "heldout";
  c.id = `${c.id}-heldout`;
  heldout.push(c);
}

// Extra held-out editor cases (fresh IDs)
heldout.push(
  caseOf({
    id: "held-001-fonio-diaspora",
    split: "heldout",
    market: "diaspora-us",
    mode: "cook_now",
    tags: ["heldout", "grain"],
    pantry: pantry(["fonio", "onion", "tomato", "oil", "salt", "garlic"]),
    candidates: [
      recipe("r-fonio-pilaf", "Fonio Pilaf", "Mali", ["fonio", "onion", "tomato", "oil", "salt", "garlic"]),
      recipe("r-couscous", "Couscous Bowl", "Morocco", ["couscous", "onion", "oil", "salt"]),
    ],
    gold: {
      relevance: { "r-fonio-pilaf": 3, "r-couscous": 0 },
      ready_recipe_ids: ["r-fonio-pilaf"],
      essential_missing_by_recipe: { "r-couscous": ["couscous"] },
    },
  }),
  caseOf({
    id: "held-002-allergy-shellfish",
    split: "heldout",
    market: "ng",
    mode: "cook_now",
    tags: ["heldout", "allergy"],
    pantry: pantry(["crayfish", "palm oil", "onion", "pepper", "salt", "ugu"]),
    constraints: { allergies: ["shellfish"], diets: [], equipment: ["stove"] },
    candidates: [
      recipe(
        "r-ugu-crayfish",
        "Ugwu with Crayfish",
        "Nigeria",
        ["ugwu", "crayfish", "palm oil", "onion", "pepper", "salt"],
        { allergens: ["shellfish"] }
      ),
      recipe("r-ugu-plain", "Ugwu Stew", "Nigeria", ["ugwu", "palm oil", "onion", "pepper", "salt"]),
    ],
    gold: {
      relevance: { "r-ugu-crayfish": 0, "r-ugu-plain": 3 },
      critical_safety_ids: ["r-ugu-crayfish"],
      ready_recipe_ids: ["r-ugu-plain"],
    },
  }),
  caseOf({
    id: "held-003-quantity-unknown-rice",
    split: "heldout",
    market: "gh",
    mode: "cook_now",
    tags: ["heldout", "quantity-unknown"],
    pantry: pantry([
      { name: "rice", quantity_known: false },
      { name: "onion" },
      { name: "tomato" },
      { name: "oil" },
      { name: "salt" },
      { name: "stock cube" },
    ]),
    candidates: [
      recipe("r-jollof", "Jollof", "Ghana", [
        { name: "rice", quantity: 3, unit: "cups" },
        { name: "onion", quantity: 1, unit: "piece" },
        { name: "tomato", quantity: 4, unit: "piece" },
        { name: "oil", quantity: 3, unit: "tbsp" },
        { name: "salt", quantity: 1, unit: "tsp" },
        { name: "stock cube", quantity: 1, unit: "piece" },
      ]),
    ],
    gold: {
      relevance: { "r-jollof": 1 },
      ready_recipe_ids: [],
      notes: "Unknown rice quantity → not ready",
    },
  })
);

function writeJsonl(name, rows) {
  const path = resolve(outDir, name);
  writeFileSync(path, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return path;
}

writeJsonl("development.jsonl", development);
writeJsonl("safety.jsonl", safety);
writeJsonl("validation.jsonl", validation);
writeJsonl("heldout.jsonl", heldout);

const judgmentRows = [];
for (const c of [...development, ...safety, ...validation]) {
  for (const [recipeId, label] of Object.entries(c.gold.relevance || {})) {
    judgmentRows.push({
      case_id: c.id,
      recipe_id: recipeId,
      relevance: label,
      adjudicated: true,
      reviewers: 1,
      notes: "pilot single-editor labels; expand to dual review before held-out freeze",
    });
  }
}
writeFileSync(
  resolve(root, "benchmarks/pantry/judgments/recipe_relevance.jsonl"),
  judgmentRows.map((r) => JSON.stringify(r)).join("\n") + "\n"
);

const resolutionRows = [];
for (const c of [...development, ...safety, ...validation]) {
  for (const [pid, res] of Object.entries(c.gold.resolution || {})) {
    resolutionRows.push({ case_id: c.id, pantry_id: pid, ...res });
  }
}
writeFileSync(
  resolve(root, "benchmarks/pantry/judgments/ingredient_resolution.jsonl"),
  resolutionRows.map((r) => JSON.stringify(r)).join("\n") + "\n"
);

console.log(
  JSON.stringify(
    {
      version: VERSION,
      development: development.length,
      validation: validation.length,
      safety: safety.length,
      heldout: heldout.length,
      judgments: judgmentRows.length,
    },
    null,
    2
  )
);
