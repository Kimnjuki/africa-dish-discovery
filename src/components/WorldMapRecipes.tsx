import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  MapPin, 
  ChefHat, 
  Clock, 
  Users, 
  Star,
  PlayCircle,
  BookOpen,
  ArrowLeft,
  Heart,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CookingPopup from "./CookingPopup";
import RecipeImagePlaceholder from "./RecipeImagePlaceholder";
import useRequireAuth from "@/hooks/useRequireAuth";
import africaMap from "@/assets/africa-map.jpg";
import asiaMap from "@/assets/asia-map.jpg";
import europeMap from "@/assets/europe-map.jpg";
import northAmericaMap from "@/assets/north-america-map.jpg";
import southAmericaMap from "@/assets/south-america-map.jpg";
import australiaMap from "@/assets/australia-map.jpg";
import { withParsedRecipeFields, type IngredientValue, type StepValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  country: string;
  summary?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  history?: string;
  ingredients?: IngredientValue[] | null;
  steps?: StepValue[] | null;
  tags?: string[];
  image_url?: string;
}

interface Region {
  name: string;
  description: string;
  countries: string[];
  color: string;
  image: string;
  icon: string;
}

const WorldMapRecipes = () => {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const { user, requireAuth } = useRequireAuth();

  const continents = [
    {
      name: "Africa",
      description: "The birthplace of humanity's oldest culinary traditions",
      image: africaMap,
      icon: "🌍",
      color: "from-orange-400 to-red-500",
      regions: [
        {
          name: "West Africa",
          description: "Bold flavors, spicy stews, and iconic rice dishes like Jollof.",
          countries: ["Nigeria", "Ghana", "Senegal", "Ivory Coast", "Mali", "Burkina Faso"],
          color: "from-orange-400 to-red-500"
        },
        {
          name: "East Africa",
          description: "Staple swallows, spiced meats, and street food traditions.",
          countries: ["Ethiopia", "Kenya", "Uganda", "Tanzania", "Somalia", "Rwanda"],
          color: "from-yellow-400 to-orange-500"
        },
        {
          name: "North Africa",
          description: "Slow-cooked tagines, couscous, and aromatic spice blends.",
          countries: ["Morocco", "Egypt", "Algeria", "Tunisia", "Libya", "Sudan"],
          color: "from-amber-400 to-yellow-500"
        },
        {
          name: "Central Africa",
          description: "Earthy stews, cassava-based staples, and palm-infused dishes.",
          countries: ["DR Congo", "Cameroon", "Central African Republic", "Chad", "Gabon"],
          color: "from-green-400 to-teal-500"
        },
        {
          name: "Southern Africa",
          description: "Fusion flavors from Dutch, Malay, and indigenous traditions.",
          countries: ["South Africa", "Zimbabwe", "Zambia", "Namibia", "Botswana", "Mozambique"],
          color: "from-blue-400 to-purple-500"
        }
      ]
    },
    {
      name: "Asia",
      description: "A tapestry of ancient spices and refined techniques",
      image: asiaMap,
      icon: "🏮",
      color: "from-red-400 to-pink-500",
      regions: [
        {
          name: "East Asia",
          description: "Delicate balance of flavors with emphasis on umami.",
          countries: ["China", "Japan", "Korea", "Taiwan", "Mongolia"],
          color: "from-red-400 to-pink-500"
        },
        {
          name: "Southeast Asia",
          description: "Fresh herbs, spices, and bold tropical flavors.",
          countries: ["Thailand", "Vietnam", "Indonesia", "Malaysia", "Philippines"],
          color: "from-green-400 to-emerald-500"
        },
        {
          name: "South Asia",
          description: "Rich curries, aromatic spices, and diverse vegetarian traditions.",
          countries: ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal"],
          color: "from-orange-400 to-amber-500"
        },
        {
          name: "Middle East",
          description: "Ancient spice routes meet modern culinary artistry.",
          countries: ["Turkey", "Iran", "Iraq", "Saudi Arabia", "Lebanon", "Israel"],
          color: "from-amber-400 to-orange-500"
        }
      ]
    },
    {
      name: "Europe",
      description: "Sophisticated cuisine with rich cultural heritage",
      image: europeMap,
      icon: "🏰",
      color: "from-blue-400 to-indigo-500",
      regions: [
        {
          name: "Mediterranean",
          description: "Olive oil, fresh vegetables, and seafood traditions.",
          countries: ["Italy", "Greece", "Spain", "Portugal", "France"],
          color: "from-blue-400 to-cyan-500"
        },
        {
          name: "Northern Europe",
          description: "Hearty comfort foods and preserved traditions.",
          countries: ["UK", "Germany", "Netherlands", "Belgium", "Scandinavia"],
          color: "from-gray-400 to-blue-500"
        },
        {
          name: "Eastern Europe",
          description: "Soul-warming stews and fermented specialties.",
          countries: ["Poland", "Russia", "Ukraine", "Czech Republic", "Hungary"],
          color: "from-red-400 to-rose-500"
        }
      ]
    },
    {
      name: "North America",
      description: "A melting pot of flavors and fusion cuisines",
      image: northAmericaMap,
      icon: "🗽",
      color: "from-green-400 to-blue-500",
      regions: [
        {
          name: "United States",
          description: "Regional diversity from BBQ to soul food to Tex-Mex.",
          countries: ["United States"],
          color: "from-blue-400 to-red-500"
        },
        {
          name: "Mexico & Central America",
          description: "Ancient Mayan and Aztec culinary heritage.",
          countries: ["Mexico", "Guatemala", "Honduras", "El Salvador", "Costa Rica"],
          color: "from-green-400 to-red-500"
        },
        {
          name: "Caribbean",
          description: "Island spices and tropical fruit traditions.",
          countries: ["Jamaica", "Cuba", "Puerto Rico", "Dominican Republic", "Haiti"],
          color: "from-yellow-400 to-green-500"
        }
      ]
    },
    {
      name: "South America",
      description: "Passionate flavors with indigenous roots",
      image: southAmericaMap,
      icon: "🏔️",
      color: "from-yellow-400 to-orange-500",
      regions: [
        {
          name: "Brazil",
          description: "Diverse cuisine from tropical to churrasco traditions.",
          countries: ["Brazil"],
          color: "from-green-400 to-yellow-500"
        },
        {
          name: "Andes Region",
          description: "Ancient Incan ingredients and high-altitude cooking.",
          countries: ["Peru", "Bolivia", "Ecuador", "Colombia"],
          color: "from-orange-400 to-red-500"
        },
        {
          name: "Southern Cone",
          description: "European influences meet South American passion.",
          countries: ["Argentina", "Chile", "Uruguay", "Paraguay"],
          color: "from-blue-400 to-cyan-500"
        }
      ]
    },
    {
      name: "Oceania",
      description: "Fresh, innovative cuisine from island paradises",
      image: australiaMap,
      icon: "🏝️",
      color: "from-cyan-400 to-blue-500",
      regions: [
        {
          name: "Australia",
          description: "Bush tucker meets modern multicultural fusion.",
          countries: ["Australia"],
          color: "from-orange-400 to-yellow-500"
        },
        {
          name: "Pacific Islands",
          description: "Fresh seafood and tropical fruit traditions.",
          countries: ["Fiji", "Samoa", "Tonga", "Hawaii", "Tahiti"],
          color: "from-blue-400 to-teal-500"
        },
        {
          name: "New Zealand",
          description: "Maori traditions meet farm-to-table innovation.",
          countries: ["New Zealand"],
          color: "from-green-400 to-emerald-500"
        }
      ]
    }
  ];

  useEffect(() => {
    if (selectedRegion) {
      fetchRecipesForRegion();
    }
  }, [selectedRegion]);

  const fetchRecipesForRegion = async () => {
    if (!selectedRegion || !selectedContinent) return;
    
    setLoading(true);
    try {
      const continent = continents.find(c => c.name === selectedContinent);
      const region = continent?.regions.find(r => r.name === selectedRegion);
      
      if (!region) return;

      // Build query to match countries in the region
      const countryFilters = region.countries.map(c => `country.ilike.%${c}%`).join(',');
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(countryFilters)
        .limit(20);

      if (error) throw error;
      setRecipes((data || []).map(withParsedRecipeFields));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error("Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const startCooking = (recipe: Recipe) => {
    requireAuth(() => {
      setSelectedRecipe(recipe);
      setIsCookingPopupOpen(true);
    });
  };

  const addToFavorites = async (recipe: Recipe) => {
    if (!requireAuth()) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ recipe_id: recipe.id, user_id: user.id });
      
      if (error) {
        if (error.code === '23505') {
          toast.info("Already in favorites");
        } else {
          throw error;
        }
      } else {
        toast.success(`Added ${recipe.name} to favorites`);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error("Failed to add to favorites");
    }
  };

  const handleBack = () => {
    if (selectedRegion) {
      setSelectedRegion(null);
      setRecipes([]);
    } else if (selectedContinent) {
      setSelectedContinent(null);
    }
  };

  // Render region detail view
  if (selectedRegion && selectedContinent) {
    const continent = continents.find(c => c.name === selectedContinent);
    const region = continent?.regions.find(r => r.name === selectedRegion);

    return (
      <section className="py-12 bg-gradient-earth min-h-screen">
        <div className="container mx-auto px-6">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {selectedContinent}
          </Button>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">{selectedRegion} Cuisine</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {region?.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {region?.countries.map(country => (
                <Badge key={country} variant="secondary">{country}</Badge>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading recipes...</p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <Card key={recipe.id} className="border-primary/10 shadow-soft hover:shadow-warm transition-all overflow-hidden">
                  {/* Recipe Image */}
                  <RecipeImagePlaceholder
                    name={recipe.name}
                    country={recipe.country}
                    imageUrl={recipe.image_url}
                    className="h-48 w-full"
                  />
                  
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-primary line-clamp-1">{recipe.name}</h3>
                      <Badge variant="outline" className="shrink-0 ml-2">{recipe.country}</Badge>
                    </div>
                    
                    {recipe.summary && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {recipe.summary}
                      </p>
                    )}

                    {recipe.history && (
                      <div className="mb-3 p-2 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium">History</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {recipe.history}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      {(recipe.prep_time || recipe.cook_time) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{recipe.servings}</span>
                        </div>
                      )}
                      {recipe.difficulty && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{recipe.difficulty}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => startCooking(recipe)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Cook
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => addToFavorites(recipe)}
                        title={user ? "Add to favorites" : "Sign in to save"}
                      >
                        {user ? <Heart className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recipes found for this region yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon as we add more recipes!
              </p>
            </div>
          )}
        </div>

        {selectedRecipe && (
          <CookingPopup
            recipe={selectedRecipe}
            isOpen={isCookingPopupOpen}
            onClose={() => {
              setIsCookingPopupOpen(false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </section>
    );
  }

  // Render continent regions view
  if (selectedContinent) {
    const continent = continents.find(c => c.name === selectedContinent);
    
    return (
      <section className="py-12 bg-gradient-earth min-h-screen">
        <div className="container mx-auto px-6">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to World Map
          </Button>

          <div className="text-center mb-12">
            <div className="text-6xl mb-4">{continent?.icon}</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Explore {selectedContinent}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {continent?.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continent?.regions.map(region => (
              <Card 
                key={region.name}
                className="border-primary/10 shadow-soft hover:shadow-warm transition-all cursor-pointer group"
                onClick={() => setSelectedRegion(region.name)}
              >
                <CardContent className="p-6">
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${region.color} mb-4`} />
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {region.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {region.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {region.countries.slice(0, 4).map(country => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                    {region.countries.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{region.countries.length - 4} more
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Explore Recipes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Render world map view
  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient">World Recipe Map</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Explore authentic recipes from every corner of the globe. Click on a continent 
            to discover regional cuisines and traditional dishes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {continents.map((continent, index) => (
            <Card 
              key={continent.name}
              className="border-primary/10 shadow-soft hover:shadow-warm transition-all cursor-pointer group overflow-hidden"
              onClick={() => setSelectedContinent(continent.name)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={continent.image}
                  alt={`${continent.name} map`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{continent.icon}</span>
                    <h3 className="text-2xl font-bold text-white">{continent.name}</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  {continent.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <MapPin className="w-4 h-4" />
                    <span>{continent.regions.length} regions</span>
                  </div>
                  <Button variant="hero" size="sm">
                    Explore
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-card/50 rounded-3xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Global Culinary Journey</h3>
            <p className="text-muted-foreground">
              Discover flavors from every corner of the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Continents</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">25+</div>
              <div className="text-sm text-muted-foreground">Regions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">195+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1,700+</div>
              <div className="text-sm text-muted-foreground">Recipes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMapRecipes;
