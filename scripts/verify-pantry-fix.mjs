/**
 * End-to-end verification of pantry matching against live Supabase recipes.
 * Mirrors the fixed extractIngredientLabel + scoring rules.
 */
import { readFileSync } from "node:fs";

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
const key = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

const STOP = new Set(
  "fresh dried ground chopped diced sliced minced peeled seeded crushed whole large small medium optional plus more for serving taste about divided packed cups cup tablespoons tablespoon tbsp teaspoons teaspoon tsp ounces ounce oz pounds pound lbs lb grams gram kg ml and or the a an of to into with as needed such like".split(
    " "
  )
);

const extractIngredientLabel = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value !== "object" || Array.isArray(value)) return "";
  const direct = value.name ?? value.ingredient ?? value.item ?? value.text ?? value.ingredient_name;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return "";
};

const singularize = (token) => {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us")) return token.slice(0, -1);
  return token;
};

const normalize = (name) =>
  String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokensOf = (name) =>
  normalize(name)
    .split(/\s+/)
    .map(singularize)
    .filter((t) => t.length > 1 && !STOP.has(t));

const namesOverlap = (a, b) => {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const ta = tokensOf(na);
  const tb = tokensOf(nb);
  if (!ta.length || !tb.length) return false;
  const setB = new Set(tb);
  const hits = ta.filter((t) => setB.has(t)).length;
  if (hits >= 1 && (ta.length === 1 || tb.length === 1)) return true;
  return hits >= Math.min(2, Math.min(ta.length, tb.length));
};

function score(pantry, recipe) {
  const labels = (recipe.ingredients || []).map(extractIngredientLabel).filter(Boolean);
  let matched = 0;
  const used = new Set();
  for (const label of labels) {
    const hit = pantry.find((p) => namesOverlap(p, label));
    if (hit) {
      matched++;
      used.add(normalize(hit));
    }
  }
  const recipeCoverage = labels.length ? Math.round((matched / labels.length) * 100) : 0;
  const pantryCoverage = pantry.length ? Math.round((used.size / pantry.length) * 100) : 0;
  const blended = Math.round(recipeCoverage * 0.7 + pantryCoverage * 0.3);
  const matchPercentage = Math.min(100, Math.max(recipeCoverage, blended) + (matched >= 3 ? 5 : 0));
  return { matched, total: labels.length, recipeCoverage, pantryCoverage, matchPercentage };
}

function keep(match, pantrySize) {
  if (match.total === 0) return false;
  const density = match.matched / match.total;
  if (match.total >= 20 && density < 0.35) return false;
  if (match.matched >= 3 && density >= 0.25) return true;
  if (match.matched >= 2 && match.matchPercentage >= 15) return true;
  if (match.matched >= 1 && pantrySize <= 2 && match.pantryCoverage >= 50) return true;
  return match.matchPercentage >= 18 && match.matched >= 1;
}

const all = [];
for (let from = 0; from < 4000; from += 1000) {
  const res = await fetch(
    `${url}/rest/v1/recipes?select=id,name,ingredients&ingredients=not.is.null&offset=${from}&limit=1000`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) break;
  all.push(...rows);
  if (rows.length < 1000) break;
}

// Simulate expand of a single typed string like the UI bug
function expandTyped(raw) {
  const COMPOUND = ["palm oil","olive oil","scotch bonnet","tomato paste","fava beans","curry powder","stock cube","chicken stock","bell pepper","peanut butter"];
  let masked = raw.toLowerCase();
  const compounds = [];
  for (const phrase of COMPOUND.sort((a,b)=>b.length-a.length)) {
    if (masked.includes(phrase)) { compounds.push(phrase); masked = masked.replaceAll(phrase, " "); }
  }
  const words = masked.split(/[,\s]+/).filter((w) => w.length >= 3);
  return [...compounds, ...words];
}

const cases = [
  ["chicken", "onion", "tomato", "garlic", "rice"],
  expandTyped("tomatoes garlic onions rice"),
  expandTyped("chicken, onion, tomato, garlic, rice"),
  ["onion", "garlic", "tomato"],
  ["beans", "palm oil", "pepper"],
  expandTyped("beans palm oil pepper"),
  ["fava beans", "parsley", "garlic", "onion"],
  ["chicken", "noodles", "carrot", "celery"],
  ["tomatoes"],
];

let failed = 0;
for (const pantry of cases) {
  const scored = all
    .map((r) => ({ name: r.name, ...score(pantry, r) }))
    .filter((m) => keep(m, pantry.length))
    .sort(
      (a, b) =>
        b.matchPercentage - a.matchPercentage ||
        b.matched / b.total - a.matched / a.total ||
        b.matched - a.matched
    );

  const top = scored.slice(0, 5).map((x) => `${x.name} [${x.matched}/${x.total} · ${x.matchPercentage}%]`);
  const ok = scored.length >= 3;
  if (!ok) failed++;
  console.log(JSON.stringify({ pantry, matches: scored.length, ok, top }, null, 2));
}

// Shape coverage
let withItemOnly = 0;
let extractable = 0;
for (const r of all) {
  const labels = (r.ingredients || []).map(extractIngredientLabel).filter(Boolean);
  if (labels.length) extractable++;
  const first = r.ingredients?.[0];
  if (first && typeof first === "object" && first.item && !first.name && !first.text) withItemOnly++;
}
console.log(JSON.stringify({ totalRecipes: all.length, extractable, withItemOnlySampledFirst: withItemOnly, failed }, null, 2));
if (failed) process.exit(1);
console.log("PASS");
