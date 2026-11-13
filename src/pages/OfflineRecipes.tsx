import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  WifiOff,
  Clock,
  Users,
  ChefHat,
  Trash2,
  RefreshCw,
  Package,
  Calendar,
  Gauge,
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useDataSaver } from "@/hooks/useDataSaver";
import { useToast } from "@/hooks/use-toast";
import { DataSaverImage } from "@/components/DataSaverImage";
import {
  clearCachedRecipes,
  getCachedRecipes,
  getMealPlanSnapshot,
  getPantryQueue,
  getPantrySnapshot,
  removeCachedRecipe,
  type OfflineMealPlanSnapshot,
  type OfflinePantrySnapshot,
  type OfflineRecipe,
} from "@/lib/offlineStore";
import { supabase } from "@/integrations/supabase/client";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const OfflineRecipes = () => {
  const [cachedRecipes, setCachedRecipes] = useState<OfflineRecipe[]>([]);
  const [pantrySnap, setPantrySnap] = useState<OfflinePantrySnapshot | null>(null);
  const [mealSnap, setMealSnap] = useState<OfflineMealPlanSnapshot | null>(null);
  const [pendingOps, setPendingOps] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isOnline } = usePWA();
  const { dataSaver, setDataSaver } = useDataSaver();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCachedRecipes(getCachedRecipes());
        setPantrySnap(getPantrySnapshot(user?.id));
        setMealSnap(getMealPlanSnapshot(user?.id));
        setPendingOps(getPantryQueue().length);
      } finally {
        setLoading(false);
      }
    };
    load();

    const onQueue = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      setPendingOps(typeof n === "number" ? n : getPantryQueue().length);
    };
    window.addEventListener("ladhaquest:pantry-queue", onQueue as EventListener);
    return () => window.removeEventListener("ladhaquest:pantry-queue", onQueue as EventListener);
  }, []);

  const removeFromCache = (recipeId: string) => {
    const updated = removeCachedRecipe(recipeId);
    setCachedRecipes(updated);
    toast({
      title: "Recipe Removed",
      description: "Recipe has been removed from offline storage.",
    });
  };

  const clearAllCache = () => {
    clearCachedRecipes();
    setCachedRecipes([]);
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
        title="Offline Mode | LadhaQuest"
        description="Access saved African recipes, your last pantry snapshot, and meal plan offline. Enable data saver for low-bandwidth cooking."
        keywords="offline recipes, cached recipes, data saver, african food offline"
      />

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Offline Mode</h1>
              <p className="text-muted-foreground">
                {isOnline
                  ? "Saved recipes, pantry snapshot, and last meal plan"
                  : "You're offline — viewing cached pantry, plans, and recipes"}
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
                Pantry edits queue locally and sync when you reconnect.
                {pendingOps > 0 ? ` ${pendingOps} change${pendingOps === 1 ? "" : "s"} waiting.` : ""}
              </p>
            </div>
          )}

          {isOnline && pendingOps > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-sm">
              {pendingOps} offline pantry change{pendingOps === 1 ? "" : "s"} will sync automatically.
            </div>
          )}

          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Data saver
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <Label htmlFor="data-saver" className="text-sm text-muted-foreground font-normal cursor-pointer">
                Prefer lighter images and skip video autoplay. Best on mobile data.
              </Label>
              <Switch
                id="data-saver"
                checked={dataSaver}
                onCheckedChange={setDataSaver}
                aria-label="Enable data saver"
              />
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <div className="space-y-10">
            {/* Pantry snapshot */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Pantry snapshot</h2>
              </div>
              {!pantrySnap || pantrySnap.items.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    {isOnline
                      ? "Open your pantry while online to cache the latest list for offline use."
                      : "No pantry snapshot saved yet."}
                    {isOnline && (
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/pantry">Go to Pantry</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Saved {formatCachedDate(pantrySnap.updatedAt)} · {pantrySnap.items.length} item
                      {pantrySnap.items.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pantrySnap.items.map((item) => (
                        <Badge key={item.id} variant="secondary" className="font-normal">
                          {item.ingredient_name}
                          {item.quantity != null ? ` · ${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : ""}
                        </Badge>
                      ))}
                    </div>
                    {isOnline && (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/pantry">Open pantry</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Meal plan snapshot */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Last meal plan</h2>
              </div>
              {!mealSnap ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    {isOnline
                      ? "Open the meal planner while online to cache your current week offline."
                      : "No meal plan snapshot saved yet."}
                    {isOnline && (
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/meal-planner">Go to Meal Planner</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{mealSnap.plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Week of {mealSnap.plan.week_start_date} · saved{" "}
                      {formatCachedDate(mealSnap.updatedAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mealSnap.meals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No meals in this plan snapshot.</p>
                    ) : (
                      mealSnap.meals
                        .slice()
                        .sort((a, b) => a.day_of_week - b.day_of_week || a.meal_type.localeCompare(b.meal_type))
                        .map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between gap-2 text-sm border-b border-border/50 py-2 last:border-0"
                          >
                            <div>
                              <span className="text-muted-foreground mr-2">
                                {daysOfWeek[meal.day_of_week] ?? "?"} · {meal.meal_type}
                              </span>
                              <span className="font-medium">
                                {meal.recipe?.name || "Recipe"}
                              </span>
                            </div>
                            {meal.recipe?.slug && isOnline ? (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/recipe/${meal.recipe.slug}`}>View</Link>
                              </Button>
                            ) : null}
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Recipes */}
            <section>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Saved recipes ({cachedRecipes.length})
                  </h2>
                </div>
                {cachedRecipes.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllCache}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {cachedRecipes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <ChefHat className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">No Offline Recipes</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mt-2">
                        {isOnline
                          ? "Open a recipe page while online — it is saved automatically for offline cooking (up to 40)."
                          : "Connect to browse and open recipes so they cache for next time."}
                      </p>
                    </div>
                    {isOnline && (
                      <Button asChild>
                        <Link to="/recipes">Browse Recipes</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cachedRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {recipe.image_url ? (
                          <DataSaverImage
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
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
                        <CardTitle className="text-lg line-clamp-1">{recipe.name}</CardTitle>
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
                                {formatTime((recipe.prep_time || 0) + (recipe.cook_time || 0))}
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
                            <Link to={`/recipe/${recipe.slug}`}>View Recipe</Link>
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
            </section>

            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Tips for Offline Cooking</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Opening a recipe while online caches it (not the whole catalog)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Pantry and meal planner save a last-known snapshot for offline open
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Pantry edits made offline queue and sync when you reconnect
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Turn on data saver to use lighter images on mobile networks
                </li>
              </ul>
              {isOnline && (
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/install">Install App</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OfflineRecipes;
