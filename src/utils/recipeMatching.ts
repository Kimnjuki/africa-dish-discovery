import type { IngredientValue } from "@/types/content";

interface PantryIngredient {
  id: string;
  name: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
  expires_at?: string;
}

interface RecipeIngredient {
  name?: string;
  ingredient?: string;
  quantity?: string;
  optional?: boolean;
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
}

interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
  substitutableIngredients: Array<{ original: string; substitute: string }>;
  canMakeNow: boolean;
  needsShopping: boolean;
}

// Ingredient substitution database
const ingredientSubstitutes: Record<string, string[]> = {
  'scotch bonnet': ['habanero', 'cayenne pepper', 'red pepper flakes', 'chili pepper'],
  'habanero': ['scotch bonnet', 'cayenne pepper', 'red pepper flakes'],
  'palm oil': ['vegetable oil', 'coconut oil', 'olive oil'],
  'cassava flour': ['all-purpose flour', 'tapioca flour', 'flour'],
  'plantain': ['banana', 'sweet potato'],
  'okra': ['zucchini', 'green beans'],
  'egusi seeds': ['pumpkin seeds', 'sunflower seeds'],
  'stock cube': ['bouillon', 'stock powder', 'broth'],
  'curry powder': ['turmeric', 'cumin', 'garam masala'],
  'bell pepper': ['red pepper', 'green pepper', 'yellow pepper'],
  'tomato paste': ['tomato sauce', 'crushed tomatoes'],
  'onion': ['shallot', 'green onion', 'leek'],
  'garlic': ['garlic powder', 'shallot'],
  'ginger': ['ginger powder'],
  'chicken stock': ['vegetable stock', 'beef stock', 'broth'],
  'vegetable oil': ['olive oil', 'coconut oil', 'palm oil'],
};

const getIngredientSubstitutes = (ingredient: string): string[] => {
  const normalized = ingredient.toLowerCase().trim();
  return ingredientSubstitutes[normalized] || [];
};

const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\d+/g, '') // Remove numbers
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

export const calculateRecipeMatch = (
  userIngredients: PantryIngredient[],
  recipe: Recipe
): MatchResult => {
  const recipeIngredients = recipe.ingredients || [];
  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;
  const missingIngredients: string[] = [];
  const substitutableIngredients: Array<{ original: string; substitute: string }> = [];

  // Normalize user ingredients
  const normalizedUserIngredients = userIngredients.map(ing => ({
    ...ing,
    normalizedName: normalizeIngredientName(ing.ingredient_name || ing.name || '')
  }));

  recipeIngredients.forEach(recipeIng => {
    const ingredientName = typeof recipeIng === 'string' 
      ? recipeIng 
      : recipeIng.name || recipeIng.ingredient || '';
    
    const weight = typeof recipeIng !== "string" && recipeIng.optional ? 0.5 : 1.0;
    totalWeight += weight;

    const recipeIngName = normalizeIngredientName(ingredientName);

    // Check for exact match
    const exactMatch = normalizedUserIngredients.find(userIng =>
      userIng.normalizedName === recipeIngName ||
      userIng.normalizedName.includes(recipeIngName) ||
      recipeIngName.includes(userIng.normalizedName)
    );

    if (exactMatch) {
      matchedCount++;
      matchedWeight += weight;
      return;
    }

    // Check for substitutable ingredients
    const substitutes = getIngredientSubstitutes(recipeIngName);
    const substituteMatch = normalizedUserIngredients.find(userIng =>
      substitutes.some(sub =>
        userIng.normalizedName.includes(sub.toLowerCase()) ||
        sub.toLowerCase().includes(userIng.normalizedName)
      )
    );

    if (substituteMatch) {
      matchedCount++;
      matchedWeight += weight * 0.8; // 80% weight for substitutes
      substitutableIngredients.push({
        original: ingredientName,
        substitute: substituteMatch.ingredient_name || substituteMatch.name
      });
      return;
    }

    // Ingredient is missing
    if (typeof recipeIng === "string" || !recipeIng.optional) {
      missingIngredients.push(ingredientName);
    }
  });

  const matchPercentage = totalWeight > 0 
    ? Math.round((matchedWeight / totalWeight) * 100) 
    : 0;

  return {
    recipe,
    matchPercentage,
    matchedCount,
    totalIngredients: recipeIngredients.length,
    missingIngredients,
    substitutableIngredients,
    canMakeNow: matchPercentage >= 90,
    needsShopping: matchPercentage >= 70 && matchPercentage < 90
  };
};

export const findMatchingRecipes = (
  userIngredients: PantryIngredient[],
  allRecipes: Recipe[],
  minMatchPercentage: number = 70
): MatchResult[] => {
  const matches = allRecipes.map(recipe => 
    calculateRecipeMatch(userIngredients, recipe)
  );

  return matches
    .filter(match => match.matchPercentage >= minMatchPercentage)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};
