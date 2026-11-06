import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  Users, 
  Utensils,
  ArrowLeft,
  Flame,
  Dumbbell,
  Wheat,
  Droplets
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  name: string;
  country: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface PlannedMeal {
  id: string;
  day_of_week: number;
  meal_type: string;
  servings: number;
  notes?: string;
  recipe?: Recipe;
}

interface MealPlan {
  id: string;
  name: string;
  week_start_date: string;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const SharedMealPlan = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedMealPlan();
  }, [shareToken]);

  const fetchSharedMealPlan = async () => {
    if (!shareToken) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    try {
      // Fetch the meal plan by share token
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (planError || !planData) {
        setError("Meal plan not found or no longer shared");
        setLoading(false);
        return;
      }

      setMealPlan(planData);

      // Fetch planned meals
      const { data: mealsData, error: mealsError } = await supabase
        .from('planned_meals')
        .select(`
          *,
          recipe:recipes(id, name, country, prep_time, cook_time, servings, image_url, calories, protein, carbs, fats)
        `)
        .eq('meal_plan_id', planData.id);

      if (mealsError) throw mealsError;
      setPlannedMeals(mealsData || []);
    } catch (err) {
      console.error('Error fetching shared meal plan:', err);
      setError("Failed to load meal plan");
    } finally {
      setLoading(false);
    }
  };

  const getMealsForDay = (dayIndex: number) => {
    return plannedMeals.filter(meal => meal.day_of_week === dayIndex);
  };

  const calculateTotalNutrition = () => {
    return plannedMeals.reduce((acc, meal) => {
      if (meal.recipe) {
        return {
          calories: acc.calories + (meal.recipe.calories || 0),
          protein: acc.protein + (meal.recipe.protein || 0),
          carbs: acc.carbs + (meal.recipe.carbs || 0),
          fats: acc.fats + (meal.recipe.fats || 0),
        };
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-16 container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading shared meal plan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-16 container mx-auto px-6 py-12">
          <div className="text-center max-w-md mx-auto">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Meal Plan Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "This meal plan may no longer be shared or the link is invalid."}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const nutrition = calculateTotalNutrition();
  const avgNutrition = {
    calories: Math.round(nutrition.calories / 7),
    protein: Math.round(nutrition.protein / 7),
    carbs: Math.round(nutrition.carbs / 7),
    fats: Math.round(nutrition.fats / 7),
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${mealPlan.name} | Shared Meal Plan | LadhaQuest`}
        description={`View this shared weekly meal plan featuring African cuisine recipes. Discover delicious African dishes planned for the week.`}
        keywords="shared meal plan, african recipes, weekly meal plan, meal planning"
        canonical={`https://www.ladhaquest.com/shared-meal-plan/${shareToken}`}
      />
      
      <Navigation />
      <main className="pt-16">
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to LadhaQuest
              </Link>
              
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  <Users className="w-3 h-3 mr-1" />
                  Shared Meal Plan
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <Calendar className="inline-block mr-3 mb-1" />
                  {mealPlan.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Week starting {new Date(mealPlan.week_start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Weekly Nutrition Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Average Daily Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{avgNutrition.calories}</p>
                      <p className="text-sm text-muted-foreground">kcal/day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                    <Dumbbell className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{avgNutrition.protein}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg">
                    <Wheat className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold">{avgNutrition.carbs}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                    <Droplets className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{avgNutrition.fats}g</p>
                      <p className="text-sm text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Calendar View */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {daysOfWeek.map((day, dayIdx) => (
                <Card key={dayIdx} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-sm font-bold text-center">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {mealTypes.map(mealType => {
                      const meal = getMealsForDay(dayIdx).find(m => m.meal_type === mealType);
                      return (
                        <div key={mealType} className="p-2 rounded-lg bg-muted/50">
                          <div className="text-xs font-semibold text-muted-foreground mb-1 capitalize">
                            {mealType}
                          </div>
                          {meal && meal.recipe ? (
                            <div className="space-y-1">
                              {meal.recipe.image_url && (
                                <img 
                                  src={meal.recipe.image_url} 
                                  alt={meal.recipe.name}
                                  className="w-full h-16 object-cover rounded"
                                />
                              )}
                              <p className="text-xs font-medium line-clamp-2">{meal.recipe.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {(meal.recipe.prep_time || 0) + (meal.recipe.cook_time || 0)} min
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {meal.servings} servings
                              </Badge>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              No meal planned
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Card className="max-w-lg mx-auto">
                <CardContent className="pt-6">
                  <ChefHat className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-xl font-bold mb-2">Create Your Own Meal Plan</h2>
                  <p className="text-muted-foreground mb-4">
                    Sign up for LadhaQuest to create and share your own weekly meal plans with AI-powered suggestions.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/auth">
                      <Button>Get Started</Button>
                    </Link>
                    <Link to="/recipes">
                      <Button variant="outline">Browse Recipes</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SharedMealPlan;