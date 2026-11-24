import type { IngredientValue } from "../types/content.ts";
import { getSubstituteNames } from "../lib/substitutionGraph.ts";
import {
  recipeViolatesConstraints,
  type PantryMatchConstraints,
} from "../lib/pantryConstraints.ts";
import { compareQuantities } from "../lib/unitConversion.ts";

export interface PantryIngredient {
  id: string;
  name: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
  /** When false, quantity is unknown — never claim ready for qty-gated staples. */
  quantity_known?: boolean;
  expires_at?: string;
}

interface Recipe {
  id: string;
  name: string;
  country?: string;
  ingredients: IngredientValue[] | null;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  image_url?: string;
  summary?: string;
  cuisine_type?: string;
  category?: string;
  allergens?: string[];
  allergen_tags?: string[];
  dietary_tags?: string[];
  requires_equipment?: string[];
}

export type CookabilityMode = "cook_now" | "shop_first";

export interface MatchOptions {
  mode?: CookabilityMode;
  constraints?: PantryMatchConstraints | null;
  /** Drop constraint-blocked recipes from results (default true). */
  excludeBlocked?: boolean;
  minMatchPercentage?: number;
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
  matchedIngredients: string[];
  substitutableIngredients: Array<{ original: string; substitute: string }>;
  /** True only when no essential ingredients are missing (subs already counted as covered). */
  canMakeNow: boolean;
  needsShopping: boolean;
  urgencyBoost: number;
  pantryCoverage: number;
  priority: "high" | "medium" | "low";
  priorityReason?: string;
  /** Unboosted recipe coverage 0–100 (for eval / explanations). */
  recipeCoverage?: number;
  constraintBlocked?: boolean;
  constraintReasons?: string[];
  quantityWarning?: string | null;
}

/** Lightweight extras beyond the Africa-first substitution graph (generic pantry noise). */
const ingredientSubstitutes: Record<string, string[]> = {
  oil: ["vegetable oil", "olive oil", "palm oil", "coconut oil", "canola oil"],
  "curry powder": ["turmeric", "cumin", "garam masala"],
  "bell pepper": ["red pepper", "green pepper", "yellow pepper", "capsicum", "pepper"],
  pepper: ["bell pepper", "black pepper", "chili", "chilli", "scotch bonnet", "cayenne"],
  tomato: ["tomatoes", "cherry tomato", "tomato paste", "tomato sauce"],
  onion: ["shallot", "green onion", "leek", "spring onion", "onions"],
  garlic: ["garlic powder", "shallot"],
  ginger: ["ginger powder"],
  "chicken stock": ["vegetable stock", "beef stock", "broth", "stock cube", "stock"],
  "vegetable oil": ["olive oil", "coconut oil", "palm oil", "canola oil", "oil"],
  fava: ["broad bean", "lima bean", "chickpea", "fava beans", "broad beans"],
  "fava beans": ["broad beans", "lima beans", "chickpeas", "fava", "beans"],
  beans: ["fava beans", "black beans", "kidney beans", "white beans", "beans"],
  dukkah: ["zaatar", "sesame seeds", "spice mix"],
  freekeh: ["bulgur", "farro", "quinoa", "brown rice"],
  bulgur: ["freekeh", "couscous", "quinoa"],
  lime: ["lemon"],
  lemon: ["lime"],
  yogurt: ["greek yogurt", "sour cream", "labneh"],
  chickpeas: ["garbanzo", "white beans", "cannellini", "chickpea"],
  rice: ["basmati", "jasmine rice", "brown rice", "white rice"],
  broth: ["stock", "stock cube", "bouillon"],
  chicken: ["poultry", "chicken breast", "chicken thighs", "whole chicken"],
  beef: ["stewing beef", "ground beef", "beef short rib", "steak"],
  fish: ["white fish", "cod", "tilapia", "salmon"],
  noodles: ["pasta", "spaghetti", "egg noodles", "vermicelli"],
  pasta: ["noodles", "spaghetti", "penne", "macaroni"],
  carrot: ["carrots"],
  celery: ["celery stalks", "celery ribs"],
};

