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
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(
  `${url}/rest/v1/recipes?select=difficulty&difficulty=not.is.null&limit=200`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const rows = await res.json();
const counts = {};
for (const r of rows) counts[r.difficulty] = (counts[r.difficulty] || 0) + 1;
console.log(counts);

// Probe allowed values
for (const d of ["Easy", "Medium", "Hard", "easy", "medium", "hard", "Beginner", "Intermediate", "Advanced", null]) {
  const probe = {
    name: `__probe_${d ?? "null"}__`,
    slug: `probe-diff-${String(d)}-${Date.now()}`,
    country: "Test",
    continent: "Africa",
    is_african: true,
    difficulty: d,
    ingredients: [{ name: "salt" }],
    steps: [{ text: "mix" }],
    item_type: "recipe",
  };
  const r = await fetch(`${url}/rest/v1/recipes`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(probe),
  });
  const body = await r.text();
  console.log(d, r.status, body.slice(0, 120));
  if (r.ok) {
    const id = JSON.parse(body)[0]?.id;
    if (id) {
      await fetch(`${url}/rest/v1/recipes?id=eq.${id}`, {
        method: "DELETE",
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
    }
  }
}
