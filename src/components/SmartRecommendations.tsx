import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { asIngredientList, withParsedRecipeFields, type IngredientValue } from "@/types/content";
import type { User } from "@supabase/supabase-js";

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
  image_url?: string;
  average_rating?: number;
  total_reviews?: number;
  match_percentage?: number;
}

interface SmartRecommendationsProps {
  onRecipeSelect: (recipe: Recipe) => void;
}

export const SmartRecommendations = ({ onRecipeSelect }: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuthAndLoadRecommendations();
  }, []);

  const checkAuthAndLoadRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadSmartRecommendations(user.id);
      } else {
        await loadTopRatedRecipes();
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const loadSmartRecommendations = async (userId: string) => {
    try {
      // Get user's pantry items
      const { data: pantryItems } = await supabase
        .from('pantry_items')
        .select('ingredient_name')
        .eq('user_id', userId);

      // Get user profile preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('dietary_restrictions, favorite_cuisines, preferred_difficulty, cooking_time_preference')
        .eq('id', userId)
        .single();

      // Get recipes - don't join with ratings if table is empty to avoid issues
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(50);

      if (error) throw error;

      // Score and filter recipes based on user preferences and pantry
      const scoredRecipes = recipes?.map(recipe => {
        let score = 0;
        const pantryIngredients = pantryItems?.map(item => item.ingredient_name.toLowerCase()) || [];
        
        // Match pantry ingredients
        const recipeIngredients = getRecipeIngredients(recipe.ingredients);
        const matchingIngredients = recipeIngredients.filter(ing => 
          pantryIngredients.some(pantryIng => ing.includes(pantryIng) || pantryIng.includes(ing))
        );
        const matchPercentage = recipeIngredients.length > 0 
          ? (matchingIngredients.length / recipeIngredients.length) * 100 
          : 0;
        score += matchPercentage * 0.4; // 40% weight for pantry match

        // Match preferences
        if (profile?.preferred_difficulty && recipe.difficulty === profile.preferred_difficulty) {
          score += 20;
        }
        
        if (profile?.cooking_time_preference) {
          const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
          if (totalTime <= profile.cooking_time_preference) {
            score += 15;
          }
        }

        if (profile?.favorite_cuisines?.length > 0) {
          if (profile.favorite_cuisines.includes(recipe.country)) {
            score += 15;
          }
        }

        return {
          ...recipe,
          average_rating: 0,
          total_reviews: 0,
          match_percentage: Math.round(matchPercentage)
        };
      }) || [];

      // Sort by score and get top recommendations
      const topRecommendations = scoredRecipes
        .sort((a, b) => {
          const scoreA = (a.match_percentage || 0) + (a.average_rating || 0) * 10;
          const scoreB = (b.match_percentage || 0) + (b.average_rating || 0) * 10;
          return scoreB - scoreA;
        })
        .slice(0, 6);

      setRecommendations(topRecommendations.map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error loading smart recommendations:', error);
      toast.error("Failed to load personalized recommendations");
    }
  };

  const loadTopRatedRecipes = async () => {
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const recipesWithRatings = recipes?.map(recipe => ({
        ...recipe,
        average_rating: 0,
        total_reviews: 0
      })) || [];

      setRecommendations(recipesWithRatings.map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error loading top recipes:', error);
      setLoading(false);
    }
  };

  const getRecipeIngredients = (ingredients: unknown): string[] => {
    return asIngredientList(ingredients).map((ing) => {
      if (typeof ing === "string") return ing.toLowerCase();
      if (typeof ing === "object" && ing !== null) {
        return (ing.item || ing.ingredient || ing.name || "").toLowerCase();
      }
      return "";
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">
              {user ? "Smart Recommendations For You" : "Top Rated Recipes"}
            </h2>
            <p className="text-muted-foreground">
              {user 
                ? "Personalized recipe suggestions based on your pantry and preferences" 
                : "Sign in to get personalized recommendations"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recipe) => (
            <Card key={recipe.id} className="group hover:shadow-warm transition-all duration-300">
              <div className="aspect-video bg-gradient-map overflow-hidden rounded-t-lg relative">
                {recipe.image_url ? (
                  <img 
                    src={recipe.image_url} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <Sparkles className="w-12 h-12 text-primary-foreground" />
                  </div>
                )}
                
                {recipe.match_percentage && recipe.match_percentage > 30 && (
                  <Badge className="absolute top-2 right-2 bg-primary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {recipe.match_percentage}% Match
                  </Badge>
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
                
                {recipe.average_rating > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= recipe.average_rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {recipe.average_rating.toFixed(1)} ({recipe.total_reviews} reviews)
                    </span>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {recipe.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                  </span>
                  <span>🍽️ {recipe.servings} servings</span>
                  <span>📊 {recipe.difficulty}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  variant="hero"
                  onClick={() => onRecipeSelect(recipe)}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};