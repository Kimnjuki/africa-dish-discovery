import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Beef, Fish, Wheat, Apple, Carrot, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ingredientsHero from "@/assets/ingredients-hero.jpg";
import { EnhancedRecipePreparation } from "@/components/enhanced/EnhancedRecipePreparation";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";

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
  steps: StepValue[] | null;
  image_url?: string;
}

const ingredientCategories = [
  { 
    id: "meat", 
    name: "Meat & Poultry", 
    icon: Beef, 
    description: "Beef, chicken, lamb, and game meat",
    keywords: ["beef", "chicken", "lamb", "goat", "turkey", "duck", "meat", "poultry"]
  },
  { 
    id: "seafood", 
    name: "Seafood", 
    icon: Fish, 
    description: "Fresh fish and seafood",
    keywords: ["fish", "seafood", "salmon", "tilapia", "shrimp", "crab", "lobster", "tuna"]
  },
  { 
    id: "grains", 
    name: "Grains & Pasta", 
    icon: Wheat, 
    description: "Rice, pasta, quinoa, and cereals",
    keywords: ["rice", "pasta", "quinoa", "couscous", "barley", "wheat", "grain", "noodles"]
  },
  { 
    id: "fruits", 
    name: "Fruits", 
    icon: Apple, 
    description: "Fresh and dried fruits",
    keywords: ["banana", "mango", "apple", "orange", "pineapple", "papaya", "coconut", "fruit"]
  },
  { 
    id: "vegetables", 
    name: "Vegetables", 
    icon: Carrot, 
    description: "Fresh vegetables and legumes",
    keywords: ["tomato", "onion", "pepper", "spinach", "potato", "carrot", "beans", "peas", "vegetable"]
  }
];

const Ingredients = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipesByIngredient();
  }, [activeCategory, searchTerm, recipes]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes((data || []).map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipesByIngredient = () => {
    let filtered = recipes;

    // Filter by category
    if (activeCategory !== "all") {
      const category = ingredientCategories.find(cat => cat.id === activeCategory);
      if (category) {
        filtered = filtered.filter(recipe => {
          const ingredients = recipe.ingredients || [];
          return ingredients.some((ingredient: IngredientValue) => {
            const ingredientName = typeof ingredient === 'string' 
              ? ingredient 
              : ingredient.name || ingredient.ingredient || '';
            
            return category.keywords.some(keyword => 
              ingredientName.toLowerCase().includes(keyword.toLowerCase())
            );
          });
        });
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recipe => {
        const ingredients = recipe.ingredients || [];
        return ingredients.some((ingredient: IngredientValue) => {
          const ingredientName = typeof ingredient === 'string' 
            ? ingredient 
            : ingredient.name || ingredient.ingredient || '';
          
          return ingredientName.toLowerCase().includes(searchTerm.toLowerCase());
        }) || recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredRecipes(filtered);
  };

  const getRecipeIngredients = (recipe: Recipe) => {
    const ingredients = recipe.ingredients || [];
    return ingredients.map((ingredient: IngredientValue) => {
      if (typeof ingredient === 'string') return ingredient;
      return ingredient.name || ingredient.ingredient || 'Unknown ingredient';
    }).slice(0, 5); // Show only first 5 ingredients
  };

  const startCooking = (recipe: Recipe) => {
    if (!recipe || !recipe.id) {
      toast.error("Invalid recipe data");
      return;
    }
    setSelectedRecipe(recipe);
  };

  if (selectedRecipe) {
    return (
      <EnhancedRecipePreparation 
        recipe={selectedRecipe} 
        onBack={() => setSelectedRecipe(null)} 
      />
    );
  }

  if (loading) {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="African Cooking Ingredients Guide | Spices, Staples & Produce | TasteAfrica"
        description="Complete guide to African ingredients. Learn about spices, grains, vegetables, proteins, and where to buy authentic African ingredients online and locally."
        keywords="african ingredients, african spices, african grains, where to buy african food, african cooking staples, african produce, ingredient guide"
        canonical="https://tasteafrica.com/ingredients"
      />
      
      <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading ingredients...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section with Image */}
        <section 
          className="relative py-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${ingredientsHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/20" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cook by Ingredient
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Find African recipes based on the ingredients you have. 
              Discover new ways to use your favorite ingredients.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by ingredient (e.g., chicken, rice, tomatoes)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-muted/30">
                <TabsTrigger value="all" className="text-xs p-2">All</TabsTrigger>
                {ingredientCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="text-xs p-2 flex flex-col gap-1"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {ingredientCategories.map((category) => {
                    const Icon = category.icon;
                    const categoryRecipeCount = recipes.filter(recipe => {
                      const ingredients = recipe.ingredients || [];
                      return ingredients.some((ingredient: IngredientValue) => {
                        const ingredientName = typeof ingredient === 'string' 
                          ? ingredient 
                          : ingredient.name || ingredient.ingredient || '';
                        
                        return category.keywords.some(keyword => 
                          ingredientName.toLowerCase().includes(keyword.toLowerCase())
                        );
                      });
                    }).length;

                    return (
                      <Card key={category.id} className="group hover:shadow-warm transition-all duration-300 cursor-pointer"
                            onClick={() => setActiveCategory(category.id)}>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {categoryRecipeCount} recipes
                          </Badge>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {ingredientCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <Card key={recipe.id} className="group hover:shadow-warm transition-all duration-300">
                        <div className="aspect-video bg-gradient-map overflow-hidden rounded-t-lg">
                          {recipe.image_url ? (
                            <img 
                              src={recipe.image_url} 
                              alt={recipe.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <category.icon className="w-12 h-12 text-muted-foreground" />
                            </div>
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
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {recipe.summary}
                          </p>
                          
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Key Ingredients:</p>
                            <div className="flex flex-wrap gap-1">
                              {getRecipeIngredients(recipe).map((ingredient, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <span>⏱️ {recipe.prep_time + recipe.cook_time} min</span>
                            <span>🍽️ {recipe.servings} servings</span>
                            <span>📊 {recipe.difficulty}</span>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => startCooking(recipe)}
                          >
                            Start Cooking
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {filteredRecipes.length === 0 && (
                    <div className="text-center py-12">
                      <category.icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? `No recipes found with "${searchTerm}" in ${category.name.toLowerCase()}.`
                          : `We're working on adding more recipes with ${category.name.toLowerCase()}.`
                        }
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Ingredients;