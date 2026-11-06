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

const dishes = JSON.parse(readFileSync(resolve(root, "data/next-batch-dishes.json"), "utf8"));
const regions = [
  ["morocco", "Africa"],
  ["egypt", "Africa"],
  ["india", "Asia"],
  ["china", "Asia"],
  ["thailand", "Asia"],
  ["vietnam", "Asia"],
  ["hawaii", "Oceania"],
  ["australia", "Oceania"],
  ["greece", "Europe"],
  ["norway", "Europe"],
  ["france", "Europe"],
  ["italy", "Europe"],
  ["portugal", "Europe"],
  ["united kingdom", "Europe"],
  ["denmark", "Europe"],
  ["turkey", "Europe"],
  ["mediterranean", "Europe"],
  ["united states", "North America"],
  ["mexico", "North America"],
];

function continentFor(country) {
  const value = country.toLowerCase();
  const match = regions.find(([name]) => value.includes(name));
  return match ? match[1] : "Global";
}

function slugify(title) {
  return title
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function times(label) {
  const extra = label.match(/\+\s*(\d+)\s*(hr|min)/i);
  const main = label.replace(/\(.*?\)/g, "");
  const hours = main.match(/(\d+)\s*hr/i);
  const minutes = main.match(/(\d+)\s*min/i);
  return {
    prep_time: extra ? Number(extra[1]) * (extra[2].toLowerCase().startsWith("hr") ? 60 : 1) : 0,
    cook_time: (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0),
  };
}

const rows = dishes.map((dish) => {
  const timing = times(dish.prep_cook_time);
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
    prep_time: timing.prep_time,
    cook_time: timing.cook_time,
    prep_time_minutes: timing.prep_time,
    cook_time_minutes: timing.cook_time,
    summary: dish.summary,
    brief_description: dish.summary,
    history: dish.historical_context,
    ingredients: dish.ingredients,
    steps: dish.steps,
    tags: [dish.category, dish.country, dish.difficulty],
    item_type: "recipe",
  };
});

const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const names = rows.map((row) => `"${row.name.replaceAll('"', '\\"')}"`).join(",");
const slugs = rows.map((row) => row.slug).join(",");
const existingResponse = await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/recipes?select=name,slug&or=(name.in.(${encodeURIComponent(names)}),slug.in.(${slugs}))`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
if (!existingResponse.ok) {
  console.error(await existingResponse.text());
  process.exit(1);
}
const existing = await existingResponse.json();
const existingNames = new Set(existing.map((row) => row.name));
const existingSlugs = new Set(existing.map((row) => row.slug));
const fresh = rows.filter((row) => !existingNames.has(row.name) && !existingSlugs.has(row.slug));

const sqlValue = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const sqlArray = (values) => `ARRAY[${values.map(sqlValue).join(", ")}]`;
const sql = fresh.length
  ? `INSERT INTO public.recipes (
  name, slug, country, continent, is_african, category, cuisine_type, difficulty,
  servings, prep_time, cook_time, prep_time_minutes, cook_time_minutes,
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

writeFileSync(resolve(root, "data/next-batch-insert.sql"), sql);
console.log(`existing ${existing.length}`);
for (const row of existing) console.log(`skip\t${row.slug}\t${row.name}`);
console.log(`insert ${fresh.length}`);
for (const row of fresh) console.log(`${row.slug}\t${row.prep_time}+${row.cook_time}\t${row.continent}`);
