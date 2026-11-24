/**
 * Validate & append cooking-pilot log rows (20–30 household discovery pilot).
 *
 * Usage:
 *   npm run pilot:cooking:log -- --file pilots/example.json
 *   npm run pilot:cooking:status
 *   node scripts/log-cooking-pilot.mjs --status
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pilotDir = resolve(root, "benchmarks/pantry/pilots");
const logPath = resolve(pilotDir, "cooking-pilot-log.jsonl");
const schemaPath = resolve(pilotDir, "cooking-pilot-log.schema.json");
const rosterPath = resolve(pilotDir, "household-roster.json");

mkdirSync(pilotDir, { recursive: true });

const STATUS = process.argv.includes("--status");
const fileIdx = process.argv.indexOf("--file");
const SAMPLE = process.argv.includes("--seed-sample");

function loadLog() {
  if (!existsSync(logPath)) return [];
  return readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function validateRow(row, schema) {
  const errors = [];
  for (const key of schema.required || []) {
    if (row[key] == null || row[key] === "") errors.push(`missing ${key}`);
  }
  if (row.would_use_again != null) {
    const n = Number(row.would_use_again);
    if (!Number.isInteger(n) || n < 1 || n > 5) errors.push("would_use_again must be 1–5");
  }
  if (row.substitution_worked != null && !["yes", "no", "n/a"].includes(row.substitution_worked)) {
    errors.push("substitution_worked must be yes|no|n/a");
  }
  if (row.servings_sufficient != null && !["yes", "no", "n/a"].includes(row.servings_sufficient)) {
    errors.push("servings_sufficient must be yes|no|n/a");
  }
  if (row.safety_incident === true && !row.notes) {
    errors.push("safety_incident requires notes");
  }
  return errors;
}

if (!existsSync(rosterPath)) {
  writeFileSync(
    rosterPath,
    JSON.stringify(
      {
        target_households: 30,
        min_households: 20,
        markets: ["ke", "ng", "gh", "za", "diaspora"],
        consented: [],
        notes: "Add { household_id, market, consented_at } rows as recruits enroll.",
      },
      null,
      2
    )
  );
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

if (SAMPLE && !existsSync(logPath)) {
  const sample = [
    {
      household_id: "hh-pilot-001",
      case_date: "2026-11-20",
      market: "ke",
      recipe_id: "r-ugali-sukuma",
      system_version: "75f597f",
      meal_success_no_unplanned_shop: true,
      time_to_suitable_dish_sec: 95,
      pantry_corrections: 1,
      substitution_worked: "n/a",
      servings_sufficient: "yes",
      would_use_again: 5,
      false_ready_reported: false,
      safety_incident: false,
      notes: "Sample template row — replace with real pilot data",
    },
  ];
  writeFileSync(logPath, sample.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log("Seeded sample pilot log row");
}

if (STATUS || (!SAMPLE && fileIdx < 0)) {
  const rows = loadLog();
  const households = new Set(rows.map((r) => r.household_id));
  const falseReady = rows.filter((r) => r.false_ready_reported).length;
  const safety = rows.filter((r) => r.safety_incident).length;
  const success = rows.filter((r) => r.meal_success_no_unplanned_shop === true).length;
  const gateClean = safety === 0 && falseReady === 0;
  const enoughHouseholds = households.size >= 20;
  console.log(
    JSON.stringify(
      {
        log_rows: rows.length,
        unique_households: households.size,
        target_range: "20–30",
        meal_success_rate: rows.length ? success / rows.length : null,
        false_ready_reports: falseReady,
        safety_incidents: safety,
        pilot_gate_clean: gateClean,
        ready_for_online_ab: gateClean && enoughHouseholds,
        next:
          !enoughHouseholds
            ? `Recruit ${20 - households.size}+ more households and log cooks`
            : !gateClean
              ? "Investigate false-ready / safety before online A/B"
              : "Pilot clean — enable online A/B (VITE_PANTRY_EXPERIMENT=1)",
      },
      null,
      2
    )
  );
  if (fileIdx < 0) process.exit(0);
}

if (fileIdx >= 0) {
  const src = resolve(process.cwd(), process.argv[fileIdx + 1]);
  const raw = JSON.parse(readFileSync(src, "utf8"));
  const rows = Array.isArray(raw) ? raw : [raw];
  const existing = loadLog();
  const out = [...existing];
  for (const row of rows) {
    const errors = validateRow(row, schema);
    if (errors.length) {
      console.error("Invalid row:", errors, row);
      process.exit(1);
    }
    out.push(row);
  }
  writeFileSync(logPath, out.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log(JSON.stringify({ appended: rows.length, total: out.length, logPath }, null, 2));
}
