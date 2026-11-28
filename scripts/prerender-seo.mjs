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
import { resolveRecipeSeo, toCanonicalUrl } from "../src/lib/recipeSeoOverrides.mjs";
import { getRecipeSeoEnrichment } from "../src/lib/recipeSeoEnrichment.mjs";
import { ATLAS_FAQS, ATLAS_SEO, ATLAS_WINNER_CLUSTERS } from "../src/lib/atlasSeo.mjs";
import { recipeSchemaImageList, toAbsoluteImageUrl } from "../src/lib/recipeSchemaImages.mjs";

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

function firstApiKey(...candidates) {
  for (const c of candidates) {
    const v = String(c || "").trim();
    if (v && v.startsWith("eyJ")) return v;
  }
  for (const c of candidates) {
    const v = String(c || "").trim();
    if (v && !isHttpUrl(v) && v.length > 20) return v;
  }
  return "";
}

const env = { ...loadEnv(), ...process.env };
const pub = publicSupabase();
// Coolify may inject a key into SUPABASE_URL — only accept real http(s) URLs.
const url = firstHttpUrl(env.SUPABASE_URL, env.VITE_SUPABASE_URL, pub.url);
const key = firstApiKey(
  env.SUPABASE_SECRET_KEY,
  env.SUPABASE_SERVICE_ROLE_KEY,
  env.SUPABASE_PUBLISHABLE_KEY,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  pub.key
);

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

/** Keep titles ≤ ~60 chars so SERP snippets are not truncated. */
const hubs = [
  ["recipes", "African Recipes by Region | LadhaQuest", "Browse 2,100+ authentic African recipes with local ingredient names and substitutions.", "African recipes"],
  ["recipe-index", "Recipe Index by Country & Diet | LadhaQuest", "Search LadhaQuest recipes by country, diet, and cook time.", "Recipe index"],
  ["countries", "Browse Recipes by Country | LadhaQuest", "Open a food guide for each African cuisine on LadhaQuest.", "Recipes by country"],
  ["continents", "African Regional Cuisines | LadhaQuest", "Explore West, East, North, Central, and Southern African cooking.", "African regions"],
  ["atlas", ATLAS_SEO.title, ATLAS_SEO.description, ATLAS_SEO.h1],
  ["cuisine-map", "Cuisine Map of Africa | LadhaQuest", "Explore African dishes by region and country, with native names.", "Cuisine map of Africa"],
  ["meals", "African Breakfast, Lunch & Dinner", "Find African meal ideas by time of day across the continent.", "African meals"],
  ["ingredients", "African Cooking Ingredients Guide", "Spices, staples, produce, and how they are used in African kitchens.", "African cooking ingredients"],
  ["blog", "African Food Blog | LadhaQuest", "Guides and cooking stories covering Jollof, Egusi, Doro Wat, and more.", "African food blog"],
  ["about", "About LadhaQuest | Our Mission", "LadhaQuest shares authentic African recipes, local ingredients, and culinary heritage.", "About LadhaQuest"],
  ["contact", "Contact Us | LadhaQuest", "Contact the LadhaQuest team about recipes, partnerships, or questions.", "Contact LadhaQuest"],
  ["install", "Install LadhaQuest | Offline Recipes", "Install LadhaQuest for offline access to authentic African recipes.", "Install LadhaQuest"],
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

function clipMeta(text, max = 155) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const cut = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf(" "));
  return `${(cut > 60 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function injectMeta(html, recipe) {
  const seo = resolveRecipeSeo({
    slug: recipe.slug,
    name: recipe.name,
    country: recipe.country,
    summary: recipe.summary,
    briefDescription: recipe.brief_description,
  });
  const title = clipMeta(seo.title, 60);
  const description = clipMeta(
    seo.overridden
      ? seo.description
      : recipe.summary ||
          recipe.brief_description ||
          `Authentic ${recipe.country || "African"} recipe for ${recipe.name}. Ingredients, steps, and cultural context on LadhaQuest.`
  );
  const canonical = toCanonicalUrl(`/recipe/${recipe.slug}`);
  const images = recipeSchemaImageList(recipe.image_url, site);
  const image = images[0] || toAbsoluteImageUrl(null, site);
  const ingredients = asList(recipe.ingredients).slice(0, 40);
  const steps = asList(recipe.steps).slice(0, 30);
  const prep = recipe.prep_time || 0;
  const cook = recipe.cook_time || 0;
  const total = prep || cook ? prep + cook : 0;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: recipe.name,
    description,
    image: images,
    recipeCuisine: recipe.cuisine_type || recipe.country || "African",
    recipeCategory: recipe.category || "Main Course",
    recipeYield: `${recipe.servings || 4} servings`,
    ...(prep ? { prepTime: `PT${prep}M` } : {}),
    ...(cook ? { cookTime: `PT${cook}M` } : {}),
    ...(total ? { totalTime: `PT${total}M` } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text,
      url: `${canonical}#step${i + 1}`,
    })),
    author: { "@type": "Organization", name: "LadhaQuest", url: site },
    publisher: { "@type": "Organization", name: "LadhaQuest", url: site },
    url: canonical,
    mainEntityOfPage: canonical,
    isAccessibleForFree: true,
    datePublished: recipe.created_at || undefined,
    dateModified: recipe.updated_at || recipe.created_at || undefined,
  };

  const enrichment = getRecipeSeoEnrichment(recipe.slug);
  const faqBlock =
    enrichment?.faqs?.length > 0
      ? `<h2>Frequently asked questions</h2>
    <dl>${enrichment.faqs
      .map(
        (f) =>
          `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`
      )
      .join("")}</dl>`
      : "";
  const linkBlock =
    enrichment?.internalLinks?.length > 0
      ? `<h2>Explore related dishes</h2>
    <ul>${enrichment.internalLinks
      .map(
        (l) =>
          `<li><a href="${site}${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`
      )
      .join("")}</ul>`
      : "";
  const dishLink = enrichment?.dishSlug
    ? `<p><a href="${site}/dish/${escapeHtml(enrichment.dishSlug)}">Dish encyclopedia entry</a></p>`
    : "";

  const faqSchema =
    enrichment?.faqs?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: enrichment.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const noscript = `<noscript>
  <article>
    <p>${escapeHtml(description)}</p>
    <p><strong>Country:</strong> ${escapeHtml(recipe.country || "Africa")}</p>
    <h2>Ingredients</h2>
    <ul>${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
    <h2>Method</h2>
    <ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    ${faqBlock}
    ${linkBlock}
    ${dishLink}
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

  // One visible H1 in the crawl shell. Recipe copy stays in noscript for non-JS crawlers.
  out = out.replace(/<h1>[^<]*<\/h1>/i, `<h1>${escapeHtml(recipe.name)}</h1>`);
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "");
  const schemaScripts = [
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    faqSchema
      ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  out = out.replace("</head>", `${schemaScripts}\n</head>`);
  out = out.replace('<div id="seo-shell">', `<div id="seo-shell">\n${noscript}`);

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
  // Give hub/country/blog shells enough visible copy for non-JS crawlers.
  out = out.replace(
    /<main>[\s\S]*?<\/main>/i,
    `<main>
          <h1>${escapeHtml(h1)}</h1>
          <p>${escapeHtml(description)}</p>
          <p>
            LadhaQuest helps you cook authentic African food at home with local ingredient names,
            market-aware substitutions, meal planning, and offline cook mode.
          </p>
          <h2>Explore LadhaQuest</h2>
          <ul>
            <li><a href="/atlas">African food atlas</a></li>
            <li><a href="/cuisine-map">Cuisine map</a></li>
            <li><a href="/recipes">Browse recipes</a></li>
            <li><a href="/recipe-index">Recipe index</a></li>
            <li><a href="/countries">Recipes by country</a></li>
            <li><a href="/continents">African regions</a></li>
            <li><a href="/blog">Food blog</a></li>
            <li><a href="${canonical}">Canonical page</a></li>
          </ul>
        </main>`
  );
  return out;
}

