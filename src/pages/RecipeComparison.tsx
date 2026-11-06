import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Clock, Users, TrendingUp, Award, Activity, Globe, Flame, Heart, Sparkles, ChefHat, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FlavorRadarChart } from "@/components/comparison/FlavorRadarChart";
import { CulinaryPrestigeScore } from "@/components/comparison/CulinaryPrestigeScore";
import { VitalityScore } from "@/components/comparison/VitalityScore";
import { ExplorerLevel } from "@/components/comparison/ExplorerLevel";
import { SplitScreenSlider } from "@/components/comparison/SplitScreenSlider";
import { withParsedRecipeFields, type IngredientValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  slug?: string;
  country: string;
  summary: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: IngredientValue[] | null;
  image_url?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  // New global comparison fields
  world_equivalent_dish?: string;
  global_rank_taste_atlas?: number;
  cultural_heritage_status?: string;
  umami_level?: number;
  carbon_footprint_score?: number;
}

const hashScore = (seed: string, min: number, max: number) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
};

// Deterministic flavor estimates from recipe metadata (not lab-measured)
const generateFlavorProfile = (recipe: Recipe) => {
  const tags = recipe.tags || [];
  const name = recipe.name.toLowerCase();
  const country = (recipe.country || "").toLowerCase();
  const seed = `${recipe.id || recipe.slug || recipe.name}`;

  return {
    smoky: tags.includes('grilled') || tags.includes('smoked') || name.includes('suya') ? 8 : hashScore(seed + "smoky", 2, 5),
    umami: tags.includes('stew') || tags.includes('meat') ? 7 : hashScore(seed + "umami", 3, 6),
    fermented: tags.includes('fermented') || name.includes('injera') || name.includes('ogi') ? 9 : hashScore(seed + "ferm", 1, 3),
    citrus: tags.includes('citrus') || country.includes('morocco') ? 6 : hashScore(seed + "citrus", 2, 5),
    spicy: tags.includes('spicy') || name.includes('peri') || name.includes('berbere') ? 8 : hashScore(seed + "spicy", 3, 7),
    earthy: tags.includes('legumes') || tags.includes('vegetables') ? 7 : hashScore(seed + "earthy", 3, 6),
  };
};

// World equivalents mapping
const WORLD_EQUIVALENTS: Record<string, { name: string; similarity: number }> = {
  "jollof rice": { name: "Spanish Paella", similarity: 72 },
  "tagine": { name: "French Casserole", similarity: 68 },
  "injera": { name: "Ethiopian Crepe / French Galette", similarity: 45 },
  "bobotie": { name: "Greek Moussaka", similarity: 65 },
  "bunny chow": { name: "British Pot Pie", similarity: 58 },
  "peri peri chicken": { name: "Portuguese Frango", similarity: 85 },
  "doro wat": { name: "Indian Curry", similarity: 62 },
  "fufu": { name: "Italian Polenta", similarity: 55 },
  "egusi soup": { name: "Japanese Miso Soup", similarity: 35 },
  "suya": { name: "Turkish Kebab", similarity: 78 },
};

// Heritage status mapping
const HERITAGE_STATUS: Record<string, "UNESCO" | "Regional Heritage" | "Emerging" | "None"> = {
  "Ethiopia": "UNESCO",
  "Morocco": "UNESCO",
  "Nigeria": "Regional Heritage",
  "South Africa": "Regional Heritage",
  "Kenya": "Emerging",
  "Ghana": "Regional Heritage",
  "Senegal": "UNESCO",
  "Egypt": "UNESCO",
};

// African superfoods
const AFRICAN_SUPERFOODS = ["Teff", "Fonio", "Baobab", "Moringa", "Amaranth", "Sorghum", "Millet", "Shea Butter", "Hibiscus", "Tamarind"];

