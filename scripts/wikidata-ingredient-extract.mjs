/**
 * Wikidata → proposed ingredient aliases / QIDs for the African ingredient graph.
 *
 * Flow:
 *  1) Match existing ingredients to Wikidata via wbsearchentities (English)
 *  2) Fetch labels/aliases/descriptions via wbgetentities for priority languages
 *  3) Write report JSON; with --apply upsert wikidata_qid + proposed aliases
 *
 * Usage:
 *   node scripts/wikidata-ingredient-extract.mjs
 *   node scripts/wikidata-ingredient-extract.mjs --apply --limit 50
 *
 * Never marks Wikidata aliases as approved — editors must review.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const env = { ...loadEnv(), ...process.env };
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const READ_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const WRITE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || null;
const APPLY = process.argv.includes("--apply");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i >= 0 ? Number(process.argv[i + 1]) || 80 : 80;
})();

const LANGS = ["en", "sw", "ha", "yo", "ig", "am", "zu", "xh", "fr", "ar", "pt"];
const UA = "LadhaQuestIngredientBot/1.0 (https://www.ladhaquest.com; research)";

const PRIORITY_SLUGS = [
  "ugwu",
  "sukuma-wiki",
  "egusi",
  "palm-oil",
  "scotch-bonnet",
  "cassava",
  "plantain",
  "yam",
  "teff",
  "fonio",
  "sorghum",
  "millet",
  "maize",
  "groundnut",
  "crayfish",
  "stockfish",
  "iru",
  "okra",
  "molokhia",
  "morogo",
  "bitterleaf",
  "tilapia",
  "goat",
  "hibiscus",
  "baobab",
  "cocoyam",
  "garri",
  "fufu",
  "black-pepper",
  "water",
  "garlic",
  "ginger",
  "onion",
  "tomato",
  "rice",
  "chicken",
  "beef",
  "spinach",
  "kale",
  "collard-greens",
  "habanero",
  "cayenne-pepper",
  "coconut-milk",
  "vegetable-oil",
  "sweet-potato",
  "black-eyed-peas",
  "lentils",
  "chickpeas",
  "prawns",
  "eggplant",
];

function normalizeAlias(input) {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function wdGet(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Wikidata ${res.status}: ${await res.text()}`);
  return res.json();
}

async function searchEntity(name) {
  const q = new URLSearchParams({
    action: "wbsearchentities",
    search: name,
    language: "en",
    uselang: "en",
    type: "item",
    limit: "5",
    format: "json",
    origin: "*",
  });
  const data = await wdGet(`https://www.wikidata.org/w/api.php?${q}`);
  const hits = data.search || [];
  // Prefer food / plant / ingredient-ish descriptions
  const scored = hits.map((h) => {
    const desc = String(h.description || "").toLowerCase();
    let score = 0;
    if (/food|ingredient|plant|vegetable|spice|fruit|grain|seed|oil|pepper|leaf|tuber|fish|meat|legume|herb/.test(desc))
      score += 3;
    if (/species|taxon/.test(desc)) score += 2;
    if (normalizeAlias(h.label) === normalizeAlias(name)) score += 2;
    return { ...h, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

async function getEntities(qids) {
  if (!qids.length) return {};
  const q = new URLSearchParams({
    action: "wbgetentities",
    ids: qids.join("|"),
    props: "labels|aliases|descriptions|claims",
    languages: LANGS.join("|"),
    format: "json",
    origin: "*",
  });
  const data = await wdGet(`https://www.wikidata.org/w/api.php?${q}`);
  return data.entities || {};
}

function scientificFromClaims(entity) {
  // P225 taxon name
  try {
    const mains = entity.claims?.P225;
    if (!mains?.length) return null;
    return mains[0]?.mainsnak?.datavalue?.value || null;
  } catch {
    return null;
  }
}

async function fetchIngredients() {
  const headers = { apikey: READ_KEY, Authorization: `Bearer ${READ_KEY}` };
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ingredients?select=id,name,slug,canonical_name,wikidata_qid,scientific_name&order=name.asc&limit=1000`,
    { headers }
  );
  if (!res.ok) {
    // wikidata_qid may not exist yet — retry without it
    const res2 = await fetch(
      `${SUPABASE_URL}/rest/v1/ingredients?select=id,name,slug,canonical_name,scientific_name&order=name.asc&limit=1000`,
      { headers }
    );
    if (!res2.ok) throw new Error(await res2.text());
    return res2.json();
  }
  return res.json();
}

async function main() {
  if (!SUPABASE_URL || !READ_KEY) {
    console.error("Missing SUPABASE_URL / publishable key");
    process.exit(1);
  }

  const all = await fetchIngredients();
  const priority = [];
  const seen = new Set();
  for (const slug of PRIORITY_SLUGS) {
    const hit = all.find((i) => i.slug === slug || normalizeAlias(i.name) === normalizeAlias(slug.replace(/-/g, " ")));
    if (hit && !seen.has(hit.id)) {
      priority.push(hit);
      seen.add(hit.id);
    }
  }
  // fill up to LIMIT with remaining approved African-looking names
  for (const ing of all) {
    if (priority.length >= LIMIT) break;
    if (seen.has(ing.id)) continue;
    priority.push(ing);
    seen.add(ing.id);
  }

  console.log(`Extracting Wikidata for ${priority.length} ingredients…`);
  const results = [];

  for (const ing of priority) {
    process.stdout.write(`  ${ing.name}… `);
    try {
      const hit = await searchEntity(ing.canonical_name || ing.name);
      await sleep(120);
      if (!hit?.id) {
        console.log("no hit");
        results.push({ ingredient_id: ing.id, name: ing.name, slug: ing.slug, qid: null, aliases: [], status: "unmatched" });
        continue;
      }
      const entities = await getEntities([hit.id]);
      await sleep(120);
      const ent = entities[hit.id];
      if (!ent) {
        console.log("missing entity");
        continue;
      }
      const aliases = [];
      for (const lang of LANGS) {
        const label = ent.labels?.[lang]?.value;
        if (label) {
          aliases.push({
            alias: label,
            alias_normalized: normalizeAlias(label),
            language: lang,
            country_code: "",
            source: "wikidata",
            match_confidence: 0.7,
            review_status: "proposed",
          });
        }
        for (const a of ent.aliases?.[lang] || []) {
          if (!a.value) continue;
          aliases.push({
            alias: a.value,
            alias_normalized: normalizeAlias(a.value),
            language: lang,
            country_code: "",
            source: "wikidata",
            match_confidence: 0.55,
            review_status: "proposed",
          });
        }
      }
      // dedupe
      const uniq = [];
      const seenA = new Set();
      for (const a of aliases) {
        const key = `${a.alias_normalized}|${a.language}`;
        if (!a.alias_normalized || seenA.has(key)) continue;
        seenA.add(key);
        uniq.push(a);
      }

      const scientific = scientificFromClaims(ent);
      console.log(`${hit.id} (${uniq.length} aliases)`);
      results.push({
        ingredient_id: ing.id,
        name: ing.name,
        slug: ing.slug,
        qid: hit.id,
        wikidata_label: ent.labels?.en?.value || hit.label,
        wikidata_description: ent.descriptions?.en?.value || hit.description,
        scientific_name: scientific,
        aliases: uniq,
        status: "matched",
      });
    } catch (e) {
      console.log("error", e.message);
      results.push({ ingredient_id: ing.id, name: ing.name, status: "error", error: e.message });
    }
  }

  mkdirSync(resolve(root, "output"), { recursive: true });
  const reportPath = resolve(root, "output/wikidata_ingredient_extract.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        count: results.length,
        matched: results.filter((r) => r.status === "matched").length,
        results,
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${reportPath}`);

  // SQL for proposed aliases + QIDs (safe to review before apply)
  const sqlLines = ["-- Generated by scripts/wikidata-ingredient-extract.mjs", "BEGIN;"];
  for (const r of results.filter((x) => x.status === "matched" && x.qid)) {
    sqlLines.push(
      `UPDATE public.ingredients SET wikidata_qid = '${r.qid}', scientific_name = COALESCE(scientific_name, ${
        r.scientific_name ? `'${String(r.scientific_name).replace(/'/g, "''")}'` : "NULL"
      }), source = COALESCE(source, 'wikidata'), imported_at = now() WHERE id = '${r.ingredient_id}'::uuid AND (wikidata_qid IS NULL OR wikidata_qid = '${r.qid}');`
    );
    for (const a of r.aliases || []) {
      sqlLines.push(
        `INSERT INTO public.ingredient_aliases (ingredient_id, alias, alias_normalized, language, country_code, match_confidence, source, licence, review_status)
SELECT '${r.ingredient_id}'::uuid, '${a.alias.replace(/'/g, "''")}', '${a.alias_normalized.replace(/'/g, "''")}', '${a.language}', '', ${a.match_confidence}, 'wikidata', 'CC0-1.0', 'proposed'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient_aliases x
  WHERE x.alias_normalized = '${a.alias_normalized.replace(/'/g, "''")}' AND x.language = '${a.language}' AND x.country_code = ''
);`
      );
    }
  }
  sqlLines.push("COMMIT;");
  const sqlPath = resolve(root, "output/wikidata_ingredient_proposed.sql");
  writeFileSync(sqlPath, sqlLines.join("\n") + "\n");
  console.log(`Wrote ${sqlPath}`);

  if (APPLY) {
    if (!WRITE_KEY) {
      console.error("--apply needs SUPABASE_SERVICE_ROLE_KEY; use: npx supabase db query --remote --yes -f output/wikidata_ingredient_proposed.sql");
      process.exit(2);
    }
    console.log("REST apply not implemented for new-format secrets; apply the SQL file via supabase db query.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