const STOP = new Set([
  "fresh",
  "dried",
  "ground",
  "chopped",
  "diced",
  "sliced",
  "minced",
  "peeled",
  "seeded",
  "crushed",
  "whole",
  "large",
  "small",
  "medium",
  "optional",
  "plus",
  "more",
  "for",
  "serving",
  "taste",
  "about",
  "divided",
  "packed",
  "room",
  "temperature",
  "cups",
  "cup",
  "tablespoons",
  "tablespoon",
  "tbsp",
  "teaspoons",
  "teaspoon",
  "tsp",
  "ounces",
  "ounce",
  "oz",
  "pounds",
  "pound",
  "lbs",
  "lb",
  "grams",
  "gram",
  "kg",
  "ml",
  "liter",
  "litre",
  "and",
  "or",
  "the",
  "a",
  "an",
  "of",
  "to",
  "into",
  "with",
  "as",
  "needed",
  "such",
  "like",
]);

const COMPOUND_INGREDIENTS = [
  "palm oil",
  "olive oil",
  "vegetable oil",
  "coconut oil",
  "scotch bonnet",
  "tomato paste",
  "tomato sauce",
  "curry powder",
  "stock cube",
  "chicken stock",
  "beef stock",
  "vegetable stock",
  "fava beans",
  "black beans",
  "kidney beans",
  "bell pepper",
  "sweet potato",
  "ground beef",
  "peanut butter",
  "all purpose flour",
  "all-purpose flour",
  "goat meat",
  "egusi seeds",
  "sesame seeds",
  "bay leaf",
  "bay leaves",
  "green onion",
  "spring onion",
].sort((a, b) => b.length - a.length);

/**
 * Split a free-text pantry entry into individual ingredients.
 * Users often type "tomatoes garlic onions rice" or "chicken, onion, rice".
 */
export const splitPantryInput = (raw: string): string[] => {
  const text = String(raw || "").trim();
  if (!text) return [];

  const protectCompounds = (input: string): { masked: string; compounds: string[] } => {
    let masked = input.toLowerCase();
    const compounds: string[] = [];
    for (const phrase of COMPOUND_INGREDIENTS) {
      if (masked.includes(phrase)) {
        compounds.push(phrase);
        masked = masked.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), " ");
      }
    }
    return { masked, compounds };
  };

  const parts = text
    .split(/,|;|\n|\||\/|&&|\band\b/i)
    .flatMap((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return [];

      // Prefer comma lists; also split space-separated single-ingredient words.
      // Do NOT split multi-word ingredient phrases (e.g. "whole teff grain", "palm oil").
      if (!/,/.test(text) && trimmed.split(/\s+/).length >= 2 && trimmed.length <= 100) {
        const { masked, compounds } = protectCompounds(trimmed);
        const words = masked
          .split(/\s+/)
          .map((w) => w.trim())
          .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d/.test(w));
        const lookLikeList =
          words.length + compounds.length >= 2 &&
          words.every((w) => /^[a-z][a-z'-]*$/i.test(w));
        // If the original phrase is itself a known compound / prep phrase, keep whole.
        const asPhrase = normalizeIngredientName(trimmed);
        const isPrepPhrase =
          /\b(flour|oil|leaves|leaf|seeds|paste|sauce|powder|milk|butter|meal|dough|grain|grains)\b/.test(
            asPhrase
          ) || COMPOUND_INGREDIENTS.some((c) => asPhrase === c || asPhrase.includes(c));
        if (lookLikeList && !isPrepPhrase) return [...compounds, ...words];
      }
      return [trimmed];
    })
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 2);

  // Dedupe case-insensitively while preserving first spelling
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out.length ? out : [text];
};

/** Expand pantry rows so multi-ingredient strings become matchable tokens. */
export const expandPantryIngredients = (
  items: PantryIngredient[]
): PantryIngredient[] => {
  const expanded: PantryIngredient[] = [];
  for (const item of items) {
    const label = item.ingredient_name || item.name || "";
    const parts = splitPantryInput(label);
    if (parts.length <= 1) {
      expanded.push(item);
      continue;
    }
    parts.forEach((part, index) => {
      expanded.push({
        ...item,
        id: `${item.id}::${index}`,
        name: part,
        ingredient_name: part,
      });
    });
  }
  return expanded;
};

