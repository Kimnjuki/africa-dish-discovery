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
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };

async function count(filter) {
  const res = await fetch(`${url}/rest/v1/recipes?select=id&${filter}`, {
    headers: { ...h, Prefer: "count=exact" },
    method: "HEAD",
  });
  return res.headers.get("content-range")?.split("/")[1] || "?";
}

const total = await count("limit=1");
const egypt = await count("slug=like.*-egypt-mina&limit=1");
const soup = await count("history=like.*Everything%20Soup*&limit=1");
const withImg = await count("slug=like.*-egypt-mina&image_url=not.is.null&limit=1");

const sample = await fetch(
  `${url}/rest/v1/recipes?select=name,slug,image_url,country&slug=like.*-egypt-mina&limit=5`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
).then((r) => r.json());

const storage = await fetch(
  `${url}/storage/v1/object/list/recipe-uploads`,
  {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "cookbooks/", limit: 5 }),
  }
).then((r) => r.json());

console.log(
  JSON.stringify({ total, egypt, soup, egyptWithImage: withImg, sample, storageSample: storage }, null, 2)
);
