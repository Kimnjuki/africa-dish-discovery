import type { IngredientValue } from "@/types/content";

interface PantryIngredient {
  id: string;
  name: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
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
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
  matchedIngredients: string[];
  substitutableIngredients: Array<{ original: string; substitute: string }>;
  canMakeNow: boolean;
  needsShopping: boolean;
  urgencyBoost: number;
  priority: "high" | "medium" | "low";
  priorityReason?: string;
}

const ingredientSubstitutes: Record<string, string[]> = {
  "scotch bonnet": ["habanero", "cayenne pepper", "red pepper flakes", "chili pepper", "aleppo pepper"],
  habanero: ["scotch bonnet", "cayenne pepper", "red pepper flakes"],
  "palm oil": ["vegetable oil", "coconut oil", "olive oil", "ghee"],
  "cassava flour": ["all-purpose flour", "tapioca flour", "flour"],
  plantain: ["banana", "sweet potato"],
  okra: ["zucchini", "green beans"],
  "egusi seeds": ["pumpkin seeds", "sunflower seeds"],
  "stock cube": ["bouillon", "stock powder", "broth", "chicken stock", "vegetable stock"],
  "curry powder": ["turmeric", "cumin", "garam masala"],
  "bell pepper": ["red pepper", "green pepper", "yellow pepper", "capsicum"],
  "tomato paste": ["tomato sauce", "crushed tomatoes", "passata"],
  onion: ["shallot", "green onion", "leek", "spring onion"],
  garlic: ["garlic powder", "shallot"],
  ginger: ["ginger powder"],
  "chicken stock": ["vegetable stock", "beef stock", "broth", "stock cube"],
  "vegetable oil": ["olive oil", "coconut oil", "palm oil", "canola oil"],
  fava: ["broad bean", "lima bean", "chickpea"],
  "fava beans": ["broad beans", "lima beans", "chickpeas"],
  tahina: ["tahini", "sesame paste"],
  tahini: ["tahina", "sesame paste"],
  dukkah: ["zaatar", "sesame seeds", "spice mix"],
  freekeh: ["bulgur", "farro", "quinoa", "brown rice"],
  bulgur: ["freekeh", "couscous", "quinoa"],
  "clarified butter": ["ghee", "butter"],
  ghee: ["clarified butter", "butter"],
  cilantro: ["parsley", "coriander leaves"],
  coriander: ["cilantro", "parsley"],
  lime: ["lemon"],
  lemon: ["lime"],
  yogurt: ["greek yogurt", "sour cream", "labneh"],
  chickpeas: ["garbanzo", "white beans", "cannellini"],
  rice: ["basmati", "jasmine rice", "brown rice"],
  broth: ["stock", "stock cube", "bouillon"],
};

const STOP = new Set([
  "fresh",
  "dried",
  "ground",
  "chopped",
  "diced",
  "sliced",
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
  "cups",
  "cup",
  "tablespoons",
  "tablespoon",
  "teaspoons",
  "teaspoon",
  "ounces",
  "ounce",
  "pounds",
  "pound",
  "grams",
  "gram",
  "ml",
  "and",
  "or",
  "the",
  "a",
  "an",
  "of",
  "to",
  "into",
  "with",
]);

export const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokensOf = (name: string): string[] =>
  normalizeIngredientName(name)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));

const namesOverlap = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const ta = tokensOf(a);
  const tb = tokensOf(b);
  if (!ta.length || !tb.length) return false;
  const setB = new Set(tb);
  const hits = ta.filter((t) => setB.has(t)).length;
  return hits >= Math.min(2, Math.min(ta.length, tb.length)) || (hits >= 1 && (ta.includes(tb[0]) || tb.includes(ta[0])));
};

const getIngredientSubstitutes = (ingredient: string): string[] => {
  const normalized = normalizeIngredientName(ingredient);
  const direct = ingredientSubstitutes[normalized];
  if (direct) return direct;
  for (const [key, vals] of Object.entries(ingredientSubstitutes)) {
    if (namesOverlap(normalized, key)) return vals;
  }
  return [];
};

const daysUntilExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const calculateRecipeMatch = (
  userIngredients: PantryIngredient[],
  recipe: Recipe
): MatchResult => {
  const recipeIngredients = recipe.ingredients || [];
  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;
  let urgencyBoost = 0;
  const missingIngredients: string[] = [];
  const matchedIngredients: string[] = [];
  const substitutableIngredients: Array<{ original: string; substitute: string }> = [];

  const normalizedUserIngredients = userIngredients.map((ing) => {
    const days = daysUntilExpiry(ing.expires_at);
    return {
      ...ing,
      normalizedName: normalizeIngredientName(ing.ingredient_name || ing.name || ""),
      daysLeft: days,
      urgent: days !== null && days <= 3,
    };
  });

  recipeIngredients.forEach((recipeIng) => {
    const ingredientName =
      typeof recipeIng === "string"
        ? recipeIng
        : recipeIng.name || recipeIng.ingredient || (recipeIng as { text?: string }).text || "";

    if (!ingredientName) return;

    const weight = typeof recipeIng !== "string" && recipeIng.optional ? 0.5 : 1.0;
    totalWeight += weight;

    const recipeIngName = normalizeIngredientName(ingredientName);

    const exactMatch = normalizedUserIngredients.find((userIng) =>
      namesOverlap(userIng.normalizedName, recipeIngName)
    );

    if (exactMatch) {
      matchedCount++;
      matchedWeight += weight;
      matchedIngredients.push(ingredientName);
      if (exactMatch.urgent) urgencyBoost += exactMatch.daysLeft !== null && exactMatch.daysLeft <= 1 ? 12 : 8;
      return;
    }

    const substitutes = getIngredientSubstitutes(recipeIngName);
    const substituteMatch = normalizedUserIngredients.find((userIng) =>
      substitutes.some((sub) => namesOverlap(userIng.normalizedName, sub.toLowerCase()))
    );

    if (substituteMatch) {
      matchedCount++;
      matchedWeight += weight * 0.85;
      matchedIngredients.push(ingredientName);
      substitutableIngredients.push({
        original: ingredientName,
        substitute: substituteMatch.ingredient_name || substituteMatch.name,
      });
      if (substituteMatch.urgent) urgencyBoost += 5;
      return;
    }

    if (typeof recipeIng === "string" || !recipeIng.optional) {
      missingIngredients.push(ingredientName);
    }
  });

  const base = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const matchPercentage = Math.min(100, base + Math.min(urgencyBoost, 15));

  let priority: "high" | "medium" | "low" = "low";
  let priorityReason: string | undefined;
  if (urgencyBoost >= 10 && base >= 50) {
    priority = "high";
    priorityReason = "Uses ingredients expiring soon";
  } else if (base >= 85) {
    priority = "high";
    priorityReason = "You can cook this now";
  } else if (base >= 70) {
    priority = "medium";
    priorityReason = "Almost ready — short shopping list";
  }

  return {
    recipe,
    matchPercentage,
    matchedCount,
    totalIngredients: recipeIngredients.length,
    missingIngredients,
    matchedIngredients,
    substitutableIngredients,
    canMakeNow: base >= 85 && missingIngredients.length <= 1,
    needsShopping: base >= 55 && base < 85,
    urgencyBoost,
    priority,
    priorityReason,
  };
};

export const findMatchingRecipes = (
  userIngredients: PantryIngredient[],
  allRecipes: Recipe[],
  minMatchPercentage: number = 45
): MatchResult[] => {
  if (!userIngredients.length) return [];

  return allRecipes
    .map((recipe) => calculateRecipeMatch(userIngredients, recipe))
    .filter((match) => match.matchPercentage >= minMatchPercentage && match.totalIngredients > 0)
    .sort((a, b) => {
      if (b.urgencyBoost !== a.urgencyBoost) return b.urgencyBoost - a.urgencyBoost;
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      return a.missingIngredients.length - b.missingIngredients.length;
    });
};

export const buildPantryInsights = (matches: MatchResult[], pantryCount: number): string => {
  if (!matches.length) {
    return pantryCount
      ? "No strong matches yet — add staple spices, oils, or a protein to unlock more dishes."
      : "Add what’s in your kitchen to unlock cook-now matches.";
  }
  const cookNow = matches.filter((m) => m.canMakeNow).length;
  const urgent = matches.filter((m) => m.urgencyBoost > 0).length;
  const top = matches[0];
  const parts = [
    `Scanned ${matches.length}+ viable dishes from your pantry of ${pantryCount} item${pantryCount === 1 ? "" : "s"}.`,
  ];
  if (cookNow) parts.push(`${cookNow} you can cook now.`);
  if (urgent) parts.push(`${urgent} prioritize ingredients that expire soon.`);
  if (top) parts.push(`Top match: ${top.recipe.name} (${top.matchPercentage}%).`);
  return parts.join(" ");
};
