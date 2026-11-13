import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock, ShoppingCart, Star, ChefHat, Sparkles, Calendar, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CookingPopup from "./CookingPopup";
import { withParsedRecipeFields, type IngredientValue, type CookableRecipe } from "@/types/content";
import {
  findMatchingRecipes as rankPantryMatches,
  splitPantryInput,
} from "@/utils/recipeMatching";

interface PantryItem {
  id: string;
  ingredient_name: string;
  quantity?: number;
  unit?: string;
  expires_at?: string;
  added_at: string;
}

interface Recipe {
  id: string;
  name: string;
  country?: string | null;
  summary?: string | null;
  ingredients: IngredientValue[] | null;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  match_percentage?: number;
  missing_ingredients?: string[];
  substitutes?: string[];
  total_ingredients?: number;
  cookability_score?: number;
  can_cook_now?: boolean;
}

interface ShoppingListItem {
  id?: string;
  ingredient_name: string;
  recipe_id?: string;
  checked?: boolean;
  store_suggestion?: string;
  affiliate_link?: string;
}

const EnhancedPantryIntelligence = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState<'pantry' | 'recipes' | 'shopping'>('pantry');
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPantryItems();
      loadShoppingList();
    }
  }, [user]);

  useEffect(() => {
    if (pantryItems.length > 0) {
      findMatchingRecipes();
    }
  }, [pantryItems]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadPantryItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setPantryItems(data || []);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      toast({
        title: "Error",
        description: "Failed to load pantry items",
        variant: "destructive"
      });
    }
  };

  const loadShoppingList = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setShoppingList(data || []);
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  };

  const addIngredient = async () => {
    if (!newIngredient.trim() || !user) return;
    const parts = splitPantryInput(newIngredient.trim());

    try {
      const { error } = await supabase.from("pantry_items").insert(
        parts.map((part) => ({
          ingredient_name: part,
          user_id: user.id,
          quantity: 1,
          unit: "piece",
        }))
      );

      if (error) throw error;

      const typed = newIngredient.trim();
      setNewIngredient("");
      loadPantryItems();
      
      toast({
        title: "Added to pantry",
        description:
          parts.length > 1
            ? `Split into ${parts.length} ingredients: ${parts.join(", ")}`
            : `${typed} has been added to your pantry`,
      });
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive"
      });
    }
  };

  const removeIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPantryItems();
      
      toast({
        title: "Removed from pantry",
        description: "Ingredient has been removed",
      });
    } catch (error) {
      console.error('Error removing ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to remove ingredient",
        variant: "destructive"
      });
    }
  };

  const findMatchingRecipes = async () => {
    setLoading(true);
    try {
      const pageSize = 1000;
      let recipes: any[] = [];
      let from = 0;
      while (from < 3000) {
        const { data, error } = await supabase
          .from("recipes")
          .select(
            "id,name,country,summary,ingredients,prep_time,cook_time,servings,difficulty,tags,image_url,cuisine_type,category"
          )
          .not("ingredients", "is", null)
          .order("name")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data?.length) break;
        recipes = recipes.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      const ranked = rankPantryMatches(
        pantryItems.map((item) => ({
          id: item.id,
          name: item.ingredient_name,
          ingredient_name: item.ingredient_name,
          expires_at: item.expires_at,
        })),
        recipes,
        18
      ).slice(0, 16);

      const sortedRecipes = ranked.map((match) => ({
        ...match.recipe,
        match_percentage: match.matchPercentage,
        missing_ingredients: match.missingIngredients,
        total_ingredients: match.totalIngredients,
        cookability_score: match.matchPercentage + match.urgencyBoost - match.missingIngredients.length * 3,
        can_cook_now: match.canMakeNow,
      }));

      setSuggestedRecipes(sortedRecipes.map(withParsedRecipeFields));
      if (sortedRecipes.length > 0) {
        setActiveTab("recipes");
      }
    } catch (error) {
      console.error('Error finding matching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to find matching recipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToShoppingList = async (ingredients: string[], recipeId?: string) => {
    if (!user) return;

    try {
      const itemsToAdd = ingredients.map(ingredient => ({
        ingredient_name: ingredient,
        user_id: user.id,
        recipe_id: recipeId,
        checked: false,
        store_suggestion: getStoreSuggestion(ingredient)
      }));

      const { error } = await supabase
        .from('shopping_list_items')
        .insert(itemsToAdd);

      if (error) throw error;

      loadShoppingList();
      toast({
        title: "Added to shopping list",
        description: `${ingredients.length} items added to your shopping list`,
      });
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to add to shopping list",
        variant: "destructive"
      });
    }
  };

  const getStoreSuggestion = (ingredient: string): string => {
    const stores = ["Amazon Fresh", "Whole Foods", "Walmart", "Target", "Local Market"];
    return stores[Math.floor(Math.random() * stores.length)];
  };

  const startCooking = (recipe: CookableRecipe) => {
    setSelectedRecipe(recipe);
    setIsCookingPopupOpen(true);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <section className="py-20 bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Unlock Pantry Intelligence</h3>
              <p className="text-muted-foreground mb-6">
                Sign in to access your smart pantry management, recipe matching, and shopping list features.
              </p>
              <Button variant="hero" size="lg" asChild>
                <a href="/auth">Sign In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/10 to-primary/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Pantry Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Smart recipe matching based on your pantry ingredients. 
            Get cooking suggestions and automated shopping lists.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-background rounded-xl p-1 shadow-soft">
            {(['pantry', 'recipes', 'shopping'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-2 capitalize"
              >
                {tab === 'pantry' && <ChefHat className="w-4 h-4 mr-2" />}
                {tab === 'recipes' && <Star className="w-4 h-4 mr-2" />}
                {tab === 'shopping' && <ShoppingCart className="w-4 h-4 mr-2" />}
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Pantry Management */}
        {activeTab === 'pantry' && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  My Pantry ({pantryItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Add ingredient (e.g., tomatoes, rice, chicken)"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    className="flex-1"
                  />
                  <Button onClick={addIngredient} disabled={!newIngredient.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {pantryItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Your pantry is empty. Add some ingredients to get recipe suggestions!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pantryItems.map((item) => {
                      const daysUntilExpiry = item.expires_at ? getDaysUntilExpiry(item.expires_at) : null;
                      const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3;
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isExpiringSoon 
                              ? 'border-destructive/50 bg-destructive/5' 
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-medium">{item.ingredient_name}</span>
                              {item.quantity && item.unit && (
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit}
                                </p>
                              )}
                              {daysUntilExpiry !== null && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className={`text-xs ${isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {daysUntilExpiry > 0 
                                      ? `${daysUntilExpiry} days left` 
                                      : 'Expired'
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredient(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recipe Suggestions */}
        {activeTab === 'recipes' && (
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Suggested Recipes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg mb-4" />
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : suggestedRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No matching recipes found. Add more ingredients to your pantry!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedRecipes.map((recipe) => (
                      <Card key={recipe.id} className="overflow-hidden hover:shadow-warm transition-shadow">
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant={recipe.can_cook_now ? "default" : recipe.match_percentage >= 60 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {recipe.match_percentage}% match
                              </Badge>
                              {recipe.can_cook_now && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Ready to Cook!
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{recipe.name}</h3>
                            <p className="text-sm text-muted-foreground">{recipe.country}</p>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {recipe.summary}
                          </p>

                          {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Missing ingredients:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {recipe.missing_ingredients.slice(0, 3).map((ingredient, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {recipe.missing_ingredients.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{recipe.missing_ingredients.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              variant="hero" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => startCooking(recipe)}
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              Start Cooking
                            </Button>
                            {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => addToShoppingList(recipe.missing_ingredients, recipe.id)}
                              >
                                <ShoppingCart className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shopping List */}
        {activeTab === 'shopping' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping List ({shoppingList.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shoppingList.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Your shopping list is empty. Missing ingredients from recipes will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shoppingList.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          item.checked ? 'bg-muted/50' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.checked || false}
                            className="w-4 h-4"
                            readOnly
                          />
                          <div>
                            <span className={`font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.ingredient_name}
                            </span>
                            {item.store_suggestion && (
                              <p className="text-xs text-muted-foreground">
                                Suggested: {item.store_suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {item.affiliate_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.affiliate_link} target="_blank" rel="noopener noreferrer">
                                Buy Now
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cooking Popup */}
        <CookingPopup 
          recipe={selectedRecipe}
          isOpen={isCookingPopupOpen}
          onClose={() => {
            setIsCookingPopupOpen(false);
            setSelectedRecipe(null);
          }}
        />
      </div>
    </section>
  );
};

export default EnhancedPantryIntelligence;