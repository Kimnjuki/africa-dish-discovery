/**
 * Parse My Egypt + Everything Soup cookbooks, upload dish photos to
 * recipe-uploads storage, and upsert recipes into Supabase.
 *
 * B0DCNZYP79.docx is image-only (no extractable text) — photos are uploaded
 * under cookbook-b0dc/ for later OCR/linking.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
  Prefer: "return=representation",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mimeFor(file) {
  const ext = file.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

async function uploadImage(localPath, destPath) {
  const body = readFileSync(localPath);
  const res = await fetch(`${url}/storage/v1/object/recipe-uploads/${destPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": mimeFor(destPath),
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`upload failed ${destPath}: ${res.status} ${t}`);
  }
  return `${url}/storage/v1/object/public/recipe-uploads/${destPath}`;
}

function isEgyptTitle(line) {
  if (!line || line.length < 3 || line.length > 90) return false;
  if (/^(Active Time|MAKES|SERVES|Equipment|Plan Ahead|CHAPTER|CONTENTS)/i.test(line)) return false;
  // Titles in this book are primarily ALL CAPS
  const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  const upper = letters.replace(/[^A-ZÀ-Ÿ]/g, "").length;
  return upper / letters.length >= 0.85;
}

function parseEgypt(paras) {
  const recipes = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    if (!isEgyptTitle(paras[i])) continue;
    // Must be followed soon by Active Time or MAKES
    let marker = -1;
    for (let k = i + 1; k < Math.min(i + 6, paras.length); k++) {
      if (/^Active Time:/i.test(paras[k]) || /^MAKES\b/i.test(paras[k])) {
        marker = k;
        break;
      }
      if (isEgyptTitle(paras[k])) break;
    }
    if (marker < 0) continue;

    const name = paras[i]
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w+/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
    // Keep intentional ALL-CAPS particles like AHI; title-case most words
    const pretty = paras[i].trim();
    const displayName = pretty
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\bTa’ameya\b/i, "Ta'ameya")
      .replace(/\bAhi\b/, "AHI");

    if (seen.has(displayName.toLowerCase())) continue;

    // End at next title
    let end = marker + 1;
    while (end < paras.length) {
      if (isEgyptTitle(paras[end])) {
        let hasMarker = false;
        for (let k = end + 1; k < Math.min(end + 6, paras.length); k++) {
          if (/^Active Time:/i.test(paras[k]) || /^MAKES\b/i.test(paras[k])) {
            hasMarker = true;
            break;
          }
        }
        if (hasMarker) break;
      }
      end++;
      if (end - i > 140) break;
    }

    const block = paras.slice(i, end);
    const meta = block.find((l) => /^MAKES\b/i.test(l)) || "";
    const active = block.find((l) => /^Active Time:/i.test(l)) || "";
    const servingsMatch = meta.match(/SERVES\s+([\d\sTO\-–]+)/i);
    const servings = servingsMatch
      ? Number(String(servingsMatch[1]).match(/\d+/)?.[0] || 4)
      : 4;
    const prepMatch = active.match(/(\d+)\s*(?:½\s*)?(?:hours?|minutes?)/i);
    let prep = 0;
    if (prepMatch) {
      prep = /hour/i.test(active) ? Number(prepMatch[1]) * 60 : Number(prepMatch[1]);
      if (/½/.test(active) && /hour/i.test(active)) prep += 30;
    }

    const ingredients = [];
    const steps = [];
    let mode = "scan"; // scan -> ingredients -> steps
    for (const line of block.slice(1)) {
      if (/^Active Time:|^MAKES\b|^Equipment:|^Plan Ahead:/i.test(line)) continue;
      if (isEgyptTitle(line)) continue;

      // Numbered method steps always win
      if (/^\d+\.\s+/.test(line)) {
        mode = "steps";
        const text = line.replace(/^\d+\.\s*/, "");
        steps.push({ instruction: text, text });
        continue;
      }

      const looksLikeIngredient =
        /^\d|^½|^¼|^¾|^⅓|^⅔/.test(line) ||
        /^(kosher salt|fine sea salt|freshly|extra-virgin|olive oil|vegetable oil|clarified butter|ghee)\b/i.test(line) ||
        (/\b(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|pound|pounds|ounce|ounces|\bg\b|\bml\b|clove|cloves|sprig|sprigs|pinch|bunch)\b/i.test(
          line
        ) &&
          line.length < 140);

      if (mode !== "steps" && looksLikeIngredient) {
        ingredients.push({ name: line, amount: null, unit: null, text: line });
        mode = "ingredients";
        continue;
      }

      if (mode === "steps") {
        if (line.length > 25) steps.push({ instruction: line, text: line });
        continue;
      }

      // Unnumbered method prose after we already have ingredients
      if (
        mode === "ingredients" &&
        line.length > 40 &&
        /^(Combine|Whisk|Heat|Add|Place|Bring|Stir|Serve|Preheat|Blend|Trim|Peel|Puree|In a |To make|Put |Season |Transfer|Remove|Drain|Rinse|Toss |Spread|Bake|Fry|Grill|Simmer|Cook |Using |Once |Meanwhile)/i.test(
          line
        )
      ) {
        mode = "steps";
        steps.push({ instruction: line, text: line });
      }
      // else headnote — ignore
    }

    // Inline ingredients inside numbered steps (rare) — keep recipe if steps exist
    if (ingredients.length < 1 && steps.length >= 1) {
      // pull measurable phrases from step text
      for (const s of steps) {
        const bits = String(s.text).match(
          /\d+[^\.;,]{0,40}(?:cup|tablespoon|teaspoon|ounce|pound|g|ml)[^\.;,]{0,40}/gi
        );
        if (bits) {
          for (const b of bits.slice(0, 8)) {
            ingredients.push({ name: b.trim(), amount: null, unit: null, text: b.trim() });
          }
        }
      }
    }

    if (ingredients.length < 1) continue;
    seen.add(displayName.toLowerCase());

    const summary =
      block.find(
        (l) =>
          l.length > 60 &&
          !/^\d+\./.test(l) &&
          !isEgyptTitle(l) &&
          !/^Active|^MAKES|^Equipment|^Plan/i.test(l) &&
          !/cup|tablespoon|teaspoon/i.test(l.slice(0, 30))
      ) || `Egyptian recipe from My Egypt by Michael Mina`;

    recipes.push({
      name: displayName,
      slug: slugify(displayName) + "-egypt-mina",
      country: "Egypt",
      continent: "Africa",
      is_african: true,
      cuisine_type: "Egyptian",
      category: "cookbook",
      summary: summary.slice(0, 500),
      servings,
      prep_time: prep,
      cook_time: 0,
      prep_time_minutes: prep,
      cook_time_minutes: 0,
      difficulty: prep > 60 ? "Hard" : prep > 30 ? "Medium" : "Easy",
      protein: null,
      is_verified_authentic: true,
      ingredients,
      steps: steps.length ? steps : [{ instruction: "Follow recipe method as written in My Egypt.", text: "Follow recipe method as written in My Egypt." }],
      tags: ["Egypt", "My Egypt", "Michael Mina", "North Africa"],
      item_type: "recipe",
      history: "Source: My Egypt — Cooking from My Roots by Michael Mina",
    });
  }
  return recipes;
}

