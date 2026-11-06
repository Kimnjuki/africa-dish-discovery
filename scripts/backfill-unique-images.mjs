/**
 * Assign unique licensed images for missing/duplicate recipe images.
 * Sources: Openverse (CC) -> Wikimedia Commons -> Wikipedia thumbs.
 *
 * node scripts/backfill-unique-images.mjs
 * node scripts/backfill-unique-images.mjs --limit=100
 * node scripts/backfill-unique-images.mjs --concurrency=6
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const CONCURRENCY = Math.max(1, Number(args.concurrency || 5));
const DRY = Boolean(args["dry-run"]);

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
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const UA = "LadhaQuestImageBackfill/1.1 (www.ladhaquest.com; hello@ladhaquest.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const progressPath = "data/image-backfill-progress.json";
const progress = existsSync(progressPath)
  ? JSON.parse(readFileSync(progressPath, "utf8"))
  : { doneIds: [], usedUrls: [], failed: [] };

const usedUrls = new Set(progress.usedUrls || []);
const doneIds = new Set(progress.doneIds || []);
const queryCache = new Map();
const countryPool = new Map();
let saveQueued = false;

function saveProgress() {
  writeFileSync(
    progressPath,
    JSON.stringify(
      {
        doneIds: [...doneIds],
        usedUrls: [...usedUrls],
        failed: progress.failed.slice(-500),
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

function queueSave() {
  if (saveQueued) return;
  saveQueued = true;
  setTimeout(() => {
    saveProgress();
    saveQueued = false;
  }, 2000);
}

function cleanDishName(name) {
  return String(name || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function claimUnused(urls, seed) {
  const unique = [];
  const seen = new Set();
  for (const u of urls) {
    if (!u || typeof u !== "string") continue;
    const base = u.split("?")[0];
    if (seen.has(base) || usedUrls.has(base) || usedUrls.has(u)) continue;
    seen.add(base);
    unique.push(u);
  }
  if (!unique.length) return null;
  let h = 0;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const picked = unique[h % unique.length];
  usedUrls.add(picked.split("?")[0]);
  usedUrls.add(picked);
  return picked;
}

async function searchOpenverse(query) {
  if (queryCache.has(`ov:${query}`)) return queryCache.get(`ov:${query}`);
  const qs = new URLSearchParams({
    q: query,
    page_size: "20",
    license_type: "commercial,modification",
  });
  const res = await fetch(`https://api.openverse.org/v1/images/?${qs}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  let urls = [];
  if (res.ok) {
    const data = await res.json();
    urls = (data.results || [])
      .map((r) => r.url || r.thumbnail)
      .filter((u) => typeof u === "string" && /^https?:/.test(u));
  }
  queryCache.set(`ov:${query}`, urls);
  return urls;
}

async function searchCommons(query) {
  if (queryCache.has(`cm:${query}`)) return queryCache.get(`cm:${query}`);
  const qs = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "20",
    gsrsearch: `${query} filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1200",
    origin: "*",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${qs}`, {
    headers: { "User-Agent": UA, "Api-User-Agent": UA },
  });
  let urls = [];
  if (res.ok) {
    const data = await res.json();
    const pages = (data?.query?.pages || []).sort((a, b) => (a.index || 0) - (b.index || 0));
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      const mime = info.mime || "";
      if (!mime.startsWith("image/") || mime.includes("svg")) continue;
      const license = String(info.extmetadata?.LicenseShortName?.value || "").toLowerCase();
      if (license.includes("fair use") || license.includes("nc-") || license.includes("noncommercial")) continue;
      urls.push(info.thumburl || info.url);
    }
  }
  queryCache.set(`cm:${query}`, urls);
  return urls;
}

async function searchWikipediaThumb(title) {
  if (queryCache.has(`wp:${title}`)) return queryCache.get(`wp:${title}`);
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { "User-Agent": UA, Accept: "application/json" } }
  );
  let urls = [];
  if (res.ok) {
    const data = await res.json();
    const u = data?.originalimage?.source || data?.thumbnail?.source;
    if (u) urls = [u];
  }
  queryCache.set(`wp:${title}`, urls);
  return urls;
}

async function countryFoodPool(country) {
  const c = (country || "African").trim();
  if (countryPool.has(c)) return countryPool.get(c);
  const urls = [
    ...(await searchOpenverse(`${c} traditional food`)),
    ...(await searchCommons(`${c} cuisine`)),
    ...(await searchOpenverse(`${c} dish`)),
  ];
  countryPool.set(c, urls);
  return urls;
}

async function findUniqueImage(name, country, recipeId) {
  const dish = cleanDishName(name);
  const first = dish.split(/\s+/)[0] || dish;

  const attempts = [
    () => searchWikipediaThumb(dish),
    () => searchOpenverse(`${dish} food`),
    () => searchOpenverse(`${dish} ${country || ""}`.trim()),
    () => searchCommons(`${dish} food`),
    () => searchOpenverse(`${first} ${country || ""} food`.trim()),
    () => searchWikipediaThumb(first),
    () => countryFoodPool(country),
  ];

  for (const attempt of attempts) {
    try {
      const urls = await attempt();
      const picked = claimUnused(urls, recipeId || dish);
      if (picked) return picked;
    } catch {
      /* continue */
    }
    await sleep(80);
  }
  return null;
}

