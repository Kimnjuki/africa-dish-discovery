/**
 * Import the African Ingredient Graph from CSV seeds into Supabase.
 *
 * Sources:
 *   data/ingredients/priority-100.csv       — 100 priority ingredients + aliases
 *   data/ingredients/substitutions-seed.csv — curated substitution edges
 *   data/ingredients/availability-seed.csv  — NG/KE/GH/ZA/EG/TZ availability rows
 *
 * Usage: node scripts/import-ingredient-graph.mjs
 *   npm run seed:ingredients
 *
 * Env vars (from .env or process.env):
 *   SUPABASE_URL / VITE_SUPABASE_URL
 *   SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Exits 0 (with a warning) if env vars are missing — safe for CI/Docker builds.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ─── Env loading (same pattern as generate-sitemaps.mjs) ──────────────────────
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
const SUPABASE_KEY =
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "import-ingredient-graph: missing SUPABASE_URL / API key — skipping DB upsert.\n" +
    "  Set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) to run the full import.\n" +
    "  Alternatively, apply supabase/migrations/20261120110000_ingredient_graph_seed.sql directly."
  );
  process.exit(0);
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

// ─── Minimal RFC-4180 CSV parser ──────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    if (values.length !== headers.length) {
      console.warn(`  CSV row ${i + 1}: expected ${headers.length} cols, got ${values.length} — skipping`);
      continue;
    }
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].trim()] = values[j];
    }
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Validation helpers ────────────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function validateIngredientRow(row, lineNum) {
  const errors = [];
  if (!row.slug) errors.push("missing slug");
  else if (!SLUG_RE.test(row.slug)) errors.push(`invalid slug "${row.slug}"`);
  if (!row.canonical_name) errors.push("missing canonical_name");
  if (!row.category) errors.push("missing category");
  if (errors.length) {
    console.warn(`  Row ${lineNum}: ${errors.join("; ")} — skipping`);
    return false;
  }
  return true;
}

function validateSubstitutionRow(row, lineNum) {
  const errors = [];
  if (!row.from_slug) errors.push("missing from_slug");
  if (!row.to_slug) errors.push("missing to_slug");
  if (!row.substitution_type) errors.push("missing substitution_type");
  if (errors.length) {
    console.warn(`  Row ${lineNum}: ${errors.join("; ")} — skipping`);
    return false;
  }
  return true;
}

function validateAvailabilityRow(row, lineNum) {
  const errors = [];
  if (!row.ingredient_slug) errors.push("missing ingredient_slug");
  if (!row.country_code) errors.push("missing country_code");
  if (errors.length) {
    console.warn(`  Row ${lineNum}: ${errors.join("; ")} — skipping`);
    return false;
  }
  return true;
}

// ─── Supabase REST helpers ─────────────────────────────────────────────────────
async function upsertBatch(table, rows, conflictCols) {
  if (rows.length === 0) return { count: 0, error: null };

  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const preferHeader =
    conflictCols
      ? `resolution=merge-duplicates,return=representation`
      : "return=representation";

  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, Prefer: preferHeader },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    return { count: 0, error: `${res.status}: ${text.slice(0, 200)}` };
  }

  const data = await res.json().catch(() => []);
  return { count: Array.isArray(data) ? data.length : rows.length, error: null };
}

async function fetchRows(table, select, filter = "") {
  const qs = new URLSearchParams({ select });
  if (filter) qs.set(filter.split("=")[0], filter.split("=").slice(1).join("="));
  const url = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchRows ${table}: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Parse pipe-delimited multi-values ────────────────────────────────────────
function parsePipe(val) {
  if (!val || val.trim() === "") return [];
  return val.split("|").map((s) => s.trim()).filter(Boolean);
}

/**
 * Parse aliases field: entries separated by ~
 * Each entry: alias|lang|country|ambiguous
 */
