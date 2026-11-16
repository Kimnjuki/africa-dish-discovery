import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, ChefHat, Heart, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RecipeImagePlaceholder from "./RecipeImagePlaceholder";
import useRequireAuth from "@/hooks/useRequireAuth";
import CookingPopup from "./CookingPopup";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  slug?: string | null;
  country: string;
  summary?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  image_url?: string;
  ingredients?: IngredientValue[] | null;
  steps?: StepValue[] | null;
}

const FeaturedRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const { user, requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  const fetchFeaturedRecipes = async () => {
    try {
      const africaFilter = "is_african.eq.true,continent.eq.Africa";
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .or(africaFilter)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      let rows = data || [];
      if (rows.length < 6) {
        const { data: fallback } = await supabase
          .from("recipes")
          .select("*")
          .or(africaFilter)
          .order("created_at", { ascending: false })
          .limit(6);
        rows = fallback || rows;
      }
      setRecipes(rows.map(withParsedRecipeFields));
    } catch (error) {
      console.error("Error fetching featured recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const startCooking = (recipe: Recipe) => {
    requireAuth(() => {
      setSelectedRecipe(recipe);
      setIsCookingPopupOpen(true);
    });
  };

  const addToFavorites = async (recipe: Recipe) => {
    if (!requireAuth()) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ recipe_id: recipe.id, user_id: user.id });
      
      if (error) {
        if (error.code === '23505') {
          toast.info("Already in favorites");
        } else {
          throw error;
        }
      } else {
        toast.success(`Added ${recipe.name} to favorites`);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error("Failed to add to favorites");
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Featured African Recipes</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Most Popular</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Featured African Recipes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start your culinary journey with these beloved dishes that represent the soul of African cooking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => {
            const href = recipe.slug ? `/recipe/${recipe.slug}` : "/recipe-index";
            return (
              <Card
                key={recipe.id}
                className="group border-primary/10 shadow-soft hover:shadow-warm transition-all duration-300 animate-slide-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Link to={href} className="block h-full">
                    <RecipeImagePlaceholder
                      name={recipe.name}
                      country={recipe.country}
                      imageUrl={recipe.image_url}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
                        {recipe.country}
                      </Badge>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToFavorites(recipe);
                    }}
                    title={user ? "Add to favorites" : "Sign in to save"}
                  >
                    {user ? <Heart className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                </div>

                <CardHeader className="pb-3">
                  <Link to={href}>
                    <h3 className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                  </Link>
                </CardHeader>

                <CardContent className="pt-0">
                  {recipe.summary && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                      {recipe.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                    {(recipe.prep_time || recipe.cook_time) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                    {recipe.difficulty && (
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-3 h-3 text-primary" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    )}
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={href}>View recipe</Link>
                    </Button>
                    <Button variant="earth" className="flex-1" onClick={() => startCooking(recipe)}>
                      {user ? "Cook" : "Sign in"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Recipes Button */}
        <div className="text-center mt-12">
          <Button 
            variant="hero" 
            size="lg" 
            className="px-8"
            onClick={() => navigate('/recipes')}
          >
            <ChefHat className="w-5 h-5" />
            View All Recipes
          </Button>
        </div>
      </div>

      {/* Cooking Popup */}
      {selectedRecipe && (
        <CookingPopup
          recipe={selectedRecipe}
          isOpen={isCookingPopupOpen}
          onClose={() => {
            setIsCookingPopupOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}
    </section>
  );
};

export default FeaturedRecipes;
