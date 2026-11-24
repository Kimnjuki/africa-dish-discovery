/**
 * Score every recipe for required-field completeness (audit KPI).
 * Usage: node scripts/recipe-completeness-audit.mjs
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
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
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

const REQUIRED = [
  "name",
  "slug",
  "country",
  "image_url",
  "ingredients",
  "steps",
  "prep_time",
  "cook_time",
  "difficulty",
  "servings",
];
const RECOMMENDED = ["summary", "calories", "dietary_tags", "history", "verification_status"];

function present(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

async function fetchAll() {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact" };
  const cols = [...new Set([...REQUIRED, ...RECOMMENDED, "id", "continent"])].join(",");
  const out = [];
  let from = 0;
  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes?select=${cols}&order=slug.asc`, {
      headers: { ...headers, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(await res.text());
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 1000) break;
    from += 1000;
  }
  return out;
}

async function main() {
  const recipes = await fetchAll();
  const fieldHits = Object.fromEntries([...REQUIRED, ...RECOMMENDED].map((f) => [f, 0]));
  let completeRequired = 0;
  const weak = [];

  for (const r of recipes) {
    let ok = true;
    for (const f of REQUIRED) {
      if (present(r[f])) fieldHits[f]++;
      else ok = false;
    }
    for (const f of RECOMMENDED) {
      if (present(r[f])) fieldHits[f]++;
    }
    if (ok) completeRequired++;
    else {
      const missing = REQUIRED.filter((f) => !present(r[f]));
      if (weak.length < 40) weak.push({ slug: r.slug, missing });
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    total: recipes.length,
    complete_required: completeRequired,
    completeness_pct: recipes.length ? Number(((completeRequired / recipes.length) * 100).toFixed(2)) : 0,
    kpi_target_pct: 95,
    field_coverage: Object.fromEntries(
      Object.entries(fieldHits).map(([k, v]) => [
        k,
        { count: v, pct: recipes.length ? Number(((v / recipes.length) * 100).toFixed(2)) : 0 },
      ])
    ),
    sample_incomplete: weak,
  };

  mkdirSync(resolve(root, "output"), { recursive: true });
  writeFileSync(resolve(root, "output/recipe_completeness_audit.json"), JSON.stringify(report, null, 2));
  console.log(
    `Completeness (required fields): ${report.completeness_pct}% (${completeRequired}/${recipes.length}) — KPI 95%`
  );
  console.log("Wrote output/recipe_completeness_audit.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
