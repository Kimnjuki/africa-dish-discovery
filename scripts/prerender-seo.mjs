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

if (!url || !key) {
  console.warn("prerender-seo: no Supabase credentials — skipping recipe shells");
  process.exit(0);
}

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

const baseHtml = readFileSync(indexHtmlPath, "utf8");
const recipes = await fetchAfricanRecipes();
let written = 0;

for (const recipe of recipes) {
  if (!recipe.slug) continue;
  const dir = resolve(distDir, "recipe", recipe.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), injectMeta(baseHtml, recipe));
  written++;
}

console.log(
  JSON.stringify(
    {
      prerenderedRecipes: written,
      output: "dist/recipe/<slug>/index.html",
    },
    null,
    2
  )
);
