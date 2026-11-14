/**
 * Acceptance checks for local market intelligence + ranked substitutions.
 * Run: npm run test:market
 */
import {
  estimateRecipeCost,
  formatMoney,
  getIngredientMarketInfo,
  rankSubstitutesForMarket,
  resolveMarketId,
} from "../src/lib/localMarket.ts";
import {
  lookupRankedSubstitutions,
  lookupSubstitutions,
  bestCookSubstitutionPrompt,
} from "../src/lib/substitutionGraph.ts";

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

console.log("resolveMarketId");
{
  assert(resolveMarketId("Nigeria") === "ng", "Nigeria → ng");
  assert(resolveMarketId("Kenya") === "ke", "Kenya → ke");
  assert(resolveMarketId("South Africa") === "za", "South Africa → za");
}

console.log("ingredient market info");
{
  const palm = getIngredientMarketInfo("red palm oil", {
    marketId: "ng",
    quantity: 0.25,
    unit: "l",
  });
  assert(palm.stall === "oil_pantry", "palm oil → oil_pantry stall");
  assert(palm.estimatedCost !== null && palm.estimatedCost > 0, "palm oil has NG cost");
  assert(palm.availability >= 90, "palm oil highly available in NG");

  const ugwuKe = getIngredientMarketInfo("ugwu", { marketId: "ke" });
  assert(ugwuKe.availability < 40, "ugwu scarce in Kenya");
}

console.log("ranked substitutions prefer local availability");
{
  const hits = lookupRankedSubstitutions("ugwu", {
    marketId: "ke",
    preferCheap: true,
    limit: 3,
  });
  assert(hits.length >= 1, "ugwu has ranked substitutes");
  assert(hits[0].market.availability >= 50, "top KE substitute is reasonably available");
  const prompt = bestCookSubstitutionPrompt("ugwu", { marketId: "ng" });
  assert(!!prompt?.cookAdjustment?.prompt || !!prompt?.cookHint, "cook prompt present for ugwu");
}

console.log("rankSubstitutesForMarket diet filter");
{
  const ranked = rankSubstitutesForMarket(
    [
      { name: "spinach", compatibilityScore: 80 },
      { name: "beef", compatibilityScore: 90 },
    ],
    { marketId: "ng", diet: ["vegetarian"], preferCheap: true }
  );
  assert(ranked[0].name === "spinach", "vegetarian diet prefers spinach over beef");
}

console.log("egusi / plantain cook prompts");
{
  const egusi = lookupSubstitutions("egusi");
  assert(egusi.some((h) => /pumpkin|sunflower/i.test(h.name)), "egusi has oilseed swaps");
  const plantain = bestCookSubstitutionPrompt("green plantain", { marketId: "ke" });
  assert(!!plantain, "plantain has a cook-time substitute");
}

console.log("estimateRecipeCost");
{
  const est = estimateRecipeCost(
    [
      { name: "rice", quantity: 1, unit: "kg" },
      { name: "tomato", quantity: 500, unit: "g" },
    ],
    "ke"
  );
  assert(est.pricedCount === 2, "both ingredients priced");
  assert(est.total > 0, "KE recipe cost > 0");
  assert(formatMoney(est.total, "ke").length > 1, "formats KES");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
