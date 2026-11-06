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
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

async function fetchAll() {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/recipes?select=id,name,slug,country,image_url&order=name.asc&offset=${from}&limit=${pageSize}`,
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

const rows = await fetchAll();
const missing = rows.filter((r) => !r.image_url);
const byUrl = new Map();
for (const r of rows) {
  if (!r.image_url) continue;
  if (!byUrl.has(r.image_url)) byUrl.set(r.image_url, []);
  byUrl.get(r.image_url).push(r);
}
const duplicateGroups = [...byUrl.entries()]
  .filter(([, list]) => list.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

const dupRecipeCount = duplicateGroups.reduce((n, [, list]) => n + list.length, 0);
const uniqueDupUrls = duplicateGroups.length;

const report = {
  total: rows.length,
  withImage: rows.length - missing.length,
  missing: missing.length,
  duplicateUrlGroups: uniqueDupUrls,
  recipesSharingDuplicateUrls: dupRecipeCount,
  topDuplicateUrls: duplicateGroups.slice(0, 20).map(([image_url, list]) => ({
    image_url,
    count: list.length,
    samples: list.slice(0, 8).map((r) => r.slug),
  })),
  missingSamples: missing.slice(0, 50).map((r) => ({
    slug: r.slug,
    name: r.name,
    country: r.country,
  })),
};

writeFileSync("data/image-audit.json", JSON.stringify(report, null, 2));
writeFileSync(
  "data/image-needs.json",
  JSON.stringify(
    {
      missing: missing.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        country: r.country,
      })),
      duplicates: duplicateGroups.flatMap(([, list]) =>
        // keep first occurrence; mark others as needing unique image
        list.slice(1).map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          country: r.country,
          shared_with: list[0].slug,
          current_image_url: list[0].image_url,
        }))
      ),
    },
    null,
    2
  )
);

console.log(
  JSON.stringify(
    {
      total: report.total,
      withImage: report.withImage,
      missing: report.missing,
      duplicateUrlGroups: report.duplicateUrlGroups,
      recipesSharingDuplicateUrls: report.recipesSharingDuplicateUrls,
      needUnique:
        report.missing +
        report.recipesSharingDuplicateUrls -
        report.duplicateUrlGroups,
    },
    null,
    2
  )
);