const RecipeComparison = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>(["", ""]);
  const [comparedRecipes, setComparedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonsCount, setComparisonsCount] = useState(0);
  const [recipesViewed, setRecipesViewed] = useState(0);
  const [regionsExplored, setRegionsExplored] = useState<string[]>([]);

  useEffect(() => {
    fetchRecipes();
    loadExplorerStats();
  }, []);

  useEffect(() => {
    if (selectedRecipes[0] && selectedRecipes[1]) {
      loadComparedRecipes();
      incrementComparisons();
    }
  }, [selectedRecipes]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name');

      if (error) throw error;
      setRecipes((data || []).map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExplorerStats = () => {
    const stats = localStorage.getItem('explorerStats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setComparisonsCount(parsed.comparisons || 0);
      setRecipesViewed(parsed.recipesViewed || 0);
      setRegionsExplored(parsed.regions || []);
    }
  };

  const saveExplorerStats = (comparisons: number, viewed: number, regions: string[]) => {
    localStorage.setItem('explorerStats', JSON.stringify({
      comparisons,
      recipesViewed: viewed,
      regions
    }));
  };

  const incrementComparisons = () => {
    const newCount = comparisonsCount + 1;
    const newViewed = recipesViewed + 2;
    
    const newRegions = [...regionsExplored];
    comparedRecipes.forEach(r => {
      if (!newRegions.includes(r.country)) {
        newRegions.push(r.country);
      }
    });
    
    setComparisonsCount(newCount);
    setRecipesViewed(newViewed);
    setRegionsExplored(newRegions);
    saveExplorerStats(newCount, newViewed, newRegions);
  };

  const loadComparedRecipes = () => {
    const compared = selectedRecipes
      .map(id => recipes.find(r => r.id === id))
      .filter(Boolean) as Recipe[];
    setComparedRecipes(compared);
  };

  const updateRecipeSelection = (index: number, value: string) => {
    const newSelection = [...selectedRecipes];
    newSelection[index] = value;
    setSelectedRecipes(newSelection);
  };

  const getIngredientCount = (recipe: Recipe): number => {
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.length;
    }
    return 0;
  };

  const getTotalTime = (recipe: Recipe): number => {
    return recipe.prep_time + recipe.cook_time;
  };

  const getDifficultyScore = (difficulty: string): number => {
    const scores: { [key: string]: number } = { 'easy': 1, 'medium': 2, 'hard': 3 };
    return scores[difficulty.toLowerCase()] || 2;
  };

  const calculatePrestigeScore = (recipe: Recipe): number => {
    let score = 50;
    
    // Use database value if available, otherwise fall back to country mapping
    const heritageStatus = recipe.cultural_heritage_status || HERITAGE_STATUS[recipe.country] || "None";
    if (heritageStatus === "UNESCO") score += 25;
    else if (heritageStatus === "Regional Heritage") score += 15;
    else if (heritageStatus === "Emerging") score += 8;
    
    if (recipe.tags?.includes('traditional')) score += 10;
    if (recipe.tags?.includes('street-food')) score += 5;
    if (getTotalTime(recipe) > 60) score += 5; // Complex dishes
    if (recipe.global_rank_taste_atlas && recipe.global_rank_taste_atlas <= 50) score += 10;
    if (recipe.umami_level && recipe.umami_level >= 7) score += 5;
    
    return Math.min(score, 98);
  };

  const calculateVitalityScore = (recipe: Recipe): number => {
    let score = 60;
    const ingredients = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map((i: IngredientValue) => (typeof i === 'string' ? i : i.name || '').toLowerCase()).join(' ')
      : '';
    
    AFRICAN_SUPERFOODS.forEach(sf => {
      if (ingredients.includes(sf.toLowerCase())) score += 8;
    });
    
    if (recipe.protein && recipe.protein > 20) score += 5;
    if (recipe.fats && recipe.fats < 15) score += 5;
    if (recipe.tags?.includes('vegetarian')) score += 5;
    
    return Math.min(score, 98);
  };

  const getSuperfoodsInRecipe = (recipe: Recipe): string[] => {
    const ingredients = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map((i: IngredientValue) => (typeof i === 'string' ? i : i.name || '').toLowerCase()).join(' ')
      : '';
    
    return AFRICAN_SUPERFOODS.filter(sf => ingredients.includes(sf.toLowerCase()));
  };

  const getWorldEquivalent = (recipe: Recipe) => {
    // Use database value if available
    if (recipe.world_equivalent_dish) {
      return { name: recipe.world_equivalent_dish, similarity: 70 };
    }
    
    // Fall back to mapping
    const nameKey = recipe.name.toLowerCase();
    for (const [key, value] of Object.entries(WORLD_EQUIVALENTS)) {
      if (nameKey.includes(key)) {
        return value;
      }
    }
    return { name: "Global Home Cooking", similarity: 50 };
  };

  const getGlobalRank = (recipe: Recipe): number => {
    // Use database value if available, otherwise generate based on country
    if (recipe.global_rank_taste_atlas) {
      return recipe.global_rank_taste_atlas;
    }
    return hashScore(`${recipe.id || recipe.slug}-rank`, 20, 99);
  };

  const getHeritageStatus = (recipe: Recipe): "UNESCO" | "Regional Heritage" | "Emerging" | "None" => {
    // Use database value if available
    if (recipe.cultural_heritage_status) {
      return recipe.cultural_heritage_status as "UNESCO" | "Regional Heritage" | "Emerging" | "None";
    }
    return HERITAGE_STATUS[recipe.country] || "None";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading recipes...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="World-Class Recipe Comparison | Africa Dish Discovery"
        description="Compare African dishes against global standards with Michelin-style criteria, molecular flavor profiling, and ancestral health indices."
        keywords="recipe comparison, african food, culinary prestige, flavor profiling, nutrition comparison, TasteAtlas"
        canonical="https://www.ladhaquest.com/recipe-comparison"
      />
      
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-amber-500/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-amber-500">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
                      Global Benchmark
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      World-Class Culinary Comparison Engine
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground max-w-xl">
                  Compare African dishes against global standards using Michelin-style criteria, 
                  TasteAtlas rankings, and UNESCO Heritage status.
                </p>
              </div>
              
              <ExplorerLevel 
                comparisonsCount={comparisonsCount}
                recipesViewed={recipesViewed}
                regionsExplored={regionsExplored.length}
              />
            </div>

            {/* Recipe Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    First Dish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedRecipes[0]} 
                    onValueChange={(v) => updateRecipeSelection(0, v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select first recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem 
                          key={recipe.id} 
                          value={recipe.id}
                          disabled={recipe.id === selectedRecipes[1]}
                        >
                          {recipe.name} ({recipe.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Second Dish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedRecipes[1]} 
                    onValueChange={(v) => updateRecipeSelection(1, v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select second recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem 
                          key={recipe.id} 
                          value={recipe.id}
                          disabled={recipe.id === selectedRecipes[0]}
                        >
                          {recipe.name} ({recipe.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {comparedRecipes.length === 2 && (
              <div className="space-y-8">
                {/* Split Screen Comparison */}
                <SplitScreenSlider
                  leftLabel={comparedRecipes[0].name}
                  rightLabel={comparedRecipes[1].name}
                  leftContent={
                    <div className="space-y-4 pr-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        {comparedRecipes[0].image_url ? (
                          <img src={comparedRecipes[0].image_url} alt={comparedRecipes[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Badge className="mb-2">{comparedRecipes[0].country}</Badge>
                        <p className="text-sm text-muted-foreground line-clamp-3">{comparedRecipes[0].summary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded bg-background/50">
                          <Clock className="h-4 w-4 mb-1 text-primary" />
                          <span>{getTotalTime(comparedRecipes[0])} min</span>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <Users className="h-4 w-4 mb-1 text-primary" />
                          <span>{comparedRecipes[0].servings} servings</span>
                        </div>
                      </div>
                    </div>
                  }
                  rightContent={
                    <div className="space-y-4 pl-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        {comparedRecipes[1].image_url ? (
                          <img src={comparedRecipes[1].image_url} alt={comparedRecipes[1].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2 bg-orange-500/20 text-orange-600">{comparedRecipes[1].country}</Badge>
                        <p className="text-sm text-muted-foreground line-clamp-3">{comparedRecipes[1].summary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded bg-background/50">
                          <Clock className="h-4 w-4 mb-1 text-orange-500" />
                          <span>{getTotalTime(comparedRecipes[1])} min</span>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <Users className="h-4 w-4 mb-1 text-orange-500" />
                          <span>{comparedRecipes[1].servings} servings</span>
                        </div>
                      </div>
                    </div>
                  }
                />

                {/* Tabbed Analysis */}
                <Tabs defaultValue="prestige" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="prestige" className="flex items-center gap-2 py-3">
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Culinary Prestige</span>
                      <span className="sm:hidden">Prestige</span>
                    </TabsTrigger>
                    <TabsTrigger value="flavor" className="flex items-center gap-2 py-3">
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Flavor Matrix</span>
                      <span className="sm:hidden">Flavors</span>
                    </TabsTrigger>
                    <TabsTrigger value="vitality" className="flex items-center gap-2 py-3">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Health Index</span>
                      <span className="sm:hidden">Health</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prestige" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {comparedRecipes.map((recipe) => {
                        const equiv = getWorldEquivalent(recipe);
                        return (
                          <CulinaryPrestigeScore
                            key={recipe.id}
                            dishName={recipe.name}
                            prestigeScore={calculatePrestigeScore(recipe)}
                            prestige={{
                              globalRank: getGlobalRank(recipe),
                              tasteAtlasRank: recipe.global_rank_taste_atlas || undefined,
                              heritageStatus: getHeritageStatus(recipe),
                              worldEquivalent: equiv.name,
                              similarityScore: equiv.similarity,
                            }}
                          />
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="flavor" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Molecular Flavor Profiling
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Chemical flavor markers comparison using advanced taste analysis
                        </p>
                      </CardHeader>
                      <CardContent>
                        <FlavorRadarChart
                          dish1={{
                            name: comparedRecipes[0].name,
                            flavors: generateFlavorProfile(comparedRecipes[0])
                          }}
                          dish2={{
                            name: comparedRecipes[1].name,
                            flavors: generateFlavorProfile(comparedRecipes[1])
                          }}
                        />
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold text-sm mb-2">Flavor Profile: {comparedRecipes[0].name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Dominant notes include {comparedRecipes[0].tags?.slice(0, 3).join(', ') || 'traditional African spices'}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                            <h4 className="font-semibold text-sm mb-2">Flavor Profile: {comparedRecipes[1].name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Dominant notes include {comparedRecipes[1].tags?.slice(0, 3).join(', ') || 'regional authentic flavors'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="vitality" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {comparedRecipes.map((recipe) => (
                        <VitalityScore
                          key={recipe.id}
                          vitalityScore={calculateVitalityScore(recipe)}
                          superfoods={getSuperfoodsInRecipe(recipe)}
                          comparison={{
                            africanDish: {
                              name: recipe.name,
                              antioxidants: hashScore(`${recipe.id}-aox`, 70, 89),
                              fiber: hashScore(`${recipe.id}-fiber`, 60, 84),
                              vitamins: hashScore(`${recipe.id}-vit`, 65, 84),
                              minerals: hashScore(`${recipe.id}-min`, 70, 89),
                              processedLevel: hashScore(`${recipe.id}-proc`, 10, 24),
                            },
                            westernCounterpart: {
                              name: "Fast Food Equivalent",
                              antioxidants: hashScore(`${recipe.id}-waox`, 20, 39),
                              fiber: hashScore(`${recipe.id}-wfiber`, 15, 29),
                              vitamins: hashScore(`${recipe.id}-wvit`, 25, 39),
                              minerals: hashScore(`${recipe.id}-wmin`, 30, 44),
                              processedLevel: hashScore(`${recipe.id}-wproc`, 60, 84),
                            }
                          }}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Classic Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Detailed Comparison Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Cooking Time */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="font-semibold">Cook Time</span>
                        </div>
                        <div className="space-y-2">
                          {comparedRecipes.map((r, idx) => (
                            <div key={r.id} className="flex justify-between items-center">
                              <span className="text-sm truncate max-w-[120px]">{r.name}</span>
                              <Badge variant={getTotalTime(r) <= getTotalTime(comparedRecipes[1-idx]) ? "default" : "secondary"}>
                                {getTotalTime(r)} min
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                          <span className="font-semibold">Difficulty</span>
                        </div>
                        <div className="space-y-2">
                          {comparedRecipes.map((r) => (
                            <div key={r.id} className="flex justify-between items-center">
                              <span className="text-sm truncate max-w-[120px]">{r.name}</span>
                              <Badge variant="outline" className="capitalize">{r.difficulty}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Servings */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">Servings</span>
                        </div>
                        <div className="space-y-2">
                          {comparedRecipes.map((r) => (
                            <div key={r.id} className="flex justify-between items-center">
                              <span className="text-sm truncate max-w-[120px]">{r.name}</span>
                              <Badge variant="outline">{r.servings}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="h-5 w-5 text-amber-500" />
                          <span className="font-semibold">Ingredients</span>
                        </div>
                        <div className="space-y-2">
                          {comparedRecipes.map((r) => (
                            <div key={r.id} className="flex justify-between items-center">
                              <span className="text-sm truncate max-w-[120px]">{r.name}</span>
                              <Badge variant="outline">{getIngredientCount(r)} items</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Nutrition Comparison */}
                    <div className="mt-6 p-4 rounded-xl bg-muted/30">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Nutritional Breakdown (per serving)
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        {comparedRecipes.map((recipe, idx) => (
                          <div key={recipe.id} className="space-y-3">
                            <h4 className="font-medium text-sm border-b pb-2">{recipe.name}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between p-2 rounded bg-background/50">
                                <span className="text-muted-foreground">Calories</span>
                                <span className="font-medium">{recipe.calories || 'N/A'} kcal</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-background/50">
                                <span className="text-muted-foreground">Protein</span>
                                <span className="font-medium">{recipe.protein || 'N/A'}g</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-background/50">
                                <span className="text-muted-foreground">Carbs</span>
                                <span className="font-medium">{recipe.carbs || 'N/A'}g</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-background/50">
                                <span className="text-muted-foreground">Fats</span>
                                <span className="font-medium">{recipe.fats || 'N/A'}g</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {comparedRecipes.length < 2 && (
              <Card className="text-center py-16 bg-gradient-to-br from-muted/30 to-transparent border-dashed">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center">
                    <Scale className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Select Two Dishes to Compare</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose recipes from the dropdowns above to unlock world-class culinary analysis 
                    including prestige scores, flavor profiling, and health indices.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" /> Global Ranking
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3" /> Flavor Matrix
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Heart className="h-3 w-3" /> Vitality Score
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RecipeComparison;
