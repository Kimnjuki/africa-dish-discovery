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

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const dishes = JSON.parse(readFileSync(resolve(root, "data/light-bites-dishes.json"), "utf8"));

const africa = ["morocco", "egypt"];
const asia = ["thailand", "vietnam", "southeast asia"];
const europe = ["denmark", "united kingdom", "italy", "turkey"];
const northAmerica = ["mexico", "united states"];
const oceania = ["australia", "hawaii"];

function continentFor(country) {
  const value = country.toLowerCase();
  if (africa.some((name) => value.includes(name))) return "Africa";
  if (asia.some((name) => value.includes(name))) return "Asia";
  if (oceania.some((name) => value.includes(name))) return "Oceania";
  if (europe.some((name) => value.includes(name))) return "Europe";
  if (northAmerica.some((name) => value.includes(name))) return "North America";
  return "Global";
}

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function times(label) {
  const prepMatch = label.match(/\+\s*(\d+)\s*hr/i);
  const main = label.replace(/\(.*?\)/g, "");
  const hours = main.match(/(\d+)\s*hr/i);
  const minutes = main.match(/(\d+)\s*min/i);
  return {
    prep_time: prepMatch ? Number(prepMatch[1]) * 60 : 0,
    cook_time: (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0),
  };
}

const rows = dishes.map((dish) => {
  const timing = times(dish.prep_cook_time);
  const continent = continentFor(dish.country);
  const slug = dish.title === "Poke Bowl" ? "poke-bowl-hawaii" : slugify(dish.title);
  return {
    name: dish.title,
    slug,
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

const sqlValue = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const sqlArray = (values) => `ARRAY[${values.map(sqlValue).join(", ")}]`;
const sql = `INSERT INTO public.recipes (
  name, slug, country, continent, is_african, category, cuisine_type, difficulty,
  servings, prep_time, cook_time, prep_time_minutes, cook_time_minutes,
  summary, brief_description, history, ingredients, steps, tags, item_type
) VALUES
${rows
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
  .join(",\n")};
`;
writeFileSync(resolve(root, "data/light-bites-insert.sql"), sql);

const response = await fetch(`${url}/rest/v1/recipes`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(rows),
});

const body = await response.text();
if (!response.ok) {
  console.error(`Insert failed (${response.status})`);
  console.error(body.slice(0, 800));
  process.exit(1);
}

const inserted = JSON.parse(body);
console.log(`Inserted ${inserted.length} recipes`);
for (const recipe of inserted) {
  console.log(`${recipe.slug}\t${recipe.name}\t${recipe.country}`);
}
