import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Clock, Users, ChefHat, Trash2, RefreshCw } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useToast } from "@/hooks/use-toast";

interface CachedRecipe {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  summary: string | null;
  slug: string;
  cachedAt: string;
}

const CACHED_RECIPES_KEY = "tasteafrica_cached_recipes";

const OfflineRecipes = () => {
  const [cachedRecipes, setCachedRecipes] = useState<CachedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = usePWA();
  const { toast } = useToast();

  useEffect(() => {
    loadCachedRecipes();
  }, []);

  const loadCachedRecipes = () => {
    try {
      const stored = localStorage.getItem(CACHED_RECIPES_KEY);
      if (stored) {
        const recipes = JSON.parse(stored) as CachedRecipe[];
        setCachedRecipes(recipes);
      }
    } catch (error) {
      console.error("Error loading cached recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCache = (recipeId: string) => {
    const updated = cachedRecipes.filter((r) => r.id !== recipeId);
    setCachedRecipes(updated);
    localStorage.setItem(CACHED_RECIPES_KEY, JSON.stringify(updated));
    toast({
      title: "Recipe Removed",
      description: "Recipe has been removed from offline storage.",
    });
  };

  const clearAllCache = () => {
    setCachedRecipes([]);
    localStorage.removeItem(CACHED_RECIPES_KEY);
    toast({
      title: "Cache Cleared",
      description: "All offline recipes have been removed.",
    });
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCachedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Offline Recipes | TasteAfrica"
        description="Access your saved African recipes offline. Cook your favorite dishes even without internet connection."
        keywords="offline recipes, cached recipes, african food offline"
      />

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Offline Recipes
              </h1>
              <p className="text-muted-foreground">
                {isOnline
                  ? "Your saved recipes for offline access"
                  : "You're offline - viewing cached recipes"}
              </p>
            </div>
          </div>

          {!isOnline && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <WifiOff className="w-5 h-5" />
                <span className="font-medium">You're currently offline</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Showing recipes saved for offline viewing. Some features may be
                limited.
              </p>
            </div>
          )}

          {cachedRecipes.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {cachedRecipes.length} recipe
                {cachedRecipes.length !== 1 ? "s" : ""} saved
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllCache}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && cachedRecipes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  No Offline Recipes
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  {isOnline
                    ? "Browse recipes and save them for offline access. Your saved recipes will appear here."
                    : "You haven't saved any recipes for offline viewing. Connect to the internet to browse and save recipes."}
                </p>
              </div>
              {isOnline && (
                <Button asChild>
                  <Link to="/recipes">Browse Recipes</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recipe Grid */}
        {!loading && cachedRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cachedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  >
                    {recipe.country}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {recipe.name}
                  </CardTitle>
                  {recipe.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.summary}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {(recipe.prep_time || recipe.cook_time) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(
                            (recipe.prep_time || 0) + (recipe.cook_time || 0)
                          )}
                        </span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Saved: {formatCachedDate(recipe.cachedAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="default" className="flex-1">
                      <Link to={`/recipes?slug=${recipe.slug}`}>
                        View Recipe
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCache(recipe.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tips for Offline Cooking</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Save your favorite recipes while online to access them anytime
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Recipe images are cached automatically for offline viewing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Check your pantry before going offline to plan your meals
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Install TasteAfrica as an app for the best offline experience
            </li>
          </ul>
          {isOnline && (
            <Button asChild variant="outline" className="mt-4">
              <Link to="/install">Install App</Link>
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfflineRecipes;