function parseAliases(raw, ingredientId) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split("~")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split("|");
      const alias = (parts[0] || "").trim();
      if (!alias) return null;
      return {
        ingredient_id: ingredientId,
        alias,
        alias_normalized: alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim(),
        language: (parts[1] || "en").trim() || "en",
        country_code: (parts[2] || "").trim(),
        is_ambiguous: (parts[3] || "false").trim() === "true",
        match_confidence: 1,
        review_status: "approved",
      };
    })
    .filter(Boolean);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== LadhaQuest Ingredient Graph Import ===\n");

  const ingredientsCsvPath = resolve(root, "data/ingredients/priority-100.csv");
  const substitutionsCsvPath = resolve(root, "data/ingredients/substitutions-seed.csv");
  const availabilityCsvPath = resolve(root, "data/ingredients/availability-seed.csv");

  for (const p of [ingredientsCsvPath, substitutionsCsvPath, availabilityCsvPath]) {
    if (!existsSync(p)) {
      console.error(`Missing CSV: ${p}`);
      process.exit(1);
    }
  }

  // ── 1) Ingredients ───────────────────────────────────────────────────────────
  console.log("1) Upserting ingredients…");
  const ingredientRows = parseCSV(readFileSync(ingredientsCsvPath, "utf8"));
  const validIngredients = ingredientRows.filter((r, i) => validateIngredientRow(r, i + 2));

  const ingredientUpserts = validIngredients.map((r) => ({
    slug: r.slug,
    name: r.canonical_name,
    canonical_name: r.canonical_name,
    category: r.category,
    food_group: r.food_group || null,
    dietary_tags: parsePipe(r.dietary_tags),
    allergens: parsePipe(r.allergens),
    function_tags: parsePipe(r.function_tags),
    default_unit: r.default_unit || null,
    review_status: r.review_status || "approved",
    source: "ladhaquest-seed-v1",
    licence: "CC0-1.0",
  }));

  const { count: ingCount, error: ingErr } = await upsertBatch("ingredients", ingredientUpserts, "slug");
  if (ingErr) {
    console.error("  Ingredients upsert failed:", ingErr);
  } else {
    console.log(`  ✓ ${ingCount} ingredient rows upserted`);
  }

  // ── 2) Fetch ingredient id map (slug → id) ───────────────────────────────────
  console.log("2) Fetching ingredient IDs…");
  let allIngredients;
  try {
    allIngredients = await fetchRows("ingredients", "id,slug,name");
  } catch (e) {
    console.error("  Failed to fetch ingredient IDs:", e.message);
    process.exit(1);
  }

  const slugToId = new Map();
  const nameToId = new Map();
  for (const ing of allIngredients) {
    if (ing.slug) slugToId.set(ing.slug, ing.id);
    if (ing.name) nameToId.set(ing.name.toLowerCase(), ing.id);
  }
  console.log(`  ✓ ${slugToId.size} ingredients in DB`);

  // ── 3) Aliases ────────────────────────────────────────────────────────────────
  console.log("3) Upserting ingredient aliases…");
  const aliasRows = [];
  for (const r of validIngredients) {
    const id = slugToId.get(r.slug);
    if (!id) {
      console.warn(`  No DB id for slug "${r.slug}" — skipping aliases`);
      continue;
    }
    const aliases = parseAliases(r.aliases, id);
    // Also add the slug itself as an alias
    const slugAlias = r.slug.replace(/-/g, " ");
    aliases.unshift({
      ingredient_id: id,
      alias: slugAlias,
      alias_normalized: slugAlias,
      language: "en",
      country_code: "",
      is_ambiguous: false,
      match_confidence: 1,
      review_status: "approved",
    });
    aliasRows.push(...aliases);
  }

  // Deduplicate on (alias_normalized, language, country_code)
  const seen = new Set();
  const uniqueAliases = aliasRows.filter((a) => {
    const key = `${a.alias_normalized}|${a.language}|${a.country_code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Batch in chunks of 500
  let aliasTotal = 0;
  for (let i = 0; i < uniqueAliases.length; i += 500) {
    const chunk = uniqueAliases.slice(i, i + 500);
    const { count, error } = await upsertBatch("ingredient_aliases", chunk, "alias_normalized,language,country_code");
    if (error) {
      console.warn(`  Alias batch ${i}-${i + chunk.length} error: ${error}`);
    } else {
      aliasTotal += count;
    }
  }
  console.log(`  ✓ ${aliasTotal} alias rows upserted`);

  // ── 4) Substitutions ──────────────────────────────────────────────────────────
  console.log("4) Upserting ingredient substitutions…");
  const substitutionRows = parseCSV(readFileSync(substitutionsCsvPath, "utf8"));
  const validSubs = substitutionRows.filter((r, i) => validateSubstitutionRow(r, i + 2));

  const subsUpserts = [];
  for (const r of validSubs) {
    const originalId = slugToId.get(r.from_slug);
    const substituteId = slugToId.get(r.to_slug);
    if (!originalId) {
      console.warn(`  Substitution: unknown from_slug "${r.from_slug}" — skipping`);
      continue;
    }
    if (!substituteId) {
      console.warn(`  Substitution: unknown to_slug "${r.to_slug}" — skipping`);
      continue;
    }
    subsUpserts.push({
      original_ingredient_id: originalId,
      substitute_ingredient_id: substituteId,
      quantity_ratio: parseFloat(r.ratio) || 1,
      compatibility_score: Math.round((parseFloat(r.confidence) || 0.7) * 100),
      substitution_type: r.substitution_type || "direct",
      confidence: parseFloat(r.confidence) || 0.7,
      flavor_impact: r.flavor_impact || null,
      texture_impact: r.texture_impact || null,
      dietary_tags: parsePipe(r.dietary_tags),
      reason: r.reason || null,
      notes: r.notes || null,
      review_status: r.review_status || "approved",
      is_verified: r.is_verified === "true",
      source: "ladhaquest-graph-v1",
      licence: "CC0-1.0",
    });
  }

  let subTotal = 0;
  for (let i = 0; i < subsUpserts.length; i += 200) {
    const chunk = subsUpserts.slice(i, i + 200);
    const { count, error } = await upsertBatch("ingredient_substitutions", chunk, null);
    if (error) {
      console.warn(`  Substitution batch error: ${error}`);
    } else {
      subTotal += count;
    }
  }
  console.log(`  ✓ ${subTotal} substitution rows upserted`);

  // ── 5) Availability ───────────────────────────────────────────────────────────
  console.log("5) Upserting ingredient availability…");
  const availabilityRows = parseCSV(readFileSync(availabilityCsvPath, "utf8"));
  const validAvail = availabilityRows.filter((r, i) => validateAvailabilityRow(r, i + 2));

  const availUpserts = [];
  for (const r of validAvail) {
    const id = slugToId.get(r.ingredient_slug);
    if (!id) {
      console.warn(`  Availability: unknown slug "${r.ingredient_slug}" — skipping`);
      continue;
    }
    availUpserts.push({
      ingredient_id: id,
      country_code: r.country_code,
      region: r.region || "",
      availability_score: parseFloat(r.availability_score) || null,
      typical_price: parseFloat(r.typical_price) || null,
      currency: r.currency || null,
      price_unit: r.price_unit || null,
      confidence: parseFloat(r.confidence) || null,
      review_status: r.review_status || "proposed",
      source: "ladhaquest-market-v1",
      licence: "CC0-1.0",
    });
  }

  let availTotal = 0;
  for (let i = 0; i < availUpserts.length; i += 500) {
    const chunk = availUpserts.slice(i, i + 500);
    const { count, error } = await upsertBatch("ingredient_availability", chunk, "ingredient_id,country_code,region");
    if (error) {
      console.warn(`  Availability batch error: ${error}`);
    } else {
      availTotal += count;
    }
  }
  console.log(`  ✓ ${availTotal} availability rows upserted`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n=== Import Summary ===");
  console.log(`  Ingredients : ${ingCount}`);
  console.log(`  Aliases     : ${aliasTotal}`);
  console.log(`  Substitutions: ${subTotal}`);
  console.log(`  Availability : ${availTotal}`);
  console.log("\nDone. Apply supabase/migrations/20261120100000_ingredient_graph_schema.sql first if not done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
