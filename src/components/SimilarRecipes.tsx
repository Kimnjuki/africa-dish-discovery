import { useState, useEffect } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChefHat } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  summary: string;
  country: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  image_url: string;
  similarity_score?: number;
}

interface SimilarRecipesProps {
  recipeId: string;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function SimilarRecipes({ recipeId, onRecipeSelect }: SimilarRecipesProps) {
  const { getSimilarRecipes, trackInteraction } = useRecommendations();
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setIsLoading(true);
      const recipes = await getSimilarRecipes(recipeId);
      setSimilarRecipes(recipes);
      setIsLoading(false);
    };

    if (recipeId) {
      fetchSimilar();
    }
  }, [recipeId, getSimilarRecipes]);

  const handleRecipeClick = async (recipe: Recipe) => {
    await trackInteraction(recipe.id, "view");
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Similar Recipes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (similarRecipes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">You Might Also Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarRecipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => handleRecipeClick(recipe)}
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={recipe.image_url || "/placeholder.svg"}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs bg-background/90">
                  {recipe.country}
                </Badge>
              </div>
              {recipe.similarity_score && recipe.similarity_score > 0.7 && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="text-xs bg-primary/90">
                    {Math.round(recipe.similarity_score * 100)}% match
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {recipe.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {recipe.summary}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  <span className="capitalize">{recipe.difficulty || "Medium"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