function parseSoup(paras) {
  const recipes = [];
  // Titles followed by ingredient lines then Yields / instructions
  for (let i = 0; i < paras.length; i++) {
    const title = paras[i];
    if (!title || title.length < 3 || title.length > 70) continue;
    if (/^(CHAPTER|CONTENTS|INTRODUCTION|Yields|Safe Handling|THE |Copyright|ISBN|Published|Library|Serves|Salt |Pepper )/i.test(title)) continue;
    if (/^\d|^½|^¼|^¾|^⅓|^⅔/.test(title)) continue;
    if (/cup|tablespoon|teaspoon|pound|clove|chopped|minced|sliced|to taste/i.test(title)) continue;
    // Real soup titles are Title Case / proper names, not ingredient fragments
    if (!/[A-Za-z]{3,}/.test(title)) continue;
    if (!/\b(soup|broth|bisque|chowder|stew|chili|consomme|gazpacho|stock|bouillabaisse|gumbo|borscht|pho|ramen|dal|curry)\b/i.test(title) && title.split(/\s+/).length < 2) {
      // allow multi-word non-soup names (e.g. "Scotch Broth") already covered; single words only if soup-ish
    }
    if (/^(of an |bunch |head of |medium |large |small )/i.test(title)) continue;

    // Look ahead for ingredient pattern within next 3 lines
    const next = paras[i + 1] || "";
    if (!/^(\d|½|¼|¾|⅓|⅔)/.test(next) && !/^(one|two|three|a |an )/i.test(next)) continue;

    const ingredients = [];
    const steps = [];
    let j = i + 1;
    let yields = "";
    while (j < paras.length && j < i + 80) {
      const line = paras[j];
      if (/^Yields?\b/i.test(line) || /^Yields \d/i.test(line)) {
        yields = line;
        j++;
        // sometimes "cups ..." spilled
        continue;
      }
      if (
        ingredients.length >= 2 &&
        (/^(Preheat|Place|Bring|Add|Remove|Strain|Allow|Stir|Combine|Heat|In the|Pour|Simmer|Cover|Serve|Whisk|Cook|Safe Handling)/i.test(line) ||
          line.length > 90)
      ) {
        // steps start
        while (j < paras.length && j < i + 100) {
          const s = paras[j];
          if (/^[A-Z][a-z].{0,60}$/.test(s) && !/^(Preheat|Place|Bring|Add|Remove|Strain|Allow|Stir|Combine|Heat|Pour|Simmer|Cover|Serve|Whisk|Cook|Safe)/i.test(s) && ingredients.length > 0 && steps.length > 0) {
            // next title
            break;
          }
          if (/^CHAPTER|^CONTENTS/i.test(s)) break;
          if (s.length > 15) steps.push({ instruction: s, text: s });
          j++;
          if (steps.length > 12) break;
        }
        break;
      }
      if (/^Safe Handling|^CHAPTER/i.test(line)) break;
      if (line.length < 120) {
        ingredients.push({ name: line, amount: null, unit: null, text: line });
      }
      j++;
    }

    if (ingredients.length < 3 || steps.length < 1) continue;
    if (recipes.some((r) => r.name === title)) continue;

    recipes.push({
      name: title,
      slug: slugify(title) + "-soup",
      country: "Global",
      continent: "Global",
      is_african: false,
      cuisine_type: "Soup",
      category: "soup",
      summary: yields || `Soup recipe from The Everything Soup Cookbook by B.J. Hanson`,
      servings: Number(yields.match(/\d+/)?.[0] || 4),
      prep_time: 15,
      cook_time: 45,
      prep_time_minutes: 15,
      cook_time_minutes: 45,
      difficulty: "Easy",
      protein: null,
      is_verified_authentic: null,
      ingredients,
      steps,
      tags: ["Soup", "Everything Soup Cookbook", "B.J. Hanson"],
      item_type: "recipe",
      history: "Source: The Everything Soup Cookbook by B.J. Hanson",
    });
  }
  // Prefer names that look like dish titles
  return recipes.filter((r) => {
    const n = r.name;
    if (/^(Serves|Salt|Pepper|Yield)/i.test(n)) return false;
    if (/^\d|^½|^¼/.test(n)) return false;
    if (/chopped|minced|to taste|cloves?$/i.test(n)) return false;
    return /[A-Za-z]{4,}/.test(n);
  });
}