/** Pull a human ingredient label from every known recipe JSON shape. */
export const extractIngredientLabel = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value !== "object" || Array.isArray(value)) return "";

  const obj = value as Record<string, unknown>;
  const direct =
    obj.name ??
    obj.ingredient ??
    obj.item ??
    obj.text ??
    obj.ingredient_name ??
    obj.label ??
    obj.title;

  if (typeof direct === "string" && direct.trim()) return direct.trim();
  if (typeof direct === "number") return String(direct);

  // { quantity, unit, item/name } sometimes split across fields
  const piece =
    (typeof obj.item === "string" && obj.item) ||
    (typeof obj.name === "string" && obj.name) ||
    "";
  if (piece) return piece.trim();

  return "";
};

const singularize = (token: string): string => {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("oes") || token.endsWith("ses") || token.endsWith("xes") || token.endsWith("zes")) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us") && !token.endsWith("is")) {
    return token.slice(0, -1);
  }
  return token;
};

export const normalizeIngredientName = (name: string): string => {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/\b\d+([./]\d+)?\s*(cups?|tbsp|tsp|oz|lbs?|g|kg|ml|l|cloves?|pieces?)?\b/gi, " ")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokensOf = (name: string): string[] =>
  normalizeIngredientName(name)
    .split(/\s+/)
    .map(singularize)
    .filter((t) => t.length > 1 && !STOP.has(t) && !STOP.has(singularize(t)));

/** Tokens that must not alone prove a compound ingredient match. */
const WEAK_SOLO_TOKENS = new Set([
  "oil",
  "pepper",
  "bean",
  "beans",
  "flour",
  "leaf",
  "leaves",
  "seed",
  "seeds",
  "sauce",
  "paste",
  "powder",
  "stock",
  "broth",
  "milk",
  "butter",
  "rice",
  "meat",
  "fish",
  "green",
  "greens",
]);

export const namesOverlap = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  const na = normalizeIngredientName(a);
  const nb = normalizeIngredientName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  // Substring only when the shorter side is a full compound (≥2 tokens) or length ≥ 5
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  if (shorter.length >= 5 && longer.includes(shorter)) {
    const shortTokens = tokensOf(shorter);
    if (shortTokens.length >= 2 || !WEAK_SOLO_TOKENS.has(shortTokens[0] || shorter)) {
      return true;
    }
  }

  const sa = singularize(na.replace(/\s+/g, ""));
  const sb = singularize(nb.replace(/\s+/g, ""));
  if (sa === sb) return true;

  const ta = tokensOf(na);
  const tb = tokensOf(nb);
  if (!ta.length || !tb.length) return false;

  const setB = new Set(tb);
  const hits = ta.filter((t) => setB.has(t)).length;
  // Single-token hit only when that token is distinctive (not oil/pepper/beans/…)
  if (hits === 1 && (ta.length === 1 || tb.length === 1)) {
    const solo = ta.length === 1 ? ta[0] : tb[0];
    if (WEAK_SOLO_TOKENS.has(solo)) return false;
    return true;
  }
  if (hits >= Math.min(2, Math.min(ta.length, tb.length))) return true;
  return false;
};

const getIngredientSubstitutes = (ingredient: string): string[] => {
  const normalized = normalizeIngredientName(ingredient);
  const fromGraph = getSubstituteNames(ingredient);
  const extras = new Set<string>(fromGraph);

  const direct = ingredientSubstitutes[normalized];
  if (direct) direct.forEach((s) => extras.add(s));
  for (const [key, vals] of Object.entries(ingredientSubstitutes)) {
    if (namesOverlap(normalized, key)) vals.forEach((s) => extras.add(s));
  }
  const first = tokensOf(normalized)[0];
  if (first && ingredientSubstitutes[first]) {
    ingredientSubstitutes[first].forEach((s) => extras.add(s));
  }
  return [...extras];
};

const daysUntilExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

/**
 * Exact/alias ≠ preparation state. Whole grain ≠ flour; fresh fish ≠ stockfish.
 * Broad category names must not silently satisfy a specific prepared form.
 */
