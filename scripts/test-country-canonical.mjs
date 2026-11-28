/**
 * Country canonical redirects must match nginx.conf.
 * Run: node scripts/test-country-canonical.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalCountrySlug,
  countryDisplayName,
  countryPath,
  countryQueryNames,
  facetCountryLabel,
  listCanonicalRedirects,
  sameCountry,
} from "../src/lib/countryCanonical.mjs";
import { canonicalForFacetUrl } from "../src/lib/facetIndexation.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nginx = readFileSync(resolve(root, "nginx.conf"), "utf8");

function assert(cond, message) {
  if (!cond) {
    console.error("FAIL", message);
    process.exitCode = 1;
  }
}

assert(canonicalCountrySlug("it") === "italy", "it → italy");
assert(canonicalCountrySlug("usa") === "united-states", "usa → united-states");
assert(canonicalCountrySlug("us") === "united-states", "us → united-states");
assert(canonicalCountrySlug("italy") === "italy", "italy stays italy");
assert(canonicalCountrySlug("greece-usa") === null, "fusion labels are not indexable");
assert(canonicalCountrySlug("el-salvador") === "el-salvador", "real countries pass through");
assert(countryDisplayName("it") === "Italy", "display name for alias slug");
assert(countryPath("USA") === "/country/united-states", "country path uses the full slug");
assert(countryPath("Greece USA") === "/countries", "fusion labels link to the country index");
assert(countryQueryNames("italy").includes("Italy"), "Italy query includes Italy");
assert(countryQueryNames("italy").includes("IT"), "Italy query includes IT");
assert(sameCountry("IT", "Italy"), "IT and Italy are the same country");
assert(!sameCountry("Italy", "France"), "Italy and France stay distinct");
assert(facetCountryLabel("USA") === "United States", "facet label collapses USA");

const facet = canonicalForFacetUrl(new URLSearchParams("country=IT"));
assert(
  facet === "https://www.ladhaquest.com/recipe-index?country=Italy",
  `facet canonical collapses IT, got ${facet}`
);

const redirects = listCanonicalRedirects();
assert(redirects.some((r) => r.from === "/index.html" && r.to === "/"), "index.html redirect");
for (const redirect of redirects) {
  const from = redirect.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const to = redirect.to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${from}\\s+${to}\\s*;`);
  assert(re.test(nginx), `nginx missing ${redirect.from} → ${redirect.to}`);
}

assert(nginx.includes("location @spa"), "SPA fallback is a named location");
assert(nginx.includes("rewrite ^ /index.html break;"), "fallback does not re-enter /index.html");
assert(!/try_files[^;]*\/index\.html;/.test(nginx), "try_files must not internal-redirect to /index.html");

if (process.exitCode) {
  process.exit(process.exitCode);
}
console.log(`ok (${redirects.length} redirects checked against nginx.conf)`);
