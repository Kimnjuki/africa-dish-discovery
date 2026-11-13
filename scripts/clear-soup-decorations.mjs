/**
 * One-off: the soup cookbook docx has no dish photos. Its media files are
 * fraction glyphs and ornaments that were stored as recipe images.
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
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / service key");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const filter = "image_url=like.*cookbooks/soup/*";
const before = await fetch(`${url}/rest/v1/recipes?${filter}&select=id`, { headers });
if (!before.ok) {
  console.error("select failed", before.status, await before.text());
  process.exit(1);
}
const rows = await before.json();
console.log("matched", rows.length);

const patch = await fetch(`${url}/rest/v1/recipes?${filter}`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify({ image_url: null }),
});
console.log("patch", patch.status);
if (!patch.ok) {
  console.error(await patch.text());
  process.exit(1);
}

const after = await fetch(`${url}/rest/v1/recipes?${filter}&select=id`, { headers });
const left = await after.json();
console.log("remaining", Array.isArray(left) ? left.length : left);

const fragments = [
  "Bean sprouts",
  "beans (or white pea beans)",
  "Black pepper",
  "Cinnamon",
  "Coarse salt",
  "Crushed basil or oregano leaves",
  "Easy Slicing with the Mandolin",
  "Freshly ground black pepper",
  "Juice of 2 lemons",
  "Juice of 2 small lemons, divided",
  "kidney beans",
  "Paprika",
  "Parmesan Topping:",
  "Topping:",
  "White pepper",
];
const removed = [];
for (const name of fragments) {
  const del = await fetch(
    `${url}/rest/v1/recipes?name=eq.${encodeURIComponent(name)}&tags=cs.{Everything%20Soup%20Cookbook}`,
    { method: "DELETE", headers: { ...headers, Prefer: "return=representation" } }
  );
  const body = del.ok ? await del.json() : await del.text();
  if (!del.ok) console.error("delete failed", name, del.status, body);
  else if (Array.isArray(body) && body.length) removed.push(body[0].name);
}
console.log("removed fragments", removed.length, removed);