async function fetchAllRecipes() {
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

async function updateImage(id, imageUrl) {
  if (DRY) return true;
  const res = await fetch(`${url}/rest/v1/recipes?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ image_url: imageUrl }),
  });
  return res.ok;
}

const recipes = await fetchAllRecipes();
const byUrl = new Map();
for (const r of recipes) {
  if (!r.image_url) continue;
  if (!byUrl.has(r.image_url)) byUrl.set(r.image_url, []);
  byUrl.get(r.image_url).push(r);
}
for (const [imageUrl] of byUrl) {
  usedUrls.add(imageUrl.split("?")[0]);
  usedUrls.add(imageUrl);
}

const needs = [];
for (const r of recipes) {
  if (!r.image_url) needs.push(r);
  else {
    const group = byUrl.get(r.image_url) || [r];
    if (group.length > 1 && group[0].id !== r.id) needs.push(r);
  }
}

const queue = needs.filter((r) => !doneIds.has(r.id)).slice(0, LIMIT);
console.log(
  JSON.stringify(
    {
      totalRecipes: recipes.length,
      needUnique: needs.length,
      alreadyDone: [...doneIds].filter((id) => needs.some((n) => n.id === id)).length,
      queue: queue.length,
      concurrency: CONCURRENCY,
    },
    null,
    2
  )
);

let updated = 0;
let failed = 0;
let index = 0;

async function worker() {
  while (true) {
    const i = index++;
    if (i >= queue.length) return;
    const recipe = queue[i];
    const label = `[${i + 1}/${queue.length}] ${recipe.slug || recipe.name}`;
    try {
      const image = await findUniqueImage(recipe.name, recipe.country, recipe.id);
      if (!image) {
        console.log(`${label} ... NO_IMAGE`);
        failed += 1;
        progress.failed.push({ id: recipe.id, slug: recipe.slug, name: recipe.name });
        doneIds.add(recipe.id);
        queueSave();
        continue;
      }
      const ok = await updateImage(recipe.id, image);
      if (ok) {
        doneIds.add(recipe.id);
        updated += 1;
        console.log(`${label} ... OK`);
      } else {
        usedUrls.delete(image.split("?")[0]);
        usedUrls.delete(image);
        failed += 1;
        console.log(`${label} ... PATCH_FAIL`);
        progress.failed.push({ id: recipe.id, slug: recipe.slug, reason: "patch" });
      }
      queueSave();
    } catch (err) {
      failed += 1;
      console.log(`${label} ... ERR ${err.message || err}`);
      progress.failed.push({ id: recipe.id, slug: recipe.slug, reason: String(err.message || err) });
      queueSave();
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
saveProgress();
console.log(JSON.stringify({ updated, failed, doneIds: doneIds.size }, null, 2));
