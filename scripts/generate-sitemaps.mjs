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
const site = "https://www.ladhaquest.com";

async function fetchSlugs(table, fields = "slug") {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/${table}?select=${fields}&${fields}=not.is.null&order=${fields}.asc&offset=${from}&limit=${pageSize}`,
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

const recipes = await fetchSlugs("recipes", "slug");
const dishes = await fetchSlugs("dishes", "slug");

const staticUrls = [
  "/",
  "/recipes",
  "/recipe-index",
  "/continents",
  "/countries",
  "/atlas",
  "/cuisine-map",
  "/meals",
  "/ingredients",
  "/pantry",
  "/meal-planner",
  "/blog",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/install",
];

const urlXml = (loc, priority = "0.6", changefreq = "weekly") => `  <url>
    <loc>${site}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const index = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((p) => urlXml(p, p === "/" ? "1.0" : "0.8", "daily")).join("\n")}
</urlset>
`;

const recipeChunks = [];
const chunkSize = 5000;
for (let i = 0; i < recipes.length; i += chunkSize) {
  const slice = recipes.slice(i, i + chunkSize);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slice
  .filter((r) => r.slug)
  .map((r) => urlXml(`/recipe/${r.slug}`, "0.7"))
  .join("\n")}
${i === 0
  ? dishes
      .filter((d) => d.slug)
      .map((d) => urlXml(`/dish/${d.slug}`, "0.6"))
      .join("\n")
  : ""}
</urlset>
`;
  const name = i === 0 ? "sitemap-recipes.xml" : `sitemap-recipes-${i / chunkSize + 1}.xml`;
  writeFileSync(`public/${name}`, body);
  recipeChunks.push(name);
}

writeFileSync("public/sitemap.xml", index);
console.log(
  JSON.stringify(
    {
      static: staticUrls.length,
      recipes: recipes.length,
      dishes: dishes.length,
      files: ["sitemap.xml", ...recipeChunks],
    },
    null,
    2
  )
);
