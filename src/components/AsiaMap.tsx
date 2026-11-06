import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import asiaMapImage from "@/assets/asia-map.jpg";
import CookingPopup from "./CookingPopup";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { asIngredientList, asStepList, withParsedRecipeFields, type CookableRecipe } from "@/types/content";
import { readErrorMessage } from "@/lib/errors";

const AsiaMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const [recipesData, setRecipesData] = useState<CookableRecipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .in('slug', ['sushi-japanese', 'pad-thai-thailand', 'chicken-tikka-masala-india', 'plov-uzbekistan']);
      
      if (error) {
        console.error('Error fetching recipes:', error);
        return;
      }
      
      if (data) {
        setRecipesData(data.map(withParsedRecipeFields));
      }
    };

    fetchRecipes();
  }, []);

  const regions = [
    {
      name: "East Asia",
      description: "Refined flavors, fermented ingredients, and perfect balance of umami.",
      countries: ["China", "Japan", "South Korea", "Mongolia", "Taiwan", "North Korea", "Hong Kong", "Macau", "Tibet", "Myanmar"],
      featuredRecipes: ["Peking Duck", "Sushi", "Kimchi", "Mongolian Beef", "Xiaolongbao", "Ramen", "Bibimbap", "Dim Sum", "Hot Pot", "Pad Thai"],
      color: "from-red-400 to-pink-500"
    },
    {
      name: "Southeast Asia",
      description: "Bold spices, coconut-rich curries, and vibrant street food culture.",
      countries: ["Thailand", "Vietnam", "Indonesia", "Philippines", "Malaysia", "Singapore", "Cambodia", "Laos", "Brunei", "East Timor"],
      featuredRecipes: ["Tom Yum", "Pho", "Rendang", "Adobo", "Laksa", "Hainanese Chicken", "Amok", "Larb", "Satay", "Lumpia"],
      color: "from-green-400 to-emerald-500"
    },
    {
      name: "South Asia",
      description: "Complex spice blends, vegetarian traditions, and aromatic rice dishes.",
      countries: ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Maldives", "Afghanistan", "Kashmir", "Punjab"],
      featuredRecipes: ["Biryani", "Tikka Masala", "Dal", "Samosa", "Dosa", "Curry", "Tandoori", "Naan", "Pulao", "Chole"],
      color: "from-orange-400 to-yellow-500"
    },
    {
      name: "Central Asia",
      description: "Hearty meat dishes, nomadic cooking traditions, and fermented dairy.",
      countries: ["Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Turkey", "Azerbaijan", "Armenia", "Georgia", "Iran"],
      featuredRecipes: ["Plov", "Manti", "Shashlik", "Lagman", "Beshbarmak", "Dolma", "Khachapuri", "Kebab", "Qabuli", "Kheer"],
      color: "from-amber-400 to-orange-500"
    }
  ];

  const handleStartCooking = async (recipeName: string, regionName: string) => {
    if (!recipeName || typeof recipeName !== 'string') {
      toast.error('Invalid recipe name');
      return;
    }

    try {
      // First try to fetch from database
      const { data: dbRecipe, error } = await supabase
        .from('recipes')
        .select('*')
        .ilike('name', `%${recipeName}%`)
        .maybeSingle();

      if (error) {
        console.error('Error fetching recipe:', error);
        toast.error(`Error loading recipe: ${error.message}`);
        return;
      }

      if (dbRecipe) {
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
          tags: dbRecipe.tags || ["Asian", regionName]
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

  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Explore Asia</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the diverse culinary traditions across the Asian continent.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div className="relative">
            <div className="relative bg-gradient-map rounded-3xl p-8 shadow-warm">
              <img 
                src={asiaMapImage}
                alt="Interactive map of Asia showing different regions"
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
                          Countries
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
                        <div className="grid grid-cols-1 gap-3 mb-6">
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
                        
                        <Link to="/recipes">
                          <Button variant="hero" className="w-full">
                            <ChefHat className="w-4 h-4 mr-2" />
                            Explore All {region.name} Recipes
                          </Button>
                        </Link>
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
          <h3 className="text-2xl font-bold text-center mb-10">All Asian Regions</h3>
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
                    {region.countries.length} countries • {region.featuredRecipes.length} recipes
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

export default AsiaMap;