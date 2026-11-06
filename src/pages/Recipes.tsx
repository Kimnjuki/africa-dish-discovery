import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, MapPin, Heart, Star, Sparkles, Lock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NutritionBadge } from "@/components/NutritionBadge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { EnhancedRecipePreparation } from "@/components/enhanced/EnhancedRecipePreparation";
import { RecipeSchema } from "@/components/seo/RecipeSchema";
import { PageMeta } from "@/components/seo/PageMeta";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import useRequireAuth from "@/hooks/useRequireAuth";
import recipesHero from "@/assets/recipes-hero.jpg";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";
import { readErrorMessage } from "@/lib/errors";

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
  image_url?: string;
  ingredients: IngredientValue[] | null;
  steps: StepValue[] | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const { user, requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSearchResults = (results: Recipe[], isAiEnhanced: boolean) => {
    setFilteredRecipes(results);
    setAiEnhanced(isAiEnhanced);
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('recipes')
        .select('*');

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        setRecipes([]);
        return;
      }

      setRecipes(data.map(withParsedRecipeFields));
      setFilteredRecipes(data.map(withParsedRecipeFields));
    } catch (error: unknown) {
      console.error('Error fetching recipes:', error);
      toast.error(readErrorMessage(error) || "Failed to load recipes");
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (recipeId: string, recipeName: string) => {
    if (!requireAuth()) return;
    
    if (!recipeId || typeof recipeId !== 'string') {
      toast.error("Invalid recipe ID");
      return;
    }

    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info("Already in favorites");
        return;
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          recipe_id: recipeId,
          user_id: user.id
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success(`Added ${recipeName} to favorites`);
    } catch (error: unknown) {
      console.error('Error adding to favorites:', error);
      toast.error(readErrorMessage(error) || "Failed to add to favorites");
    }
  };

  const startCooking = (recipe: Recipe) => {
    if (!recipe || !recipe.id) {
      toast.error("Invalid recipe data");
      return;
    }
    requireAuth(() => {
      setSelectedRecipe(recipe);
    });
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
      <div className="min-h-screen bg-gradient-earth">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-muted rounded" />
                    <div className="h-8 w-16 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <PageMeta
        title="African Recipes | Authentic Dishes from West, East, North & Southern Africa | TasteAfrica"
        description="Explore 50+ authentic African recipes from Nigeria, Ghana, Kenya, Ethiopia & more. Find Jollof Rice, Fufu, Injera, Nyama Choma with step-by-step guides. Filter by country and difficulty."
        keywords="african recipes, nigerian jollof rice, ghanaian fufu, ethiopian injera, kenyan nyama choma, african food, west african recipes, east african cuisine"
        canonical="https://6fde0ee8-1c45-43f7-b769-be75373bc9da.lovableproject.com/recipes"
      />
      <Navigation />
      
      {/* Header with Hero Image */}
      <section 
        className="relative py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${recipesHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              <span className="text-gradient">African Recipes</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover authentic African recipes from across the continent. From traditional favorites to modern innovations.
            </p>
          </div>

          {/* AI-Powered Search */}
          <div className="max-w-4xl mx-auto">
            <AdvancedSearch 
              onSearchResults={handleSearchResults}
              onLoading={setLoading}
            />
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-12">
        {aiEnhanced && (
          <div className="container mx-auto px-6 mb-6">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Enhanced Results
            </Badge>
          </div>
        )}
        <div className="container mx-auto px-6">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-warm transition-all duration-300 overflow-hidden">
                  <RecipeSchema recipe={recipe} />
                  <div className="relative">
                    <RecipeImagePlaceholder
                      name={recipe.name}
                      country={recipe.country}
                      imageUrl={recipe.image_url}
                      className="h-48 w-full"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => addToFavorites(recipe.id, recipe.name)}
                      title={user ? "Add to favorites" : "Sign in to save"}
                    >
                      {user ? <Heart className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-medium">{recipe.country}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {recipe.name}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {recipe.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <NutritionBadge calories={recipe.calories} protein={recipe.protein} carbs={recipe.carbs} fats={recipe.fats} />
                      {recipe.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
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
      
      <Footer />
    </div>
  );
};

export default Recipes;