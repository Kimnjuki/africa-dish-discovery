import { readFileSync } from "node:fs";

const slug = process.argv[2] || "cucumber-soup-soup";
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
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const rows = await fetch(
  `${url}/rest/v1/recipes?select=id,name,slug,image_url&slug=eq.${encodeURIComponent(slug)}`,
  { headers }
).then((r) => r.json());
const img = rows[0]?.image_url;
if (!img) {
  console.log(JSON.stringify({ slug, rows }, null, 2));
  process.exit(1);
}
const res = await fetch(img);
const buf = Buffer.from(await res.arrayBuffer());
console.log(
  JSON.stringify(
    {
      recipe: rows[0],
      status: res.status,
      ctype: res.headers.get("content-type"),
      bytes: buf.length,
      magic: buf.slice(0, 4).toString("hex"),
    },
    null,
    2
  )
);
