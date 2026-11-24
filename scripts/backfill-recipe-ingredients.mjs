/**
 * Backfill public.recipe_ingredients from recipes.ingredients JSON.
 *
 * Matching order:
 *   1) exact normalized name / slug / alias
 *   2) stripped quantity+unit noise → exact
 *   3) synonym map → exact
 *   4) longest contained ingredient name (≥4 chars)
 *   5) Levenshtein ≤ threshold on short tokens
 *
 * Usage:
 *   node scripts/backfill-recipe-ingredients.mjs            # dry-run report
 *   node scripts/backfill-recipe-ingredients.mjs --apply     # upsert via secret key
 *   node scripts/backfill-recipe-ingredients.mjs --sql       # also write SQL file
 *   npm run backfill:recipe-ingredients
 *
 * Env: SUPABASE_URL, SUPABASE_SECRET_KEY | SUPABASE_SERVICE_ROLE_KEY
 *      (reads work with VITE_SUPABASE_PUBLISHABLE_KEY / anon JWT)
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return {};
  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const env = { ...loadEnv(), ...process.env };
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const READ_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY;
const WRITE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SECRET_KEY ||
  null;

const APPLY = process.argv.includes("--apply");
const WRITE_SQL = process.argv.includes("--sql");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i >= 0 ? Number(process.argv[i + 1]) || 0 : 0;
})();

if (!SUPABASE_URL || !READ_KEY) {
  console.error("Missing SUPABASE_URL or publishable/anon key");
  process.exit(1);
}

const readHeaders = {
  apikey: READ_KEY,
  Authorization: `Bearer ${READ_KEY}`,
  Accept: "application/json",
};

/** Common free-text → canonical ingredient name */
const SYNONYMS = {
  onion: "onion",
  onions: "onion",
  "yellow onion": "onion",
  "red onion": "red onion",
  "white onion": "onion",
  "green onion": "scallions",
  "spring onion": "scallions",
  scallion: "scallions",
  scallions: "scallions",
  tomato: "tomato",
  tomatoes: "tomato",
  "cherry tomato": "tomato",
  "roma tomato": "tomato",
  potato: "potato",
  potatoes: "potato",
  "sweet potato": "sweet potato",
  "sweet potatoes": "sweet potato",
  garlic: "garlic",
  "garlic clove": "garlic",
  "garlic cloves": "garlic",
  ginger: "ginger",
  "fresh ginger": "ginger",
  salt: "salt",
  "sea salt": "salt",
  "kosher salt": "salt",
  "pinch of salt": "salt",
  pepper: "black pepper",
  "black pepper": "black pepper",
  "white pepper": "black pepper",
  "freshly ground black pepper": "black pepper",
  "ground black pepper": "black pepper",
  "bay leaf": "bay leaves",
  "bay leaves": "bay leaves",
  "1 bay leaf": "bay leaves",
  saffron: "saffron",
  maggi: "maggi",
  "maggi cube": "maggi",
  "maggi cubes": "maggi",
  "stock cube": "maggi",
  "bouillon cube": "maggi",
  "ras el hanout": "ras el hanout",
  "warm water": "water",
  "hot water": "water",
  "cold water": "water",
  cream: "heavy cream",
  "½ cup cream": "heavy cream",
  oil: "vegetable oil",
  "cooking oil": "vegetable oil",
  "vegetable oil": "vegetable oil",
  "olive oil": "olive oil",
  "palm oil": "palm oil",
  "red palm oil": "palm oil",
  water: "water",
  sugar: "sugar",
  "brown sugar": "sugar",
  flour: "all-purpose flour",
  "plain flour": "all-purpose flour",
  "all purpose flour": "all-purpose flour",
  "all-purpose flour": "all-purpose flour",
  rice: "rice",
  "white rice": "rice",
  "jasmine rice": "rice",
  "basmati rice": "rice",
  chicken: "chicken",
  "chicken thighs": "chicken",
  "chicken breast": "chicken",
  beef: "beef",
  "stewing beef": "beef",
  "ground beef": "beef",
  goat: "goat",
  "goat meat": "goat",
  lamb: "lamb",
  fish: "tilapia",
  spinach: "spinach",
  kale: "kale",
  "collard greens": "collard greens",
  collards: "collard greens",
  "sukuma wiki": "sukuma wiki",
  sukuma: "sukuma wiki",
  ugwu: "ugwu",
  ugu: "ugwu",
  "fluted pumpkin": "ugwu",
  "fluted pumpkin leaves": "ugwu",
  egusi: "egusi",
  "egusi seeds": "egusi",
  "melon seeds": "egusi",
  "groundnut": "groundnut",
  "groundnuts": "groundnut",
  peanut: "groundnut",
  peanuts: "groundnut",
  "peanut butter": "groundnut",
  "scotch bonnet": "scotch bonnet",
  "scotch bonnets": "scotch bonnet",
  "ata rodo": "scotch bonnet",
  habanero: "habanero",
  crayfish: "crayfish",
  "dried crayfish": "crayfish",
  stockfish: "stockfish",
  "dried fish": "smoked fish",
  "smoked fish": "smoked fish",
  cassava: "cassava",
  "cassava flour": "cassava",
  plantain: "plantain",
  plantains: "plantain",
  yam: "yam",
  "african yam": "yam",
  okra: "okra",
  "lady fingers": "okra",
  maize: "maize",
  corn: "maize",
  "cornmeal": "maize",
  "maize meal": "maize",
  "corn meal": "maize",
  millet: "millet",
  "millet flour": "millet",
  sorghum: "sorghum",
  teff: "teff",
  fonio: "fonio",
  cumin: "cumin",
  "ground cumin": "cumin",
  thyme: "thyme",
  "dried thyme": "thyme",
  coriander: "cilantro",
  cilantro: "cilantro",
  parsley: "parsley",
  "coconut milk": "coconut milk",
  "evaporated milk": "evaporated milk",
  milk: "milk",
  butter: "butter",
  ghee: "ghee",
  broth: "chicken",
  stock: "chicken",
  "chicken broth": "chicken",
  "beef broth": "beef",
  chili: "cayenne pepper",
  chilli: "cayenne pepper",
  "chili pepper": "cayenne pepper",
  cayenne: "cayenne pepper",
  "cayenne pepper": "cayenne pepper",
  turmeric: "turmeric",
  "ground turmeric": "turmeric",
  cloves: "cloves",
  "bay leaf": "bay leaves",
  "bay leaves": "bay leaves",
  lemon: "lemon",
  lime: "lime",
  "green pepper": "bell pepper",
  "bell pepper": "bell pepper",
  "red pepper": "bell pepper",
  carrot: "carrots",
  carrots: "carrots",
  celery: "celery",
  cabbage: "cabbage",
  eggplant: "eggplant",
  "garden egg": "eggplant",
  "garden eggs": "eggplant",
  "black eyed peas": "black-eyed peas",
  "black-eyed peas": "black-eyed peas",
  "blackeyed peas": "black-eyed peas",
  lentils: "lentils",
  chickpeas: "chickpeas",
  "garbanzo beans": "chickpeas",
  beans: "kidney beans",
  "kidney beans": "kidney beans",
  "palm nut": "palm oil",
  "palm nuts": "palm oil",
  "bitter leaf": "bitterleaf",
  bitterleaf: "bitterleaf",
  "bitter leaves": "bitterleaf",
  morogo: "morogo",
  molokhia: "molokhia",
  "jute leaves": "molokhia",
  iru: "iru",
  dawadawa: "iru",
  locust: "iru",
  "locust beans": "iru",
  uziza: "uziza",
  utazi: "utazi",
  "suya spice": "suya spice",
  "yaji": "suya spice",
  shrimp: "prawns",
  prawns: "prawns",
  "dried shrimp": "dried shrimp",
  tomatoe: "tomatoes",
  "tomato paste": "tomato paste",
  "tomato puree": "tomato paste",
  "tomato sauce": "tomato paste",
};

