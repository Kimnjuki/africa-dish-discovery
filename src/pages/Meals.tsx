import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Coffee, Salad, Soup, ChefHat, Wine, Cookie, Sun, Heart, Beef, Fish, Drumstick, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mealsHero from "@/assets/meals-hero.jpg";
import { EnhancedRecipePreparation } from "@/components/enhanced/EnhancedRecipePreparation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { NutritionBadge } from "@/components/NutritionBadge";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  country: string;
  summary: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: IngredientValue[] | null;
  steps: StepValue[] | null;
  image_url?: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}


const mealCategories = [
  { id: "breakfast", name: "Breakfast", icon: Coffee, description: "Start your day with African flavors" },
  { id: "lunch", name: "Lunch", icon: Sun, description: "Hearty midday meals" },
  { id: "dinner", name: "Dinner", icon: Utensils, description: "Evening feasts and comfort food" },
  { id: "drinks", name: "Drinks", icon: Wine, description: "Refreshing beverages & cocktails" },
  { id: "healthy", name: "Healthy", icon: Heart, description: "Nutritious and wholesome dishes" },
  { id: "appetizers", name: "Appetizers & Snacks", icon: Utensils, description: "Perfect for sharing" },
  { id: "salads", name: "Salads", icon: Salad, description: "Fresh and vibrant salads" },
  { id: "sides", name: "Side Dishes", icon: Utensils, description: "Perfect accompaniments" },
  { id: "soups", name: "Soups", icon: Soup, description: "Warming and comforting" },
  { id: "bread", name: "Bread", icon: ChefHat, description: "Traditional African breads" },
  { id: "desserts", name: "Desserts", icon: Cookie, description: "Sweet endings" }
];

const ingredientCategories = [
  { id: "beef", name: "Beef", icon: Beef, description: "Beef-based recipes" },
  { id: "chicken", name: "Chicken", icon: Drumstick, description: "Chicken dishes" },
  { id: "fish", name: "Fish & Seafood", icon: Fish, description: "Seafood recipes" },
  { id: "lamb", name: "Lamb & Goat", icon: Beef, description: "Lamb and goat dishes" },
  { id: "vegetables", name: "Vegetables", icon: Leaf, description: "Vegetarian dishes" },
  { id: "legumes", name: "Beans & Legumes", icon: Leaf, description: "Beans, lentils, peas" },
  { id: "grains", name: "Rice & Grains", icon: ChefHat, description: "Rice and grain-based dishes" },
];

