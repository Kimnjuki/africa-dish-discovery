/**
 * Africa-first local market intelligence: currency, stall mapping,
 * rough unit prices, and substitution ranking by price / diet / availability.
 * Estimates are household planning aids — not live vendor quotes.
 */

export type MarketId = "ng" | "ke" | "gh" | "za" | "eg" | "tz" | "default";

export type DietTag =
  | "vegetarian"
  | "vegan"
  | "halal"
  | "gluten_free"
  | "dairy_free"
  | "nut_free";

export type PriceTier = "budget" | "moderate" | "premium" | "specialty";

export type StallId =
  | "produce_stall"
  | "spice_stall"
  | "grain_stall"
  | "butcher"
  | "fishmonger"
  | "dairy_eggs"
  | "oil_pantry"
  | "supermarket"
  | "other";

export interface MarketProfile {
  id: MarketId;
  label: string;
  countryHints: string[];
  currency: string;
  symbol: string;
  /** Typical weekly household food budget for a family of 4 (local currency). */
  defaultWeeklyBudget: number;
  locale: string;
}

export const MARKETS: Record<MarketId, MarketProfile> = {
  ng: {
    id: "ng",
    label: "Nigeria",
    countryHints: ["nigeria", "lagos", "abuja", "ibadan"],
    currency: "NGN",
    symbol: "₦",
    defaultWeeklyBudget: 45000,
    locale: "en-NG",
  },
  ke: {
    id: "ke",
    label: "Kenya",
    countryHints: ["kenya", "nairobi", "mombasa"],
    currency: "KES",
    symbol: "KSh",
    defaultWeeklyBudget: 8500,
    locale: "en-KE",
  },
  gh: {
    id: "gh",
    label: "Ghana",
    countryHints: ["ghana", "accra", "kumasi"],
    currency: "GHS",
    symbol: "GH₵",
    defaultWeeklyBudget: 900,
    locale: "en-GH",
  },
  za: {
    id: "za",
    label: "South Africa",
    countryHints: ["south africa", "johannesburg", "cape town", "durban"],
    currency: "ZAR",
    symbol: "R",
    defaultWeeklyBudget: 1800,
    locale: "en-ZA",
  },
  eg: {
    id: "eg",
    label: "Egypt",
    countryHints: ["egypt", "cairo", "alexandria"],
    currency: "EGP",
    symbol: "E£",
    defaultWeeklyBudget: 2500,
    locale: "ar-EG",
  },
  tz: {
    id: "tz",
    label: "Tanzania",
    countryHints: ["tanzania", "dar es salaam", "arusha", "zanzibar"],
    currency: "TZS",
    symbol: "TSh",
    defaultWeeklyBudget: 90000,
    locale: "sw-TZ",
  },
  default: {
    id: "default",
    label: "African market (USD estimate)",
    countryHints: [],
    currency: "USD",
    symbol: "$",
    defaultWeeklyBudget: 60,
    locale: "en",
  },
};

export const MARKET_ORDER: MarketId[] = ["ng", "ke", "gh", "za", "eg", "tz", "default"];

export const STALL_LABELS: Record<StallId, string> = {
  produce_stall: "Produce / greens stall",
  spice_stall: "Spice & pepper stall",
  grain_stall: "Grains & staples",
  butcher: "Butcher",
  fishmonger: "Fish / seafood",
  dairy_eggs: "Dairy & eggs",
  oil_pantry: "Oil, paste & dry goods",
  supermarket: "Supermarket aisle",
  other: "Other / ask around",
};

export const STALL_ORDER: StallId[] = [
  "produce_stall",
  "spice_stall",
  "grain_stall",
  "butcher",
  "fishmonger",
  "dairy_eggs",
  "oil_pantry",
  "supermarket",
  "other",
];

const MARKET_PREF_KEY = "ladhaquest_market_id";
const DIET_PREF_KEY = "ladhaquest_diet_prefs";
const BUDGET_PREF_KEY = "ladhaquest_weekly_budget";

/** Unit price in local currency per reference unit. */
interface PriceRow {
  aliases: string[];
  /** Price per reference amount in each market currency. */
  prices: Partial<Record<MarketId, number>>;
  unit: "kg" | "l" | "piece" | "bunch" | "pack";
  stall: StallId;
  tier: PriceTier;
  availability: Partial<Record<MarketId, number>>; // 0–100
  diet: DietTag[];
}

/**
 * Curated open-market reference prices (approx. street/market mid-range, 2025–2026).
 * Missing market cells fall back to USD `default` via FX-ish ratios.
 */
