/**
 * Lightweight acceptance checks for offlineStore helpers (no DOM storage polyfill needed beyond localStorage).
 * Run: node --experimental-strip-types scripts/test-offline-store.ts
 */

import assert from "node:assert/strict";
import { lighterImageUrl } from "../src/lib/offlineStore.ts";

let passed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`ok  ${name}`);
  } catch (err) {
    console.error(`fail ${name}`);
    throw err;
  }
}

check("lighterImageUrl leaves URL alone when data-saver off", () => {
  const url = "https://images.unsplash.com/photo-123?w=1200";
  assert.equal(lighterImageUrl(url, false), url);
});

check("lighterImageUrl shrinks Unsplash when data-saver on", () => {
  const url = "https://images.unsplash.com/photo-123?w=1200";
  const out = lighterImageUrl(url, true)!;
  assert.match(out, /w=480/);
  assert.match(out, /q=60/);
});

check("lighterImageUrl null-safe", () => {
  assert.equal(lighterImageUrl(null, true), null);
  assert.equal(lighterImageUrl(undefined, false), null);
});

console.log(`\n${passed}/3 offlineStore checks passed`);
