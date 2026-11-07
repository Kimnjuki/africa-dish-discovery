import { readFileSync } from "node:fs";
const paras = JSON.parse(readFileSync("data/cookbooks/egypt/paragraphs.json", "utf8"));

const patterns = [
  /cups?\b/i,
  /tablespoons?\b/i,
  /teaspoons?\b/i,
  /Preheat/i,
  /SERVES/i,
  /Makes\b/i,
  /minutes\b/i,
  /Combine\b/i,
  /Whisk\b/i,
];

let hits = 0;
for (let i = 0; i < paras.length; i++) {
  if (patterns.some((re) => re.test(paras[i]))) {
    console.log(i, paras[i]);
    hits++;
    if (hits > 40) break;
  }
}
console.log("total paras", paras.length);
console.log("unique length>40", paras.filter((p) => p.length > 40).length);
console.log("long samples", paras.filter((p) => p.length > 80).slice(0, 20));