function normalize(input) {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripNoise(raw) {
  let s = String(raw || "").trim();
  // unicode fractions / mixed numbers at start
  s = s.replace(/^[¼½¾⅓⅔⅛⅜⅝⅞]\s*/, "");
  s = s.replace(/^\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]\s*/, "");
  s = s.replace(/^\d+([./]\d+)?(\s*-\s*\d+([./]\d+)?)?\s*/, "");
  s = s.replace(
    /^(cups?|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|cloves?|pieces?|cans?|bunch(?:es)?|handfuls?|tins?|pinch(?:es)?|dash(?:es)?|slices?|stalks?|heads?|medium|large|small)\s+/i,
    ""
  );
  // leading qty still glued: "2 bay leaves", "1 teaspoon pepper"
  s = s.replace(/^\d+\s+/, "");
  s = s.replace(/\s*\(.*?\)\s*/g, " ");
  s = s.replace(
    /\s*(optional|to taste|or to taste|for serving|for frying|for boiling|drained|peeled|chopped|diced|sliced|minced|fresh|dried|ground|freshly ground|whole)\s*$/i,
    " "
  );
  s = s.replace(/,.*$/, "");
  s = s.replace(/\s+or\s+.*$/i, "");
  s = s.replace(/^(warm|hot|cold|boiling)\s+/i, "");
  return s.trim();
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function typoThreshold(len) {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  return 2;
}

function extractDisplay(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw !== "object") return String(raw);
  return String(raw.item || raw.name || raw.text || raw.ingredient || "").trim();
}

