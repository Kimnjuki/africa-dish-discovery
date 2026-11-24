/**
 * Household A/B assignment sanity checks.
 * Run: node --experimental-strip-types scripts/test-pantry-experiment.ts
 */
import {
  assignPantryVariant,
  hashHousehold,
  estimateSampleSizePerArm,
  PANTRY_EXPERIMENT_ID,
} from "../src/lib/pantryExperiment.ts";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("stable assignment");
{
  const a = assignPantryVariant("hh-alpha");
  const b = assignPantryVariant("hh-alpha");
  assert(a === b, "same household → same variant");
  assert(a === "control" || a === "treatment", "variant is control|treatment");
  assert(hashHousehold("x") === hashHousehold("x"), "hash stable");
}

console.log("force + kill switch");
{
  assert(assignPantryVariant("hh", { force: "control" }) === "control", "force control");
  assert(assignPantryVariant("hh", { enabled: false }) === "treatment", "experiment off → treatment");
}

console.log("sample size planner");
{
  const s = estimateSampleSizePerArm({ baselineRate: 0.25, mde: 0.05 });
  assert(s.perArm > 100, `perArm sensible (${s.perArm})`);
  assert(s.total === s.perArm * 2, "total = 2 * perArm");
  assert(PANTRY_EXPERIMENT_ID === "pantry_cookability_v1", "experiment id");
}

console.log("\n" + "=".repeat(40));
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