async function existingSlugs(slugs) {
  const set = new Set();
  for (let i = 0; i < slugs.length; i += 80) {
    const chunk = slugs.slice(i, i + 80);
    const q = chunk.map(encodeURIComponent).join(",");
    const res = await fetch(`${url}/rest/v1/recipes?select=slug&slug=in.(${q})`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows = await res.json();
    for (const r of rows || []) set.add(r.slug);
  }
  return set;
}

async function upsertRecipes(rows) {
  let inserted = 0;
  let updated = 0;
  for (let i = 0; i < rows.length; i += 15) {
    const chunk = rows.slice(i, i + 15);
    // align keys
    const keys = [
      "name",
      "slug",
      "country",
      "continent",
      "is_african",
      "cuisine_type",
      "category",
      "summary",
      "servings",
      "prep_time",
      "cook_time",
      "prep_time_minutes",
      "cook_time_minutes",
      "difficulty",
      "protein",
      "is_verified_authentic",
      "ingredients",
      "steps",
      "tags",
      "item_type",
      "history",
      "image_url",
    ];
    const payload = chunk.map((r) => {
      const o = {};
      for (const k of keys) o[k] = r[k] ?? null;
      return o;
    });

    const res = await fetch(`${url}/rest/v1/recipes?on_conflict=slug`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("upsert fail", await res.text());
      continue;
    }
    const saved = await res.json();
    inserted += saved.length;
    console.log(`upserted chunk ${i / 15 + 1}: ${saved.length}`);
    await sleep(200);
  }
  return { inserted, updated };
}

async function patchImagesByName(nameToUrl) {
  let n = 0;
  for (const [name, image_url] of Object.entries(nameToUrl)) {
    const res = await fetch(
      `${url}/rest/v1/recipes?name=eq.${encodeURIComponent(name)}`,
      {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ image_url }),
      }
    );
    if (res.ok) n++;
    await sleep(40);
  }
  return n;
}

// ---------- main ----------
const egyptParas = JSON.parse(readFileSync("data/cookbooks/egypt/paragraphs.json", "utf8"));
const soupParas = JSON.parse(readFileSync("data/cookbooks/soup/paragraphs.json", "utf8"));

const egyptRecipes = parseEgypt(egyptParas);
const soupRecipes = parseSoup(soupParas);
console.log(JSON.stringify({ egyptParsed: egyptRecipes.length, soupParsed: soupRecipes.length }, null, 2));
writeFileSync("data/cookbooks/egypt/parsed-recipes.json", JSON.stringify(egyptRecipes, null, 2));
writeFileSync("data/cookbooks/soup/parsed-recipes.json", JSON.stringify(soupRecipes.slice(0, 5), null, 2));
writeFileSync("data/cookbooks/soup/parsed-count.json", JSON.stringify({ count: soupRecipes.length }));