const Meals = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState("all");
  const [ingredientType, setIngredientType] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [mealType, ingredientType, recipes]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes((data || []).map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by meal type - check category field first, then tags
    if (mealType !== "all") {
      const categoryKeywords = getCategoryKeywords(mealType);
      filtered = filtered.filter(recipe => {
        // Direct category match (e.g., category = "Breakfast", "Lunch", "Dinner", "Drinks")
        const recipeCategory = recipe.category?.toLowerCase() || "";
        if (categoryKeywords.some(keyword => recipeCategory === keyword.toLowerCase())) {
          return true;
        }
        // Fallback: check tags
        const tags = recipe.tags || [];
        return tags.some(tag => 
          categoryKeywords.some(keyword => 
            tag.toLowerCase().includes(keyword.toLowerCase())
          )
        ) || categoryKeywords.some(keyword => 
          recipe.name.toLowerCase().includes(keyword.toLowerCase())
        );
      });
    }

    // Filter by ingredient type
    if (ingredientType !== "all") {
      const ingredientKeywords = getIngredientKeywords(ingredientType);
      filtered = filtered.filter(recipe => {
        const ingredients = recipe.ingredients;
        const tags = recipe.tags || [];
        const recipeName = recipe.name.toLowerCase();
        const recipeSummary = recipe.summary?.toLowerCase() || "";
        
        let ingredientText = "";
        if (Array.isArray(ingredients)) {
          ingredientText = ingredients.map(ing => {
            if (typeof ing === 'string') return ing;
            if (typeof ing === 'object' && ing !== null) {
              return ing.item || ing.ingredient || ing.name || "";
            }
            return "";
          }).join(" ").toLowerCase();
        } else if (typeof ingredients === 'object') {
          ingredientText = JSON.stringify(ingredients).toLowerCase();
        }
        
        return ingredientKeywords.some(keyword => 
          ingredientText.includes(keyword.toLowerCase()) ||
          tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())) ||
          recipeName.includes(keyword.toLowerCase()) ||
          recipeSummary.includes(keyword.toLowerCase())
        );
      });
    }

    setFilteredRecipes(filtered);
  };

  const getCategoryKeywords = (category: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      breakfast: ["breakfast", "morning", "porridge"],
      lunch: ["lunch", "midday"],
      dinner: ["dinner", "evening", "supper"],
      healthy: ["healthy", "nutritious", "diet", "light", "fresh"],
      appetizers: ["appetizer", "snack", "starter", "finger", "small"],
      salads: ["salad", "greens", "fresh", "raw", "lettuce"],
      sides: ["side", "accompaniment"],
      soups: ["soup", "broth"],
      bread: ["bread", "flatbread", "bun", "roll", "loaf"],
      drinks: ["drink", "drinks", "beverage", "juice", "tea", "coffee", "smoothie", "beer", "wine", "cocktail"],
      desserts: ["dessert", "sweet", "cake", "pudding"]
    };
    
    return keywordMap[category] || [];
  };

  const getIngredientKeywords = (ingredient: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      beef: ["beef", "steak", "ground beef", "cow", "oxtail"],
      chicken: ["chicken", "hen", "poultry", "fowl"],
      fish: ["fish", "seafood", "shrimp", "prawn", "crab", "tilapia", "salmon", "tuna"],
      lamb: ["lamb", "goat", "mutton", "chevon"],
      vegetables: ["vegetable", "vegetarian", "vegan", "veggie", "plant-based"],
      legumes: ["beans", "lentils", "chickpeas", "peas", "legumes", "black-eyed peas"],
      grains: ["rice", "grain", "couscous", "quinoa", "millet", "sorghum", "fonio"]
    };
    
    return keywordMap[ingredient] || [];
  };

  const startCooking = (recipe: Recipe) => {
    if (!recipe || !recipe.id) {
      toast.error("Invalid recipe data");
      return;
    }
    setSelectedRecipe(recipe);
  };

  if (selectedRecipe) {
    return (
      <EnhancedRecipePreparation 
        recipe={selectedRecipe} 
        onBack={() => setSelectedRecipe(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageMeta
          title="African Meals by Time of Day | Breakfast, Lunch & Dinner | TasteAfrica"
          description="Explore African recipes organized by meal type. Find breakfast, lunch, dinner, and snack recipes from across the continent. Perfect meal planning for any time of day."
          keywords="african breakfast, african lunch recipes, african dinner ideas, african snacks, meal planning, african cuisine by meal type"
          canonical="https://tasteafrica.com/meals"
        />
        
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading delicious meals...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageMeta
        title="African Meals by Time of Day | Breakfast, Lunch & Dinner | TasteAfrica"
        description="Explore African recipes organized by meal type. Find breakfast, lunch, dinner, and snack recipes from across the continent. Perfect meal planning for any time of day."
        keywords="african breakfast, african lunch recipes, african dinner ideas, african snacks, meal planning, african cuisine by meal type"
        canonical="https://tasteafrica.com/meals"
      />
      
      <Navigation />
      <main className="pt-16">
        {/* Hero Section with Image */}
        <section 
          className="relative py-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${mealsHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/20" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore African Meals
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover authentic African recipes organized by meal type and ingredient. 
              From hearty breakfasts to delightful desserts.
            </p>
          </div>
        </section>

        {/* Smart Recommendations */}
        <SmartRecommendations onRecipeSelect={startCooking} />

        {/* Combined Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Filter Recipes</h2>
              <p className="text-muted-foreground">Combine meal type and ingredient filters to find your perfect dish</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Meal Type</label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meal Types</SelectItem>
                    {mealCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Main Ingredient</label>
                <Select value={ingredientType} onValueChange={setIngredientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ingredients</SelectItem>
                    {ingredientCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(mealType !== "all" || ingredientType !== "all") && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {mealType !== "all" && (
                  <Badge variant="secondary" className="text-sm">
                    Meal: {mealCategories.find(c => c.id === mealType)?.name}
                    <button onClick={() => setMealType("all")} className="ml-2 hover:text-destructive">✕</button>
                  </Badge>
                )}
                {ingredientType !== "all" && (
                  <Badge variant="secondary" className="text-sm">
                    Ingredient: {ingredientCategories.find(c => c.id === ingredientType)?.name}
                    <button onClick={() => setIngredientType("all")} className="ml-2 hover:text-destructive">✕</button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {(mealType === "all" && ingredientType === "all") 
                  ? "All Recipes" 
                  : "Filtered Results"}
              </h2>
              <p className="text-muted-foreground">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No recipes found matching your filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMealType("all");
                    setIngredientType("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <Card key={recipe.id} className="group hover:shadow-warm transition-all duration-300">
                    <div className="aspect-video bg-gradient-map overflow-hidden rounded-t-lg">
                      {recipe.image_url ? (
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {recipe.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {recipe.country}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {recipe.summary}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>⏱️ {recipe.prep_time + recipe.cook_time} min</span>
                        <span>🍽️ {recipe.servings} servings</span>
                        <span>📊 {recipe.difficulty}</span>
                      </div>
                      <div className="mb-3">
                        <NutritionBadge calories={recipe.calories} protein={recipe.protein} carbs={recipe.carbs} fats={recipe.fats} />
                      </div>

                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => startCooking(recipe)}
                      >
                        Start Cooking
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Meals;