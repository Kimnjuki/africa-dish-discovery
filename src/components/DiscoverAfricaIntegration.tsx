import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Star, Bookmark, Heart, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CookingPopup from "./CookingPopup";
import discoverAfricaHero from "@/assets/discover-africa-hero.jpg";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";
import type { User } from "@supabase/supabase-js";
import { readErrorMessage } from "@/lib/errors";

interface DiscoverAfricaRecipe {
  id: string;
  name: string;
  country: string;
  summary: string;
  ingredients: IngredientValue[] | null;
  steps: StepValue[] | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  tags: string[] | null;
  image_url?: string | null;
  slug: string;
  region_id?: string | null;
  is_african?: boolean | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

const DiscoverAfricaIntegration = () => {
  const [recipes, setRecipes] = useState<DiscoverAfricaRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<DiscoverAfricaRecipe | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadFavorites();
    }
  };

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("is_african", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecipes((data || []).map(withParsedRecipeFields));
    } catch (error: unknown) {
      toast({
        title: "Error loading recipes",
        description: readErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setFavorites(data?.map(f => f.recipe_id) || []);
    } catch (error: unknown) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorited = favorites.includes(recipeId);

      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== recipeId));
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites.",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            collection_name: "Saved Recipes"
          });

        if (error) throw error;

        setFavorites(prev => [...prev, recipeId]);
        toast({
          title: "Added to favorites",
          description: "Recipe saved to your favorites.",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: readErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const startCooking = (recipe: DiscoverAfricaRecipe) => {
    setSelectedRecipe(recipe);
    setIsCookingPopupOpen(true);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-earth">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading African recipes...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        {/* Hero Section with Image */}
        <div 
          className="relative py-12 bg-cover bg-center rounded-lg mb-16"
          style={{ backgroundImage: `url(${discoverAfricaHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/20 rounded-lg" />
          <div className="relative z-10 text-center px-6 py-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Discover Africa
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Explore authentic African recipes from across the continent. From traditional dishes 
              to modern interpretations, discover the rich culinary heritage of Africa.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <Card 
              key={recipe.id}
              className="group border-primary/10 shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {recipe.image_url ? (
                  <img 
                    src={recipe.image_url} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-sunset flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-white/60" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <Badge variant="outline" className="bg-primary/90 text-primary-foreground">
                    African Cuisine
                  </Badge>
                </div>
                
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(recipe.id)}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(recipe.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-white'
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{recipe.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {recipe.country}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                  {recipe.summary}
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}m</span>
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
                  {recipe.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button 
                  onClick={() => startCooking(recipe)}
                  variant="hero" 
                  className="w-full"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Cooking
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              No recipes found. Check back soon for new additions!
            </p>
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

export default DiscoverAfricaIntegration;