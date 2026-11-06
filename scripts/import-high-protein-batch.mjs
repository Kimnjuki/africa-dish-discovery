import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, "")];
    })
);

const dishes = JSON.parse(readFileSync(resolve(root, "data/high-protein-batch.json"), "utf8"));
const regions = [
  ["morocco", "Africa"],
  ["sweden", "Europe"],
  ["greece", "Europe"],
  ["argentina", "South America"],
  ["thailand", "Asia"],
];

function continentFor(country) {
  const value = country.toLowerCase();
  const match = regions.find(([name]) => value.includes(name));
  return match ? match[1] : "Global";
}

function slugify(title) {
  return title
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ingredientLine(item) {
  const amount = Number.isInteger(item.amount) ? String(item.amount) : String(item.amount);
  const notes = item.notes ? ` (${item.notes})` : "";
  return {
    ...item,
    text: `${amount} ${item.unit} ${item.name}${notes}`,
  };
}

const rows = dishes.map((dish) => {
  const continent = continentFor(dish.country);
  return {
    name: dish.title,
    slug: slugify(dish.title),
    country: dish.country,
    continent,
    is_african: continent === "Africa",
    category: dish.category,
    cuisine_type: dish.country,
    difficulty: dish.difficulty,
    servings: dish.servings,
    prep_time: dish.prep_time_minutes,
    cook_time: dish.cook_time_minutes,
    prep_time_minutes: dish.prep_time_minutes,
    cook_time_minutes: dish.cook_time_minutes,
    protein: dish.protein_grams,
    summary: dish.historical_context,
    brief_description: dish.historical_context,
    history: dish.historical_context,
    ingredients: dish.ingredients.map(ingredientLine),
    steps: dish.instructions,
    tags: [dish.category, dish.country, "The High Protein Cookbook", dish.difficulty],
    item_type: "recipe",
  };
});

const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const slugs = rows.map((row) => row.slug).join(",");
const existingResponse = await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/recipes?select=slug,name&slug=in.(${slugs})`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
if (!existingResponse.ok) {
  console.error(await existingResponse.text());
  process.exit(1);
}
const existing = await existingResponse.json();
const existingSlugs = new Set(existing.map((row) => row.slug));
const fresh = rows.filter((row) => !existingSlugs.has(row.slug));

const sqlValue = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const sqlArray = (values) => `ARRAY[${values.map(sqlValue).join(", ")}]`;
const sql = fresh.length
  ? `INSERT INTO public.recipes (
  name, slug, country, continent, is_african, category, cuisine_type, difficulty,
  servings, prep_time, cook_time, prep_time_minutes, cook_time_minutes, protein,
  summary, brief_description, history, ingredients, steps, tags, item_type
) VALUES
${fresh
  .map((row) => `  (${[
    sqlValue(row.name),
    sqlValue(row.slug),
    sqlValue(row.country),
    sqlValue(row.continent),
    row.is_african ? "true" : "false",
    sqlValue(row.category),
    sqlValue(row.cuisine_type),
    sqlValue(row.difficulty),
    row.servings,
    row.prep_time,
    row.cook_time,
    row.prep_time_minutes,
    row.cook_time_minutes,
    row.protein,
    sqlValue(row.summary),
    sqlValue(row.brief_description),
    sqlValue(row.history),
    sqlJson(row.ingredients),
    sqlJson(row.steps),
    sqlArray(row.tags),
    sqlValue(row.item_type),
  ].join(", ")})`)
  .join(",\n")}
ON CONFLICT (slug) DO NOTHING;`
  : "";

writeFileSync(resolve(root, "data/high-protein-batch-insert.sql"), sql);
console.log(`skip ${existing.length}`);
for (const row of existing) console.log(`skip\t${row.slug}`);
console.log(`insert ${fresh.length}`);
for (const row of fresh) console.log(`${row.slug}\t${row.protein}g\t${row.continent}`);
