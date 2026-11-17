/**
 * Post-build SEO prerender: write crawler-friendly HTML shells for recipe URLs.
 * Each shell keeps the SPA boot scripts and injects unique title/description/
 * canonical/OG/JSON-LD + noscript body so Google can index without waiting on JS.
 *
 * Run after `vite build` (writes into dist/). Skips gracefully if env/API missing.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const publicDir = resolve(root, "public");
const site = "https://www.ladhaquest.com";

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

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return String(item.text || item.name || item.instruction || item.description || "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      return asList(JSON.parse(value));
    } catch {
      return value.split(/\n/).map((l) => l.trim()).filter(Boolean);
    }
  }
  return [];
}

const env = { ...loadEnv(), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key =
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!existsSync(distDir)) {
  console.warn("prerender-seo: dist/ missing — run vite build first");
  process.exit(0);
}

const indexHtmlPath = resolve(distDir, "index.html");
if (!existsSync(indexHtmlPath)) {
  console.warn("prerender-seo: dist/index.html missing");
  process.exit(0);
}

// Ensure sitemap artifacts from public/ are present in dist (already copied by Vite).
const publicOg = resolve(root, "public/og-image.jpg");
if (existsSync(publicOg) && !existsSync(resolve(distDir, "og-image.jpg"))) {
  copyFileSync(publicOg, resolve(distDir, "og-image.jpg"));
}

const hubs = [
  ["recipes", "African Recipes | Authentic Dishes from West, East, North & Southern Africa | LadhaQuest", "Browse 2,100+ authentic African recipes from West, East, North, Central, and Southern Africa, with local ingredient names and substitutions.", "African recipes"],
  ["recipe-index", "Recipe Index | Browse African & World Recipes by Country, Diet & Time", "Search the LadhaQuest recipe index by country, diet, and time. Find authentic African dishes you can cook at home.", "Recipe index"],
  ["countries", "Browse Recipes by Country | LadhaQuest", "Browse LadhaQuest recipes by country and open a food guide for each African cuisine.", "Recipes by country"],
  ["continents", "Explore African Continents | Regional Cuisines | LadhaQuest", "Explore African cooking by region: West, East, North, Central, and Southern Africa.", "African regions"],
  ["atlas", "African Food Atlas | Top 50 Dishes, Best Stews & 100 Foods to Try", "Explore the LadhaQuest African food atlas: landmark dishes, stews, and foods to try.", "African food atlas"],
  ["cuisine-map", "Cuisine Map of Africa | LadhaQuest", "Explore African dishes by region and country on a cuisine map, with native names and cultural context.", "Cuisine map of Africa"],
  ["meals", "African Meals by Time of Day | Breakfast, Lunch & Dinner | LadhaQuest", "Find African breakfast, lunch, and dinner ideas from across the continent.", "African meals"],
  ["ingredients", "African Cooking Ingredients Guide | Spices, Staples & Produce | LadhaQuest", "A guide to African cooking ingredients: spices, staples, produce, and how they are used.", "African cooking ingredients"],
  ["blog", "African Food Blog | Authentic Recipes, Guides & Cooking Tips | LadhaQuest", "Guides and cooking stories from LadhaQuest, covering Jollof, Egusi, Doro Wat, tagine, and more.", "African food blog"],
  ["about", "About LadhaQuest | Our Mission & Story", "Learn about LadhaQuest's mission to share authentic African recipes, local ingredients, and culinary heritage.", "About LadhaQuest"],
  ["contact", "Contact Us | LadhaQuest", "Contact the LadhaQuest team about recipes, partnerships, or questions.", "Contact LadhaQuest"],
  ["install", "Install LadhaQuest App | Offline African Recipes", "Install LadhaQuest for offline access to authentic African recipes.", "Install LadhaQuest"],
  ["privacy-policy", "Privacy Policy | LadhaQuest", "How LadhaQuest collects, uses, and protects personal information.", "Privacy Policy"],
  ["terms-of-service", "Terms of Service | LadhaQuest", "The terms that apply when you use LadhaQuest.", "Terms of Service"],
];

async function fetchAfricanRecipes() {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/recipes?select=slug,name,summary,brief_description,country,image_url,prep_time,cook_time,servings,ingredients,steps,cuisine_type,category,updated_at,created_at,is_african,continent&or=(is_african.eq.true,continent.eq.Africa)&slug=not.is.null&order=slug.asc&offset=${from}&limit=${pageSize}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Range: `${from}-${from + pageSize - 1}`,
        },
      }
    );
    if (!res.ok) throw new Error(`recipes fetch ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function injectMeta(html, recipe) {
  const title = `${recipe.name} Recipe${recipe.country ? ` — ${recipe.country}` : ""} | LadhaQuest`;
  const description = stripHtml(
    recipe.summary ||
      recipe.brief_description ||
      `Authentic ${recipe.country || "African"} recipe for ${recipe.name}. Ingredients, steps, and cultural context on LadhaQuest.`
  ).slice(0, 160);
  const canonical = `${site}/recipe/${recipe.slug}`;
  const image = recipe.image_url || `${site}/og-image.jpg`;
  const ingredients = asList(recipe.ingredients).slice(0, 40);
  const steps = asList(recipe.steps).slice(0, 30);

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: recipe.name,
    description,
    image: [image],
    recipeCuisine: recipe.cuisine_type || recipe.country || "African",
    recipeCategory: recipe.category || "Main Course",
    recipeYield: `${recipe.servings || 4} servings`,
    ...(recipe.prep_time ? { prepTime: `PT${recipe.prep_time}M` } : {}),
    ...(recipe.cook_time ? { cookTime: `PT${recipe.cook_time}M` } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
    author: { "@type": "Organization", name: "LadhaQuest", url: site },
    publisher: { "@type": "Organization", name: "LadhaQuest", url: site },
    url: canonical,
    datePublished: recipe.created_at || undefined,
    dateModified: recipe.updated_at || recipe.created_at || undefined,
  };

  const noscript = `<noscript>
  <article>
    <h1>${escapeHtml(recipe.name)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><strong>Country:</strong> ${escapeHtml(recipe.country || "Africa")}</p>
    <h2>Ingredients</h2>
    <ul>${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
    <h2>Method</h2>
    <ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <p><a href="${canonical}">View full recipe on LadhaQuest</a></p>
  </article>
</noscript>`;

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(image)}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`
  );

  // Drop homepage graph JSON-LD; inject recipe schema before </head>
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "");
  out = out.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n${noscript}\n</head>`
  );

  return out;
}

function publishHtml(urlPath, html) {
  const rel = urlPath.replace(/^\/+|\/+$/g, "");
  if (!rel || rel.includes("..")) return;
  for (const rootDir of [distDir, publicDir]) {
    const dir = resolve(rootDir, rel);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "index.html"), html);
  }
}

function shellPage(html, { title, description, canonical, h1 }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  out = out.replace(/<h1>[^<]*<\/h1>/i, `<h1>${escapeHtml(h1)}</h1>`);
  return out;
}

function readStaticBlog() {
  const path = resolve(root, "src/data/blogPosts.ts");
  if (!existsSync(path)) return [];
  const src = readFileSync(path, "utf8");
  const titles = [...src.matchAll(/title:\s*"([^"]+)"/g)].map((m) => m[1]);
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const excerpts = [...src.matchAll(/excerpt:\s*"([^"]+)"/g)].map((m) => m[1]);
  return slugs.map((slug, i) => ({
    slug,
    title: titles[i] || slug,
    excerpt: excerpts[i] || "",
  }));
}

const baseHtml = readFileSync(indexHtmlPath, "utf8");
let hubCount = 0;
for (const [path, title, description, h1] of hubs) {
  publishHtml(
    path,
    shellPage(baseHtml, {
      title,
      description,
      canonical: `${site}/${path}`,
      h1,
    })
  );
  hubCount++;
}

for (const post of readStaticBlog()) {
  const title = `${post.title} | LadhaQuest Blog`;
  const description = post.excerpt || post.title;
  publishHtml(
    `blog/${post.slug}`,
    shellPage(baseHtml, {
      title,
      description,
      canonical: `${site}/blog/${post.slug}`,
      h1: post.title,
    })
  );
  hubCount++;
}

let written = 0;
let countryCount = 0;
if (!url || !key) {
  console.warn("prerender-seo: no Supabase credentials — skipping recipe and country shells");
} else {
  const recipes = await fetchAfricanRecipes();
  const countries = new Map();
  for (const recipe of recipes) {
    if (!recipe.slug) continue;
    publishHtml(`recipe/${recipe.slug}`, injectMeta(baseHtml, recipe));
    written++;
    const name = String(recipe.country || "").trim();
    if (!name) continue;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (slug && !countries.has(slug)) countries.set(slug, name);
  }
  for (const [slug, name] of countries) {
    publishHtml(
      `country/${slug}`,
      shellPage(baseHtml, {
        title: `${name} Food Guide — Authentic Recipes & Cuisine | LadhaQuest`,
        description: `Explore authentic ${name} recipes on LadhaQuest, with local dishes, ingredients, and cooking context.`,
        canonical: `${site}/country/${slug}`,
        h1: `${name} recipes`,
      })
    );
    countryCount++;
  }
}

console.log(
  JSON.stringify(
    {
      prerenderedHubs: hubCount,
      prerenderedCountries: countryCount,
      prerenderedRecipes: written,
      output: "dist and public HTML shells",
    },
    null,
    2
  )
);
