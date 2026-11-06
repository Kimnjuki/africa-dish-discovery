import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Plus, X, Sparkles, Clock, Users, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findMatchingRecipes as calculateMatches } from "@/utils/recipeMatching";
import { asIngredientList, withParsedRecipeFields, type IngredientValue, type CookableRecipe } from "@/types/content";

interface PantryItem {
  id: string;
  ingredient_name: string;
  expires_at?: string;
}

interface Recipe {
  id: string;
  name: string;
  country: string;
  summary: string;
  ingredients: IngredientValue[] | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  tags: string[] | null;
  slug: string;
  is_african: boolean | null;
  matchCount?: number;
  matchPercentage?: number;
  totalIngredients?: number;
  missingIngredients?: string[];
  canMakeNow?: boolean;
  needsShopping?: boolean;
}

const PantryIntelligence = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPantryItems();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pantryItems.length > 0) {
      findMatchingRecipes();
    }
  }, [pantryItems]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const loadPantryItems = async () => {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .order("added_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading pantry",
        description: error.message,
      });
      return;
    }

    setPantryItems(data || []);
  };

  const addIngredient = async () => {
    if (!newIngredient.trim() || !isAuthenticated) return;

    const { error } = await supabase
      .from("pantry_items")
      .insert([{ 
        ingredient_name: newIngredient.trim(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding ingredient",
        description: error.message,
      });
      return;
    }

    setNewIngredient("");
    loadPantryItems();
    toast({
      title: "Ingredient added!",
      description: `${newIngredient} has been added to your pantry.`,
    });
  };

  const removeIngredient = async (id: string) => {
    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error removing ingredient",
        description: error.message,
      });
      return;
    }

    loadPantryItems();
  };

  const findMatchingRecipes = async () => {
    if (pantryItems.length === 0) {
      setSuggestedRecipes([]);
      return;
    }

    setLoading(true);
    
    // Get all recipes and match ingredients
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error finding recipes",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    if (!recipes || recipes.length === 0) {
      setSuggestedRecipes([]);
      setLoading(false);
      return;
    }

    // Simple ingredient matching logic
    const pantryIngredients = pantryItems.map(item => 
      item.ingredient_name.toLowerCase()
    );

    const matchedRecipes = recipes
      ?.map(recipe => {
        // Safely handle ingredients as JSON
        const recipeIngredients = asIngredientList(recipe.ingredients);
        const matches = recipeIngredients.filter((ingredient) => {
          const name = (typeof ingredient === "string" ? ingredient : ingredient.name || "").toLowerCase();
          return pantryIngredients.some((pantryItem) =>
            name.includes(pantryItem) || pantryItem.includes(name)
          );
        });
        
        const matchPercentage = recipeIngredients.length > 0 ? 
          Math.round((matches.length / recipeIngredients.length) * 100) : 0;
        
        return {
          ...recipe,
          matchCount: matches.length,
          matchPercentage,
          totalIngredients: recipeIngredients.length,
          canMakeNow: matchPercentage >= 90,
          needsShopping: matchPercentage >= 70 && matchPercentage < 90
        };
      })
      .filter(recipe => recipe.matchCount && recipe.matchCount > 0)
      .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      .slice(0, 6) || [];

    setSuggestedRecipes(matchedRecipes.map(withParsedRecipeFields));
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <ChefHat className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Pantry Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Sign in to get personalized recipe suggestions based on your pantry ingredients.
              </p>
              <Button variant="hero" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
                Sign In to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Pantry Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tell us what's in your pantry, and we'll suggest delicious recipes you can make right now.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Pantry Management */}
          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                My Pantry ({pantryItems.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add ingredient (e.g., tomatoes, rice, chicken)"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient} variant="earth">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="flex items-center gap-2 pr-1"
                  >
                    {item.ingredient_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(item.id)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recipe Match Summary */}
          <Card className="border-primary/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recipe Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Finding perfect recipes...</p>
                </div>
              ) : suggestedRecipes.length > 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {suggestedRecipes.length} recipes you can make with your pantry ingredients!
                  </p>
                  <div className="space-y-2">
                    {suggestedRecipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="font-medium">{recipe.name}</span>
                        <Badge variant="secondary">{recipe.matchPercentage}% match</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : pantryItems.length > 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recipes found. Try adding more ingredients to your pantry!
                </p>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Add ingredients to your pantry to see recipe suggestions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggested Recipes Grid */}
        {suggestedRecipes.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-8 text-center">Recipes You Can Make</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedRecipes.map((recipe) => (
                <Card 
                  key={recipe.id}
                  className="group border-primary/10 shadow-soft hover:shadow-warm transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="relative h-48 bg-gradient-sunset flex items-center justify-center">
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                        {recipe.matchPercentage}% Match
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className={recipe.is_african ? "bg-orange-500/90 text-white" : ""}>
                        {recipe.country}
                      </Badge>
                    </div>
                    <ChefHat className="w-16 h-16 text-white/60" />
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.summary}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{recipe.prep_time + recipe.cook_time}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span>{recipe.servings}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-3 h-3 text-primary" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="earth" className="w-full">
                      View Recipe
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PantryIntelligence;