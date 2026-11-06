import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChefHat, 
  Clock, 
  Users, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CookableRecipe } from "@/types/content";

export interface RecipeMatch {
  id: string;
  name: string;
  country?: string;
  summary?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  image_url?: string;
  tags?: string[];
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  substitutionSuggestions: Array<{
    missing: string;
    substitute: string;
    note?: string;
  }>;
  canCookNow: boolean;
  priority: 'high' | 'medium' | 'low';
  priorityReason?: string;
}

interface SmartRecipeMatchProps {
  matches: RecipeMatch[];
  loading: boolean;
  onRefresh: () => void;
  onStartCooking: (recipe: CookableRecipe) => void;
  onAddToShoppingList: (ingredients: string[]) => void;
  insights?: string;
}

const SmartRecipeMatch = ({
  matches,
  loading,
  onRefresh,
  onStartCooking,
  onAddToShoppingList,
  insights
}: SmartRecipeMatchProps) => {
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
  };

  const getPriorityBadge = (priority: string, reason?: string) => {
    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900/30",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
    };
    return (
      <Badge className={cn("text-xs", colors[priority as keyof typeof colors] || colors.low)}>
        {priority === 'high' ? '🔥 ' : priority === 'medium' ? '⚡ ' : '💡 '}
        {priority} priority
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-primary/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">
            <Sparkles className="inline w-4 h-4 mr-2" />
            AI is analyzing your pantry...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="border-primary/10">
        <CardContent className="p-8 text-center">
          <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
          <p className="text-muted-foreground mb-4">
            Add more ingredients to your pantry to get recipe suggestions.
          </p>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {insights && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm mb-1">AI Insights</p>
              <p className="text-sm text-muted-foreground">{insights}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Matches */}
      <div className="grid gap-4">
        {matches.map((match) => (
          <Card 
            key={match.id} 
            className={cn(
              "border transition-all duration-300 hover:shadow-lg",
              match.canCookNow ? "border-green-200 dark:border-green-900" : "border-border"
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Recipe Image/Placeholder */}
                <div className="w-full lg:w-32 h-24 lg:h-auto rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                  {match.image_url ? (
                    <img 
                      src={match.image_url} 
                      alt={match.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ChefHat className="w-8 h-8 text-primary/50" />
                  )}
                </div>

                {/* Recipe Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{match.name}</h3>
                    {match.canCookNow && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                        <Check className="w-3 h-3 mr-1" />
                        Ready to cook
                      </Badge>
                    )}
                    {getPriorityBadge(match.priority, match.priorityReason)}
                  </div>

                  {match.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {match.summary}
                    </p>
                  )}

                  {/* Match Score */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 max-w-xs">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Ingredient Match</span>
                        <span className="font-medium">{match.matchScore}%</span>
                      </div>
                      <Progress value={match.matchScore} className="h-2" />
                    </div>
                    <Badge className={cn("shrink-0", getMatchColor(match.matchScore))}>
                      {match.matchedIngredients.length} of {match.matchedIngredients.length + match.missingIngredients.length}
                    </Badge>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                    {match.prep_time && match.cook_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{match.prep_time + match.cook_time} min</span>
                      </div>
                    )}
                    {match.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{match.servings} servings</span>
                      </div>
                    )}
                    {match.difficulty && (
                      <Badge variant="outline" className="text-xs">
                        {match.difficulty}
                      </Badge>
                    )}
                    {match.country && (
                      <Badge variant="secondary" className="text-xs">
                        {match.country}
                      </Badge>
                    )}
                  </div>

                  {/* Expandable Details */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRecipe(expandedRecipe === match.id ? null : match.id)}
                    className="text-xs p-0 h-auto"
                  >
                    {expandedRecipe === match.id ? "Hide details" : "Show ingredients & substitutes"}
                  </Button>

                  {expandedRecipe === match.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {/* Matched Ingredients */}
                      {match.matchedIngredients.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            You have ({match.matchedIngredients.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {match.matchedIngredients.map((ing, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Ingredients */}
                      {match.missingIngredients.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-orange-600 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Missing ({match.missingIngredients.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {match.missingIngredients.map((ing, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Substitution Suggestions */}
                      {match.substitutionSuggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Substitution Suggestions
                          </p>
                          <div className="space-y-2">
                            {match.substitutionSuggestions.map((sub, i) => (
                              <div key={i} className="text-xs p-2 bg-primary/5 rounded-md">
                                <span className="font-medium">{sub.missing}</span>
                                <ArrowRight className="w-3 h-3 inline mx-1" />
                                <span className="text-primary font-medium">{sub.substitute}</span>
                                {sub.note && (
                                  <p className="text-muted-foreground mt-1">{sub.note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => onStartCooking(match)}
                    className={match.canCookNow ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Cook
                  </Button>
                  {match.missingIngredients.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => onAddToShoppingList(match.missingIngredients)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add Missing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Suggestions
        </Button>
      </div>
    </div>
  );
};

export default SmartRecipeMatch;
