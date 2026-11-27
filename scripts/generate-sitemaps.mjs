/**
 * Generate segmented XML sitemaps for Bing Webmaster Tools and Google Search Console.
 *
 * Output (public/):
 *   sitemap.xml              — sitemap index (submit this URL)
 *   sitemap-pages.xml        — public marketing / browse hubs
 *   sitemap-recipes.xml      — /recipe/:slug (+ image title/caption when present)
 *   sitemap-dishes.xml       — /dish/:slug
 *   sitemap-countries.xml    — /country/:slug
 *   sitemap-blog.xml         — /blog/:slug (+ image when present)
 *   sitemap-stories.xml      — /story/:slug (dishes with cultural content)
 *
 * Run: npm run sitemap
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const site = "https://www.ladhaquest.com";
const today = new Date().toISOString().slice(0, 10);

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

function publicSupabase() {
  const path = resolve(root, "src/integrations/supabase/client.ts");
  if (!existsSync(path)) return {};
  const src = readFileSync(path, "utf8");
  return {
    url: src.match(/SUPABASE_URL = "([^"]+)"/)?.[1] || "",
    key: src.match(/SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/)?.[1] || "",
  };
}

function isHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function firstHttpUrl(...candidates) {
  for (const c of candidates) {
    const v = String(c || "").trim().replace(new RegExp("/+$"), "");
    if (v && isHttpUrl(v)) return v;
  }
  return "";
}

// Prefer process.env (Docker/Coolify build args) over local .env file.
const env = { ...loadEnv(), ...process.env };
const pub = publicSupabase();
// Coolify often sets SUPABASE_URL to a key or host without https:// — skip invalid values.
const url = firstHttpUrl(env.SUPABASE_URL, env.VITE_SUPABASE_URL, pub.url);
const key =
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  pub.key;

if (!url || !key) {
  // Do not fail Coolify/Docker builds — committed public/sitemap*.xml still ship.
  console.warn(
    "generate-sitemaps: missing/invalid SUPABASE_URL or API key — keeping existing public/sitemap*.xml"
  );
  process.exit(0);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  Prefer: "count=exact",
};

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toCountrySlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatLastmod(value) {
  if (!value) return today;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return today;
  return d.toISOString().slice(0, 10);
}

function absoluteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("data:")) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `${site}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function clip(value, max = 200) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function urlEntry({ loc, lastmod, changefreq = "weekly", priority = "0.6", image }) {
  const imageLoc = image ? absoluteUrl(image.loc) : "";
  const imageBlock = imageLoc
    ? `
    <image:image>
      <image:loc>${escapeXml(imageLoc)}</image:loc>${image.title ? `
      <image:title>${escapeXml(clip(image.title, 140))}</image:title>` : ""}${image.caption ? `
      <image:caption>${escapeXml(clip(image.caption))}</image:caption>` : ""}
    </image:image>`
    : "";
  return `  <url>
    <loc>${escapeXml(loc.startsWith("http") ? loc : `${site}${loc}`)}</loc>
    <lastmod>${formatLastmod(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageBlock}
  </url>`;
}

function writeUrlset(filename, entries) {
  const hasImages = entries.some((entry) => entry.includes("<image:image>"));
  const xmlns = hasImages
    ? `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${xmlns}>
${entries.join("\n")}
</urlset>
`;
  writeFileSync(resolve(publicDir, filename), body);
  return filename;
}

function writeIndex(children) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    (name) => `  <sitemap>
    <loc>${site}/${name}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>
`;
  writeFileSync(resolve(publicDir, "sitemap.xml"), body);
}

async function fetchAll(table, select, { filter = "", order = "slug.asc" } = {}) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const qs = new URLSearchParams();
    qs.set("select", select);
    if (order) qs.set("order", order);
    // PostgREST: append filters as query params (e.g. slug=not.is.null)
    const filterPart = filter ? `&${filter}` : "";
    const res = await fetch(
      `${url}/rest/v1/${table}?${qs.toString()}${filterPart}&offset=${from}&limit=${pageSize}`,
      {
        headers: {
          ...headers,
          Range: `${from}-${from + pageSize - 1}`,
        },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed ${table}: ${res.status} ${text}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function readStaticBlogSlugs() {
  const path = resolve(root, "src/data/blogPosts.ts");
  if (!existsSync(path)) return [];
  const src = readFileSync(path, "utf8");
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const dates = [...src.matchAll(/publishedAt:\s*"([^"]+)"/g)].map((m) => m[1]);
  return slugs.map((slug, i) => ({
    slug,
    published_at: dates[i] || today,
  }));
}

// —— Public hubs only (no auth-gated app surfaces) ——
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/recipes", priority: "0.9", changefreq: "daily" },
  { path: "/recipe-index", priority: "0.9", changefreq: "daily" },
  { path: "/countries", priority: "0.9", changefreq: "weekly" },
  { path: "/continents", priority: "0.8", changefreq: "weekly" },
  { path: "/atlas", priority: "0.8", changefreq: "weekly" },
  { path: "/cuisine-map", priority: "0.8", changefreq: "weekly" },
  { path: "/meals", priority: "0.7", changefreq: "weekly" },
  { path: "/ingredients", priority: "0.7", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/install", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

console.log("Fetching content from Supabase…");

let recipes, dishes, recipeCountries, africanCountryRows, dbBlog;
try {
  [recipes, dishes, recipeCountries, africanCountryRows, dbBlog] = await Promise.all([
    fetchAll("recipes", "slug,name,summary,country,image_url,updated_at,created_at", {
      filter: "slug=not.is.null",
      order: "slug.asc",
    }),
    fetchAll("dishes", "slug,updated_at,created_at,cultural_significance", {
      filter: "slug=not.is.null",
      order: "slug.asc",
    }),
    fetchAll("recipes", "country,updated_at", {
      filter: "country=not.is.null",
      order: "country.asc",
    }),
    // Fetch African country names for facet sitemap entries.
    fetchAll("recipes", "country,updated_at", {
      filter: "continent=eq.Africa&country=not.is.null",
      order: "country.asc",
    }).catch(() => []),
    fetchAll("blog_posts", "slug,title,excerpt,image_url,published_at,updated_at,is_published", {
      filter: "is_published=eq.true&slug=not.is.null",
      order: "slug.asc",
    }).catch(() => []),
  ]);
} catch (err) {
  console.warn(
    "generate-sitemaps: Supabase fetch failed — keeping existing public/sitemap*.xml"
  );
  console.warn(err?.cause?.message || err?.message || err);
  process.exit(0);
}

const uniqueRecipes = new Map();
for (const r of recipes) {
  if (!r.slug) continue;
  uniqueRecipes.set(r.slug, r);
}

const uniqueDishes = new Map();
for (const d of dishes) {
  if (!d.slug) continue;
  uniqueDishes.set(d.slug, d);
}

const countryMap = new Map();
for (const row of recipeCountries) {
  const name = row.country?.trim();
  if (!name) continue;
  const slug = toCountrySlug(name);
  if (!slug) continue;
  const prev = countryMap.get(slug);
  const last = formatLastmod(row.updated_at);
  if (!prev || last > prev.lastmod) {
    countryMap.set(slug, { name, slug, lastmod: last });
  }
}

const staticBlog = readStaticBlogSlugs();
const blogMap = new Map();
for (const p of staticBlog) blogMap.set(p.slug, p);
for (const p of dbBlog) {
  if (p.slug) blogMap.set(p.slug, p);
}

// Only index story URLs when cultural copy is substantial (avoids 1:1 /dish duplicate noise).
const storyDishes = [...uniqueDishes.values()].filter(
  (d) => typeof d.cultural_significance === "string" && d.cultural_significance.trim().length >= 200
);

// Remove legacy flat sitemap if regenerating index layout
const legacyExtra = ["sitemap-recipes-2.xml"];
for (const name of legacyExtra) {
  const p = resolve(publicDir, name);
  if (existsSync(p)) unlinkSync(p);
}

const pagesFile = writeUrlset(
  "sitemap-pages.xml",
  staticPages.map((p) =>
    urlEntry({
      loc: p.path,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    })
  )
);

const recipesFile = writeUrlset(
  "sitemap-recipes.xml",
  [...uniqueRecipes.values()].map((r) =>
    urlEntry({
      loc: `/recipe/${r.slug}`,
      lastmod: r.updated_at || r.created_at,
      changefreq: "weekly",
      priority: "0.8",
      image: r.image_url
        ? {
            loc: r.image_url,
            title: r.name,
            caption: [r.name, r.country, r.summary].filter(Boolean).join(" — "),
          }
        : null,
    })
  )
);

const dishesFile = writeUrlset(
  "sitemap-dishes.xml",
  [...uniqueDishes.values()].map((d) =>
    urlEntry({
      loc: `/dish/${d.slug}`,
      lastmod: d.updated_at || d.created_at,
      changefreq: "weekly",
      priority: "0.7",
    })
  )
);

const countriesFile = writeUrlset(
  "sitemap-countries.xml",
  [...countryMap.values()]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((c) =>
      urlEntry({
        loc: `/country/${c.slug}`,
        lastmod: c.lastmod,
        changefreq: "weekly",
        priority: "0.75",
      })
    )
);

const blogFile = writeUrlset(
  "sitemap-blog.xml",
  [...blogMap.values()].map((p) =>
    urlEntry({
      loc: `/blog/${p.slug}`,
      lastmod: p.updated_at || p.published_at,
      changefreq: "monthly",
      priority: "0.65",
      image: p.image_url
        ? {
            loc: p.image_url,
            title: p.title || p.slug,
            caption: p.excerpt || p.title,
          }
        : null,
    })
  )
);

const storiesFile = writeUrlset(
  "sitemap-stories.xml",
  storyDishes.map((d) =>
    urlEntry({
      loc: `/story/${d.slug}`,
      lastmod: d.updated_at || d.created_at,
      changefreq: "monthly",
      priority: "0.55",
    })
  )
);

// ── Facet sitemap: high-demand African country filter URLs ─────────────────
// Allow-listed single-facet URLs (country) are indexable per S1-07.
// Stable param order: ?country=<name> (single facet, so only one param).
// Cap at 54 entries (number of African sovereign states).
const africanCountryMap = new Map();
for (const row of africanCountryRows) {
  const name = row.country?.trim();
  if (!name) continue;
  const prev = africanCountryMap.get(name);
  const last = formatLastmod(row.updated_at);
  if (!prev || last > prev.lastmod) {
    africanCountryMap.set(name, { name, lastmod: last });
  }
}

const africanFacetEntries = [...africanCountryMap.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .slice(0, 54) // cap at ~54 African countries
  .map(({ name, lastmod }) =>
    urlEntry({
      loc: `/recipe-index?country=${encodeURIComponent(name)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.65",
    })
  );

const facetsFile =
  africanFacetEntries.length > 0
    ? writeUrlset("sitemap-facets.xml", africanFacetEntries)
    : null;

const children = [
  pagesFile,
  recipesFile,
  dishesFile,
  countriesFile,
  blogFile,
  storiesFile,
  ...(facetsFile ? [facetsFile] : []),
];
writeIndex(children);

// Point robots.txt at the index only
const robotsPath = resolve(publicDir, "robots.txt");
let robots = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "User-agent: *\nAllow: /\n\n";
robots = robots.replace(/\n?Sitemap:.*\n?/g, "\n");
if (!robots.endsWith("\n")) robots += "\n";
robots += `Sitemap: ${site}/sitemap.xml\n`;
writeFileSync(robotsPath, robots.replace(/\n{3,}/g, "\n\n"));

const imageCount = [...uniqueRecipes.values()].filter((r) => absoluteUrl(r.image_url)).length;
const summary = {
  generatedAt: new Date().toISOString(),
  site,
  submitInBing: `${site}/sitemap.xml`,
  submitInGsc: `${site}/sitemap.xml`,
  files: children,
  counts: {
    pages: staticPages.length,
    recipes: uniqueRecipes.size,
    recipeImages: imageCount,
    dishes: uniqueDishes.size,
    countries: countryMap.size,
    blog: blogMap.size,
    stories: storyDishes.length,
    facetCountryUrls: africanFacetEntries.length,
    totalUrls:
      staticPages.length +
      uniqueRecipes.size +
      uniqueDishes.size +
      countryMap.size +
      blogMap.size +
      storyDishes.length +
      africanFacetEntries.length,
  },
};

writeFileSync(resolve(publicDir, "sitemap-manifest.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
