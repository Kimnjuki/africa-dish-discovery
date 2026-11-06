import { readFileSync } from "node:fs";
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

const africa = ["algeria","angola","benin","botswana","burkina faso","burundi","cameroon","cape verde","central african republic","chad","comoros","congo","drc","côte d'ivoire","ivory coast","djibouti","egypt","equatorial guinea","eritrea","eswatini","ethiopia","gabon","gambia","ghana","guinea","guinea-bissau","kenya","lesotho","liberia","libya","madagascar","malawi","mali","mauritania","mauritius","morocco","mozambique","namibia","niger","nigeria","rwanda","senegal","seychelles","sierra leone","somalia","south africa","south sudan","sudan","tanzania","togo","tunisia","uganda","zambia","zimbabwe"];
const asia = ["china","india","indonesia","japan","malaysia","philippines","south korea","thailand","vietnam","singapore","taiwan","pakistan","bangladesh","nepal","sri lanka"];
const europe = ["france","germany","greece","hungary","italy","poland","spain","united kingdom","uk","portugal","netherlands","belgium","austria","switzerland","sweden","norway","denmark","finland","ireland","scotland","cyprus","turkey","russia","ukraine","romania","czech republic","lebanon"];
const middleEast = ["israel","palestine","jordan","syria","iraq","iran","saudi arabia","uae","united arab emirates","yemen","oman","kuwait","qatar","bahrain"];
const northAmerica = ["united states","usa","canada","mexico","cuba","jamaica","puerto rico","dominican republic","haiti","el salvador","guatemala","honduras","nicaragua","costa rica","panama"];
const southAmerica = ["colombia","venezuela","ecuador","peru","bolivia","chile","argentina","brazil","uruguay","paraguay","guyana","suriname"];
const oceania = ["australia","new zealand","fiji","papua new guinea","hawaii"];

function continentFor(country) {
  const value = country.toLowerCase();
  const lists = [
    [africa, "Africa"],
    [asia, "Asia"],
    [europe, "Europe"],
    [middleEast, "Middle East"],
    [northAmerica, "North America"],
    [southAmerica, "South America"],
    [oceania, "Oceania"],
  ];
  const match = lists.find(([names]) => names.some((name) => value.includes(name)));
  return match ? match[1] : "Global";
}

function slugify(title) {
  return title
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ưƯ]/g, "u")
    .replace(/[ơƠ]/g, "o")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clean(value) {
  return String(value ?? "").replace(/\[cite:\s*\d+\]/g, "").replace(/\s+/g, " ").trim();
}

function formatAmount(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return clean(amount);
  return Number.isInteger(number) ? String(number) : String(number);
}

function ingredientLine(item) {
  const amount = item.amount ?? item.quantity;
  const unit = clean(item.unit);
  const name = clean(item.name);
  const notes = clean(item.notes);
  const amountText = formatAmount(amount);
  const text = [amountText, unit, name].filter(Boolean).join(" ") + (notes ? ` (${notes})` : "");
  return {
    name,
    amount: amountText,
    unit,
    notes,
    text,
  };
}

function load(file) {
  return JSON.parse(readFileSync(resolve(root, file), "utf8"));
}

const highProtein = load("data/high-protein-vol2.json").map((dish) => {
  const country = dish.country_of_origin;
  const continent = continentFor(country);
  const history = clean(dish.historical_context);
  return {
    name: dish.title,
    slug: slugify(dish.title),
    country,
    continent,
    is_african: continent === "Africa",
    category: dish.category,
    cuisine_type: country,
    difficulty: null,
    is_verified_authentic: null,
    servings: dish.servings,
    prep_time: dish.prep_time_minutes,
    cook_time: dish.cook_time_minutes,
    prep_time_minutes: dish.prep_time_minutes,
    cook_time_minutes: dish.cook_time_minutes,
    protein: dish.protein_grams ?? null,
    summary: history,
    brief_description: history,
    history,
    ingredients: dish.ingredients.map(ingredientLine),
    steps: dish.instructions.map(clean),
    tags: [dish.category, country, dish.cookbook].filter(Boolean),
    item_type: "recipe",
  };
});

const egypt = [...load("data/egypt-batch-1.json"), ...load("data/egypt-batch-2.json"), ...load("data/egypt-batch-3.json")].map((dish) => {
  const continent = dish.continent || continentFor(dish.country);
  const history = [dish.history, dish.cultural_significance, dish.cultural_significance_text]
    .map(clean)
    .filter((part, index, all) => part && all.indexOf(part) === index);
  if (dish.original_name_native) history.push(`Native name: ${clean(dish.original_name_native)}.`);
  if (dish.phonetic_spelling) history.push(`Pronounced ${clean(dish.phonetic_spelling)}.`);
  return {
    name: dish.name,
    slug: dish.slug || slugify(dish.name),
    country: dish.country,
    continent,
    is_african: dish.is_african ?? continent === "Africa",
    is_verified_authentic: dish.is_verified_authentic ?? null,
    category: dish.category,
    cuisine_type: dish.cuisine_type || dish.country,
    difficulty: dish.difficulty || null,
    servings: dish.servings,
    prep_time: dish.prep_time_minutes,
    cook_time: dish.cook_time_minutes,
    prep_time_minutes: dish.prep_time_minutes,
    cook_time_minutes: dish.cook_time_minutes,
    protein: null,
    summary: clean(dish.summary),
    brief_description: clean(dish.brief_description),
    history: history.join(" "),
    ingredients: dish.ingredients.map(ingredientLine),
    steps: dish.steps.map((step) => clean(step.instruction ?? step)),
    tags: [dish.category, dish.country, dish.cuisine_type].filter(Boolean),
    item_type: "recipe",
  };
});

const rows = [...highProtein, ...egypt];
const seen = new Set();
const unique = [];
for (const row of rows) {
  if (seen.has(row.slug)) {
    console.log(`duplicate in batch\t${row.slug}`);
    continue;
  }
  seen.add(row.slug);
  unique.push(row);
}

const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
if (!key || !url) {
  console.error("Missing Supabase URL or secret key in .env");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const slugs = unique.map((row) => row.slug).join(",");
const existingResponse = await fetch(
  `${url}/rest/v1/recipes?select=slug&slug=in.(${slugs})`,
  { headers }
);
if (!existingResponse.ok) {
  console.error(await existingResponse.text());
  process.exit(1);
}
const existing = new Set((await existingResponse.json()).map((row) => row.slug));
const fresh = unique.filter((row) => !existing.has(row.slug));
console.log(`skip ${existing.size}`);
for (const slug of [...existing].sort()) console.log(`skip\t${slug}`);

const insertHeaders = {
  ...headers,
  "Content-Type": "application/json",
  Prefer: "resolution=ignore-duplicates,return=representation",
};
const inserted = [];
for (let index = 0; index < fresh.length; index += 20) {
  const chunk = fresh.slice(index, index + 20);
  const response = await fetch(`${url}/rest/v1/recipes?on_conflict=slug`, {
    method: "POST",
    headers: insertHeaders,
    body: JSON.stringify(chunk),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(response.status, body.slice(0, 800));
    process.exit(1);
  }
  const created = body ? JSON.parse(body) : [];
  inserted.push(...created);
  console.log(`posted ${chunk.length} stored ${created.length}`);
}

console.log(`insert ${inserted.length}`);
for (const row of inserted) console.log(`${row.slug}\t${row.country}\t${row.category}`);
