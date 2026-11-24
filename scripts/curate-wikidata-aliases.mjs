/**
 * Safe auto-curation for Wikidata-proposed ingredient_aliases.
 *
 * Approves high-confidence, non-colliding culinary aliases.
 * Rejects CAS numbers, toxic/non-culinary denylist hits, and cross-ingredient collisions.
 * Leaves ambiguous mid-confidence rows as proposed for human review.
 *
 * Usage:
 *   node scripts/curate-wikidata-aliases.mjs           # dry-run + SQL
 *   node scripts/curate-wikidata-aliases.mjs --apply   # write SQL + print apply hint
 *   npm run wikidata:curate
 *
 * Apply SQL:
 *   npx supabase db query --remote --yes -f output/curate_wikidata_aliases.sql
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
const KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY;

const APPLY = process.argv.includes("--apply");

/** Non-culinary / misleading Wikidata aliases we never auto-approve. */
const REJECT_ALIASES = new Set(
  [
    "vine of sodom",
    "bitter apple",
    "bitter cucumber",
    "desert gourd",
    "wild gourd",
    "coloquintida",
    "8002-75-3",
    "8002 75 3",
  ].map((s) => s)
);

const SAFE_LANGS = new Set([
  "en",
  "sw",
  "ha",
  "yo",
  "ig",
  "am",
  "zu",
  "xh",
  "fr",
  "ar",
  "pt",
]);

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCasLike(s) {
  return /^\d[\d\s-]{3,}$/.test(s) || /^\d{2,}-\d{2,}-\d$/.test(s);
}

