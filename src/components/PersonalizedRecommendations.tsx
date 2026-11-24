import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChefHat,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  TrendingUp,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataSaverImage } from "@/components/DataSaverImage";
import { toSlug } from "@/lib/recipeText";

interface RecommendationRecipe {
  id: string;
  name: string;
  slug?: string | null;
  summary?: string | null;
  country?: string | null;
  difficulty?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  image_url?: string | null;
  recommendation_reason?: string;
  score?: number;
}

interface PersonalizedRecommendationsProps {
  onRecipeSelect?: (recipe: RecommendationRecipe) => void;
  showFeedback?: boolean;
}

function recipePath(recipe: RecommendationRecipe): string {
  const slug = recipe.slug?.trim() || toSlug(recipe.name);
  return `/recipe/${slug}`;
}

export function PersonalizedRecommendations({
  onRecipeSelect,
  showFeedback = true,
}: PersonalizedRecommendationsProps) {
  const {
    recommendations,
    isLoading,
    error,
    personalized,
    refetch,
    trackInteraction,
  } = useRecommendations("for_you", 8);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  const openRecipe = async (recipe: RecommendationRecipe) => {
    void trackInteraction(recipe.id, "view");
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
      return;
    }
    navigate(recipePath(recipe));
  };

  const handleFeedback = async (recipeId: string, positive: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [recipeId]: positive ? "up" : "down" }));
    await trackInteraction(recipeId, positive ? "save" : "abandon", {
      feedback: positive ? "positive" : "negative",
    });
    toast({
      title: positive ? "Thanks for the feedback!" : "We'll improve your recommendations",
      description: positive
        ? "We'll show you more recipes like this"
        : "We'll adjust your recommendations",
    });
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Recommendations refreshed",
      description: "Here are some fresh picks for you!",
    });
  };

  if (error) {
    return (
      <div id="recommendations" className="text-center py-8 scroll-mt-24">
        <p className="text-muted-foreground mb-4">Unable to load recommendations</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <section id="recommendations" className="py-12 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {personalized ? (
              <Sparkles className="h-6 w-6 text-primary" />
            ) : (
              <TrendingUp className="h-6 w-6 text-primary" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {personalized ? "Picked For You" : "Trending Recipes"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {personalized
                  ? "AI-powered recommendations based on your taste"
                  : "Popular recipes from our community"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            recommendations.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50"
                onClick={() => openRecipe(recipe)}
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <DataSaverImage
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={640}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {recipe.country}
                    </Badge>
                  </div>
                  {recipe.score != null && recipe.score > 0.8 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Top Match
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {recipe.name}
                  </h3>

                  {recipe.recommendation_reason && (
                    <p className="text-xs text-primary/80 mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {recipe.recommendation_reason}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.summary}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      <span className="capitalize">{recipe.difficulty || "Medium"}</span>
                    </div>
                  </div>

                  {showFeedback && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 ${feedbackGiven[recipe.id] === "up" ? "text-green-500" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(recipe.id, true);
                          }}
                          disabled={!!feedbackGiven[recipe.id]}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 ${feedbackGiven[recipe.id] === "down" ? "text-red-500" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(recipe.id, false);
                          }}
                          disabled={!!feedbackGiven[recipe.id]}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={recipePath(recipe)}>
                          View Recipe
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!personalized && !isLoading && (
          <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
            <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Get Personalized Recommendations</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Sign in to unlock AI-powered recommendations tailored to your taste preferences and
              cooking history.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In to Personalize</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
