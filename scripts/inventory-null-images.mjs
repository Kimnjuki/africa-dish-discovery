/**
 * Inventory recipes with null/empty image_url.
 * node scripts/inventory-null-images.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

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
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function fetchAll(select) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/recipes?select=${select}&order=name.asc&offset=${from}&limit=${pageSize}`,
      { headers: { ...headers, Range: `${from}-${from + pageSize - 1}` } }
    );
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

const rows = await fetchAll("id,name,slug,country,tags,image_url");
const missing = rows.filter((r) => !r.image_url || String(r.image_url).trim() === "");
const soup = missing.filter(
  (r) =>
    (Array.isArray(r.tags) && r.tags.some((t) => /soup/i.test(String(t)))) ||
    /soup/i.test(r.slug || "") ||
    /soup/i.test(r.name || "")
);
const cucumber = rows.filter((r) => /cucumber.*soup/i.test(r.name || ""));
const bucketsRes = await fetch(`${url}/storage/v1/bucket`, { headers });
const buckets = await bucketsRes.json();

const report = {
  total: rows.length,
  missing: missing.length,
  soupMissing: soup.length,
  cucumber,
  buckets: Array.isArray(buckets) ? buckets.map((b) => b.name) : buckets,
  samples: missing.slice(0, 40).map((r) => ({
    name: r.name,
    slug: r.slug,
    country: r.country,
    tags: r.tags,
  })),
};

writeFileSync("data/null-image-inventory.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
