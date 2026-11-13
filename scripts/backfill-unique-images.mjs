/**
 * Backfill null/empty recipe images from licensed sources, upload to Supabase
 * storage (recipe-uploads/recipe-images/backfill/{slug}.ext), then PATCH image_url.
 *
 * Sources: Openverse (CC) -> Wikimedia Commons -> Wikipedia thumbs.
 *
 * node scripts/backfill-unique-images.mjs
 * node scripts/backfill-unique-images.mjs --limit=50
 * node scripts/backfill-unique-images.mjs --concurrency=4
 * node scripts/backfill-unique-images.mjs --nulls-only
 * node scripts/backfill-unique-images.mjs --dry-run
 * node scripts/backfill-unique-images.mjs --slug=cucumber-soup-soup
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const CONCURRENCY = Math.max(1, Number(args.concurrency || 4));
const DRY = Boolean(args["dry-run"]);
const NULLS_ONLY = args["nulls-only"] !== "false"; // default true
const ONLY_SLUG = args.slug ? String(args.slug) : null;
const MIN_BYTES = Number(args["min-bytes"] || 30 * 1024);

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

const BUCKET = "recipe-uploads";
const UA = "LadhaQuestImageBackfill/2.0 (www.ladhaquest.com; hello@ladhaquest.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const progressPath = "data/image-backfill-progress.json";
const progress = existsSync(progressPath)
  ? JSON.parse(readFileSync(progressPath, "utf8"))
  : { doneIds: [], usedUrls: [], failed: [], filled: [] };

const usedUrls = new Set(progress.usedUrls || []);
const doneIds = new Set(progress.doneIds || []);
const filled = Array.isArray(progress.filled) ? progress.filled : [];
const queryCache = new Map();
let saveQueued = false;

const BAD_TITLE_RE =
  /cover|logo|ornament|glyph|icon|diagram|map|chart|svg|book\b|cookbook|title page|frontispiece|decoration|clipart|clip art|symbol|badge|seal|flag|portrait of|signature|handwriting|text only|wordmark/i;

function saveProgress() {
  writeFileSync(
    progressPath,
    JSON.stringify(
      {
        doneIds: [...doneIds],
        usedUrls: [...usedUrls],
        failed: (progress.failed || []).slice(-800),
        filled: filled.slice(-2000),
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
  }, 1500);
}

function cleanDishName(name) {
  return String(name || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

function readJpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    const len = (buf[i + 2] << 8) + buf[i + 3];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (buf[i + 5] << 8) + buf[i + 6];
      const width = (buf[i + 7] << 8) + buf[i + 8];
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

function readPngSize(buf) {
  if (buf.length < 24) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function readWebpSize(buf) {
  if (buf.length < 30) return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buf.length >= 30) {
    const width = 1 + buf[24] + (buf[25] << 8) + (buf[26] << 16);
    const height = 1 + buf[27] + (buf[28] << 8) + (buf[29] << 16);
    return { width, height };
  }
  if (chunk === "VP8 " && buf.length >= 30) {
    const width = buf[26] + (buf[27] << 8);
    const height = buf[28] + (buf[29] << 8);
    return { width: width & 0x3fff, height: height & 0x3fff };
  }
  return null;
}

function dimensionsOk(kind, buf) {
  let dim = null;
  if (kind.ext === "jpg") dim = readJpegSize(buf);
  else if (kind.ext === "png") dim = readPngSize(buf);
  else if (kind.ext === "webp") dim = readWebpSize(buf);
  if (!dim) return true; // allow if unreadable
  return dim.width >= 400 && dim.height >= 300;
}

function isBadCandidate(urlOrTitle) {
  const s = String(urlOrTitle || "");
  if (BAD_TITLE_RE.test(s)) return true;
  if (/Cover\.jpe?g/i.test(s)) return true;
  if (/cookbooks\/soup/i.test(s)) return true;
  return false;
}

function claimUnused(candidates, seed) {
  const unique = [];
  const seen = new Set();
  for (const c of candidates) {
    const u = typeof c === "string" ? c : c?.url;
    if (!u || typeof u !== "string" || !/^https?:/.test(u)) continue;
    if (isBadCandidate(u) || isBadCandidate(c?.title)) continue;
    const base = u.split("?")[0];
    if (seen.has(base) || usedUrls.has(base) || usedUrls.has(u)) continue;
    seen.add(base);
    unique.push({ url: u, title: c?.title || "" });
  }
  if (!unique.length) return null;
  let h = 0;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return unique[h % unique.length];
}

async function searchOpenverse(query) {
  const keyCache = `ov:${query}`;
  if (queryCache.has(keyCache)) return queryCache.get(keyCache);
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
      .map((r) => ({
        url: r.url || r.thumbnail,
        title: `${r.title || ""} ${r.foreign_landing_url || ""}`,
      }))
      .filter((x) => x.url);
  } else if (res.status === 429) {
    await sleep(2000);
  }
  queryCache.set(keyCache, urls);
  return urls;
}

async function searchCommons(query) {
  const keyCache = `cm:${query}`;
  if (queryCache.has(keyCache)) return queryCache.get(keyCache);
  const qs = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "20",
    gsrsearch: `${query} filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata|size",
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
      if (license.includes("fair use") || license.includes("nc-") || license.includes("noncommercial")) {
        continue;
      }
      const title = p.title || info.extmetadata?.ObjectName?.value || "";
      if (isBadCandidate(title)) continue;
      urls.push({ url: info.thumburl || info.url, title });
    }
  }
  queryCache.set(keyCache, urls);
  return urls;
}

async function searchWikipediaThumb(title) {
  const keyCache = `wp:${title}`;
  if (queryCache.has(keyCache)) return queryCache.get(keyCache);
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { "User-Agent": UA, Accept: "application/json" } }
  );
  let urls = [];
  if (res.ok) {
    const data = await res.json();
    const u = data?.originalimage?.source || data?.thumbnail?.source;
    const t = data?.title || title;
    if (u && !isBadCandidate(u) && !isBadCandidate(t)) urls = [{ url: u, title: t }];
  }
  queryCache.set(keyCache, urls);
  return urls;
}

function searchQueries(name) {
  const dish = cleanDishName(name);
  const words = dish.split(/\s+/).filter(Boolean);
  const firstTwo = words.slice(0, 2).join(" ");
  const first = words[0] || dish;
  const isSoupish = /soup|chowder|stew|broth|bisque|goulash|chili|vichyssoise|borscht/i.test(dish);
  const q = [];
  q.push(dish);
  if (isSoupish) {
    q.push(`${dish} soup`);
    q.push(`${dish} bowl`);
  } else {
    q.push(`${dish} food dish`);
    q.push(`${dish} soup`);
  }
  if (firstTwo && firstTwo !== dish) q.push(`${firstTwo} soup`);
  if (first && first !== dish) q.push(`${first} soup`);
  // generic edible fallbacks for broths/spice bags etc.
  if (/broth/i.test(dish)) q.push("clear broth soup bowl");
  if (/bag o/i.test(dish) || /spice/i.test(dish)) q.push("spice soup ingredients");
  return [...new Set(q.filter(Boolean))];
}

async function findImageCandidates(name, recipeId) {
  const queries = searchQueries(name);
  const attempts = [];
  for (const q of queries) {
    attempts.push(() => searchWikipediaThumb(q));
    attempts.push(() => searchOpenverse(`${q} food`));
    attempts.push(() => searchCommons(`${q} food`));
    attempts.push(() => searchOpenverse(q));
    attempts.push(() => searchCommons(q));
  }
  // broader licensed food photos as last resort (still unique via claimUnused)
  attempts.push(() => searchOpenverse("homemade soup bowl food"));
  attempts.push(() => searchCommons("soup bowl"));
  attempts.push(() => searchOpenverse("vegetable soup"));

  for (const attempt of attempts) {
    try {
      const urls = await attempt();
      const picked = claimUnused(urls, recipeId || name);
      if (picked) return picked;
    } catch {
      /* continue */
    }
    await sleep(60);
  }
  return null;
}