const PRICE_ROWS: PriceRow[] = [
  {
    aliases: ["tomato", "tomatoes"],
    prices: { ng: 1800, ke: 120, gh: 18, za: 25, eg: 30, tz: 3500, default: 1.5 },
    unit: "kg",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 95, ke: 95, gh: 95, za: 95, eg: 95, tz: 90, default: 90 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["onion", "onions", "red onion"],
    prices: { ng: 1200, ke: 100, gh: 14, za: 20, eg: 22, tz: 2800, default: 1.2 },
    unit: "kg",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 98, ke: 98, gh: 98, za: 98, eg: 98, tz: 95, default: 95 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["garlic"],
    prices: { ng: 3500, ke: 250, gh: 40, za: 60, eg: 55, tz: 7000, default: 4 },
    unit: "kg",
    stall: "produce_stall",
    tier: "moderate",
    availability: { ng: 90, ke: 90, gh: 90, za: 95, eg: 95, tz: 85, default: 90 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["plantain", "plantains", "green plantain"],
    prices: { ng: 800, ke: 80, gh: 8, za: 30, eg: 40, tz: 2000, default: 1.8 },
    unit: "kg",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 95, ke: 70, gh: 95, za: 60, eg: 40, tz: 75, default: 70 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["spinach", "baby spinach"],
    prices: { ng: 600, ke: 50, gh: 8, za: 18, eg: 20, tz: 1500, default: 2 },
    unit: "bunch",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 90, ke: 95, gh: 90, za: 95, eg: 90, tz: 90, default: 90 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["ugwu", "ugu", "fluted pumpkin", "pumpkin leaves"],
    prices: { ng: 500, ke: 80, gh: 10, za: 35, eg: 45, tz: 2000, default: 2.5 },
    unit: "bunch",
    stall: "produce_stall",
    tier: "moderate",
    availability: { ng: 92, ke: 25, gh: 55, za: 20, eg: 15, tz: 20, default: 40 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["sukuma wiki", "sukuma", "collard greens", "collards"],
    prices: { ng: 700, ke: 30, gh: 12, za: 15, eg: 25, tz: 800, default: 1.5 },
    unit: "bunch",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 40, ke: 98, gh: 50, za: 85, eg: 40, tz: 95, default: 70 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["kale", "curly kale"],
    prices: { ng: 800, ke: 40, gh: 12, za: 18, eg: 28, tz: 1000, default: 2 },
    unit: "bunch",
    stall: "produce_stall",
    tier: "moderate",
    availability: { ng: 55, ke: 80, gh: 60, za: 90, eg: 50, tz: 70, default: 75 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["scotch bonnet", "habanero", "ata rodo", "fresh chili", "chilli"],
    prices: { ng: 2500, ke: 200, gh: 25, za: 80, eg: 60, tz: 5000, default: 5 },
    unit: "kg",
    stall: "spice_stall",
    tier: "moderate",
    availability: { ng: 95, ke: 70, gh: 90, za: 60, eg: 50, tz: 65, default: 70 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["palm oil", "red palm oil"],
    prices: { ng: 2200, ke: 280, gh: 28, za: 70, eg: 90, tz: 6500, default: 4 },
    unit: "l",
    stall: "oil_pantry",
    tier: "moderate",
    availability: { ng: 98, ke: 55, gh: 95, za: 50, eg: 35, tz: 50, default: 60 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["vegetable oil", "cooking oil", "sunflower oil"],
    prices: { ng: 1800, ke: 220, gh: 22, za: 35, eg: 50, tz: 5000, default: 2.5 },
    unit: "l",
    stall: "oil_pantry",
    tier: "budget",
    availability: { ng: 98, ke: 98, gh: 98, za: 98, eg: 98, tz: 95, default: 95 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["coconut oil"],
    prices: { ng: 4500, ke: 450, gh: 55, za: 90, eg: 120, tz: 12000, default: 8 },
    unit: "l",
    stall: "supermarket",
    tier: "premium",
    availability: { ng: 70, ke: 75, gh: 80, za: 85, eg: 60, tz: 80, default: 75 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["egusi", "egusi seeds", "melon seeds"],
    prices: { ng: 3500, ke: 600, gh: 45, za: 120, eg: 150, tz: 14000, default: 7 },
    unit: "kg",
    stall: "grain_stall",
    tier: "specialty",
    availability: { ng: 95, ke: 30, gh: 70, za: 25, eg: 20, tz: 25, default: 40 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["pumpkin seeds", "pepitas"],
    prices: { ng: 5000, ke: 500, gh: 60, za: 100, eg: 130, tz: 12000, default: 8 },
    unit: "kg",
    stall: "supermarket",
    tier: "premium",
    availability: { ng: 50, ke: 60, gh: 55, za: 80, eg: 55, tz: 50, default: 65 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["rice", "long grain rice", "jasmine rice", "basmati"],
    prices: { ng: 1600, ke: 180, gh: 16, za: 28, eg: 35, tz: 4000, default: 2 },
    unit: "kg",
    stall: "grain_stall",
    tier: "budget",
    availability: { ng: 98, ke: 98, gh: 98, za: 98, eg: 98, tz: 98, default: 95 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["maize meal", "ugali flour", "nshima", "mealie meal", "cornmeal"],
    prices: { ng: 900, ke: 90, gh: 10, za: 15, eg: 25, tz: 2200, default: 1.2 },
    unit: "kg",
    stall: "grain_stall",
    tier: "budget",
    availability: { ng: 70, ke: 98, gh: 75, za: 98, eg: 40, tz: 98, default: 80 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["cassava", "yuca", "manioc"],
    prices: { ng: 600, ke: 70, gh: 6, za: 20, eg: 30, tz: 1500, default: 1 },
    unit: "kg",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 90, ke: 75, gh: 90, za: 55, eg: 30, tz: 85, default: 70 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["yam", "white yam", "puna yam"],
    prices: { ng: 1000, ke: 150, gh: 12, za: 40, eg: 50, tz: 3500, default: 2.5 },
    unit: "kg",
    stall: "produce_stall",
    tier: "moderate",
    availability: { ng: 95, ke: 40, gh: 90, za: 35, eg: 25, tz: 40, default: 55 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["chicken", "whole chicken", "chicken pieces"],
    prices: { ng: 3500, ke: 450, gh: 45, za: 65, eg: 90, tz: 10000, default: 5 },
    unit: "kg",
    stall: "butcher",
    tier: "moderate",
    availability: { ng: 95, ke: 95, gh: 95, za: 95, eg: 95, tz: 90, default: 90 },
    diet: ["halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["beef", "stewing beef", "goat"],
    prices: { ng: 4500, ke: 550, gh: 55, za: 90, eg: 180, tz: 12000, default: 7 },
    unit: "kg",
    stall: "butcher",
    tier: "premium",
    availability: { ng: 90, ke: 90, gh: 90, za: 90, eg: 85, tz: 85, default: 85 },
    diet: ["halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["fish", "tilapia", "fresh fish"],
    prices: { ng: 3000, ke: 400, gh: 40, za: 70, eg: 100, tz: 9000, default: 6 },
    unit: "kg",
    stall: "fishmonger",
    tier: "moderate",
    availability: { ng: 85, ke: 90, gh: 85, za: 80, eg: 80, tz: 90, default: 80 },
    diet: ["halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["eggs", "egg"],
    prices: { ng: 200, ke: 20, gh: 2.5, za: 3.5, eg: 4, tz: 500, default: 0.25 },
    unit: "piece",
    stall: "dairy_eggs",
    tier: "budget",
    availability: { ng: 98, ke: 98, gh: 98, za: 98, eg: 98, tz: 95, default: 95 },
    diet: ["vegetarian", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["milk", "fresh milk"],
    prices: { ng: 900, ke: 80, gh: 12, za: 18, eg: 25, tz: 2500, default: 1.2 },
    unit: "l",
    stall: "dairy_eggs",
    tier: "moderate",
    availability: { ng: 90, ke: 95, gh: 90, za: 95, eg: 95, tz: 90, default: 90 },
    diet: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  {
    aliases: ["butter", "ghee", "samn"],
    prices: { ng: 6000, ke: 700, gh: 70, za: 90, eg: 120, tz: 15000, default: 8 },
    unit: "kg",
    stall: "supermarket",
    tier: "premium",
    availability: { ng: 80, ke: 85, gh: 80, za: 95, eg: 90, tz: 75, default: 80 },
    diet: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  {
    aliases: ["peanut", "peanuts", "groundnut", "groundnuts", "peanut butter"],
    prices: { ng: 2500, ke: 300, gh: 30, za: 50, eg: 70, tz: 7000, default: 4 },
    unit: "kg",
    stall: "grain_stall",
    tier: "moderate",
    availability: { ng: 95, ke: 90, gh: 95, za: 90, eg: 70, tz: 85, default: 85 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
  },
  {
    aliases: ["beans", "black-eyed peas", "cowpeas", "brown beans"],
    prices: { ng: 1400, ke: 160, gh: 14, za: 30, eg: 40, tz: 3500, default: 2 },
    unit: "kg",
    stall: "grain_stall",
    tier: "budget",
    availability: { ng: 95, ke: 90, gh: 95, za: 90, eg: 85, tz: 90, default: 90 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["stock cube", "bouillon", "maggi", "seasoning cube"],
    prices: { ng: 50, ke: 10, gh: 1, za: 3, eg: 3, tz: 200, default: 0.2 },
    unit: "piece",
    stall: "spice_stall",
    tier: "budget",
    availability: { ng: 99, ke: 95, gh: 99, za: 90, eg: 85, tz: 95, default: 90 },
    diet: ["gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["ginger"],
    prices: { ng: 2000, ke: 180, gh: 20, za: 40, eg: 45, tz: 4500, default: 3 },
    unit: "kg",
    stall: "produce_stall",
    tier: "moderate",
    availability: { ng: 90, ke: 90, gh: 90, za: 90, eg: 90, tz: 85, default: 85 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["crayfish", "dried crayfish"],
    prices: { ng: 8000, ke: 900, gh: 90, za: 150, eg: 200, tz: 20000, default: 12 },
    unit: "kg",
    stall: "spice_stall",
    tier: "specialty",
    availability: { ng: 90, ke: 25, gh: 70, za: 20, eg: 15, tz: 20, default: 35 },
    diet: ["halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["ogbono", "ogbono seeds"],
    prices: { ng: 5000, ke: 800, gh: 55, za: 140, eg: 160, tz: 16000, default: 9 },
    unit: "kg",
    stall: "grain_stall",
    tier: "specialty",
    availability: { ng: 90, ke: 20, gh: 55, za: 15, eg: 10, tz: 15, default: 30 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["irú", "iru", "locust beans", "dawadawa", "ogiri"],
    prices: { ng: 4000, ke: 700, gh: 50, za: 130, eg: 150, tz: 15000, default: 8 },
    unit: "kg",
    stall: "spice_stall",
    tier: "specialty",
    availability: { ng: 92, ke: 15, gh: 80, za: 10, eg: 10, tz: 15, default: 30 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["teff", "teff flour"],
    prices: { ng: 6000, ke: 500, gh: 70, za: 110, eg: 90, tz: 14000, default: 9 },
    unit: "kg",
    stall: "supermarket",
    tier: "specialty",
    availability: { ng: 25, ke: 40, gh: 20, za: 45, eg: 35, tz: 30, default: 40 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    aliases: ["parsley", "cilantro", "coriander leaves", "fresh coriander"],
    prices: { ng: 300, ke: 20, gh: 4, za: 12, eg: 8, tz: 600, default: 1 },
    unit: "bunch",
    stall: "produce_stall",
    tier: "budget",
    availability: { ng: 70, ke: 85, gh: 70, za: 90, eg: 95, tz: 75, default: 80 },
    diet: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findRow(ingredientName: string): PriceRow | null {
  const key = normalize(ingredientName);
  if (!key) return null;
  let best: PriceRow | null = null;
  let bestLen = 0;
  for (const row of PRICE_ROWS) {
    for (const alias of row.aliases) {
      const a = normalize(alias);
      if (key === a || key.includes(a) || a.includes(key)) {
        if (a.length > bestLen) {
          best = row;
          bestLen = a.length;
        }
      }
    }
  }
  return best;
}

export function resolveMarketId(countryOrHint?: string | null): MarketId {
  if (!countryOrHint) return getMarketPreference();
  const key = normalize(countryOrHint);
  for (const id of MARKET_ORDER) {
    if (id === "default") continue;
    const profile = MARKETS[id];
    if (profile.countryHints.some((h) => key.includes(h) || h.includes(key))) {
      return id;
    }
  }
  return getMarketPreference();
}

export function getMarketPreference(): MarketId {
  try {
    const raw = localStorage.getItem(MARKET_PREF_KEY) as MarketId | null;
    if (raw && MARKETS[raw]) return raw;
  } catch {
    /* SSR / private mode */
  }
  return "ng";
}

export function setMarketPreference(id: MarketId): void {
  try {
    localStorage.setItem(MARKET_PREF_KEY, id);
    window.dispatchEvent(new CustomEvent("ladhaquest:market", { detail: id }));
  } catch {
    /* ignore */
  }
}

export function getDietPreferences(): DietTag[] {
  try {
    const raw = localStorage.getItem(DIET_PREF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DietTag[]) : [];
  } catch {
    return [];
  }
}

export function setDietPreferences(tags: DietTag[]): void {
  try {
    localStorage.setItem(DIET_PREF_KEY, JSON.stringify(tags));
  } catch {
    /* ignore */
  }
}

export function getWeeklyBudgetPreference(marketId?: MarketId): number {
  const market = MARKETS[marketId || getMarketPreference()];
  try {
    const raw = localStorage.getItem(`${BUDGET_PREF_KEY}_${market.id}`);
    if (raw) {
      const n = Number(raw);
      if (n > 0) return n;
    }
  } catch {
    /* ignore */
  }
  return market.defaultWeeklyBudget;
}

export function setWeeklyBudgetPreference(amount: number, marketId?: MarketId): void {
  const market = MARKETS[marketId || getMarketPreference()];
  try {
    localStorage.setItem(`${BUDGET_PREF_KEY}_${market.id}`, String(Math.max(0, amount)));
  } catch {
    /* ignore */
  }
}

export function formatMoney(amount: number, marketId?: MarketId): string {
  const market = MARKETS[marketId || getMarketPreference()];
  const rounded = market.currency === "USD" ? Math.round(amount * 100) / 100 : Math.round(amount);
  try {
    return new Intl.NumberFormat(market.locale, {
      style: "currency",
      currency: market.currency,
      maximumFractionDigits: market.currency === "USD" ? 2 : 0,
    }).format(rounded);
  } catch {
    return `${market.symbol}${rounded.toLocaleString()}`;
  }
}

export interface IngredientMarketInfo {
  name: string;
  stall: StallId;
  stallLabel: string;
  tier: PriceTier;
  availability: number;
  unitPrice: number | null;
  unit: string;
  diet: DietTag[];
  estimatedCost: number | null;
  marketId: MarketId;
}

function estimateQtyFactor(
  quantity: number | null,
  unit: string,
  rowUnit: PriceRow["unit"]
): number {
  if (quantity === null || !isFinite(quantity) || quantity <= 0) {
    // Default household purchase: one reference unit
    return 1;
  }
  const u = unit.toLowerCase();
  if (rowUnit === "kg") {
    if (u === "g" || u === "gram" || u === "grams") return quantity / 1000;
    if (u === "kg" || u === "kilogram" || u === "kilograms") return quantity;
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return (quantity * 454) / 1000;
    if (u === "oz" || u === "ounce" || u === "ounces") return (quantity * 28) / 1000;
    // bare number often means pieces for produce — treat as ~0.2 kg each
    if (!u || u === "piece" || u === "pieces") return quantity * 0.2;
    return quantity;
  }
  if (rowUnit === "l") {
    if (u === "ml" || u === "milliliter" || u === "millilitre") return quantity / 1000;
    if (u === "l" || u === "liter" || u === "litre" || u === "liters" || u === "litres") return quantity;
    if (u === "cup" || u === "cups") return (quantity * 240) / 1000;
    if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") return (quantity * 15) / 1000;
    if (u === "tsp" || u === "teaspoon" || u === "teaspoons") return (quantity * 5) / 1000;
    return quantity;
  }
  if (rowUnit === "bunch" || rowUnit === "pack" || rowUnit === "piece") {
    if (u === "g" || u === "kg") return Math.max(1, Math.ceil(quantity / (rowUnit === "bunch" ? 250 : 1)));
    return Math.max(1, quantity);
  }
  return quantity;
}

export function getIngredientMarketInfo(
  ingredientName: string,
  options?: {
    marketId?: MarketId;
    quantity?: number | null;
    unit?: string;
  }
): IngredientMarketInfo {
  const marketId = options?.marketId || getMarketPreference();
  const row = findRow(ingredientName);
  if (!row) {
    return {
      name: ingredientName,
      stall: "other",
      stallLabel: STALL_LABELS.other,
      tier: "moderate",
      availability: 50,
      unitPrice: null,
      unit: "",
      diet: [],
      estimatedCost: null,
      marketId,
    };
  }

  const unitPrice = row.prices[marketId] ?? row.prices.default ?? null;
  const availability = row.availability[marketId] ?? row.availability.default ?? 50;
  const factor = estimateQtyFactor(options?.quantity ?? null, options?.unit || "", row.unit);
  const estimatedCost = unitPrice !== null ? unitPrice * factor : null;

  return {
    name: ingredientName,
    stall: row.stall,
    stallLabel: STALL_LABELS[row.stall],
    tier: row.tier,
    availability,
    unitPrice,
    unit: row.unit,
    diet: row.diet,
    estimatedCost,
    marketId,
  };
}

export function guessStall(ingredientName: string): StallId {
  return getIngredientMarketInfo(ingredientName).stall;
}

export interface RankableSubstitute {
  name: string;
  compatibilityScore: number;
  authenticity?: string;
  regions?: string[];
  notes?: string;
  reason?: string;
  ratio?: string;
  flavorRole?: string;
  source?: string;
}

export interface RankedSubstitute extends RankableSubstitute {
  rankScore: number;
  market: IngredientMarketInfo;
  savingsVsOriginal: number | null;
  cookHint: string;
}

export interface RankOptions {
  marketId?: MarketId;
  countryHint?: string;
  preferCheap?: boolean;
  preferAvailable?: boolean;
  diet?: DietTag[];
  originalName?: string;
  limit?: number;
}

/**
 * Re-rank substitution candidates using local price, availability, and diet fit.
 */
export function rankSubstitutesForMarket(
  candidates: RankableSubstitute[],
  options: RankOptions = {}
): RankedSubstitute[] {
  const marketId = options.marketId || resolveMarketId(options.countryHint);
  const diet = options.diet?.length ? options.diet : getDietPreferences();
  const preferCheap = options.preferCheap !== false;
  const preferAvailable = options.preferAvailable !== false;
  const original = options.originalName
    ? getIngredientMarketInfo(options.originalName, { marketId })
    : null;

  const ranked = candidates.map((c) => {
    const market = getIngredientMarketInfo(c.name, { marketId });
    let score = c.compatibilityScore;

    if (preferAvailable) {
      score += (market.availability - 50) * 0.25;
    }
    if (preferCheap && market.unitPrice !== null && original?.unitPrice) {
      const ratio = market.unitPrice / Math.max(original.unitPrice, 0.01);
      if (ratio < 0.85) score += 12;
      else if (ratio > 1.4) score -= 10;
      else if (ratio < 1) score += 4;
    }
    // Hard diet filter: candidate must satisfy EVERY required diet tag.
    if (diet.length) {
      if (!market.diet.length) {
        // Unknown diet profile — keep but do not boost; soft-penalize
        score -= 8;
      } else if (!diet.every((d) => market.diet.includes(d))) {
        return null;
      } else {
        score += 8;
      }
    }
    // Soft-penalize specialty items when a budget cook is shopping
    if (preferCheap && market.tier === "specialty") score -= 6;
    if (preferCheap && market.tier === "budget") score += 4;

    const savingsVsOriginal =
      original?.unitPrice != null && market.unitPrice != null
        ? original.unitPrice - market.unitPrice
        : null;

    const cookHintParts: string[] = [];
    if (market.availability < 40) {
      cookHintParts.push(`Often hard to find in ${MARKETS[marketId].label} — confirm at the market.`);
    } else if (market.availability >= 80) {
      cookHintParts.push(`Usually easy to find at ${market.stallLabel.toLowerCase()}.`);
    }
    if (c.notes) cookHintParts.push(c.notes);

    return {
      ...c,
      rankScore: Math.round(score * 10) / 10,
      market,
      savingsVsOriginal,
      cookHint: cookHintParts.join(" "),
    } satisfies RankedSubstitute;
  }).filter((row): row is RankedSubstitute => row != null);

  ranked.sort((a, b) => b.rankScore - a.rankScore);
  return ranked.slice(0, options.limit ?? 6);
}

export function estimateRecipeCost(
  ingredientNames: { name: string; quantity?: number | null; unit?: string }[],
  marketId?: MarketId
): { total: number; pricedCount: number; unknownCount: number; marketId: MarketId } {
  const mid = marketId || getMarketPreference();
  let total = 0;
  let pricedCount = 0;
  let unknownCount = 0;
  for (const ing of ingredientNames) {
    const info = getIngredientMarketInfo(ing.name, {
      marketId: mid,
      quantity: ing.quantity,
      unit: ing.unit,
    });
    if (info.estimatedCost !== null) {
      total += info.estimatedCost;
      pricedCount++;
    } else {
      unknownCount++;
    }
  }
  return { total, pricedCount, unknownCount, marketId: mid };
}