// Upload Egypt images and map Art_P{page} by sequential recipe order where possible
const egyptMediaDir = "data/cookbooks/egypt/unzipped/word/media";
const egyptMedia = readdirSync(egyptMediaDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const artPages = egyptMedia
  .filter((f) => /^Art_P\d+/i.test(f))
  .map((f) => ({
    file: f,
    page: Number(f.match(/Art_P(\d+)/i)?.[1] || 0),
  }))
  .filter((x) => x.page > 0)
  .sort((a, b) => a.page - b.page);

const skipUpload = process.env.SKIP_UPLOAD === "1";
console.log(skipUpload ? "reusing egypt image URLs" : "uploading egypt images", artPages.length);
const egyptImageUrls = [];
for (const { file, page } of artPages) {
  const dest = `cookbooks/egypt/${file.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const publicUrl = `${url}/storage/v1/object/public/recipe-uploads/${dest}`;
  if (skipUpload) {
    egyptImageUrls.push({ page, file, url: publicUrl });
    continue;
  }
  try {
    await uploadImage(join(egyptMediaDir, file), dest);
    egyptImageUrls.push({ page, file, url: publicUrl });
    if (egyptImageUrls.length % 20 === 0) console.log("egypt uploaded", egyptImageUrls.length);
  } catch (e) {
    console.warn(e.message);
  }
  await sleep(30);
}

// Assign images to egypt recipes round-robin by index order (best-effort)
for (let i = 0; i < egyptRecipes.length; i++) {
  const img = egyptImageUrls[i % Math.max(egyptImageUrls.length, 1)];
  if (img) egyptRecipes[i].image_url = img.url;
}

console.log(skipUpload ? "reusing soup image URLs" : "uploading soup images");
const soupMediaDir = "data/cookbooks/soup/unzipped/word/media";
const soupMedia = existsSync(soupMediaDir)
  ? readdirSync(soupMediaDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !/logo|cover|inner|ever/i.test(f))
  : [];
const soupUrls = [];
for (const file of soupMedia) {
  const dest = `cookbooks/soup/${file.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const publicUrl = `${url}/storage/v1/object/public/recipe-uploads/${dest}`;
  if (!skipUpload) {
    try {
      await uploadImage(join(soupMediaDir, file), dest);
    } catch (e) {
      console.warn(e.message);
    }
  }
  soupUrls.push(publicUrl);
}
for (let i = 0; i < soupRecipes.length; i++) {
  if (soupUrls.length) soupRecipes[i].image_url = soupUrls[i % soupUrls.length];
}

console.log(skipUpload ? "skipping b0dc re-upload" : "uploading b0dc images (image-only book)");
const b0dcMediaDir = "data/cookbooks/b0dc/unzipped/word/media";
const b0dcMedia = existsSync(b0dcMediaDir)
  ? readdirSync(b0dcMediaDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  : [];
let b0dcUploaded = 0;
if (!skipUpload) {
  for (const file of b0dcMedia) {
    try {
      await uploadImage(join(b0dcMediaDir, file), `cookbooks/b0dc/${file.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
      b0dcUploaded++;
    } catch (e) {
      console.warn(e.message);
    }
    await sleep(20);
  }
} else {
  b0dcUploaded = b0dcMedia.length;
}

const all = [...egyptRecipes, ...soupRecipes];
const have = await existingSlugs(all.map((r) => r.slug));
const fresh = all.filter((r) => !have.has(r.slug));
const existing = all.filter((r) => have.has(r.slug));
console.log(JSON.stringify({ total: all.length, fresh: fresh.length, existing: existing.length, b0dcUploaded }, null, 2));

const result = await upsertRecipes(all);
// Also patch existing egypt dishes by exact name with cookbook photos when possible
const nameMap = {};
for (const r of egyptRecipes) {
  if (r.image_url) nameMap[r.name] = r.image_url;
}
const patched = await patchImagesByName(nameMap);

writeFileSync(
  "data/cookbooks/import-report.json",
  JSON.stringify(
    {
      egyptRecipes: egyptRecipes.length,
      soupRecipes: soupRecipes.length,
      egyptImages: egyptImageUrls.length,
      soupImages: soupUrls.length,
      b0dcUploaded,
      upsert: result,
      patchedByName: patched,
    },
    null,
    2
  )
);
console.log("done", JSON.stringify(JSON.parse(readFileSync("data/cookbooks/import-report.json", "utf8")), null, 2));
