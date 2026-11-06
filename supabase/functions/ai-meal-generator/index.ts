import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealPlanRequest {
  userId: string;
  preferences: {
    dietaryRestrictions?: string[];
    favoriteCuisines?: string[];
    maxPrepTime?: number;
    calorieTarget?: number;
    budgetPerDay?: number;
    servings?: number;
    daysToGenerate?: number;
  };
  pantryItems?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, preferences, pantryItems } = await req.json() as MealPlanRequest;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch available recipes
    let query = supabase.from('recipes').select('*');
    
    if (preferences.maxPrepTime) {
      query = query.lte('prep_time', preferences.maxPrepTime);
    }

    const { data: recipes, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No recipes available' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's taste profile
    const { data: tasteProfile } = await supabase
      .from('user_taste_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const daysToGenerate = preferences.daysToGenerate || 7;
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    // Prepare recipe data for AI
    const recipesSummary = recipes.map(r => ({
      id: r.id,
      name: r.name,
      country: r.country,
      tags: r.tags || [],
      prep_time: r.prep_time,
      cook_time: r.cook_time,
      calories: r.calories || 0,
      protein: r.protein || 0,
      carbs: r.carbs || 0,
      fats: r.fats || 0,
      difficulty: r.difficulty,
      ingredients: Array.isArray(r.ingredients) 
        ? r.ingredients.map((i) => typeof i === 'string' ? i : i.name || i.item || '').slice(0, 5)
        : []
    }));

    if (!lovableApiKey) {
      // Fallback: random selection
      const mealPlan = generateRandomMealPlan(recipes, daysToGenerate, mealTypes);
      return new Response(JSON.stringify({ mealPlan, ai_generated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use AI to generate optimized meal plan
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a meal planning assistant. Create a balanced, varied ${daysToGenerate}-day meal plan using the provided recipes. Consider:
- Nutritional balance (aim for variety in protein, carbs, and vegetables)
- User's dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
- Favorite cuisines: ${preferences.favoriteCuisines?.join(', ') || 'any'}
- Daily calorie target: ${preferences.calorieTarget || 2000} calories
- Available pantry items: ${pantryItems?.join(', ') || 'not specified'}
- Taste profile: ${tasteProfile ? `Spice tolerance: ${tasteProfile.spice_tolerance}, Skill level: ${tasteProfile.cooking_skill_level}` : 'not specified'}

Return ONLY a valid JSON object with this structure (no markdown, no explanations):
{
  "days": [
    {
      "day": 0,
      "meals": {
        "breakfast": { "recipeId": "uuid", "servings": 2 },
        "lunch": { "recipeId": "uuid", "servings": 2 },
        "dinner": { "recipeId": "uuid", "servings": 2 }
      },
      "nutrition": { "calories": 1800, "protein": 80, "carbs": 200, "fats": 60 }
    }
  ],
  "weeklyNutrition": { "avgCalories": 1850, "avgProtein": 75, "avgCarbs": 210, "avgFats": 65 },
  "tips": ["meal prep tip 1", "meal prep tip 2"]
}`
          },
          {
            role: 'user',
            content: `Generate a ${daysToGenerate}-day meal plan using these recipes:\n${JSON.stringify(recipesSummary, null, 2)}`
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Fallback to random
      const mealPlan = generateRandomMealPlan(recipes, daysToGenerate, mealTypes);
      return new Response(JSON.stringify({ mealPlan, ai_generated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const mealPlan = JSON.parse(cleanedContent);
      
      // Validate and enrich the meal plan with full recipe data
      const enrichedPlan = enrichMealPlan(mealPlan, recipes);
      
      return new Response(JSON.stringify({ 
        mealPlan: enrichedPlan, 
        ai_generated: true,
        tips: mealPlan.tips || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI meal plan:', parseError, content);
      const mealPlan = generateRandomMealPlan(recipes, daysToGenerate, mealTypes);
      return new Response(JSON.stringify({ mealPlan, ai_generated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Meal generator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface MealRecipe {
  id: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface PlannedMeal {
  recipeId: string;
  recipe: MealRecipe;
  servings: number;
}

interface DayNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DayMeals {
  day: number;
  meals: Record<string, PlannedMeal>;
  nutrition: DayNutrition;
}

interface RandomMealPlan {
  days: DayMeals[];
  weeklyNutrition: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
  };
}

interface AiPlannedMeal {
  recipeId?: string;
  recipe?: MealRecipe | null;
  servings?: number;
}

interface AiDayPlan {
  meals?: Record<string, AiPlannedMeal>;
}

interface AiMealPlan {
  days?: AiDayPlan[];
  tips?: string[];
}

function generateRandomMealPlan(recipes: MealRecipe[], days: number, mealTypes: string[]): RandomMealPlan {
  const plan: RandomMealPlan = {
    days: [],
    weeklyNutrition: { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFats: 0 }
  };

  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

  for (let day = 0; day < days; day++) {
    const dayMeals: DayMeals = { day, meals: {}, nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
    
    for (const mealType of mealTypes) {
      const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
      dayMeals.meals[mealType] = {
        recipeId: randomRecipe.id,
        recipe: randomRecipe,
        servings: 2
      };
      dayMeals.nutrition.calories += randomRecipe.calories || 400;
      dayMeals.nutrition.protein += randomRecipe.protein || 25;
      dayMeals.nutrition.carbs += randomRecipe.carbs || 50;
      dayMeals.nutrition.fats += randomRecipe.fats || 15;
    }

    totalCalories += dayMeals.nutrition.calories;
    totalProtein += dayMeals.nutrition.protein;
    totalCarbs += dayMeals.nutrition.carbs;
    totalFats += dayMeals.nutrition.fats;
    
    plan.days.push(dayMeals);
  }

  plan.weeklyNutrition = {
    avgCalories: Math.round(totalCalories / days),
    avgProtein: Math.round(totalProtein / days),
    avgCarbs: Math.round(totalCarbs / days),
    avgFats: Math.round(totalFats / days)
  };

  return plan;
}

function enrichMealPlan(mealPlan: AiMealPlan, recipes: MealRecipe[]) {
  const recipeMap = new Map(recipes.map(r => [r.id, r]));
  
  for (const day of mealPlan.days || []) {
    const meals: Record<string, AiPlannedMeal> = day.meals || {};
    for (const [mealType, meal] of Object.entries(meals)) {
      if (meal.recipeId) {
        meal.recipe = recipeMap.get(meal.recipeId) || null;
      }
    }
  }
  
  return mealPlan;
}