export const preparationCompatible = (recipeIng: string, pantryIng: string): boolean => {
  const r = normalizeIngredientName(recipeIng);
  const p = normalizeIngredientName(pantryIng);
  if (!r || !p) return false;
  const rFlour = /\bflour\b/.test(r);
  const pFlour = /\bflour\b/.test(p);
  const pWholeGrain = /\b(whole|grain|grains|berries|berry)\b/.test(p) && !pFlour;
  // Recipe needs flour; pantry is whole grain OR the bare cereal name without flour.
  if (rFlour && pWholeGrain) return false;
  if (rFlour && !pFlour) {
    const rBase = r.replace(/\bflour\b/g, "").replace(/\s+/g, " ").trim();
    const pBase = p.replace(/\b(whole|grain|grains|berries|berry)\b/g, "").replace(/\s+/g, " ").trim();
    if (rBase && (p === rBase || pBase === rBase || namesOverlap(rBase, p))) return false;
  }
  if (/\bfresh\b/.test(r) && /\b(dried|dry|stockfish)\b/.test(p)) return false;
  if (/\b(dried|dry|stockfish)\b/.test(r) && /\bfresh\b/.test(p)) return false;
  if (/\bcooked\b/.test(r) && /\b(raw|dried|dry)\b/.test(p)) return false;
  return true;
};

const pantryMatchesIngredient = (
  normalizedUserIngredients: Array<{
    normalizedName: string;
    ingredient_name?: string;
    name: string;
    urgent: boolean;
    daysLeft: number | null;
  }>,
  recipeIngName: string
) => {
  const compatible = (userIng: { normalizedName: string }) =>
    preparationCompatible(recipeIngName, userIng.normalizedName);

  const exact = normalizedUserIngredients.find(
    (userIng) => namesOverlap(userIng.normalizedName, recipeIngName) && compatible(userIng)
  );
  if (exact) return { kind: "exact" as const, user: exact };

  const substitutes = getIngredientSubstitutes(recipeIngName);
  const viaSub = normalizedUserIngredients.find(
    (userIng) =>
      compatible(userIng) &&
      substitutes.some((sub) => namesOverlap(userIng.normalizedName, sub))
  );
  if (viaSub) return { kind: "sub" as const, user: viaSub };

  // Reverse: pantry item has substitutes that cover the recipe ingredient
  const reverse = normalizedUserIngredients.find((userIng) => {
    if (!compatible(userIng)) return false;
    const panSubs = getIngredientSubstitutes(userIng.normalizedName);
    return panSubs.some((sub) => namesOverlap(sub, recipeIngName));
  });
  if (reverse) return { kind: "sub" as const, user: reverse };

  return null;
};

