import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid3X3, LayoutGrid, ImageIcon, Globe, MapPin, Filter, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { getCountryFlag, getContinent } from "@/utils/countryFlags";

interface Recipe {
  id: string;
  name: string;
  country: string;
  continent: string | null;
  image_url: string | null;
  summary: string | null;
  difficulty: string | null;
  history: string | null;
}

const CONTINENTS = [
  { value: "all", label: "All Continents", icon: "🌍" },
  { value: "Africa", label: "Africa", icon: "🌍" },
  { value: "Asia", label: "Asia", icon: "🌏" },
  { value: "Europe", label: "Europe", icon: "🌍" },
  { value: "Middle East", label: "Middle East", icon: "🌍" },
  { value: "North America", label: "North America", icon: "🌎" },
  { value: "South America", label: "South America", icon: "🌎" },
  { value: "Latin America", label: "Latin America", icon: "🌎" },
  { value: "Central America", label: "Central America", icon: "🌎" },
  { value: "Oceania", label: "Oceania", icon: "🌏" },
  { value: "Global", label: "Global/Fusion", icon: "🌐" },
];

const RecipeGallery = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [imageFilter, setImageFilter] = useState<"all" | "with-image" | "without-image">("all");
  const [historyFilter, setHistoryFilter] = useState<"all" | "with-history" | "without-history">("all");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, country, continent, image_url, summary, difficulty, history')
        .order('name', { ascending: true });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error: unknown) {
      console.error('Error fetching recipes:', error);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  // Get unique countries for filter
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    recipes.forEach(r => {
      if (r.country) countrySet.add(r.country);
    });
    return Array.from(countrySet).sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!recipe.name.toLowerCase().includes(query) && 
            !recipe.country?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Continent filter
      if (selectedContinent !== "all") {
        const recipeContinent = recipe.continent || getContinent(recipe.country);
        if (recipeContinent !== selectedContinent) {
          return false;
        }
      }

      // Country filter
      if (selectedCountry !== "all") {
        if (recipe.country !== selectedCountry) {
          return false;
        }
      }

      // Image filter
      if (imageFilter === "with-image") {
        if (!recipe.image_url || recipe.image_url.includes('example.com')) {
          return false;
        }
      } else if (imageFilter === "without-image") {
        if (recipe.image_url && !recipe.image_url.includes('example.com')) {
          return false;
        }
      }

      // History filter
      if (historyFilter === "with-history") {
        if (!recipe.history) {
          return false;
        }
      } else if (historyFilter === "without-history") {
        if (recipe.history) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, searchQuery, selectedContinent, selectedCountry, imageFilter, historyFilter]);

  // Stats
  const stats = useMemo(() => {
    const withImages = recipes.filter(r => r.image_url && !r.image_url.includes('example.com')).length;
    const withoutImages = recipes.length - withImages;
    const withHistory = recipes.filter(r => r.history).length;
    const withoutHistory = recipes.length - withHistory;
    return { total: recipes.length, withImages, withoutImages, withHistory, withoutHistory };
  }, [recipes]);

  // Group by continent
  const groupedByContinent = useMemo(() => {
    const groups: Record<string, Recipe[]> = {};
    filteredRecipes.forEach(recipe => {
      const continent = recipe.continent || getContinent(recipe.country) || 'Global';
      if (!groups[continent]) {
        groups[continent] = [];
      }
      groups[continent].push(recipe);
    });
    return groups;
  }, [filteredRecipes]);

  const hasValidImage = (url: string | null) => {
    return url && !url.includes('example.com') && url.startsWith('http');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="h-3 bg-muted rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Recipe Image Gallery | Browse Authentic Dish Photos | TasteAfrica"
        description="Explore our curated gallery of authentic recipe images from around the world. Filter by continent, country, and browse high-quality dish photos."
      />
      <Navigation />

      {/* Header */}
      <section className="py-12 border-b bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Recipe Image Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse authentic dish images from {stats.total} recipes across all continents
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.withImages}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3 h-3" /> With Images
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.withoutImages}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                <AlertTriangle className="w-3 h-3" /> Need Images
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.withHistory}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                <BookOpen className="w-3 h-3" /> With History
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.withoutHistory}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                <AlertTriangle className="w-3 h-3" /> Need History
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedContinent} onValueChange={setSelectedContinent}>
              <SelectTrigger className="w-[180px]">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent>
                {CONTINENTS.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>
                    {getCountryFlag(c)} {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={imageFilter} onValueChange={(v) => setImageFilter(v as "all" | "with-image" | "without-image")}>
              <SelectTrigger className="w-[160px]">
                <ImageIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Image Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="with-image">✅ With Image</SelectItem>
                <SelectItem value="without-image">⚠️ Need Image</SelectItem>
              </SelectContent>
            </Select>

            <Select value={historyFilter} onValueChange={(v) => setHistoryFilter(v as "all" | "with-history" | "without-history")}>
              <SelectTrigger className="w-[160px]">
                <BookOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="History Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="with-history">📖 With History</SelectItem>
                <SelectItem value="without-history">📝 Need History</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "compact" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("compact")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-sm text-muted-foreground mb-6">
            Showing {filteredRecipes.length} of {stats.total} recipes
          </div>

          {Object.entries(groupedByContinent).sort().map(([continent, continentRecipes]) => (
            <div key={continent} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">
                  {CONTINENTS.find(c => c.value === continent)?.icon || '🌍'}
                </span>
                {continent}
                <Badge variant="secondary" className="ml-2">
                  {continentRecipes.length}
                </Badge>
              </h2>

              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                : "grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3"
              }>
                {continentRecipes.map(recipe => (
                  <Card key={recipe.id} className="group overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative">
                      {hasValidImage(recipe.image_url) ? (
                        <img
                          src={recipe.image_url!}
                          alt={recipe.name}
                          className={`w-full object-cover ${viewMode === "grid" ? "aspect-square" : "aspect-square"}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={hasValidImage(recipe.image_url) ? "hidden" : ""}>
                        <RecipeImagePlaceholder
                          name={recipe.name}
                          country={recipe.country}
                          className={`w-full ${viewMode === "grid" ? "aspect-square" : "aspect-square"}`}
                        />
                      </div>
                      
                      {/* Country flag overlay */}
                      <div className="absolute top-2 left-2">
                        <span className="text-2xl drop-shadow-lg" title={recipe.country}>
                          {getCountryFlag(recipe.country)}
                        </span>
                      </div>

                      {/* Status indicators */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {hasValidImage(recipe.image_url) ? (
                          <Badge variant="default" className="bg-emerald-600/90 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-amber-600/90 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                          </Badge>
                        )}
                        {recipe.history && (
                          <Badge variant="default" className="bg-blue-600/90 text-xs">
                            <BookOpen className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className={viewMode === "grid" ? "p-4" : "p-2"}>
                      <h3 className={`font-semibold group-hover:text-primary transition-colors ${viewMode === "grid" ? "text-base" : "text-xs"} line-clamp-2`}>
                        {recipe.name}
                      </h3>
                      <p className={`text-muted-foreground ${viewMode === "grid" ? "text-sm" : "text-xs"} flex items-center gap-1 mt-1`}>
                        <MapPin className="w-3 h-3" />
                        {recipe.country}
                      </p>
                      {viewMode === "grid" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {recipe.difficulty}
                            </Badge>
                          )}
                          {recipe.history && (
                            <Badge variant="secondary" className="text-xs">
                              📖 History
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RecipeGallery;
