/**
 * Notify Bing (and other IndexNow engines) that sitemap URLs changed.
 *
 * The key file must be publicly reachable before this succeeds:
 *   https://www.ladhaquest.com/<key>.txt
 *
 * Run: npm run indexnow
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const site = "https://www.ladhaquest.com";
const host = "www.ladhaquest.com";
const endpoint = "https://api.indexnow.org/indexnow";
const batchSize = 10000;

function findKey() {
  const match = readdirSync(publicDir).find((name) => /^[a-f0-9]{32}\.txt$/i.test(name));
  if (!match) {
    throw new Error("No IndexNow key file in public/. Expected public/<32-hex>.txt");
  }
  const key = match.slice(0, -4);
  const body = readFileSync(resolve(publicDir, match), "utf8").trim();
  if (body !== key) {
    throw new Error(`public/${match} must contain exactly the key ${key}`);
  }
  return key;
}

function collectUrls() {
  const files = readdirSync(publicDir).filter(
    (name) => name.startsWith("sitemap-") && name.endsWith(".xml")
  );
  const urls = new Set();
  for (const file of files) {
    const xml = readFileSync(resolve(publicDir, file), "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const loc = match[1].replace(/&amp;/g, "&").trim();
      if (loc === site || loc.startsWith(`${site}/`)) urls.add(loc);
    }
  }
  return [...urls];
}

async function assertKeyIsLive(key) {
  const keyUrl = `${site}/${key}.txt`;
  const res = await fetch(keyUrl, { redirect: "follow" });
  const body = (await res.text()).trim();
  if (!res.ok || body !== key) {
    throw new Error(
      `IndexNow key is not live at ${keyUrl} (HTTP ${res.status}). Deploy public/${key}.txt, then run npm run indexnow again.`
    );
  }
  return keyUrl;
}

async function submit(key, keyLocation, urlList) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  const text = await res.text();
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow rejected the batch (${res.status}): ${text || res.statusText}`);
  }
  return res.status;
}

const key = findKey();
const urls = collectUrls();
if (!urls.length) {
  throw new Error("No sitemap URLs found. Run npm run sitemap first.");
}

const keyLocation = await assertKeyIsLive(key);
console.log(`Submitting ${urls.length} URLs for ${host}`);

for (let i = 0; i < urls.length; i += batchSize) {
  const batch = urls.slice(i, i + batchSize);
  const status = await submit(key, keyLocation, batch);
  console.log(`Accepted ${batch.length} URLs (HTTP ${status})`);
}
