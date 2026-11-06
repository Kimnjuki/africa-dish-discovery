import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ChefHat } from "lucide-react";
import northAmericaMapImage from "@/assets/north-america-map.jpg";
import CookingPopup from "./CookingPopup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { withParsedRecipeFields, type CookableRecipe } from "@/types/content";

const NorthAmericaMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const [recipesData, setRecipesData] = useState<Record<string, CookableRecipe>>({});
  const { toast } = useToast();

  // Load recipes from database on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .in('country', ['USA', 'United States', 'Canada', 'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Jamaica']);

        if (error) throw error;

        const lookup: Record<string, CookableRecipe> = {};
        data?.forEach(recipe => {
          lookup[recipe.name] = withParsedRecipeFields(recipe);
        });
        setRecipesData(lookup);
      } catch (error) {
        console.error('Error loading recipes:', error);
      }
    };

    loadRecipes();
  }, []);

  const regions = [
    {
      name: "United States",
      description: "Diverse regional cuisines, fusion flavors, and comfort food classics.",
      countries: ["California", "Texas", "New York", "Louisiana", "Hawaii", "Alaska", "Florida", "Illinois", "Nevada", "Washington"],
      featuredRecipes: ["BBQ Ribs", "Tex-Mex Tacos", "New York Pizza", "Gumbo", "Poke Bowl", "Salmon", "Key Lime Pie", "Deep Dish Pizza", "Prime Rib", "Clam Chowder"],
      color: "from-red-400 to-rose-500"
    },
    {
      name: "Canada",
      description: "Fresh seafood, maple-infused dishes, and multicultural fusion.",
      countries: ["Ontario", "Quebec", "British Columbia", "Alberta", "Nova Scotia", "Manitoba", "Saskatchewan", "New Brunswick", "Newfoundland", "Yukon"],
      featuredRecipes: ["Poutine", "Tourtière", "Butter Tarts", "Nanaimo Bars", "Lobster Roll", "Bannock", "Saskatoon Pie", "Rappie Pie", "Jiggs Dinner", "BeaverTails"],
      color: "from-blue-400 to-cyan-500"
    },
    {
      name: "Mexico",
      description: "Ancient Aztec traditions, vibrant spices, and corn-based cuisine.",
      countries: ["Oaxaca", "Puebla", "Yucatan", "Jalisco", "Veracruz", "Michoacan", "Chiapas", "Sonora", "Baja California", "Quintana Roo"],
      featuredRecipes: ["Mole", "Chiles Rellenos", "Cochinita Pibil", "Pozole", "Ceviche", "Carnitas", "Tamales", "Carne Asada", "Fish Tacos", "Sopa de Lima"],
      color: "from-green-400 to-lime-500"
    },
    {
      name: "Central America",
      description: "Tropical ingredients, indigenous roots, and Spanish colonial influences.",
      countries: ["Guatemala", "Belize", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panama", "Caribbean Islands", "Cuba", "Jamaica"],
      featuredRecipes: ["Pepián", "Rice and Beans", "Pupusas", "Baleadas", "Gallo Pinto", "Casado", "Sancocho", "Jerk Chicken", "Ropa Vieja", "Ackee and Saltfish"],
      color: "from-yellow-400 to-orange-500"
    }
  ];

  const handleStartCooking = (recipeName: string, regionName: string) => {
    const dbRecipe = recipesData[recipeName];
    
    if (dbRecipe) {
      setSelectedRecipe(dbRecipe);
      setIsCookingPopupOpen(true);
    } else {
      toast({
        title: "Recipe not available",
        description: `${recipeName} is not yet available in the database.`,
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Explore North America</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the melting pot of flavors across North America.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div className="relative">
            <div className="relative bg-gradient-map rounded-3xl p-8 shadow-warm">
              <img 
                src={northAmericaMapImage}
                alt="Interactive map of North America showing different regions"
                className="w-full h-auto rounded-2xl shadow-soft"
              />
              
              {/* Overlay regions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {regions.map((region, index) => (
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
                      <div className="text-white/90 text-xs">{region.countries.length} regions</div>
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
                  <Card key={region.name} className="border-primary/20 shadow-warm animate-slide-in-up">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${region.color}`} />
                        <h3 className="text-2xl font-bold text-primary">{region.name}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {region.description}
                      </p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Regions
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
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Featured Recipes
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {region.featuredRecipes.map(recipe => (
                            <Button
                              key={recipe}
                              variant="secondary"
                              className="p-3 justify-between h-auto"
                              onClick={() => handleStartCooking(recipe, region.name)}
                            >
                              <span className="text-sm font-medium">{recipe}</span>
                              <div className="flex items-center gap-1 text-xs">
                                <ChefHat className="w-3 h-3" />
                                Start Cooking
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Region</h3>
                  <p className="text-muted-foreground">
                    Click on any region on the map to explore its culinary treasures.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All Regions Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-10">All North American Regions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    {region.countries.length} regions • {region.featuredRecipes.length} recipes
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cooking Popup */}
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
      </div>
    </section>
  );
};

export default NorthAmericaMap;