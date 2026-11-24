/**
 * Infer missing recipe calories / macros / allergens / diet tags from the
 * ingredient graph (recipe_ingredients → ingredients).
 *
 * Conservative heuristics — NutritionBadge already labels values as estimates.
 *
 * Usage:
 *   node scripts/infer-recipe-nutrition.mjs
 *   npx supabase db query --remote --yes -f output/infer_recipe_nutrition.sql
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
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
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

/** Typical kcal contribution per ingredient occurrence (per recipe serving). */
const CATEGORY_KCAL = {
  protein: 90,
  seafood: 70,
  meat: 110,
  oil: 60,
  fat: 60,
  dairy: 50,
  grain: 80,
  flour: 70,
  starch: 85,
  produce: 25,
  vegetable: 20,
  fruit: 25,
  legume: 55,
  nut: 70,
  seed: 55,
  spice: 5,
  seasoning: 5,
  herb: 3,
  condiment: 15,
  liquid: 5,
  beverage: 10,
  default: 30,
};

const CATEGORY_MACRO = {
  protein: { p: 12, c: 1, f: 4 },
  seafood: { p: 10, c: 0, f: 2 },
  meat: { p: 14, c: 0, f: 6 },
  oil: { p: 0, c: 0, f: 7 },
  fat: { p: 0, c: 0, f: 7 },
  dairy: { p: 3, c: 2, f: 3 },
  grain: { p: 2, c: 15, f: 1 },
  flour: { p: 2, c: 14, f: 1 },
  starch: { p: 2, c: 16, f: 1 },
  produce: { p: 1, c: 4, f: 0 },
  vegetable: { p: 1, c: 3, f: 0 },
  fruit: { p: 0, c: 6, f: 0 },
  legume: { p: 5, c: 8, f: 1 },
  nut: { p: 3, c: 2, f: 6 },
  seed: { p: 3, c: 2, f: 4 },
  spice: { p: 0, c: 0, f: 0 },
  seasoning: { p: 0, c: 0, f: 0 },
  herb: { p: 0, c: 0, f: 0 },
  condiment: { p: 0, c: 2, f: 0 },
  liquid: { p: 0, c: 0, f: 0 },
  default: { p: 1, c: 3, f: 1 },
};

async function fetchAll(path) {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact" };
  const out = [];
  let from = 0;
  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { ...headers, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 1000) break;
    from += 1000;
  }
  return out;
}

function catKey(ing) {
  const c = String(ing.category || ing.food_group || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();
  if (/oil|fat/.test(c)) return "oil";
  if (/meat|protein|poultry|beef|goat|lamb|chicken/.test(c)) return "protein";
  if (/seafood|fish|shellfish/.test(c)) return "seafood";
  if (/dairy|milk|cheese|butter/.test(c)) return "dairy";
  if (/grain|cereal/.test(c)) return "grain";
  if (/flour/.test(c)) return "flour";
  if (/starch|root|tuber/.test(c)) return "starch";
  if (/legume|bean|pea/.test(c)) return "legume";
  if (/nut/.test(c)) return "nut";
  if (/seed/.test(c)) return "seed";
  if (/spice|season/.test(c)) return "spice";
  if (/herb/.test(c)) return "herb";
  if (/condiment|sauce/.test(c)) return "condiment";
  if (/liquid|beverage|drink/.test(c)) return "liquid";
  if (/fruit/.test(c)) return "fruit";
  if (/veg|produce|leaf|green/.test(c)) return "vegetable";
  return "default";
}

function sqlArr(arr) {
  if (!arr.length) return "ARRAY[]::text[]";
  return `ARRAY[${arr.map((a) => `'${String(a).replace(/'/g, "''")}'`).join(",")}]::text[]`;
}

function sqlNum(n) {
  return Number.isFinite(n) ? String(Math.round(n * 10) / 10) : "NULL";
}

