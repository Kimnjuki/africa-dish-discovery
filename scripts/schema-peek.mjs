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
const res = await fetch(`${url}/rest/v1/recipes?select=*&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const rows = await res.json();
console.log(Object.keys(rows[0] || {}).sort().join("\n"));
