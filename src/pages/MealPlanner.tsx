import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, ShoppingCart, Trash2, ChefHat, Sparkles, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AIMealGenerator } from "@/components/meal-planner/AIMealGenerator";
import { NutritionTracker } from "@/components/meal-planner/NutritionTracker";
import { BudgetTracker } from "@/components/meal-planner/BudgetTracker";
import { MealPlanShare } from "@/components/meal-planner/MealPlanShare";
import { withParsedRecipeFields, type IngredientValue } from "@/types/content";
import type { User } from "@supabase/supabase-js";

interface Recipe {
  id: string;
  name: string;
  country: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: IngredientValue[] | null;
  image_url?: string;
}

interface MealPlan {
  id: string;
  name: string;
  week_start_date: string;
  is_public?: boolean;
  share_token?: string | null;
}

interface PlannedMeal {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: number;
  meal_type: string;
  servings: number;
  notes?: string;
  recipe?: Recipe;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const MealPlanner = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDate, setNewPlanDate] = useState("");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [servings, setServings] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    checkUser();
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMealPlans();
    }
  }, [user]);

  useEffect(() => {
    if (currentPlan) {
      fetchPlannedMeals();
    }
  }, [currentPlan]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to use the meal planner");
      navigate("/auth");
      return;
    }
    setUser(user);
  };

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

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) throw error;
      setMealPlans(data || []);
      if (data && data.length > 0 && !currentPlan) {
        setCurrentPlan(data[0]);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    }
  };

  const fetchPlannedMeals = async () => {
    if (!currentPlan) return;

    try {
      const { data, error } = await supabase
        .from('planned_meals')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('meal_plan_id', currentPlan.id);

      if (error) throw error;
      setPlannedMeals((data || []).map((meal) => ({
        ...meal,
        recipe: meal.recipe ? withParsedRecipeFields(meal.recipe) as Recipe : undefined,
      })));
    } catch (error) {
      console.error('Error fetching planned meals:', error);
      toast.error('Failed to load planned meals');
    }
  };

  const createMealPlan = async () => {
    if (!newPlanName || !newPlanDate) {
      toast.error("Please provide a name and start date");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{
          user_id: user.id,
          name: newPlanName,
          week_start_date: newPlanDate
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success("Meal plan created!");
      setMealPlans([data, ...mealPlans]);
      setCurrentPlan(data);
      setNewPlanName("");
      setNewPlanDate("");
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast.error('Failed to create meal plan');
    }
  };

  const addMealToPlan = async () => {
    if (!currentPlan || !selectedRecipe) {
      toast.error("Please select a recipe");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('planned_meals')
        .insert([{
          meal_plan_id: currentPlan.id,
          recipe_id: selectedRecipe,
          day_of_week: selectedDay,
          meal_type: selectedMealType,
          servings,
          notes
        }])
        .select(`
          *,
          recipe:recipes(*)
        `)
        .single();

      if (error) throw error;
      toast.success("Meal added to plan!");
      setPlannedMeals([...plannedMeals, {
        ...data,
        recipe: data.recipe ? withParsedRecipeFields(data.recipe) as Recipe : undefined,
      }]);
      setSelectedRecipe("");
      setNotes("");
      setServings(2);
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal to plan');
    }
  };

  const removeMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('planned_meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      toast.success("Meal removed");
      setPlannedMeals(plannedMeals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Error removing meal:', error);
      toast.error('Failed to remove meal');
    }
  };

  const generateShoppingList = () => {
    const ingredients = new Map<string, { quantity: string; unit: string }>();

    plannedMeals.forEach(meal => {
      if (meal.recipe && meal.recipe.ingredients) {
        const recipeIngredients = meal.recipe.ingredients;
        
        if (Array.isArray(recipeIngredients)) {
          recipeIngredients.forEach((ing: IngredientValue) => {
            let ingredientName = "";
            let quantity = "";
            
            if (typeof ing === 'string') {
              ingredientName = ing;
            } else if (typeof ing === 'object' && ing !== null) {
              ingredientName = ing.item || ing.ingredient || ing.name || "";
              quantity = String(ing.quantity || "");
            }
            
            if (ingredientName) {
              if (ingredients.has(ingredientName)) {
                const existing = ingredients.get(ingredientName);
                ingredients.set(ingredientName, {
                  quantity: `${existing?.quantity || ""}, ${quantity}`.trim(),
                  unit: existing?.unit || ""
                });
              } else {
                ingredients.set(ingredientName, { quantity, unit: "" });
              }
            }
          });
        }
      }
    });

    return Array.from(ingredients.entries()).map(([name, details]) => ({
      name,
      quantity: details.quantity
    }));
  };

  const getMealsForDay = (dayIndex: number) => {
    return plannedMeals.filter(meal => meal.day_of_week === dayIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-16 container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading meal planner...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Meal Planner | Plan Your Weekly African Meals | LadhaQuest"
        description="Plan your weekly African cuisine meals and automatically generate shopping lists. Organize breakfast, lunch, and dinner with authentic African recipes."
        keywords="meal planning, weekly meal plan, african meal prep, shopping list generator, meal organization"
        canonical="https://www.ladhaquest.com/meal-planner"
      />
      
      <Navigation />
      <main className="pt-16">
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <Calendar className="inline-block mr-3 mb-1" />
                Meal Planner
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Plan your weekly African cuisine meals and generate shopping lists automatically
              </p>
            </div>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex gap-4 flex-wrap">
                {mealPlans.map(plan => (
                  <Button
                    key={plan.id}
                    variant={currentPlan?.id === plan.id ? "default" : "outline"}
                    onClick={() => setCurrentPlan(plan)}
                  >
                    {plan.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                {currentPlan && (
                  <MealPlanShare
                    mealPlanId={currentPlan.id}
                    mealPlanName={currentPlan.name}
                    isPublic={currentPlan.is_public}
                    shareToken={currentPlan.share_token}
                    onShareUpdate={(isPublic, shareToken) => {
                      setCurrentPlan({ ...currentPlan, is_public: isPublic, share_token: shareToken });
                      setMealPlans(mealPlans.map(p => 
                        p.id === currentPlan.id 
                          ? { ...p, is_public: isPublic, share_token: shareToken }
                          : p
                      ));
                    }}
                  />
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Meal Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="plan-name">Plan Name</Label>
                        <Input
                          id="plan-name"
                          value={newPlanName}
                          onChange={(e) => setNewPlanName(e.target.value)}
                          placeholder="e.g., Week of Jan 15"
                        />
                      </div>
                      <div>
                        <Label htmlFor="start-date">Week Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={newPlanDate}
                          onChange={(e) => setNewPlanDate(e.target.value)}
                        />
                      </div>
                      <Button onClick={createMealPlan} className="w-full">
                        Create Plan
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {currentPlan && (
              <Tabs defaultValue="week" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="week">Week View</TabsTrigger>
                  <TabsTrigger value="ai">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Generate
                  </TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                  <TabsTrigger value="shopping">Shopping List</TabsTrigger>
                </TabsList>

                <TabsContent value="week" className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mb-4">
                        <ChefHat className="mr-2 h-4 w-4" />
                        Add Meal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Meal to Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Day of Week</Label>
                          <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map((day, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Meal Type</Label>
                          <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mealTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Recipe</Label>
                          <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a recipe" />
                            </SelectTrigger>
                            <SelectContent>
                              {recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.id}>
                                  {recipe.name} ({recipe.country})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Servings</Label>
                          <Input
                            type="number"
                            min="1"
                            value={servings}
                            onChange={(e) => setServings(parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Notes (optional)</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions..."
                          />
                        </div>
                        <Button onClick={addMealToPlan} className="w-full">
                          Add to Plan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {daysOfWeek.map((day, dayIdx) => (
                      <Card key={dayIdx}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-bold">{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {mealTypes.map(mealType => {
                            const meal = getMealsForDay(dayIdx).find(m => m.meal_type === mealType);
                            return (
                              <div key={mealType} className="p-2 rounded-lg bg-muted/50">
                                <div className="text-xs font-semibold text-muted-foreground mb-1 capitalize">
                                  {mealType}
                                </div>
                                {meal ? (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium line-clamp-2">{meal.recipe?.name}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {meal.servings} servings
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-full text-xs"
                                      onClick={() => removeMeal(meal.id)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">No meal</p>
                                )}
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <AIMealGenerator 
                    userId={user?.id}
                    onMealPlanGenerated={(plan, tips) => {
                      toast.success("AI meal plan ready! Review and add meals to your plan.");
                    }}
                  />
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <NutritionTracker
                      dailyNutrition={{ calories: 1850, protein: 75, carbs: 220, fats: 65 }}
                      weeklyAverage={{ calories: 1920, protein: 80, carbs: 230, fats: 70 }}
                      targets={{ calories: 2000, protein: 100, carbs: 250, fats: 80 }}
                    />
                    <BudgetTracker
                      weeklyBudget={175}
                      spent={95}
                      plannedCost={160}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="shopping">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShoppingCart className="mr-2" />
                        Shopping List for {currentPlan.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generateShoppingList().length > 0 ? (
                        <div className="space-y-2">
                          {generateShoppingList().map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Add meals to your plan to generate a shopping list
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {!currentPlan && mealPlans.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Meal Plans Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first meal plan to get started
                  </p>
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

export default MealPlanner;
