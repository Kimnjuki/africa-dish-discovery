import { useState, useEffect, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Loader2, 
  Utensils,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Lightbulb,
  Calendar,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CookableRecipe } from "@/types/content";
import { readErrorMessage } from "@/lib/errors";

interface MealPlanDay {
  day: number;
  meals: {
    breakfast?: { recipeId: string; recipe?: CookableRecipe; servings: number };
    lunch?: { recipeId: string; recipe?: CookableRecipe; servings: number };
    dinner?: { recipeId: string; recipe?: CookableRecipe; servings: number };
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface GeneratedMealPlan {
  days: MealPlanDay[];
  weeklyNutrition: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
  };
}

interface AIMealGeneratorProps {
  onMealPlanGenerated: (plan: GeneratedMealPlan, tips: string[]) => void;
  userId: string;
}

const dietaryOptions = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Halal", "Low-Carb", "High-Protein", "Keto"
];

const cuisineOptions = [
  "West African", "East African", "North African", 
  "Southern African", "Nigerian", "Ethiopian", "Moroccan"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AIMealGenerator = ({ onMealPlanGenerated, userId }: AIMealGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState([2000]);
  const [budgetPerDay, setBudgetPerDay] = useState([25]);
  const [maxPrepTime, setMaxPrepTime] = useState([60]);
  const [servings, setServings] = useState(2);
  const [daysToGenerate, setDaysToGenerate] = useState(7);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [tips, setTips] = useState<string[]>([]);

  const toggleDietary = (option: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]
    );
  };

  const toggleCuisine = (option: string) => {
    setFavoriteCuisines(prev =>
      prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]
    );
  };

  const generateMealPlan = async () => {
    setIsGenerating(true);

    try {
      // Fetch user's pantry items
      const { data: pantryItems } = await supabase
        .from('pantry_items')
        .select('ingredient_name')
        .eq('user_id', userId);

      const { data, error } = await supabase.functions.invoke('ai-meal-generator', {
        body: {
          userId,
          preferences: {
            dietaryRestrictions,
            favoriteCuisines,
            maxPrepTime: maxPrepTime[0],
            calorieTarget: calorieTarget[0],
            budgetPerDay: budgetPerDay[0],
            servings,
            daysToGenerate
          },
          pantryItems: pantryItems?.map(p => p.ingredient_name) || []
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error("Rate limit exceeded", { description: "Please try again in a moment" });
        } else if (data.error.includes('credits')) {
          toast.error("AI credits exhausted", { description: "Please add funds to continue" });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setGeneratedPlan(data.mealPlan);
      setTips(data.tips || []);
      onMealPlanGenerated(data.mealPlan, data.tips || []);

      toast.success(data.ai_generated ? "AI meal plan generated!" : "Meal plan generated", {
        description: data.ai_generated 
          ? "Optimized for your preferences and nutrition goals"
          : "Basic plan created - AI unavailable"
      });
    } catch (error: unknown) {
      console.error('Generation error:', error);
      toast.error("Failed to generate meal plan", {
        description: readErrorMessage(error) || "Please try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const NutritionBar = ({ label, value, max, icon: Icon, color }: {
    label: string;
    value: number;
    max: number;
    icon: ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1">
          <Icon className={`w-4 h-4 ${color}`} />
          {label}
        </span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={(value / max) * 100} className="h-2" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Meal Plan Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Days to Generate */}
          <div className="space-y-2">
            <Label>Plan Duration</Label>
            <div className="flex gap-2">
              {[3, 5, 7].map(days => (
                <Button
                  key={days}
                  variant={daysToGenerate === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDaysToGenerate(days)}
                >
                  {days} Days
                </Button>
              ))}
            </div>
          </div>

          {/* Calorie Target */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Daily Calorie Target
              </Label>
              <span className="text-sm font-medium">{calorieTarget[0]} kcal</span>
            </div>
            <Slider
              value={calorieTarget}
              onValueChange={setCalorieTarget}
              min={1200}
              max={3500}
              step={100}
            />
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Budget per Day
              </Label>
              <span className="text-sm font-medium">${budgetPerDay[0]}</span>
            </div>
            <Slider
              value={budgetPerDay}
              onValueChange={setBudgetPerDay}
              min={10}
              max={75}
              step={5}
            />
          </div>

          {/* Max Prep Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Prep Time per Meal</Label>
              <span className="text-sm font-medium">{maxPrepTime[0]} min</span>
            </div>
            <Slider
              value={maxPrepTime}
              onValueChange={setMaxPrepTime}
              min={15}
              max={120}
              step={15}
            />
          </div>

          {/* Servings */}
          <div className="space-y-2">
            <Label>Servings per Meal</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 2)}
              className="w-24"
            />
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <Badge
                  key={option}
                  variant={dietaryRestrictions.includes(option) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDietary(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Favorite Cuisines */}
          <div className="space-y-3">
            <Label>Preferred Cuisines</Label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map(option => (
                <Badge
                  key={option}
                  variant={favoriteCuisines.includes(option) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCuisine(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateMealPlan} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Generated Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Nutrition Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <NutritionBar 
                label="Calories" 
                value={generatedPlan.weeklyNutrition.avgCalories}
                max={calorieTarget[0]}
                icon={Flame}
                color="text-orange-500"
              />
              <NutritionBar 
                label="Protein" 
                value={generatedPlan.weeklyNutrition.avgProtein}
                max={150}
                icon={Dumbbell}
                color="text-red-500"
              />
              <NutritionBar 
                label="Carbs" 
                value={generatedPlan.weeklyNutrition.avgCarbs}
                max={300}
                icon={Wheat}
                color="text-amber-500"
              />
              <NutritionBar 
                label="Fats" 
                value={generatedPlan.weeklyNutrition.avgFats}
                max={100}
                icon={Droplets}
                color="text-blue-500"
              />
            </div>

            {/* Days Preview */}
            <div className="grid grid-cols-7 gap-2">
              {generatedPlan.days.slice(0, 7).map((day, idx) => (
                <div 
                  key={idx} 
                  className="text-center p-2 bg-muted/30 rounded-lg"
                >
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    {daysOfWeek[idx]}
                  </div>
                  <div className="space-y-1">
                    {['breakfast', 'lunch', 'dinner'].map(mealType => {
                      const meal = day.meals[mealType as keyof typeof day.meals];
                      return meal?.recipe ? (
                        <div key={mealType} className="text-xs truncate" title={meal.recipe.name}>
                          <Utensils className="w-3 h-3 inline mr-1" />
                          {meal.recipe.name?.slice(0, 8)}...
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Tips */}
            {tips.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Meal Prep Tips
                </Label>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
