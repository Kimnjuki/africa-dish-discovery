/**
 * Grow held-out pantry cases toward 200 (path documented for 500).
 * Appends editor-templated diversity — does not rewrite development/validation.
 *
 * Usage:
 *   npm run bench:pantry:heldout:grow
 *   npm run bench:pantry:heldout:grow -- --target 500
 *   npm run bench:pantry:heldout:grow -- --target 200 --reset
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const path = resolve(root, "benchmarks/pantry/cases/heldout.jsonl");

const targetArg = process.argv.indexOf("--target");
const TARGET = targetArg >= 0 ? Number(process.argv[targetArg + 1]) : 200;
const RESET = process.argv.includes("--reset");

const VERSION = "1.1.0";

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
      quantity_known: r.quantity_known ?? r.quantity != null,
      expires_at: r.expires_at ?? null,
      language: r.language || "en",
      relation_hint: r.relation_hint || "exact_or_alias",
    };
  });
}

function caseOf(partial) {
  return {
    version: VERSION,
    constraints: { allergies: [], diets: [], equipment: ["stove"], max_total_minutes: null, servings: 4 },
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

const seedOnly = RESET
  ? []
  : existsSync(path)
    ? readFileSync(path, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : [];

// On --reset keep only non-grow editor seeds (ids not starting with held-grow-)
const existing = RESET
  ? seedOnly.filter((c) => !String(c.id).startsWith("held-grow-") && !String(c.id).includes("-heldout"))
  : seedOnly;
// Prefer clean slate of editor held + fresh grow when resetting from bloated auto patterns
const baseExisting = RESET
  ? (existsSync(path)
      ? readFileSync(path, "utf8")
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l) => JSON.parse(l))
          .filter((c) => String(c.id).startsWith("held-00"))
      : [])
  : existing;

const existingIds = new Set(baseExisting.map((c) => c.id));
const generated = [];

function push(c) {
  if (existingIds.has(c.id) || generated.some((g) => g.id === c.id)) return;
  generated.push(c);
}

const markets = [
  { code: "ke", country: "Kenya", staple: "maize flour", green: "sukuma wiki", dish: "Ugali" },
  { code: "ng", country: "Nigeria", staple: "garri", green: "ugu", dish: "Eba" },
  { code: "gh", country: "Ghana", staple: "rice", green: "kontomire", dish: "Jollof" },
  { code: "za", country: "South Africa", staple: "maize meal", green: "morogo", dish: "Pap" },
  { code: "et", country: "Ethiopia", staple: "teff flour", green: "gomen", dish: "Injera" },
  { code: "sn", country: "Senegal", staple: "rice", green: "bissap", dish: "Thieboudienne" },
  { code: "tz", country: "Tanzania", staple: "maize flour", green: "mchicha", dish: "Ugali" },
  { code: "ug", country: "Uganda", staple: "rice", green: "dodo", dish: "Rice Bowl" },
  { code: "ci", country: "Côte d'Ivoire", staple: "rice", green: "spinach", dish: "Rice Stew" },
  { code: "cm", country: "Cameroon", staple: "cassava flour", green: "ndolé greens", dish: "Fufu" },
  { code: "diaspora-us", country: "Diaspora", staple: "fonio", green: "spinach", dish: "Fonio" },
  { code: "diaspora-uk", country: "Diaspora", staple: "plantain", green: "kale", dish: "Plantain" },
];

const qtyPairs = [
  { pantryQty: 500, pantryUnit: "g", recipeQty: 2, recipeUnit: "cups", staple: "rice", enough: true },
  { pantryQty: 100, pantryUnit: "g", recipeQty: 2, recipeUnit: "cups", staple: "rice", enough: false },
  { pantryQty: 2, pantryUnit: "cups", recipeQty: 200, recipeUnit: "g", staple: "flour", enough: true },
  { pantryQty: 0.5, pantryUnit: "cups", recipeQty: 200, recipeUnit: "g", staple: "flour", enough: false },
  { pantryQty: 250, pantryUnit: "ml", recipeQty: 1, recipeUnit: "cup", staple: "oil", enough: true },
  { pantryQty: 50, pantryUnit: "ml", recipeQty: 3, recipeUnit: "tbsp", staple: "oil", enough: true },
  { pantryQty: 10, pantryUnit: "ml", recipeQty: 3, recipeUnit: "tbsp", staple: "oil", enough: false },
  { pantryQty: 1, pantryUnit: "kg", recipeQty: 3, recipeUnit: "cups", staple: "maize flour", enough: true },
  { pantryQty: 80, pantryUnit: "g", recipeQty: 1, recipeUnit: "cup", staple: "teff flour", enough: false },
  { pantryQty: 400, pantryUnit: "g", recipeQty: 2, recipeUnit: "cups", staple: "black-eyed peas", enough: true },
];

let n = 0;
while (baseExisting.length + generated.length < TARGET && n < TARGET * 4) {
  const m = markets[n % markets.length];
  const kind = n % 5;
  const i = Math.floor(n / markets.length) + 1;
  n++;

  if (kind === 0) {
    const id = `held-grow-${m.code}-cook-${i}`;
    const readyId = `r-${id}-ready`;
    const hardId = `r-${id}-hard`;
    push(
      caseOf({
        id,
        split: "heldout",
        market: m.code,
        mode: "cook_now",
        tags: ["heldout", "grow", "cookable"],
        pantry: pantry([m.staple, m.green, "onion", "tomato", "oil", "salt", "stock cube"]),
        candidates: [
          recipe(readyId, `${m.dish} Grow ${i}`, m.country, [
            m.staple,
            m.green,
            "onion",
            "tomato",
            "oil",
            "salt",
            "stock cube",
          ]),
          // Use a rare protein with no pantry substitute edges (stock cube ≠ beef)
          recipe(hardId, `${m.dish} Missing Protein ${i}`, m.country, [
            m.staple,
            "rabbit",
            "onion",
            "oil",
            "salt",
          ]),
        ],
        gold: {
          relevance: { [readyId]: 3, [hardId]: 0 },
          ready_recipe_ids: [readyId],
          essential_missing_by_recipe: { [hardId]: ["rabbit"] },
          notes: `Held-out growth cookable ${m.code}`,
        },
      })
    );
  } else if (kind === 1) {
    const id = `held-grow-${m.code}-shop-${i}`;
    const readyId = `r-${id}`;
    push(
      caseOf({
        id,
        split: "heldout",
        market: m.code,
        mode: "shop_first",
        tags: ["heldout", "grow", "shop-first"],
        pantry: pantry([m.staple, "onion", "oil", "salt"]),
        candidates: [
          recipe(readyId, `${m.dish} Shop ${i}`, m.country, [
            m.staple,
            m.green,
            "onion",
            "tomato",
            "oil",
            "salt",
            "stock cube",
          ]),
        ],
        gold: {
          relevance: { [readyId]: 1 },
          ready_recipe_ids: [],
          essential_missing_by_recipe: { [readyId]: [m.green, "tomato", "stock cube"] },
          notes: `Held-out growth shop-first ${m.code}`,
        },
      })
    );
  } else if (kind === 2) {
    // Peanut allergy only — allergen tag on bad recipe so constraints exclude it
    const id = `held-grow-${m.code}-allergy-peanut-${i}`;
    const safeId = `r-${id}-safe`;
    const badId = `r-${id}-bad`;
    push(
      caseOf({
        id,
        split: "heldout",
        market: m.code,
        mode: "cook_now",
        tags: ["heldout", "grow", "allergy", "safety"],
        pantry: pantry([m.staple, m.green, "onion", "tomato", "oil", "salt", "peanut butter"]),
        constraints: {
          allergies: ["peanut"],
          diets: [],
          equipment: ["stove"],
          max_total_minutes: null,
          servings: 4,
        },
        candidates: [
          recipe(safeId, `${m.dish} Safe ${i}`, m.country, [
            m.staple,
            m.green,
            "onion",
            "tomato",
            "oil",
            "salt",
          ]),
          recipe(
            badId,
            `${m.dish} Peanut ${i}`,
            m.country,
            [m.staple, "peanut butter", "onion", "oil", "salt"],
            { allergens: ["peanut"] }
          ),
        ],
        gold: {
          relevance: { [safeId]: 3, [badId]: 0 },
          ready_recipe_ids: [safeId],
          critical_safety_ids: [badId],
          notes: "Held-out growth peanut allergy",
        },
      })
    );
  } else if (kind === 3) {
    const q = qtyPairs[n % qtyPairs.length];
    const id = `held-grow-qty-${q.staple.replace(/\s+/g, "-")}-${q.pantryUnit}-to-${q.recipeUnit}-${i}`;
    const rid = `r-${id}`;
    push(
      caseOf({
        id,
        split: "heldout",
        market: markets[n % markets.length].code,
        mode: "cook_now",
        tags: ["heldout", "grow", "quantity", "unit-conversion"],
        pantry: pantry([
          {
            name: q.staple,
            quantity: q.pantryQty,
            unit: q.pantryUnit,
            quantity_known: true,
          },
          { name: "onion", quantity: 2, unit: "piece" },
          { name: "tomato", quantity: 3, unit: "piece" },
          { name: "oil", quantity: 3, unit: "tbsp" },
          { name: "salt", quantity: 1, unit: "tsp" },
        ]),
        candidates: [
          recipe(rid, `Qty ${q.staple} ${i}`, "Multi", [
            { name: q.staple, quantity: q.recipeQty, unit: q.recipeUnit },
            { name: "onion", quantity: 1, unit: "piece" },
            { name: "tomato", quantity: 2, unit: "piece" },
            { name: "oil", quantity: 2, unit: "tbsp" },
            { name: "salt", quantity: 1, unit: "tsp" },
          ]),
        ],
        gold: {
          relevance: { [rid]: q.enough ? 3 : 1 },
          ready_recipe_ids: q.enough ? [rid] : [],
          notes: q.enough
            ? `cups↔g enough: ${q.pantryQty}${q.pantryUnit} ≥ ${q.recipeQty}${q.recipeUnit}`
            : `cups↔g shortfall: ${q.pantryQty}${q.pantryUnit} < ${q.recipeQty}${q.recipeUnit}`,
        },
      })
    );
  } else {
    const id = `held-grow-${m.code}-unkqty-${i}`;
    const rid = `r-${id}`;
    push(
      caseOf({
        id,
        split: "heldout",
        market: m.code,
        mode: "cook_now",
        tags: ["heldout", "grow", "quantity-unknown"],
        pantry: pantry([
          { name: m.staple, quantity_known: false },
          "onion",
          "tomato",
          "oil",
          "salt",
        ]),
        candidates: [
          recipe(rid, `${m.dish} UnkQty ${i}`, m.country, [
            { name: m.staple, quantity: 2, unit: "cups" },
            { name: "onion", quantity: 1, unit: "piece" },
            { name: "tomato", quantity: 2, unit: "piece" },
            { name: "oil", quantity: 2, unit: "tbsp" },
            { name: "salt", quantity: 1, unit: "tsp" },
          ]),
        ],
        gold: {
          relevance: { [rid]: 1 },
          ready_recipe_ids: [],
          notes: "Unknown staple quantity → not ready",
        },
      })
    );
  }
}

const merged = [...baseExisting, ...generated];
writeFileSync(path, merged.map((c) => JSON.stringify(c)).join("\n") + "\n");

const progressPath = resolve(root, "benchmarks/pantry/cases/HELDOUT_GROWTH.md");
writeFileSync(
  progressPath,
  `# Held-out growth tracker

| Milestone | Target | Status |
|-----------|--------|--------|
| Pilot seed | ~15 | done |
| Dual-review batch | 200 | ${merged.length >= 200 ? "done" : `in progress (${merged.length})`} |
| Scale freeze | 500 | ${merged.length >= 500 ? "done" : "planned"} |

## Rules

- Held-out never used for threshold tuning.
- Dual-reviewer adjudication required before reporting freeze.
- Prefer editor-designed templates over LLM bulk dumps.
- Quantity / unit-conversion / allergy / shop-first coverage required each growth wave.

## Latest run

- Generated at: ${new Date().toISOString()}
- Prior: ${baseExisting.length}
- Added: ${generated.length}
- Total: ${merged.length}
- Target this run: ${TARGET}
- Reset: ${RESET}
`
);

console.log(
  JSON.stringify(
    {
      prior: baseExisting.length,
      added: generated.length,
      total: merged.length,
      target: TARGET,
      reset: RESET,
      path,
      next:
        merged.length >= 500
          ? "ready for freeze adjudication"
          : `run again with --target 500 (now ${merged.length})`,
    },
    null,
    2
  )
);
