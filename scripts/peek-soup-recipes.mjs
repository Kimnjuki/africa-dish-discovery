import { readFileSync } from "node:fs";
const paras = JSON.parse(readFileSync("data/cookbooks/soup/paragraphs.json", "utf8"));
const idx = paras.findIndex((p) => p === "Potato and Vegetable Broth");
console.log(paras.slice(idx, idx + 40).map((p, i) => `${i}: ${p}`).join("\n"));
const idx2 = paras.findIndex((p) => /Chicken Noodle Soup/i.test(p));
console.log("\n==== chicken", idx2);
console.log(paras.slice(idx2, idx2 + 45).map((p, i) => `${i}: ${p}`).join("\n"));