export const calculateRecipeMatch = (
  userIngredients: PantryIngredient[],
  recipe: Recipe
): MatchResult => {
  const rawIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const recipeLabels = rawIngredients
    .map((ri) => extractIngredientLabel(ri))
    .filter((label) => label.length > 0);

  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;
  let urgencyBoost = 0;
  const missingIngredients: string[] = [];
  const matchedIngredients: string[] = [];
  const substitutableIngredients: Array<{ original: string; substitute: string }> = [];
  const usedPantry = new Set<string>();

  const normalizedUserIngredients = userIngredients.map((ing) => {
    const days = daysUntilExpiry(ing.expires_at);
    return {
      ...ing,
      normalizedName: normalizeIngredientName(ing.ingredient_name || ing.name || ""),
      daysLeft: days,
      urgent: days !== null && days <= 3,
    };
  }).filter((ing) => ing.normalizedName.length > 0);

  recipeLabels.forEach((ingredientName, index) => {
    const raw = rawIngredients[index];
    const optional =
      typeof raw === "object" && raw !== null && "optional" in raw
        ? Boolean((raw as { optional?: boolean }).optional)
        : false;
    const weight = optional ? 0.5 : 1.0;
    totalWeight += weight;

    const hit = pantryMatchesIngredient(normalizedUserIngredients, ingredientName);
    if (hit?.kind === "exact") {
      matchedCount++;
      matchedWeight += weight;
      matchedIngredients.push(ingredientName);
      usedPantry.add(hit.user.normalizedName);
      if (hit.user.urgent) urgencyBoost += hit.user.daysLeft !== null && hit.user.daysLeft <= 1 ? 12 : 8;
      return;
    }
    if (hit?.kind === "sub") {
      matchedCount++;
      matchedWeight += weight * 0.85;
      matchedIngredients.push(ingredientName);
      usedPantry.add(hit.user.normalizedName);
      substitutableIngredients.push({
        original: ingredientName,
        substitute: hit.user.ingredient_name || hit.user.name,
      });
      if (hit.user.urgent) urgencyBoost += 5;
      return;
    }

    if (!optional) missingIngredients.push(ingredientName);
  });

  const recipeCoverage = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const pantryCoverage =
    normalizedUserIngredients.length > 0
      ? Math.round((usedPantry.size / normalizedUserIngredients.length) * 100)
      : 0;

  // Blend: mostly "how much of the dish can I make", boosted when pantry items are useful
  const blended = Math.round(recipeCoverage * 0.7 + pantryCoverage * 0.3);
  const matchPercentage = Math.min(
    100,
    Math.max(recipeCoverage, blended) + Math.min(urgencyBoost, 12) + (matchedCount >= 3 ? 5 : 0)
  );

  // Quantity / uncertainty demotion (cups↔g via unit conversion graph)
  let quantityWarning: string | null = null;
  for (let i = 0; i < rawIngredients.length; i++) {
    const raw = rawIngredients[i];
    if (typeof raw !== "object" || raw === null) continue;
    const reqQty =
      typeof (raw as { quantity?: unknown }).quantity === "number"
        ? Number((raw as { quantity: number }).quantity)
        : typeof (raw as { amount?: unknown }).amount === "number"
          ? Number((raw as { amount: number }).amount)
          : null;
    const reqUnit = String((raw as { unit?: string }).unit || "").toLowerCase() || null;
    const label = recipeLabels[i];
    if (reqQty == null || !label) continue;
    const hit = pantryMatchesIngredient(normalizedUserIngredients, label);
    if (!hit) continue;
    const pan = hit.user as {
      normalizedName: string;
      quantity?: number;
      unit?: string;
      quantity_known?: boolean;
      name: string;
      ingredient_name?: string;
    };
    const cmp = compareQuantities({
      pantryAmount: pan.quantity,
      pantryUnit: pan.unit,
      pantryKnown: pan.quantity_known,
      requiredAmount: reqQty,
      requiredUnit: reqUnit,
      ingredientName: label,
    });
    if (!cmp.comparable) {
      if (cmp.reason === "unknown_quantity") {
        // Recipe asks for a measured amount; pantry qty unknown → never claim Ready
        quantityWarning = `Confirm you have enough ${label}`;
      } else if (cmp.reason === "unknown_density" || cmp.reason === "incompatible_units") {
        // Cannot convert measured pantry ↔ recipe → do not claim Ready
        quantityWarning = `Confirm units for ${label} (cannot convert pantry ↔ recipe)`;
      }
      continue;
    }
    if (!cmp.ok) {
      const pu = String(pan.unit || "").toLowerCase();
      quantityWarning = `Not enough ${label} (${pan.quantity}${pu ? " " + pu : ""} < ${reqQty}${
        reqUnit ? " " + reqUnit : ""
      })`;
      break;
    }
  }

  // Cookability-first: Ready only when every essential ingredient is present
  // (exact or reviewed substitute already counted above). Overlap ≠ cookable.
  let canMakeNow = missingIngredients.length === 0 && matchedCount > 0;
  if (quantityWarning) canMakeNow = false;

  let priority: "high" | "medium" | "low" = "low";
  let priorityReason: string | undefined;
  if (quantityWarning) {
    priority = "medium";
    priorityReason = quantityWarning;
  } else if (urgencyBoost >= 10 && recipeCoverage >= 35) {
    priority = "high";
    priorityReason = "Uses ingredients expiring soon";
  } else if (canMakeNow) {
    priority = "high";
    priorityReason =
      substitutableIngredients.length > 0
        ? "Cookable now with pantry substitutions"
        : "You can cook this now";
  } else if (recipeCoverage >= 45 || matchedCount >= 3) {
    priority = "medium";
    priorityReason = "Strong pantry overlap — short shopping list";
  } else if (matchedCount >= 2) {
    priority = "low";
    priorityReason = "Uses several items from your pantry";
  }

  return {
    recipe,
    matchPercentage,
    matchedCount,
    totalIngredients: recipeLabels.length,
    missingIngredients,
    matchedIngredients,
    substitutableIngredients,
    canMakeNow,
    needsShopping: !canMakeNow && missingIngredients.length > 0 && recipeCoverage >= 35,
    urgencyBoost,
    pantryCoverage,
    priority,
    priorityReason,
    recipeCoverage,
    quantityWarning,
  };
};

function densityOf(m: MatchResult) {
  return m.totalIngredients > 0 ? m.matchedCount / m.totalIngredients : 0;
}