function extractQuantityUnit(raw) {
  if (!raw || typeof raw !== "object") {
    return { quantity: null, unit: null, optional: false, note: null };
  }
  const optional =
    Boolean(raw.is_optional) ||
    /\boptional\b/i.test(String(raw.notes || raw.name || raw.item || raw.text || ""));
  let quantity =
    raw.quantity != null && raw.quantity !== ""
      ? raw.quantity
      : raw.amount != null && raw.amount !== ""
        ? raw.amount
        : null;
  let unit = raw.unit != null && raw.unit !== "" ? String(raw.unit) : null;
  const note = raw.notes || raw.preparation_note || raw.note || null;

  // Parse "1 cup dried black beans" style name when amount/unit null
  if ((quantity == null || quantity === "") && typeof (raw.name || raw.text) === "string") {
    const m = String(raw.name || raw.text).match(
      /^([0-9]+(?:[./][0-9]+)?|[¼½¾⅓⅔]|[0-9]+\s*[¼½¾⅓⅔])\s*([a-zA-Z]+)?/
    );
    if (m) {
      quantity = m[1].replace(/\s+/g, "");
      if (!unit && m[2]) unit = m[2].toLowerCase();
    }
  }

  if (typeof quantity === "string") {
    const frac = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 0.33, "⅔": 0.67 };
    if (frac[quantity] != null) quantity = frac[quantity];
    else if (/^\d+\/\d+$/.test(quantity)) {
      const [a, b] = quantity.split("/").map(Number);
      quantity = b ? a / b : null;
    } else if (quantity === "" || Number.isNaN(Number(quantity))) {
      // keep as-is string for display; numeric column may reject — coerce later
    } else {
      quantity = Number(quantity);
    }
  }

  return { quantity, unit, optional, note };
}

async function fetchAll(pathBase) {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathBase}`, {
      headers: {
        ...readHeaders,
        Range: `${from}-${from + pageSize - 1}`,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) throw new Error(`GET ${pathBase}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function buildLookup(ingredients, aliases) {
  /** @type {Map<string, {id:string,name:string,slug:string}>} */
  const exact = new Map();
  /** @type {Array<{id:string,name:string,slug:string,norm:string}>} */
  const list = [];

  for (const ing of ingredients) {
    const entry = { id: ing.id, name: ing.name, slug: ing.slug || normalize(ing.name).replace(/\s+/g, "-") };
    list.push({ ...entry, norm: normalize(ing.name) });
    if (ing.canonical_name) list.push({ ...entry, norm: normalize(ing.canonical_name) });
    for (const key of [ing.name, ing.canonical_name, ing.slug]) {
      const n = normalize(key || "");
      if (n && !exact.has(n)) exact.set(n, entry);
    }
    // singular/plural light variants
    const n = normalize(ing.name);
    if (n.endsWith("s") && n.length > 4 && !exact.has(n.slice(0, -1))) exact.set(n.slice(0, -1), entry);
    if (!n.endsWith("s") && !exact.has(n + "s")) exact.set(n + "s", entry);
  }

  for (const a of aliases) {
    const n = normalize(a.alias || a.alias_normalized);
    if (!n) continue;
    const ing = ingredients.find((i) => i.id === a.ingredient_id);
    if (!ing) continue;
    const entry = { id: ing.id, name: ing.name, slug: ing.slug };
    if (!exact.has(n)) exact.set(n, entry);
  }

  // synonym targets must resolve
  for (const [from, to] of Object.entries(SYNONYMS)) {
    const target = exact.get(normalize(to));
    if (target) exact.set(normalize(from), target);
  }

  list.sort((a, b) => b.norm.length - a.norm.length);
  return { exact, list };
}