/** True only for Capitalized genus + species style labels (not "palm oil"). */
function isLatinBinomial(alias) {
  return /^[A-Z][a-z]{2,} [a-z]{2,}( [a-z]+)?$/.test(String(alias || "").trim());
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

async function fetchAll(path) {
  const out = [];
  let offset = 0;
  const page = 1000;
  for (;;) {
    const url = `${SUPABASE_URL}/rest/v1/${path}${path.includes("?") ? "&" : "?"}limit=${page}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const chunk = await res.json();
    out.push(...chunk);
    if (chunk.length < page) break;
    offset += page;
  }
  return out;
}

function escapeSql(s) {
  return String(s).replace(/'/g, "''");
}

if (!SUPABASE_URL || !KEY) {
  console.error("Missing SUPABASE_URL or publishable key");
  process.exit(1);
}

console.log("Loading ingredients + aliases…");
const [ingredients, aliases] = await Promise.all([
  fetchAll("ingredients?select=id,name,slug,canonical_name,scientific_name"),
  fetchAll(
    "ingredient_aliases?select=id,ingredient_id,alias,alias_normalized,language,match_confidence,review_status,source"
  ),
]);

/** Map normalized token → set of ingredient ids that already claim it. */
const claimOwners = new Map();
function claim(token, ingredientId) {
  if (!token || token.length < 2) return;
  if (!claimOwners.has(token)) claimOwners.set(token, new Set());
  claimOwners.get(token).add(ingredientId);
}

for (const ing of ingredients) {
  claim(norm(ing.name), ing.id);
  claim(norm(ing.slug), ing.id);
  claim(norm(ing.canonical_name), ing.id);
  claim(norm(ing.scientific_name), ing.id);
}
for (const a of aliases) {
  if (a.review_status !== "approved") continue;
  claim(norm(a.alias_normalized || a.alias), a.ingredient_id);
}

const byId = new Map(ingredients.map((i) => [i.id, i]));
const proposed = aliases.filter((a) => a.review_status === "proposed");

const approve = [];
const reject = [];
const skip = [];

for (const row of proposed) {
  const ing = byId.get(row.ingredient_id);
  if (!ing) {
    reject.push({ id: row.id, reason: "orphan_ingredient" });
    continue;
  }

  const aliasN = norm(row.alias_normalized || row.alias);
  const nameN = norm(ing.name);
  const slugN = norm(ing.slug);
  const canonN = norm(ing.canonical_name);
  const sciN = norm(ing.scientific_name);
  const conf = Number(row.match_confidence) || 0;
  const lang = (row.language || "en").toLowerCase();

  if (!aliasN || aliasN.length < 2) {
    reject.push({ id: row.id, reason: "too_short", alias: row.alias });
    continue;
  }
  if (isCasLike(aliasN) || REJECT_ALIASES.has(aliasN)) {
    reject.push({ id: row.id, reason: "denylist_or_cas", alias: row.alias });
    continue;
  }

  const owners = claimOwners.get(aliasN);
  if (owners && [...owners].some((id) => id !== row.ingredient_id)) {
    reject.push({ id: row.id, reason: "collision", alias: row.alias });
    continue;
  }

  const selfMatch =
    aliasN === nameN ||
    aliasN === slugN ||
    aliasN === canonN ||
    (sciN && aliasN === sciN);

  const closeTypo =
    (nameN && levenshtein(aliasN, nameN) <= 1 && Math.min(aliasN.length, nameN.length) >= 4) ||
    (slugN && levenshtein(aliasN, slugN) <= 1 && Math.min(aliasN.length, slugN.length) >= 4);

  if (isLatinBinomial(row.alias) && !(sciN && aliasN === sciN) && !selfMatch) {
    // Alternate binomial that is not this ingredient's scientific_name
    if (conf < 0.7) {
      reject.push({ id: row.id, reason: "nonmatching_binomial", alias: row.alias });
      continue;
    }
    skip.push({ id: row.id, reason: "ambiguous_binomial", alias: row.alias });
    continue;
  }

  const highSafe = conf >= 0.7 && SAFE_LANGS.has(lang) && aliasN.length >= 3;
  const midSelf = conf >= 0.55 && (selfMatch || closeTypo);

  if (selfMatch || highSafe || midSelf) {
    approve.push({
      id: row.id,
      reason: selfMatch ? "self_match" : highSafe ? "high_conf_safe_lang" : "mid_conf_close",
      alias: row.alias,
      ingredient: ing.name,
      conf,
      lang,
    });
    claim(aliasN, row.ingredient_id);
    continue;
  }

  skip.push({ id: row.id, reason: "needs_human", alias: row.alias, conf, lang });
}

const outDir = resolve(root, "output");
mkdirSync(outDir, { recursive: true });

const sqlParts = [
  "-- Generated by scripts/curate-wikidata-aliases.mjs",
  `-- approve=${approve.length} reject=${reject.length} leave_proposed=${skip.length}`,
  "BEGIN;",
];

if (approve.length) {
  const ids = approve.map((a) => `'${a.id}'::uuid`).join(",\n  ");
  sqlParts.push(`
UPDATE public.ingredient_aliases
SET review_status = 'approved',
    reviewed_at = now(),
    reviewed_by = 'wikidata-auto-curate-v1'
WHERE id IN (
  ${ids}
) AND review_status = 'proposed';`);
}

if (reject.length) {
  const ids = reject.map((a) => `'${a.id}'::uuid`).join(",\n  ");
  sqlParts.push(`
UPDATE public.ingredient_aliases
SET review_status = 'rejected',
    reviewed_at = now(),
    reviewed_by = 'wikidata-auto-curate-v1'
WHERE id IN (
  ${ids}
) AND review_status = 'proposed';`);
}

sqlParts.push("COMMIT;");

const sqlPath = resolve(outDir, "curate_wikidata_aliases.sql");
writeFileSync(sqlPath, sqlParts.join("\n") + "\n", "utf8");

const report = {
  generated_at: new Date().toISOString(),
  proposed_scanned: proposed.length,
  approve: approve.length,
  reject: reject.length,
  leave_proposed: skip.length,
  approve_sample: approve.slice(0, 30),
  reject_sample: reject.slice(0, 30),
  skip_sample: skip.slice(0, 30),
};
writeFileSync(resolve(outDir, "curate_wikidata_aliases_report.json"), JSON.stringify(report, null, 2));

console.log(
  `Proposed=${proposed.length} → approve=${approve.length} reject=${reject.length} leave=${skip.length}`
);
console.log(`Wrote ${sqlPath}`);
if (APPLY) {
  console.log("Apply with: npx supabase db query --remote --yes -f output/curate_wikidata_aliases.sql");
}
