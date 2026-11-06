import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Flame, Zap, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RecipeImagePlaceholder from "./RecipeImagePlaceholder";

interface TrendingRecipe {
  id: string;
  name: string;
  country: string;
  summary?: string;
  prep_time?: number;
  cook_time?: number;
  difficulty?: string;
  image_url?: string;
  category?: string;
  continent?: string;
  tags?: string[];
}

type FilterTab = "trending" | "quick" | "seasonal" | "new";

const TrendingRecipes = () => {
  const [recipes, setRecipes] = useState<TrendingRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("trending");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes(activeTab);
  }, [activeTab]);

  const fetchRecipes = async (tab: FilterTab) => {
    setLoading(true);
    try {
      let query = supabase.from('recipes').select('id, name, country, summary, prep_time, cook_time, difficulty, image_url, category, continent, tags');

      switch (tab) {
        case "trending":
          query = query.order('created_at', { ascending: false }).limit(8);
          break;
        case "quick":
          // Under 30 minutes total
          query = query.or('prep_time.lte.15,cook_time.lte.15').order('prep_time', { ascending: true }).limit(8);
          break;
        case "seasonal":
          // Summer/spring recipes - light dishes
          query = query.or('category.ilike.%salad%,category.ilike.%drink%,tags.cs.{light}').limit(8);
          break;
        case "new":
          query = query.order('created_at', { ascending: false }).limit(8);
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching trending recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "trending" as FilterTab, label: "Trending Now", icon: TrendingUp },
    { id: "quick" as FilterTab, label: "Under 30 Min", icon: Zap },
    { id: "seasonal" as FilterTab, label: "Seasonal Picks", icon: Flame },
    { id: "new" as FilterTab, label: "Just Added", icon: ChefHat },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">What's Hot</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Discover What's <span className="text-gradient">Cooking</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore trending recipes, quick meals, and seasonal favorites from around the world.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipes.slice(0, 8).map((recipe, index) => (
              <Card
                key={recipe.id}
                className="group cursor-pointer hover:shadow-warm transition-all duration-300 overflow-hidden"
                onClick={() => navigate('/recipes')}
              >
                <div className="relative aspect-square overflow-hidden">
                  <RecipeImagePlaceholder
                    name={recipe.name}
                    country={recipe.country}
                    imageUrl={recipe.image_url}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Rank badge for trending */}
                  {activeTab === "trending" && index < 3 && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      #{index + 1}
                    </div>
                  )}

                  {/* Quick time badge */}
                  {(recipe.prep_time || 0) + (recipe.cook_time || 0) <= 30 && (
                    <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs gap-1">
                      <Zap className="w-3 h-3" />
                      Quick
                    </Badge>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/80 text-xs">{recipe.country}</span>
                      {(recipe.prep_time || recipe.cook_time) && (
                        <span className="text-white/80 text-xs flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/recipes')} className="rounded-full">
            View All Recipes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingRecipes;