/** Cookability-first sort: ready → fewer missing → coverage → urgency. */
export const sortByCookability = (matches: MatchResult[]): MatchResult[] =>
  [...matches].sort((a, b) => {
    if (Number(b.canMakeNow) !== Number(a.canMakeNow)) {
      return Number(b.canMakeNow) - Number(a.canMakeNow);
    }
    if (a.missingIngredients.length !== b.missingIngredients.length) {
      return a.missingIngredients.length - b.missingIngredients.length;
    }
    if (b.urgencyBoost !== a.urgencyBoost) return b.urgencyBoost - a.urgencyBoost;
    if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
    if (densityOf(b) !== densityOf(a)) return densityOf(b) - densityOf(a);
    if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
    return b.pantryCoverage - a.pantryCoverage;
  });

export const findMatchingRecipes = (
  userIngredients: PantryIngredient[],
  allRecipes: Recipe[],
  minMatchPercentage: number | MatchOptions = 20
): MatchResult[] => {
  if (!userIngredients.length) return [];

  const opts: MatchOptions =
    typeof minMatchPercentage === "number"
      ? { minMatchPercentage }
      : minMatchPercentage || {};
  const minPct = opts.minMatchPercentage ?? 20;
  const mode = opts.mode || "cook_now";
  const excludeBlocked = opts.excludeBlocked !== false;

  // Expand "tomatoes garlic onion" style rows into discrete pantry items
  const expanded = expandPantryIngredients(userIngredients);
  const pantrySize = expanded.length;

  let results = allRecipes
    .map((recipe) => {
      const match = calculateRecipeMatch(expanded, recipe);
      const { blocked, reasons } = recipeViolatesConstraints(recipe, opts.constraints);
      if (blocked) {
        return {
          ...match,
          canMakeNow: false,
          constraintBlocked: true,
          constraintReasons: reasons,
          priority: "low" as const,
          priorityReason: reasons[0] || "Blocked by dietary or equipment constraints",
        };
      }
      return { ...match, constraintBlocked: false, constraintReasons: [] as string[] };
    })
    .filter((match) => {
      if (match.constraintBlocked && excludeBlocked) return false;
      if (match.totalIngredients === 0) return false;
      if (match.totalIngredients >= 20 && densityOf(match) < 0.35) return false;
      // cook_now mode: prefer stronger overlaps; still keep short shopping lists
      if (mode === "cook_now") {
        if (match.canMakeNow) return true;
        if (match.missingIngredients.length <= 2 && match.matchedCount >= 2) return true;
        if (match.matchedCount >= 3 && densityOf(match) >= 0.35) return true;
        return false;
      }
      if (match.matchedCount >= 3 && densityOf(match) >= 0.25) return true;
      if (match.matchedCount >= 2 && match.matchPercentage >= 15) return true;
      if (match.matchedCount >= 1 && pantrySize <= 2 && match.pantryCoverage >= 50) return true;
      return match.matchPercentage >= minPct && match.matchedCount >= 1;
    });

  return sortByCookability(results);
};

/** Matches that specifically help clear items expiring within ~3 days. */
export const filterCookFromExpiring = (matches: MatchResult[]): MatchResult[] =>
  matches.filter(
    (m) => m.urgencyBoost > 0 || /expir/i.test(m.priorityReason || "")
  );

export const buildPantryInsights = (matches: MatchResult[], pantryCount: number): string => {
  if (!matches.length) {
    return pantryCount
      ? "No strong matches yet — add a protein, staple grain, or common spice to unlock more dishes."
      : "Add what’s in your kitchen to unlock cook-now matches.";
  }
  const cookNow = matches.filter((m) => m.canMakeNow).length;
  const urgent = matches.filter((m) => m.urgencyBoost > 0).length;
  const top = matches[0];
  const parts = [
    `Found ${matches.length} dish${matches.length === 1 ? "" : "es"} that fit your pantry of ${pantryCount} item${pantryCount === 1 ? "" : "s"}.`,
  ];
  if (cookNow) parts.push(`${cookNow} you can cook with little or no shopping.`);
  if (urgent) parts.push(`${urgent} help use ingredients that expire soon.`);
  if (top) {
    parts.push(
      `Top match: ${top.recipe.name} (${top.matchPercentage}% · ${top.matchedCount}/${top.totalIngredients} ingredients).`
    );
  }
  return parts.join(" ");
};
