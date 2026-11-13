import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SECRET_KEY;

const t0 = Date.now();
const res = await fetch(
  `${url}/rest/v1/recipes?select=id,name,country,summary,prep_time,cook_time,servings,difficulty,image_url,tags,ingredients,cuisine_type,category&ingredients=not.is.null&order=name&offset=0&limit=1000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const t1 = Date.now();
const text = await res.text();
const t2 = Date.now();
const rows = JSON.parse(text);
console.log({
  status: res.status,
  fetchMs: t1 - t0,
  parseMs: t2 - t1,
  rows: rows.length,
  bytes: text.length,
});