async function downloadValidate(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length < MIN_BYTES) return null;
  const kind = sniffImage(buf);
  if (!kind) return null;
  if (!dimensionsOk(kind, buf)) return null;
  return { buf, ...kind, sourceUrl: imageUrl };
}

async function uploadToStorage(slug, file) {
  const safe = String(slug || "recipe")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const path = `recipe-images/backfill/${safe}.${file.ext}`;
  const uploadUrl = `${url}/storage/v1/object/${BUCKET}/${path}`;
  const put = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": file.mime,
      "x-upsert": "true",
    },
    body: file.buf,
  });
  if (!put.ok) {
    const text = await put.text();
    throw new Error(`upload ${put.status}: ${text.slice(0, 200)}`);
  }
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function fetchAllRecipes() {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const res = await fetch(
      `${url}/rest/v1/recipes?select=id,name,slug,country,image_url,tags&order=name.asc&offset=${from}&limit=${pageSize}`,
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

// Seed usedUrls with current DB image urls so we don't re-pick hotlinks already in use
for (const r of recipes) {
  if (!r.image_url) continue;
  usedUrls.add(r.image_url.split("?")[0]);
  usedUrls.add(r.image_url);
}

const missing = recipes.filter((r) => !r.image_url || String(r.image_url).trim() === "");
// Allow retry: recipes still missing should not be blocked by old doneIds
for (const r of missing) doneIds.delete(r.id);

let needs = [];
if (NULLS_ONLY) {
  needs = missing;
} else {
  const byUrl = new Map();
  for (const r of recipes) {
    if (!r.image_url) continue;
    if (!byUrl.has(r.image_url)) byUrl.set(r.image_url, []);
    byUrl.get(r.image_url).push(r);
  }
  needs = [...missing];
  for (const r of recipes) {
    if (!r.image_url) continue;
    const group = byUrl.get(r.image_url) || [r];
    if (group.length > 1 && group[0].id !== r.id) needs.push(r);
  }
}

if (ONLY_SLUG) {
  needs = recipes.filter((r) => r.slug === ONLY_SLUG || r.name === ONLY_SLUG);
}

const queue = needs.filter((r) => !doneIds.has(r.id)).slice(0, LIMIT);
console.log(
  JSON.stringify(
    {
      totalRecipes: recipes.length,
      missing: missing.length,
      needUnique: needs.length,
      queue: queue.length,
      concurrency: CONCURRENCY,
      nullsOnly: NULLS_ONLY,
      dry: DRY,
      minBytes: MIN_BYTES,
      onlySlug: ONLY_SLUG,
    },
    null,
    2
  )
);

let updated = 0;
let failed = 0;
let index = 0;

async function processOne(recipe, i) {
  const label = `[${i + 1}/${queue.length}] ${recipe.slug || recipe.name}`;
  const maxTries = 8;
  let lastErr = null;

  for (let tryN = 0; tryN < maxTries; tryN++) {
    const candidate = await findImageCandidates(recipe.name, `${recipe.id}:${tryN}`);
    if (!candidate) {
      lastErr = "NO_IMAGE";
      break;
    }
    usedUrls.add(candidate.url.split("?")[0]);
    usedUrls.add(candidate.url);

    try {
      const file = await downloadValidate(candidate.url);
      if (!file) {
        lastErr = "VALIDATE_FAIL";
        continue;
      }
      let publicUrl = candidate.url;
      if (!DRY) {
        publicUrl = await uploadToStorage(recipe.slug || recipe.id, file);
      } else {
        publicUrl = `(dry) ${candidate.url}`;
      }
      const ok = await updateImage(recipe.id, DRY ? candidate.url : publicUrl);
      if (!ok) {
        lastErr = "PATCH_FAIL";
        continue;
      }
      doneIds.add(recipe.id);
      updated += 1;
      filled.push({
        id: recipe.id,
        slug: recipe.slug,
        name: recipe.name,
        image_url: DRY ? candidate.url : publicUrl,
        source: candidate.url,
        at: new Date().toISOString(),
      });
      // drop from failed if previously listed
      progress.failed = (progress.failed || []).filter((f) => f.id !== recipe.id);
      console.log(`${label} ... OK`);
      queueSave();
      return;
    } catch (err) {
      lastErr = String(err.message || err);
      await sleep(200);
    }
  }

  failed += 1;
  console.log(`${label} ... FAIL ${lastErr || "unknown"}`);
  progress.failed = progress.failed || [];
  progress.failed.push({
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    reason: lastErr || "unknown",
  });
  // Do NOT mark doneIds on failure — allow restart retry
  queueSave();
}

async function worker() {
  while (true) {
    const i = index++;
    if (i >= queue.length) return;
    await processOne(queue[i], i);
    await sleep(120);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
saveProgress();
console.log(JSON.stringify({ updated, failed, filledTotal: filled.length, doneIds: doneIds.size }, null, 2));
