/**
 * Promote a user to admin by email.
 * Usage: node scripts/seed-admin.mjs you@example.com
 */
import { readFileSync } from "node:fs";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs you@example.com");
  process.exit(1);
}

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
  console.error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, { headers });
if (!listRes.ok) {
  console.error("Failed to list users", await listRes.text());
  process.exit(1);
}
const listed = await listRes.json();
const users = listed.users || listed;
const user = (Array.isArray(users) ? users : []).find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`No auth user found for ${email}. Sign up on /auth first, then rerun.`);
  process.exit(1);
}

const upsert = await fetch(`${url}/rest/v1/user_roles?on_conflict=user_id,role`, {
  method: "POST",
  headers: {
    ...headers,
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify([{ user_id: user.id, role: "admin" }]),
});

if (!upsert.ok) {
  // fallback plain insert
  const insert = await fetch(`${url}/rest/v1/user_roles`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify([{ user_id: user.id, role: "admin" }]),
  });
  if (!insert.ok) {
    console.error("Failed to seed admin role", await insert.text());
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, email, user_id: user.id, role: "admin" }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({ ok: true, email, user_id: user.id, role: "admin" }, null, 2));
