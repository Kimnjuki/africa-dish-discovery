import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ChefHat } from "lucide-react";
import southAmericaMapImage from "@/assets/south-america-map.jpg";
import CookingPopup from "@/components/CookingPopup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { withParsedRecipeFields, type CookableRecipe } from "@/types/content";

const SouthAmericaMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const [recipesData, setRecipesData] = useState<Record<string, CookableRecipe>>({});
  const { toast } = useToast();

  const regions = [
    {
      name: "Northern South America",
      description: "Tropical fruits, grilled meats, and vibrant street food culture.",
      countries: ["Colombia", "Venezuela", "Guyana", "Suriname", "French Guiana", "Trinidad", "Barbados", "Aruba", "Curacao", "Bonaire"],
      featuredRecipes: ["Arepa", "Pabellón", "Pepperpot", "Roti", "Bouillon", "Doubles", "Flying Fish", "Keshi Yena", "Stoba", "Pastechi"],
      color: "from-emerald-400 to-green-500"
    },
    {
      name: "Brazil",
      description: "Portuguese influences, tropical ingredients, and festive BBQ traditions.",
      countries: ["São Paulo", "Rio de Janeiro", "Bahia", "Minas Gerais", "Pernambuco", "Ceará", "Amazonas", "Paraná", "Santa Catarina", "Rio Grande do Sul"],
      featuredRecipes: ["Feijoada", "Açaí Bowl", "Coxinha", "Brigadeiro", "Moqueca", "Tapioca", "Churrasco", "Pão de Açúcar", "Caipirinha", "Pastéis"],
      color: "from-yellow-400 to-amber-500"
    },
    {
      name: "Andean Region",
      description: "Ancient Incan ingredients, high-altitude crops, and quinoa-based dishes.",
      countries: ["Peru", "Ecuador", "Bolivia", "Northern Chile", "Northern Argentina", "Colombian Andes", "Venezuelan Andes", "Patagonia", "Altiplano", "Amazon Basin"],
      featuredRecipes: ["Ceviche", "Lomo Saltado", "Locro", "Salteñas", "Empanadas", "Anticuchos", "Quinoa Soup", "Humitas", "Ají de Gallina", "Pachamanca"],
      color: "from-orange-400 to-red-500"
    },
    {
      name: "Southern Cone",
      description: "European influences, world-class wines, and premium beef culture.",
      countries: ["Argentina", "Chile", "Uruguay", "Paraguay", "Southern Brazil", "Patagonia", "Mendoza", "Central Valley", "Montevideo", "Asunción"],
      featuredRecipes: ["Asado", "Empanadas", "Chimichurri", "Choripán", "Chivito", "Sopa Paraguaya", "Dulce de Leche", "Milanesa", "Provoleta", "Mate"],
      color: "from-purple-400 to-pink-500"
    }
  ];

  // Load recipes from database on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .in('country', ['Venezuela', 'Colombia', 'Guyana', 'Suriname', 'Peru', 'Ecuador', 'Bolivia', 'Chile', 'Argentina', 'Uruguay', 'Paraguay', 'Brazil']);

        if (error) throw error;

        // Create a lookup object by recipe name
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

  const handleStartCooking = (recipeName: string, regionName: string) => {
    // Try to find the recipe in the database first
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
            <span className="text-gradient">Explore South America</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the passionate flavors and rich culinary heritage of South America.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div className="relative">
            <div className="relative bg-gradient-map rounded-3xl p-8 shadow-warm">
              <img 
                src={southAmericaMapImage}
                alt="Interactive map of South America showing different regions"
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
          <h3 className="text-2xl font-bold text-center mb-10">All South American Regions</h3>
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
    </section>
  );
};

export default SouthAmericaMap;