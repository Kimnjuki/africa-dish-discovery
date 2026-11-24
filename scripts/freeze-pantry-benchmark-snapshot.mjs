/**
 * Freeze catalog + ingredient-graph version metadata for pantry eval reproducibility.
 *
 * Usage: node scripts/freeze-pantry-benchmark-snapshot.mjs
 * Writes: benchmarks/pantry/snapshots/catalog_version.json
 *         benchmarks/pantry/snapshots/ingredient_graph_version.json
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

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

async function headCount(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "HEAD",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Prefer: "count=exact",
    },
  });
  const cr = res.headers.get("content-range") || "";
  const total = cr.split("/")[1];
  return total ? Number(total) : null;
}

function gitCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

if (!SUPABASE_URL || !KEY) {
  console.error("Missing SUPABASE_URL or publishable key");
  process.exit(1);
}

const outDir = resolve(root, "benchmarks/pantry/snapshots");
mkdirSync(outDir, { recursive: true });

const [
  recipes,
  recipeIngredients,
  ingredients,
  aliasesApproved,
  aliasesProposed,
  substitutions,
] = await Promise.all([
  headCount("recipes?select=id"),
  headCount("recipe_ingredients?select=id"),
  headCount("ingredients?select=id"),
  headCount("ingredient_aliases?select=id&review_status=eq.approved"),
  headCount("ingredient_aliases?select=id&review_status=eq.proposed"),
  headCount("ingredient_substitutions?select=id"),
]);

const frozenAt = new Date().toISOString();
const commit = gitCommit();
const catalogId = `catalog-${frozenAt.slice(0, 10)}-${(commit || "nogit").slice(0, 8)}`;
const graphId = `graph-${frozenAt.slice(0, 10)}-${(commit || "nogit").slice(0, 8)}`;

const catalog = {
  catalog_version: catalogId,
  frozen_at: frozenAt,
  git_commit: commit,
  counts: {
    recipes,
    recipe_ingredients: recipeIngredients,
  },
  notes:
    "Counts only — full recipe dump is optional. Case fixtures embed candidate pools for offline ranking.",
};

const graph = {
  ingredient_graph_version: graphId,
  frozen_at: frozenAt,
  git_commit: commit,
  counts: {
    ingredients,
    aliases_approved: aliasesApproved,
    aliases_proposed: aliasesProposed,
    ingredient_substitutions: substitutions,
  },
  relation_policy: {
    exact_or_alias: "identity / reviewed alias",
    broader_category: "not proof of specific species/product",
    possible_substitute: "culinary swap; requires reviewed edge + prep notes",
  },
};

writeFileSync(resolve(outDir, "catalog_version.json"), JSON.stringify(catalog, null, 2));
writeFileSync(resolve(outDir, "ingredient_graph_version.json"), JSON.stringify(graph, null, 2));
console.log(JSON.stringify({ catalog, graph }, null, 2));
