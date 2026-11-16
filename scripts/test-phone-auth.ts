/**
 * Phone E.164 normalization checks.
 * Run: npm run test:phone
 */
import { isValidE164, toE164 } from "../src/lib/phoneAuth.ts";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("toE164 Kenya");
{
  assert(toE164("0712345678", "254") === "+254712345678", "trunk 0 → +254");
  assert(toE164("712345678", "254") === "+254712345678", "local without 0");
  assert(toE164("+254712345678", "254") === "+254712345678", "already E.164");
  assert(toE164("254712345678", "254") === "+254712345678", "digits with country");
}

console.log("toE164 Nigeria");
{
  assert(toE164("08012345678", "234") === "+2348012345678", "NG trunk 0");
}

console.log("isValidE164");
{
  assert(isValidE164("+254712345678"), "valid KE");
  assert(!isValidE164("0712345678"), "local invalid as E.164");
  assert(!isValidE164("+0123"), "leading zero country invalid");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
