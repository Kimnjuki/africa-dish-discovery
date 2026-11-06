import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ChefHat, Clock, Users, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CookingPopup from "./CookingPopup";
import africaMapImage from "@/assets/africa-map.jpg";
import westAfricaCuisine from "@/assets/west-africa-cuisine.jpg";
import eastAfricaCuisine from "@/assets/east-africa-cuisine.jpg";
import northAfricaCuisine from "@/assets/north-africa-cuisine.jpg";
import southernAfricaCuisine from "@/assets/southern-africa-cuisine.jpg";
import centralAfricaCuisine from "@/assets/central-africa-cuisine.jpg";
import { asIngredientList, asStepList, withParsedRecipeFields, type CookableRecipe } from "@/types/content";
import { readErrorMessage } from "@/lib/errors";

const AfricaMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<CookableRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const regions = [
    {
      name: "West Africa",
      description: "Bold flavors, spicy stews, and iconic rice dishes like Jollof.",
      countries: ["Nigeria", "Ghana", "Senegal", "Ivory Coast", "Mali", "Burkina Faso", "Guinea", "Sierra Leone", "Liberia", "Niger", "Guinea-Bissau", "Togo", "Benin", "Mauritania", "The Gambia", "Cape Verde"],
      featuredRecipes: [
        { name: "Jollof Rice", time: 45, servings: 6, difficulty: "Medium" },
        { name: "Egusi Soup", time: 60, servings: 4, difficulty: "Hard" },
        { name: "Suya", time: 30, servings: 4, difficulty: "Easy" },
        { name: "Thieboudienne", time: 90, servings: 8, difficulty: "Hard" },
        { name: "Groundnut Stew", time: 50, servings: 6, difficulty: "Medium" }
      ],
      color: "from-orange-400 to-red-500",
      image: westAfricaCuisine
    },
    {
      name: "East Africa",
      description: "Staple swallows, spiced meats, and street food like the Ugandan Rolex.",
      countries: ["Ethiopia", "Kenya", "Uganda", "Tanzania", "Somalia", "Rwanda", "Burundi", "South Sudan", "Eritrea", "Djibouti", "Comoros", "Seychelles", "Mauritius", "Madagascar"],
      featuredRecipes: [
        { name: "Injera with Doro Wat", time: 120, servings: 4, difficulty: "Hard" },
        { name: "Ugali", time: 20, servings: 4, difficulty: "Easy" },
        { name: "Nyama Choma", time: 45, servings: 6, difficulty: "Medium" },
        { name: "Pilau", time: 60, servings: 8, difficulty: "Medium" },
        { name: "Sambusa", time: 40, servings: 12, difficulty: "Medium" }
      ],
      color: "from-yellow-400 to-orange-500",
      image: eastAfricaCuisine
    },
    {
      name: "North Africa",
      description: "Slow-cooked tagines, couscous, and aromatic spice blends.",
      countries: ["Morocco", "Egypt", "Sudan", "Algeria", "Tunisia", "Libya"],
      featuredRecipes: [
        { name: "Moroccan Tagine", time: 120, servings: 4, difficulty: "Medium" },
        { name: "Couscous", time: 45, servings: 6, difficulty: "Easy" },
        { name: "Harira", time: 60, servings: 8, difficulty: "Medium" },
        { name: "Ful Medames", time: 30, servings: 4, difficulty: "Easy" },
        { name: "Chermoula", time: 15, servings: 6, difficulty: "Easy" }
      ],
      color: "from-amber-400 to-yellow-500",
      image: northAfricaCuisine
    },
    {
      name: "Central Africa",
      description: "Earthy stews, cassava-based staples, and rich palm-infused dishes.",
      countries: ["DR Congo", "Cameroon", "Central African Republic", "Chad", "Republic of the Congo", "Gabon", "Equatorial Guinea", "São Tomé and Príncipe"],
      featuredRecipes: [
        { name: "Moambe Chicken", time: 90, servings: 6, difficulty: "Medium" },
        { name: "Saka Saka", time: 45, servings: 4, difficulty: "Easy" },
        { name: "Pepe Soup", time: 60, servings: 6, difficulty: "Medium" },
        { name: "Kwanga", time: 30, servings: 8, difficulty: "Easy" },
        { name: "Ndolé", time: 75, servings: 6, difficulty: "Hard" }
      ],
      color: "from-green-400 to-teal-500",
      image: centralAfricaCuisine
    },
    {
      name: "Southern Africa",
      description: "Fusion flavors from Dutch, Malay, and indigenous traditions.",
      countries: ["South Africa", "Zimbabwe", "Zambia", "Malawi", "Namibia", "Botswana", "Lesotho", "Eswatini", "Angola", "Mozambique"],
      featuredRecipes: [
        { name: "Bobotie", time: 60, servings: 6, difficulty: "Medium" },
        { name: "Bunny Chow", time: 90, servings: 4, difficulty: "Hard" },
        { name: "Chakalaka", time: 25, servings: 8, difficulty: "Easy" },
        { name: "Pap", time: 20, servings: 6, difficulty: "Easy" },
        { name: "Sadza", time: 30, servings: 4, difficulty: "Easy" }
      ],
      color: "from-blue-400 to-purple-500",
      image: southernAfricaCuisine
    }
  ];

  // Fetch recipes for selected region
  useEffect(() => {
    if (selectedRegion) {
      fetchRecipes();
    }
  }, [selectedRegion]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`country.ilike.%${selectedRegion}%,tags.cs.{${selectedRegion}}`)
        .limit(15);

      if (error) throw error;
      
      // Filter by countries in the selected region
      const region = regions.find(r => r.name === selectedRegion);
      if (region) {
        const filteredRecipes = (data || []).filter(recipe => 
          region.countries.some(country => 
            recipe.country?.toLowerCase().includes(country.toLowerCase()) ||
            country.toLowerCase().includes(recipe.country?.toLowerCase() || '')
          )
        );
        setRecipes(filteredRecipes.map(withParsedRecipeFields));
      } else {
        setRecipes((data || []).map(withParsedRecipeFields));
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCooking = async (recipeName: string, regionName: string) => {
    if (!recipeName || typeof recipeName !== 'string') {
      toast.error('Invalid recipe name');
      return;
    }

    try {
      const { data: dbRecipe, error } = await supabase
        .from('recipes')
        .select('*')
        .ilike('name', `%${recipeName}%`)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Error loading recipe: ${error.message}`);
        return;
      }

      if (dbRecipe && dbRecipe.id) {
        const recipe = {
          id: dbRecipe.id,
          name: dbRecipe.name,
          region: regionName,
          ingredients: asIngredientList(dbRecipe.ingredients),
          steps: asStepList(dbRecipe.steps),
          prep_time: dbRecipe.prep_time || 0,
          cook_time: dbRecipe.cook_time || 0,
          servings: dbRecipe.servings || 4,
          difficulty: dbRecipe.difficulty || 'Medium',
          tags: dbRecipe.tags || ["African", regionName]
        };
        setSelectedRecipe(recipe);
        setIsCookingPopupOpen(true);
      } else {
        toast.error(`Recipe "${recipeName}" not found in database`);
      }
    } catch (err: unknown) {
      console.error('Unexpected error:', err);
      toast.error(readErrorMessage(err) || 'Failed to load recipe');
    }
  };

  const startCooking = (recipe: CookableRecipe) => {
    if (!recipe || !recipe.id) {
      toast.error('Invalid recipe data');
      return;
    }
    setSelectedRecipe(recipe);
    setIsCookingPopupOpen(true);
  };

  return (
    <section id="explore-africa" className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Explore by Region</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Click on a region to discover its most beloved dishes and culinary traditions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div className="relative">
            <div className="relative bg-gradient-map rounded-3xl p-8 shadow-warm">
              <img 
                src={africaMapImage}
                alt="Interactive map of Africa showing different regions"
                className="w-full h-auto rounded-2xl shadow-soft"
              />
              
              {/* Overlay regions - positioned absolutely for interactivity */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {regions.slice(0, 4).map((region, index) => (
                    <div
                      key={region.name}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-300 transform
                        ${selectedRegion === region.name 
                          ? 'scale-110 shadow-glow' 
                          : 'hover:scale-105 shadow-soft'
                        }
                        bg-gradient-to-br ${region.color} opacity-80 hover:opacity-100
                      `}
                      onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    >
                      <div className="text-white text-sm font-semibold">{region.name}</div>
                      <div className="text-white/90 text-xs">{region.countries.length} countries</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Region Information */}
          <div className="space-y-6">
            {selectedRegion ? (
              regions
                .filter(region => region.name === selectedRegion)
                .map(region => (
                  <div key={region.name} className="space-y-6">
                    {/* Region Hero Image */}
                    <Card className="border-primary/20 shadow-warm overflow-hidden">
                      <div className="relative h-64">
                        <img 
                          src={region.image}
                          alt={`${region.name} cuisine`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${region.color}`} />
                            <h3 className="text-2xl font-bold text-white">{region.name}</h3>
                          </div>
                          <p className="text-white/90 text-sm">
                            {region.countries.length} countries • {region.featuredRecipes.length} signature dishes
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Region Details */}
                    <Card className="border-primary/20 shadow-warm animate-slide-in-up">
                      <CardContent className="p-8">
                        <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                          {region.description}
                        </p>
                        
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Countries ({region.countries.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {region.countries.map(country => (
                              <Badge key={country} variant="secondary">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-primary" />
                            Signature Recipes
                          </h4>
                          <div className="grid gap-4">
                            {loading ? (
                              <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-muted-foreground mt-2">Loading recipes...</p>
                              </div>
                            ) : recipes.length > 0 ? (
                              recipes.map(recipe => (
                                <Card 
                                  key={recipe.id}
                                  className="p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer border-primary/10"
                                >
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-primary">{recipe.name}</h5>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => startCooking(recipe)}
                                      >
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        Start Cooking
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>{recipe.servings} servings</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      <span>{recipe.difficulty}</span>
                                    </div>
                                  </div>
                                </Card>
                              ))
                            ) : (
                              // Fallback to static recipes if no database recipes found
                              region.featuredRecipes.map(recipe => (
                                <Card 
                                  key={recipe.name}
                                  className="p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer border-primary/10"
                                >
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-primary">{recipe.name}</h5>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        startCooking({
                                          name: recipe.name,
                                          ingredients: [],
                                          steps: [],
                                          prep_time: recipe.time,
                                          cook_time: 0,
                                          servings: recipe.servings,
                                          difficulty: recipe.difficulty,
                                          tags: [region.name]
                                        });
                                      }}
                                    >
                                      <PlayCircle className="w-3 h-3 mr-1" />
                                      Start Cooking
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{recipe.time} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>{recipe.servings} servings</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      <span>{recipe.difficulty}</span>
                                    </div>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
            ) : (
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Region</h3>
                  <p className="text-muted-foreground">
                    Click on any region on the map to explore its culinary treasures and traditional dishes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All Regions Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-10">All African Regions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region, index) => (
              <Card 
                key={region.name} 
                className="border-primary/20 shadow-soft hover:shadow-warm transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedRegion(region.name)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${region.color}`} />
                    <h4 className="font-semibold text-primary">{region.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {region.description}
                  </p>
                  <div className="text-xs text-primary font-medium">
                    {region.countries.length} countries • {region.featuredRecipes.length} signature dishes
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cooking Popup */}
        <CookingPopup 
          recipe={selectedRecipe}
          isOpen={isCookingPopupOpen}
          onClose={() => {
            setIsCookingPopupOpen(false);
            setSelectedRecipe(null);
          }}
        />
      </div>
    </section>
  );
};

export default AfricaMap;