function matchIngredient(display, lookup) {
  const raw = display;
  const candidates = [
    normalize(raw),
    normalize(stripNoise(raw)),
    normalize(SYNONYMS[normalize(raw)] || ""),
    normalize(SYNONYMS[normalize(stripNoise(raw))] || ""),
  ].filter(Boolean);

  for (const c of candidates) {
    const hit = lookup.exact.get(c);
    if (hit) return { ...hit, confidence: 1, method: "exact", query: c };
  }

  // contained: ingredient name appears as a whole phrase inside the line
  // Never match a short query into a longer ingredient ("water" ↛ "water leaves").
  const stripped = normalize(stripNoise(raw));
  if (stripped.length >= 3) {
    for (const ing of lookup.list) {
      if (ing.norm.length < 3) continue;
      if (stripped === ing.norm) {
        return { id: ing.id, name: ing.name, slug: ing.slug, confidence: 1, method: "exact-list", query: stripped };
      }
      if (ing.norm.length < 4) continue;
      const re = new RegExp(`(?:^|\\s)${ing.norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`);
      if (re.test(stripped)) {
        return { id: ing.id, name: ing.name, slug: ing.slug, confidence: 0.85, method: "contains", query: stripped };
      }
    }
  }

  // typo on short final token phrase
  if (stripped.length >= 5 && stripped.length <= 24) {
    let best = null;
    for (const ing of lookup.list) {
      if (Math.abs(ing.norm.length - stripped.length) > 3) continue;
      const d = editDistance(stripped, ing.norm);
      if (d <= typoThreshold(stripped.length)) {
        if (!best || d < best.d) best = { ing, d };
      }
    }
    if (best) {
      return {
        id: best.ing.id,
        name: best.ing.name,
        slug: best.ing.slug,
        confidence: best.d === 0 ? 1 : 0.7,
        method: "fuzzy",
        query: stripped,
      };
    }
  }

  return null;
}

