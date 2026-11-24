/**
 * Offline pantry cookability eval harness.
 *
 * Usage:
 *   node --experimental-strip-types scripts/run-pantry-benchmark.mjs
 *   node --experimental-strip-types scripts/run-pantry-benchmark.mjs --split development,safety
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import { precisionAtK, ndcgAtK, mean } from "../benchmarks/pantry/metrics/ranking.mjs";
import { falseReadyRate, missingIngredientStats } from "../benchmarks/pantry/metrics/cookability.mjs";
import { runCase as runOverlap } from "../benchmarks/pantry/runners/overlap.mjs";
import { runCase as runQuantity } from "../benchmarks/pantry/runners/quantity_aware.mjs";
import { runCase as runProduction } from "../benchmarks/pantry/runners/production.mjs";
import { runCase as runRandom } from "../benchmarks/pantry/runners/random.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const benchRoot = resolve(root, "benchmarks/pantry");

const splitArg = (() => {
  const i = process.argv.indexOf("--split");
  return i >= 0 ? process.argv[i + 1] : "development,safety,validation";
})();
const splits = splitArg.split(",").map((s) => s.trim()).filter(Boolean);

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function gitCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function loadSnapshot(name) {
  const p = resolve(benchRoot, "snapshots", name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function relevantMin(mode) {
  return mode === "shop_first" ? 1 : 2;
}

function evaluateSystem(systemName, runFn, cases) {
  const latencies = [];
  const p5 = [];
  const ndcgs = [];
  const readyPreds = [];
  const missingRecalls = [];
  const missingPrecisions = [];
  let criticalViolations = 0;
  let resolutionCorrect = 0;
  let resolutionTotal = 0;
  const failures = [];

  for (const c of cases) {
    const mode = c.mode || "cook_now";
    const result = runFn(c, { mode });
    latencies.push(result.latencyMs || 0);

    const rel = c.gold?.relevance || {};
    const rmin = relevantMin(mode);
    const prec = precisionAtK(result.ranked, rel, 5, rmin);
    if (Object.values(rel).filter((v) => v >= rmin).length >= 1) {
      p5.push(prec.precision);
    }
    const nd = ndcgAtK(result.ranked, rel, 5);
    if (nd.ndcg != null) ndcgs.push(nd.ndcg);

    for (const pred of result.predictions || []) {
      readyPreds.push({
        labeledReady: pred.labeledReady,
        goldRelevance: pred.goldRelevance,
        safetyFail: pred.safetyFail,
      });
      if (pred.safetyFail) {
        criticalViolations++;
        failures.push({
          case_id: c.id,
          recipe_id: pred.recipeId,
          type: "critical_safety_ready",
        });
      }

      const goldMissing = c.gold?.essential_missing_by_recipe?.[pred.recipeId];
      if (goldMissing) {
        const stats = missingIngredientStats(pred.missingIngredients, goldMissing);
        missingRecalls.push(stats.recall);
        missingPrecisions.push(stats.precision);
        if (pred.labeledReady && goldMissing.length > 0) {
          failures.push({
            case_id: c.id,
            recipe_id: pred.recipeId,
            type: "false_ready_missing_essential",
            missing: goldMissing,
          });
        }
      }
    }

    // Production soft-ready false ready vs gold cook_now
    if (mode === "cook_now") {
      for (const pred of result.predictions || []) {
        if (pred.productionCanMakeNow && (pred.goldRelevance ?? 0) < 2) {
          failures.push({
            case_id: c.id,
            recipe_id: pred.recipeId,
            type: "production_soft_false_ready",
          });
        }
      }
    }

    for (const [pid, goldRes] of Object.entries(c.gold?.resolution || {})) {
      resolutionTotal++;
      // Offline runners don't yet emit resolution; count clarify cases as pass if not guessed ready
      if (goldRes.outcome === "clarify") {
        const anyReady = (result.predictions || []).some((p) => p.labeledReady);
        if (!anyReady || mode === "shop_first") resolutionCorrect++;
      } else if (goldRes.outcome === "resolved") {
        resolutionCorrect++; // placeholder until resolution tracer lands
      }
    }
  }

  const fr = falseReadyRate(readyPreds);
  const sortedLat = [...latencies].sort((a, b) => a - b);
  const p95 = sortedLat.length
    ? sortedLat[Math.min(sortedLat.length - 1, Math.floor(sortedLat.length * 0.95))]
    : null;

  return {
    system: systemName,
    cases: cases.length,
    metrics: {
      precision_at_5: mean(p5),
      ndcg_at_5: mean(ndcgs),
      false_ready_rate: fr.rate,
      false_ready_count: fr.falseReady,
      ready_labeled_count: fr.readyCount,
      essential_missing_ingredient_recall: mean(missingRecalls),
      essential_missing_ingredient_precision: mean(missingPrecisions),
      critical_constraint_violations: criticalViolations,
      resolution_proxy_accuracy: resolutionTotal ? resolutionCorrect / resolutionTotal : null,
      p95_latency_ms: p95,
      mean_latency_ms: mean(latencies),
      mean_cost_per_request: 0,
    },
    failure_sample: failures.slice(0, 40),
    failure_count: failures.length,
  };
}

const cases = [];
for (const split of splits) {
  cases.push(...readJsonl(resolve(benchRoot, "cases", `${split}.jsonl`)));
}

if (!cases.length) {
  console.error("No cases found. Run: node scripts/generate-pantry-benchmark-cases.mjs");
  process.exit(1);
}

const catalog = loadSnapshot("catalog_version.json");
const graph = loadSnapshot("ingredient_graph_version.json");
const commit = gitCommit();

const systems = [
  ["random_baseline", runRandom],
  ["overlap_baseline", runOverlap],
  ["quantity_aware_baseline", runQuantity],
  ["production_matcher", runProduction],
];

const results = systems.map(([name, fn]) => evaluateSystem(name, fn, cases));

const report = {
  run_id: `pantry-eval-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  benchmark_version: "1.0.0",
  catalog_version: catalog?.catalog_version ?? null,
  ingredient_graph_version: graph?.ingredient_graph_version ?? null,
  system_version: commit,
  model_version: null,
  prompt_version: null,
  splits,
  case_count: cases.length,
  mode_note: "cook_now relevance≥2; shop_first relevance≥1",
  systems: results,
  gates: {
    // Release gates apply to production_matcher; other systems are ablations/baselines.
    critical_safety: {
      pass: results
        .filter((r) => r.system === "production_matcher")
        .every((r) => r.metrics.critical_constraint_violations === 0),
      detail: results.map((r) => ({
        system: r.system,
        violations: r.metrics.critical_constraint_violations,
      })),
    },
    false_ready_rate_lt_2pct: {
      pass: results
        .filter((r) => r.system === "production_matcher")
        .every((r) => (r.metrics.false_ready_rate ?? 1) < 0.02),
      detail: results.map((r) => ({ system: r.system, rate: r.metrics.false_ready_rate })),
    },
    beats_overlap_ndcg: {
      pass: (() => {
        const prod = results.find((r) => r.system === "production_matcher");
        const overlap = results.find((r) => r.system === "overlap_baseline");
        if (!prod || !overlap) return false;
        if (prod.metrics.ndcg_at_5 == null || overlap.metrics.ndcg_at_5 == null) return false;
        return prod.metrics.ndcg_at_5 >= overlap.metrics.ndcg_at_5;
      })(),
    },
  },
};

const reportDir = resolve(benchRoot, "reports");
mkdirSync(reportDir, { recursive: true });
const outPath = resolve(reportDir, `${report.run_id}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));
writeFileSync(resolve(reportDir, "latest.json"), JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  run_id: report.run_id,
  case_count: report.case_count,
  gates: report.gates,
  systems: results.map((r) => ({
    system: r.system,
    precision_at_5: r.metrics.precision_at_5,
    ndcg_at_5: r.metrics.ndcg_at_5,
    false_ready_rate: r.metrics.false_ready_rate,
    essential_missing_ingredient_recall: r.metrics.essential_missing_ingredient_recall,
    critical_constraint_violations: r.metrics.critical_constraint_violations,
    failure_count: r.failure_count,
  })),
  report: outPath,
}, null, 2));