async function main() {
  console.log("Loading recipes, ingredients, joins…");
  const [recipes, ingredients, joins] = await Promise.all([
    fetchAll(
      "recipes?select=id,slug,servings,calories,protein,carbs,fats,allergen_tags,dietary_tags&order=slug.asc"
    ),
    fetchAll("ingredients?select=id,name,category,food_group,allergens,dietary_tags"),
    fetchAll("recipe_ingredients?select=recipe_id,ingredient_id,is_optional"),
  ]);

  const ingById = new Map(ingredients.map((i) => [i.id, i]));
  const joinsByRecipe = new Map();
  for (const j of joins) {
    if (!joinsByRecipe.has(j.recipe_id)) joinsByRecipe.set(j.recipe_id, []);
    joinsByRecipe.get(j.recipe_id).push(j);
  }

  const updates = [];
  let calFilled = 0;
  let allergenFilled = 0;
  let dietFilled = 0;

  for (const r of recipes) {
    const rows = (joinsByRecipe.get(r.id) || []).filter((j) => !j.is_optional);
    if (!rows.length) continue;

    const ings = rows.map((j) => ingById.get(j.ingredient_id)).filter(Boolean);
    if (!ings.length) continue;

    const servings = Math.max(1, Number(r.servings) || 4);

    // Calories / macros
    let kcalTotal = 0;
    let p = 0;
    let c = 0;
    let f = 0;
    for (const ing of ings) {
      const key = catKey(ing);
      kcalTotal += CATEGORY_KCAL[key] ?? CATEGORY_KCAL.default;
      const m = CATEGORY_MACRO[key] ?? CATEGORY_MACRO.default;
      p += m.p;
      c += m.c;
      f += m.f;
    }
    // Scale: category contributions are "per serving portion of that ingredient"
    // Cap extremes for long ingredient lists
    const scale = Math.min(1.4, Math.max(0.55, 8 / Math.max(ings.length, 1)));
    let calPerServing = Math.round((kcalTotal * scale) / Math.max(1, Math.sqrt(servings / 4)));
    calPerServing = Math.max(90, Math.min(950, calPerServing));
    const protein = Math.round((p * scale) / Math.sqrt(servings / 4));
    const carbs = Math.round((c * scale) / Math.sqrt(servings / 4));
    const fats = Math.round((f * scale) / Math.sqrt(servings / 4));

    // Allergens = union
    const allergens = new Set();
    for (const ing of ings) {
      for (const a of ing.allergens || []) {
        if (a) allergens.add(String(a).toLowerCase().replace(/_/g, "-"));
      }
    }

    // Diet tags = intersection of tags present on ≥70% of ingredients
    const dietCounts = new Map();
    for (const ing of ings) {
      for (const d of ing.dietary_tags || []) {
        const key = String(d).toLowerCase().replace(/_/g, "-");
        dietCounts.set(key, (dietCounts.get(key) || 0) + 1);
      }
    }
    const dietTags = [];
    for (const [tag, count] of dietCounts) {
      if (count / ings.length >= 0.7) dietTags.push(tag);
    }

    const needCal = r.calories == null;
    const needAllergen = !(Array.isArray(r.allergen_tags) && r.allergen_tags.length) && allergens.size > 0;
    const needDiet = !(Array.isArray(r.dietary_tags) && r.dietary_tags.length) && dietTags.length > 0;
    if (!needCal && !needAllergen && !needDiet) continue;

    if (needCal) calFilled++;
    if (needAllergen) allergenFilled++;
    if (needDiet) dietFilled++;

    const sets = [];
    if (needCal) {
      sets.push(`calories = ${Math.round(calPerServing)}`);
      if (r.protein == null) sets.push(`protein = ${sqlNum(protein)}`);
      if (r.carbs == null) sets.push(`carbs = ${sqlNum(carbs)}`);
      if (r.fats == null) sets.push(`fats = ${sqlNum(fats)}`);
    }
    if (needAllergen) sets.push(`allergen_tags = ${sqlArr([...allergens].sort())}`);
    if (needDiet) sets.push(`dietary_tags = ${sqlArr(dietTags.sort())}`);

    updates.push({
      id: r.id,
      slug: r.slug,
      sql: `UPDATE public.recipes SET ${sets.join(", ")} WHERE id = '${r.id}'::uuid;`,
    });
  }

  mkdirSync(resolve(root, "output"), { recursive: true });
  const sqlPath = resolve(root, "output/infer_recipe_nutrition.sql");
  writeFileSync(sqlPath, ["-- Generated by scripts/infer-recipe-nutrition.mjs", "BEGIN;", ...updates.map((u) => u.sql), "COMMIT;", ""].join("\n"));
  writeFileSync(
    resolve(root, "output/infer_recipe_nutrition_report.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        recipes_scanned: recipes.length,
        updates: updates.length,
        calories_filled: calFilled,
        allergens_filled: allergenFilled,
        diet_tags_filled: dietFilled,
      },
      null,
      2
    )
  );

  console.log(`Updates: ${updates.length} (cal=${calFilled}, allergens=${allergenFilled}, diet=${dietFilled})`);
  console.log(`Wrote ${sqlPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
