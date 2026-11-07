import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Re-run just the egypt parser by eval of the functions — duplicate light check
const paras = JSON.parse(readFileSync("data/cookbooks/egypt/paragraphs.json", "utf8"));

function isEgyptTitle(line) {
  if (!line || line.length < 3 || line.length > 90) return false;
  if (/^(Active Time|MAKES|SERVES|Equipment|Plan Ahead|CHAPTER|CONTENTS)/i.test(line)) return false;
  const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  const upper = letters.replace(/[^A-ZÀ-Ÿ]/g, "").length;
  return upper / letters.length >= 0.85;
}

let titles = 0;
const names = [];
for (let i = 0; i < paras.length; i++) {
  if (!isEgyptTitle(paras[i])) continue;
  let marker = -1;
  for (let k = i + 1; k < Math.min(i + 6, paras.length); k++) {
    if (/^Active Time:/i.test(paras[k]) || /^MAKES\b/i.test(paras[k])) {
      marker = k;
      break;
    }
    if (isEgyptTitle(paras[k])) break;
  }
  if (marker < 0) continue;
  titles++;
  names.push(paras[i]);
}
console.log({ titles, sample: names.slice(0, 20), last: names.slice(-10) });

// How many Active Time markers total?
const active = paras.filter((p) => /^Active Time:/i.test(p)).length;
const makes = paras.filter((p) => /^MAKES\b/i.test(p)).length;
console.log({ active, makes });
