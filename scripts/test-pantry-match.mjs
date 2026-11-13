/**
 * Reproduce pantry matching against live recipe ingredient shapes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

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
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

const res = await fetch(
  `${url}/rest/v1/recipes?select=id,name,ingredients&ingredients=not.is.null&limit=30`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const recipes = await res.json();

// Sample ingredient shapes
const shapes = {};
for (const r of recipes) {
  const ing = r.ingredients;
  const keyShape = Array.isArray(ing)
    ? `array:${typeof ing[0]}:${ing[0] && typeof ing[0] === "object" ? Object.keys(ing[0]).sort().join(",") : ""}`
    : typeof ing;
  shapes[keyShape] = (shapes[keyShape] || 0) + 1;
}
console.log("shapes", shapes);
console.log("sample0", JSON.stringify(recipes[0]?.ingredients?.slice?.(0, 3) ?? recipes[0]?.ingredients, null, 2));
console.log("sample1", JSON.stringify(recipes[1]?.ingredients?.slice?.(0, 3) ?? recipes[1]?.ingredients, null, 2));
console.log("sample5", JSON.stringify(recipes[5]?.ingredients?.slice?.(0, 3) ?? recipes[5]?.ingredients, null, 2));

// Inline a copy of current matcher logic for diagnosis
const STOP = new Set(["fresh","dried","ground","chopped","diced","sliced","large","small","medium","optional","plus","more","for","serving","taste","about","cups","cup","tablespoons","tablespoon","teaspoons","teaspoon","ounces","ounce","pounds","pound","grams","gram","ml","and","or","the","a","an","of","to","into","with"]);
const normalize = (name) =>
  String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const tokensOf = (name) => normalize(name).split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
const namesOverlap = (a, b) => {
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const ta = tokensOf(a);
  const tb = tokensOf(b);
  if (!ta.length || !tb.length) return false;
  const setB = new Set(tb);
  const hits = ta.filter((t) => setB.has(t)).length;
  return hits >= Math.min(2, Math.min(ta.length, tb.length)) || (hits >= 1 && (ta.includes(tb[0]) || tb.includes(ta[0])));
};

function extractName(recipeIng, mode = "fixed") {
  if (typeof recipeIng === "string") return recipeIng;
  if (!recipeIng || typeof recipeIng !== "object") return "";
  if (mode === "prod") {
    return recipeIng.name || recipeIng.ingredient || recipeIng.text || "";
  }
  return (
    recipeIng.name ||
    recipeIng.ingredient ||
    recipeIng.text ||
    recipeIng.item ||
    recipeIng.ingredient_name ||
    ""
  );
}

function matchPct(pantry, recipe, mode = "fixed") {
  const ings = recipe.ingredients || [];
  let matched = 0;
  let total = 0;
  const matchedNames = [];
  for (const ri of ings) {
    const n = extractName(ri, mode);
    if (!n) continue;
    total++;
    const rn = normalize(n);
    if (pantry.some((p) => namesOverlap(normalize(p), rn))) {
      matched++;
      matchedNames.push(n);
    }
  }
  return { matched, total, pct: total ? Math.round((matched / total) * 100) : 0, matchedNames };
}

const pantrySets = [
  ["chicken", "onion", "tomato", "garlic", "rice"],
  ["onion", "garlic", "tomato"],
  ["beans", "palm oil", "pepper"],
  ["fava beans", "parsley", "garlic", "onion"],
  ["chicken", "noodles", "carrot", "celery"],
];

// Fetch more recipes for ranking test
const allRes = await fetch(
  `${url}/rest/v1/recipes?select=id,name,ingredients&ingredients=not.is.null&limit=1000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const all = await allRes.json();
console.log("fetched", all.length);

for (const mode of ["prod", "fixed"]) {
  console.log("\n======== MODE", mode, "========");
  for (const pantry of pantrySets) {
    const scored = all
      .map((r) => ({ name: r.name, ...matchPct(pantry, r, mode) }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.pct - a.pct || b.matched - a.matched);
    const ge40 = scored.filter((x) => x.pct >= 40).length;
    const ge25 = scored.filter((x) => x.pct >= 25).length;
    const ge2 = scored.filter((x) => x.matched >= 2).length;
    const zeroTotal = all.length - scored.length;
    const top = scored.slice(0, 5).map((x) => `${x.name} ${x.pct}% (${x.matched}/${x.total})`);
    console.log("\nPANTRY", pantry.join(", "));
    console.log({ zeroTotal, ge40, ge25, matchedAtLeast2: ge2, top });
  }
}

// How many recipes have extractable names with current fields?
let emptyExtract = 0;
let nonempty = 0;
const keyCounts = {};
for (const r of all.slice(0, 200)) {
  const ings = r.ingredients;
  if (!Array.isArray(ings) || !ings.length) {
    emptyExtract++;
    continue;
  }
  const first = ings[0];
  if (typeof first === "object" && first) {
    for (const k of Object.keys(first)) keyCounts[k] = (keyCounts[k] || 0) + 1;
  }
  const names = ings.map(extractName).filter(Boolean);
  if (!names.length) emptyExtract++;
  else nonempty++;
}
console.log("\nextractability", { emptyExtract, nonempty, keyCounts });
