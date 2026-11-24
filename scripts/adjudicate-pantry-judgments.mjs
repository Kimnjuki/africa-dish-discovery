/**
 * Merge dual-reviewer pantry judgments; write disagreements queue + adjudicated file.
 *
 * Usage:
 *   npm run bench:pantry:adjudicate
 *   node scripts/adjudicate-pantry-judgments.mjs --seed-dual   # bootstrap A/B from current labels
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "benchmarks/pantry/judgments");
mkdirSync(dir, { recursive: true });

const SEED = process.argv.includes("--seed-dual");

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function writeJsonl(path, rows) {
  writeFileSync(path, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
}

function key(row) {
  return `${row.case_id}::${row.recipe_id}`;
}

const basePath = resolve(dir, "recipe_relevance.jsonl");
const aPath = resolve(dir, "reviewer_a.jsonl");
const bPath = resolve(dir, "reviewer_b.jsonl");

if (SEED || !existsSync(aPath) || !existsSync(bPath)) {
  const base = readJsonl(basePath);
  // Reviewer A = current labels
  const reviewerA = base.map((r) => ({
    case_id: r.case_id,
    recipe_id: r.recipe_id,
    relevance: r.relevance,
    reviewer: "A",
    labeled_at: new Date().toISOString(),
    notes: r.notes || "seeded from pilot editor labels",
  }));
  // Reviewer B = mostly agree; inject controlled disagreements for workflow demo
  // Disagreement rule: label 2 ↔ 1 flips on every 7th shop-adjacent row; never flip safety-critical 0s upward.
  let i = 0;
  const reviewerB = base.map((r) => {
    i++;
    let relevance = r.relevance;
    let notes = "seeded independent review (simulated B)";
    if (r.relevance === 2 && i % 7 === 0) {
      relevance = 1;
      notes = "simulated disagreement: 2→1 (substitution vs shop-first)";
    } else if (r.relevance === 1 && i % 11 === 0) {
      relevance = 2;
      notes = "simulated disagreement: 1→2 (shop-first vs cookable-with-sub)";
    }
    return {
      case_id: r.case_id,
      recipe_id: r.recipe_id,
      relevance,
      reviewer: "B",
      labeled_at: new Date().toISOString(),
      notes,
    };
  });
  writeJsonl(aPath, reviewerA);
  writeJsonl(bPath, reviewerB);
  console.log(`Seeded reviewer_a=${reviewerA.length} reviewer_b=${reviewerB.length}`);
}

const a = readJsonl(aPath);
const b = readJsonl(bPath);
const mapA = new Map(a.map((r) => [key(r), r]));
const mapB = new Map(b.map((r) => [key(r), r]));
const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);

const agreed = [];
const disagreements = [];
const adjudicated = [];

for (const k of [...allKeys].sort()) {
  const ra = mapA.get(k);
  const rb = mapB.get(k);
  if (!ra || !rb) {
    disagreements.push({
      case_id: (ra || rb).case_id,
      recipe_id: (ra || rb).recipe_id,
      reviewer_a: ra?.relevance ?? null,
      reviewer_b: rb?.relevance ?? null,
      status: "missing_reviewer",
      final_relevance: null,
      adjudication_notes: "Needs both reviewers before freeze",
    });
    continue;
  }

  if (ra.relevance === rb.relevance) {
    agreed.push(k);
    adjudicated.push({
      case_id: ra.case_id,
      recipe_id: ra.recipe_id,
      relevance: ra.relevance,
      final_relevance: ra.relevance,
      reviewer_a: ra.relevance,
      reviewer_b: rb.relevance,
      reviewers: 2,
      adjudicated: true,
      agreement: true,
      notes: "A=B auto-adjudicated",
    });
  } else {
    // Conservative default: min(A,B) until human adjudicator overrides
    const final = Math.min(ra.relevance, rb.relevance);
    disagreements.push({
      case_id: ra.case_id,
      recipe_id: ra.recipe_id,
      reviewer_a: ra.relevance,
      reviewer_b: rb.relevance,
      status: "disagreement",
      provisional_final: final,
      final_relevance: null,
      adjudication_notes: "Awaiting human adjudication; provisional uses min(A,B)",
    });
    adjudicated.push({
      case_id: ra.case_id,
      recipe_id: ra.recipe_id,
      relevance: final,
      final_relevance: final,
      reviewer_a: ra.relevance,
      reviewer_b: rb.relevance,
      reviewers: 2,
      adjudicated: false,
      agreement: false,
      provisional: true,
      notes: "Disagreement — provisional min(A,B); mark adjudicated after review",
    });
  }
}

const disagreePath = resolve(dir, "disagreements.jsonl");
const outPath = resolve(dir, "recipe_relevance.adjudicated.jsonl");
writeJsonl(disagreePath, disagreements);
writeJsonl(outPath, adjudicated);

const report = {
  generated_at: new Date().toISOString(),
  total_pairs: allKeys.size,
  agreed: agreed.length,
  disagreements: disagreements.filter((d) => d.status === "disagreement").length,
  missing_reviewer: disagreements.filter((d) => d.status === "missing_reviewer").length,
  agreement_rate: allKeys.size ? agreed.length / allKeys.size : null,
  freeze_ready: disagreements.length === 0,
  outputs: {
    disagreements: disagreePath,
    adjudicated: outPath,
  },
};

writeFileSync(resolve(dir, "adjudication_report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