function sqlLiteral(v) {
  if (v == null) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function upsertBatch(rows) {
  if (!WRITE_KEY) return { ok: false, error: "no write key" };
  if (!rows.length) return { ok: true, count: 0 };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/recipe_ingredients?on_conflict=recipe_id,ingredient_id`, {
    method: "POST",
    headers: {
      apikey: WRITE_KEY,
      Authorization: `Bearer ${WRITE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true, count: rows.length };
}

async function main() {
  console.log("Loading ingredients, aliases, recipes…");
  const [ingredients, aliases, recipes] = await Promise.all([
    fetchAll("ingredients?select=id,name,slug,canonical_name&order=name.asc"),
    fetchAll("ingredient_aliases?select=ingredient_id,alias,alias_normalized"),
    fetchAll(
      LIMIT
        ? `recipes?select=id,slug,ingredients&order=slug.asc&limit=${LIMIT}`
        : "recipes?select=id,slug,ingredients&order=slug.asc"
    ),
  ]);

  console.log(`  ingredients=${ingredients.length} aliases=${aliases.length} recipes=${recipes.length}`);
  const lookup = buildLookup(ingredients, aliases);
  console.log(`  lookup keys=${lookup.exact.size}`);

  const rows = [];
  const unmatched = new Map(); // display → count
  const methodCounts = {};
  let lineTotal = 0;
  let matchedLines = 0;
  let recipesWithAnyMatch = 0;
  let recipesWithFullMatch = 0;

  for (const recipe of recipes) {
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const seen = new Set();
    let matchedInRecipe = 0;
    let sort = 0;

    for (const raw of ings) {
      lineTotal++;
      sort++;
      const display = extractDisplay(raw);
      if (!display) continue;
      const { quantity, unit, optional, note } = extractQuantityUnit(raw);
      const hit = matchIngredient(display, lookup);
      if (!hit) {
        unmatched.set(display, (unmatched.get(display) || 0) + 1);
        continue;
      }
      if (seen.has(hit.id)) continue; // PK (recipe_id, ingredient_id)
      seen.add(hit.id);
      matchedLines++;
      matchedInRecipe++;
      methodCounts[hit.method] = (methodCounts[hit.method] || 0) + 1;

      let qtyNum = null;
      if (typeof quantity === "number" && Number.isFinite(quantity)) qtyNum = quantity;
      else if (typeof quantity === "string" && quantity.trim() !== "" && !Number.isNaN(Number(quantity))) {
        qtyNum = Number(quantity);
      }

      rows.push({
        recipe_id: recipe.id,
        ingredient_id: hit.id,
        quantity: qtyNum != null ? qtyNum : 1,
        unit: unit || "piece",
        is_optional: optional,
        display_text: display.slice(0, 500),
        preparation_note: note ? String(note).slice(0, 500) : null,
        sort_order: sort,
        source: "json-backfill-v1",
        review_status: hit.confidence >= 0.85 ? "approved" : "proposed",
        _meta: { slug: recipe.slug, method: hit.method, confidence: hit.confidence, matched: hit.name },
      });
    }

    if (matchedInRecipe > 0) recipesWithAnyMatch++;
    if (ings.length > 0 && matchedInRecipe === ings.length) recipesWithFullMatch++;
    else if (ings.length > 0 && seen.size === new Set(ings.map((x) => extractDisplay(x)).filter(Boolean)).size) {
      // approximate full when all unique lines matched (duplicates aside)
    }
  }

  const unmatchedSorted = [...unmatched.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80);

  const report = {
    generated_at: new Date().toISOString(),
    recipes: recipes.length,
    ingredient_lines: lineTotal,
    matched_lines: matchedLines,
    unique_join_rows: rows.length,
    match_rate_lines: lineTotal ? Number((matchedLines / lineTotal).toFixed(4)) : 0,
    recipes_with_any_match: recipesWithAnyMatch,
    recipes_with_full_line_match: recipesWithFullMatch,
    method_counts: methodCounts,
    top_unmatched: unmatchedSorted.map(([text, count]) => ({ text, count })),
    apply: APPLY,
  };

  mkdirSync(resolve(root, "output"), { recursive: true });
  writeFileSync(resolve(root, "output/recipe_ingredients_backfill_report.json"), JSON.stringify(report, null, 2));
  console.log("\nReport:");
  console.log(`  lines matched: ${matchedLines}/${lineTotal} (${(report.match_rate_lines * 100).toFixed(1)}%)`);
  console.log(`  join rows (deduped): ${rows.length}`);
  console.log(`  recipes with ≥1 match: ${recipesWithAnyMatch}/${recipes.length}`);
  console.log(`  methods:`, methodCounts);
  console.log(`  top unmatched:`, unmatchedSorted.slice(0, 15).map(([t, c]) => `${c}× ${t}`).join(" | "));

  if (WRITE_SQL || (!APPLY && !WRITE_KEY)) {
    const sqlPath = resolve(root, "output/recipe_ingredients_backfill.sql");
    const chunks = [];
    chunks.push("-- Generated by scripts/backfill-recipe-ingredients.mjs");
    chunks.push("-- Idempotent upsert on PRIMARY KEY (recipe_id, ingredient_id)");
    chunks.push("BEGIN;");
    const batchSize = 200;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      chunks.push(
        `INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional, display_text, preparation_note, sort_order, source, review_status)
VALUES`
      );
      chunks.push(
        batch
          .map(
            (r) =>
              `  (${sqlLiteral(r.recipe_id)}::uuid, ${sqlLiteral(r.ingredient_id)}::uuid, ${sqlLiteral(r.quantity)}, ${sqlLiteral(r.unit)}, ${sqlLiteral(r.is_optional)}, ${sqlLiteral(r.display_text)}, ${sqlLiteral(r.preparation_note)}, ${sqlLiteral(r.sort_order)}, ${sqlLiteral(r.source)}, ${sqlLiteral(r.review_status)})`
          )
          .join(",\n")
      );
      chunks.push(`ON CONFLICT (recipe_id, ingredient_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  is_optional = EXCLUDED.is_optional,
  display_text = EXCLUDED.display_text,
  preparation_note = COALESCE(EXCLUDED.preparation_note, recipe_ingredients.preparation_note),
  sort_order = EXCLUDED.sort_order,
  source = EXCLUDED.source,
  review_status = EXCLUDED.review_status;`);
    }
    chunks.push("COMMIT;");
    writeFileSync(sqlPath, chunks.join("\n") + "\n");
    console.log(`\nWrote ${sqlPath} (${rows.length} rows)`);
  }

  if (APPLY) {
    console.log("\nApplying upserts…");
    if (!WRITE_KEY) {
      console.error("No SUPABASE_SERVICE_ROLE_KEY / working secret — cannot apply via REST.");
      console.error("Apply output/recipe_ingredients_backfill.sql in the Supabase SQL editor, or deploy the edge function.");
      process.exit(2);
    }
    const payload = rows.map(({ _meta, ...r }) => r);
    let ok = 0;
    for (let i = 0; i < payload.length; i += 200) {
      const batch = payload.slice(i, i + 200);
      const res = await upsertBatch(batch);
      if (!res.ok) {
        console.error("Upsert failed:", res.error);
        process.exit(3);
      }
      ok += batch.length;
      process.stdout.write(`  upserted ${ok}/${payload.length}\r`);
    }
    console.log(`\nDone. Upserted ${ok} rows.`);
  } else {
    console.log("\nDry-run only. Re-run with --apply (service role) or --sql (default SQL written).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