/** Atlas hub shell with winner clusters + FAQ for non-JS crawlers. */
function shellAtlasPage(html) {
  const clusterHtml = ATLAS_WINNER_CLUSTERS.map((c) => {
    const winnerHref = c.winner.slug.startsWith("/")
      ? c.winner.slug
      : `/recipe/${c.winner.slug}`;
    const sats = c.satellites
      .map((s) => {
        const href = s.slug.startsWith("/") ? s.slug : `/recipe/${s.slug}`;
        return `<li><a href="${href}">${escapeHtml(s.label)}</a></li>`;
      })
      .join("");
    return `<section>
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.blurb)}</p>
      <p><a href="${winnerHref}"><strong>${escapeHtml(c.winner.label)}</strong></a></p>
      <ul>${sats}</ul>
    </section>`;
  }).join("");

  const faqHtml = ATLAS_FAQS.map(
    (f) => `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`
  ).join("");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ATLAS_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  let out = shellPage(html, {
    title: ATLAS_SEO.title,
    description: ATLAS_SEO.description,
    canonical: `${site}/atlas`,
    h1: ATLAS_SEO.h1,
  });

  out = out.replace(
    /<main>[\s\S]*?<\/main>/i,
    `<main>
          <h1>${escapeHtml(ATLAS_SEO.h1)}</h1>
          <p>${escapeHtml(ATLAS_SEO.description)}</p>
          <h2>Start with dishes that already convert</h2>
          ${clusterHtml}
          <h2>Food Atlas FAQ</h2>
          <dl>${faqHtml}</dl>
          <h2>Explore LadhaQuest</h2>
          <ul>
            <li><a href="/cuisine-map">Cuisine map</a></li>
            <li><a href="/countries">Recipes by country</a></li>
            <li><a href="/recipe-index">Recipe index</a></li>
            <li><a href="/recipes">Browse recipes</a></li>
          </ul>
        </main>`
  );
  out = out.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n</head>`
  );
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
  // Leave __LQ_CANONICAL__ for recipe-index so nginx can inject allow-listed
  // facet self-canonicals (?country=, etc.). Other hubs bake a stable URL.
  if (path === "atlas") {
    publishHtml(path, shellAtlasPage(baseHtml));
    hubCount++;
    continue;
  }
  const canonical = path === "recipe-index" ? "__LQ_CANONICAL__" : `${site}/${path}`;
  publishHtml(
    path,
    shellPage(baseHtml, {
      title,
      description,
      canonical,
      h1,
    })
  );
  hubCount++;
}

for (const post of readStaticBlog()) {
  let title = `${post.title} | LadhaQuest`;
  if (title.length > 60) {
    title = `${String(post.title || "").slice(0, 48).trim()}… | LadhaQuest`;
  }
  const description = clipMeta(post.excerpt || post.title);
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
  try {
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
          title: `${name} Food Guide | LadhaQuest`.length <= 60
            ? `${name} Food Guide | LadhaQuest`
            : `${name} Recipes | LadhaQuest`,
          description: clipMeta(
            `Explore authentic ${name} recipes on LadhaQuest, with local dishes, ingredients, and cooking context.`
          ),
          canonical: `${site}/country/${slug}`,
          h1: `${name} recipes`,
        })
      );
      countryCount++;
    }
  } catch (err) {
    console.warn("prerender-seo: Supabase fetch failed — shipping vite dist without recipe shells");
    console.warn(err?.cause?.message || err?.message || err);
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
