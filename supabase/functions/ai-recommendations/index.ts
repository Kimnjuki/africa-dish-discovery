import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recipe {
  id: string;
  name: string;
  summary: string;
  country: string;
  cuisine_type: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  tags: string[];
  ingredients: unknown;
  image_url: string;
  calories: number;
  heat_level: number;
}

interface UserInteraction {
  recipe_id: string;
  interaction_type: string;
  recipes: Recipe;
}

interface TasteProfile {
  preferred_cuisines: string[];
  preferred_ingredients: string[];
  avoided_ingredients: string[];
  spice_tolerance: string;
  time_availability_weekday: number;
  time_availability_weekend: number;
}

interface Recommendation extends Recipe {
  recommendation_reason: string;
  score?: number;
}

interface SqlFragmentClient {
  raw: (expression: string) => unknown;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { action, recipe_id, category = "for_you", limit = 10 } = await req.json();

    console.log(`AI Recommendations: action=${action}, userId=${userId}, category=${category}`);

    // Handle different actions
    switch (action) {
      case "get_recommendations":
        return await getRecommendations(supabase, userId, category, limit, lovableApiKey, corsHeaders);
      
      case "track_interaction":
        if (!userId || !recipe_id) {
          return new Response(
            JSON.stringify({ error: "User ID and recipe ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return await trackInteraction(supabase, userId, recipe_id, req, corsHeaders);
      
      case "get_similar":
        if (!recipe_id) {
          return new Response(
            JSON.stringify({ error: "Recipe ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return await getSimilarRecipes(supabase, recipe_id, limit, corsHeaders);
      
      case "refresh_profile":
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return await refreshTasteProfile(supabase, userId, lovableApiKey, corsHeaders);
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("AI Recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getRecommendations(
  supabase: SupabaseClient,
  userId: string | null,
  category: string,
  limit: number,
  lovableApiKey: string | undefined,
  corsHeaders: Record<string, string>
) {
  let recommendations: Recommendation[] = [];
  const reasons: Record<string, string> = {};

  if (userId) {
    // Check for cached recommendations
    const { data: cachedRecs } = await supabase
      .from("personalized_recommendations")
      .select("recipe_id, recommendation_score, recommendation_reason, category")
      .eq("user_id", userId)
      .eq("category", category)
      .gt("expires_at", new Date().toISOString())
      .order("recommendation_score", { ascending: false })
      .limit(limit);

    if (cachedRecs && cachedRecs.length > 0) {
      const recipeIds = cachedRecs.map((r) => r.recipe_id);
      const { data: recipes } = await supabase
        .from("recipes")
        .select("*")
        .in("id", recipeIds);

      if (recipes) {
        cachedRecs.forEach((rec) => {
          reasons[rec.recipe_id] = rec.recommendation_reason;
        });
        
        recommendations = recipes.map((recipe: Recipe) => ({
          ...recipe,
          recommendation_reason: reasons[recipe.id] || "Recommended for you",
          score: cachedRecs.find((r) => r.recipe_id === recipe.id)?.recommendation_score
        }));

        // Mark as shown
        await supabase
          .from("personalized_recommendations")
          .update({ shown_to_user: true })
          .eq("user_id", userId)
          .in("recipe_id", recipeIds);
      }
    } else {
      // Generate new recommendations
      recommendations = await generatePersonalizedRecommendations(
        supabase, userId, category, limit, lovableApiKey
      );
    }
  } else {
    // Non-authenticated: return trending/popular recipes
    recommendations = await getTrendingRecipes(supabase, limit);
  }

  console.log(`Returning ${recommendations.length} recommendations`);

  return new Response(
    JSON.stringify({ 
      recommendations,
      category,
      personalized: !!userId 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function generatePersonalizedRecommendations(
  supabase: SupabaseClient,
  userId: string,
  category: string,
  limit: number,
  lovableApiKey: string | undefined
) {
  // Get user's taste profile
  const { data: tasteProfile } = await supabase
    .from("user_taste_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Get user's interaction history
  const { data: interactions } = await supabase
    .from("user_recipe_interactions")
    .select("recipe_id, interaction_type, recipes(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get user's favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId);

  const favoriteIds = favorites?.map((f) => f.recipe_id) || [];
  const viewedIds = interactions?.map((i: UserInteraction) => i.recipe_id) || [];

  // Get all recipes
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("*")
    .limit(200);

  if (!allRecipes || allRecipes.length === 0) {
    return [];
  }

  // Score each recipe based on user preferences
  const scoredRecipes = allRecipes.map((recipe: Recipe) => {
    let score = 0.5; // Base score
    let reason = "Discover something new";

    // Boost if matches preferred cuisine
    if (tasteProfile?.preferred_cuisines?.includes(recipe.cuisine_type)) {
      score += 0.2;
      reason = `Matches your love for ${recipe.cuisine_type} cuisine`;
    }

    // Boost if similar to favorited recipes
    if (favoriteIds.length > 0) {
      const favoritedRecipes = interactions?.filter(
        (i: UserInteraction) => favoriteIds.includes(i.recipe_id)
      );
      const favCuisines = favoritedRecipes?.map((f: UserInteraction) => f.recipes?.cuisine_type) || [];
      if (favCuisines.includes(recipe.cuisine_type)) {
        score += 0.15;
        reason = "Similar to recipes you've loved";
      }
    }

    // Adjust based on difficulty preference
    if (tasteProfile?.cooking_skill_level) {
      const skillLevel = Number(tasteProfile.cooking_skill_level);
      const difficultyMap: Record<string, number> = { easy: 0.3, medium: 0.6, hard: 0.9 };
      const recipeDifficulty = difficultyMap[recipe.difficulty?.toLowerCase()] || 0.5;
      if (Math.abs(skillLevel - recipeDifficulty) < 0.3) {
        score += 0.1;
      }
    }

    // Adjust based on spice preference
    if (tasteProfile?.spice_tolerance && recipe.heat_level) {
      const spiceMap: Record<string, number> = { mild: 1, medium: 2, hot: 3, very_hot: 4 };
      const userSpice = spiceMap[tasteProfile.spice_tolerance] || 2;
      if (recipe.heat_level <= userSpice) {
        score += 0.05;
      } else {
        score -= 0.1;
      }
    }

    // Penalize already viewed
    if (viewedIds.includes(recipe.id)) {
      score -= 0.3;
    }

    // Add some randomness for discovery
    score += Math.random() * 0.1;

    return {
      ...recipe,
      score: Math.max(0, Math.min(1, score)),
      recommendation_reason: reason
    };
  });

  // Sort by score and take top results
  const topRecipes = scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Cache recommendations
  const cacheEntries = topRecipes.map((recipe, index) => ({
    user_id: userId,
    recipe_id: recipe.id,
    recommendation_score: recipe.score,
    recommendation_reason: recipe.recommendation_reason,
    category,
    position: index + 1,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }));

  await supabase.from("personalized_recommendations").insert(cacheEntries);

  return topRecipes;
}

async function getTrendingRecipes(supabase: SupabaseClient, limit: number) {
  // Get trending recipes based on trends table or recent reviews
  const { data: trends } = await supabase
    .from("trends")
    .select("recipe_id, score, recipes(*)")
    .order("score", { ascending: false })
    .limit(limit);

  if (trends && trends.length > 0) {
    return trends.map((t) => ({
      ...t.recipes,
      recommendation_reason: "Trending now",
      score: t.score
    }));
  }

  // Fallback to recent recipes with good ratings
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (recipes || []).map((recipe: Recipe) => ({
    ...recipe,
    recommendation_reason: "Popular recipe",
    score: 0.7
  }));
}

async function trackInteraction(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
  req: Request,
  corsHeaders: Record<string, string>
) {
  const { interaction_type, duration_seconds, completion_percentage, metadata } = await req.json();

  const { error } = await supabase.from("user_recipe_interactions").insert({
    user_id: userId,
    recipe_id: recipeId,
    interaction_type: interaction_type || "view",
    duration_seconds,
    completion_percentage,
    session_id: crypto.randomUUID(),
    metadata
  });

  if (error) {
    console.error("Error tracking interaction:", error);
    return new Response(
      JSON.stringify({ error: "Failed to track interaction" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update taste profile training data points
  await supabase
    .from("user_taste_profiles")
    .update({ 
      training_data_points: (supabase as SupabaseClient & SqlFragmentClient).raw("training_data_points + 1"),
      last_updated: new Date().toISOString()
    })
    .eq("user_id", userId);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getSimilarRecipes(
  supabase: SupabaseClient,
  recipeId: string,
  limit: number,
  corsHeaders: Record<string, string>
) {
  // Get the source recipe
  const { data: sourceRecipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (!sourceRecipe) {
    return new Response(
      JSON.stringify({ error: "Recipe not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check cached similarity scores
  const { data: cachedSimilar } = await supabase
    .from("recipe_similarity_scores")
    .select("recipe_b_id, similarity_score")
    .eq("recipe_a_id", recipeId)
    .order("similarity_score", { ascending: false })
    .limit(limit);

  if (cachedSimilar && cachedSimilar.length > 0) {
    const recipeIds = cachedSimilar.map((s) => s.recipe_b_id);
    const { data: recipes } = await supabase
      .from("recipes")
      .select("*")
      .in("id", recipeIds);

    return new Response(
      JSON.stringify({ 
        similar_recipes: recipes?.map((r: Recipe) => ({
          ...r,
          similarity_score: cachedSimilar.find((s) => s.recipe_b_id === r.id)?.similarity_score
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Calculate similarity on the fly
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("*")
    .neq("id", recipeId)
    .limit(100);

  const similarRecipes = (allRecipes || []).map((recipe: Recipe) => {
    let score = 0;

    // Same cuisine type
    if (recipe.cuisine_type === sourceRecipe.cuisine_type) score += 0.3;
    
    // Same country
    if (recipe.country === sourceRecipe.country) score += 0.2;
    
    // Similar difficulty
    if (recipe.difficulty === sourceRecipe.difficulty) score += 0.15;
    
    // Similar cook time (within 15 min)
    const timeDiff = Math.abs((recipe.cook_time || 0) - (sourceRecipe.cook_time || 0));
    if (timeDiff <= 15) score += 0.15;
    
    // Shared tags
    const sourceTags = sourceRecipe.tags || [];
    const recipeTags = recipe.tags || [];
    const sharedTags = sourceTags.filter((t: string) => recipeTags.includes(t));
    score += sharedTags.length * 0.05;

    return { ...recipe, similarity_score: Math.min(1, score) };
  })
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);

  return new Response(
    JSON.stringify({ similar_recipes: similarRecipes }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function refreshTasteProfile(
  supabase: SupabaseClient,
  userId: string,
  lovableApiKey: string | undefined,
  corsHeaders: Record<string, string>
) {
  // Get user's interaction history
  const { data: interactions } = await supabase
    .from("user_recipe_interactions")
    .select("*, recipes(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!interactions || interactions.length < 5) {
    return new Response(
      JSON.stringify({ 
        message: "Not enough data to build taste profile",
        interactions_needed: 5 - (interactions?.length || 0)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Analyze interactions to build profile
  const cuisineCounts: Record<string, number> = {};
  const ingredientCounts: Record<string, number> = {};
  let totalCookTime = 0;
  let cookCount = 0;

  interactions.forEach((interaction) => {
    const recipe = interaction.recipes;
    if (!recipe) return;

    const weight = interaction.interaction_type === "cook" ? 3 : 
                   interaction.interaction_type === "save" ? 2 : 1;

    if (recipe.cuisine_type) {
      cuisineCounts[recipe.cuisine_type] = (cuisineCounts[recipe.cuisine_type] || 0) + weight;
    }

    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        const name = typeof ing === "string" ? ing : ing.name;
        if (name) {
          ingredientCounts[name] = (ingredientCounts[name] || 0) + weight;
        }
      });
    }

    if (recipe.cook_time && interaction.interaction_type === "cook") {
      totalCookTime += recipe.cook_time;
      cookCount++;
    }
  });

  // Get top preferences
  const preferredCuisines = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cuisine]) => cuisine);

  const preferredIngredients = Object.entries(ingredientCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ingredient]) => ingredient);

  const avgCookTime = cookCount > 0 ? Math.round(totalCookTime / cookCount) : 45;
  const confidence = Math.min(1, interactions.length / 50);

  // Upsert taste profile
  const { error } = await supabase
    .from("user_taste_profiles")
    .upsert({
      user_id: userId,
      preferred_cuisines: preferredCuisines,
      preferred_ingredients: preferredIngredients,
      time_availability_weekday: avgCookTime,
      time_availability_weekend: avgCookTime + 30,
      confidence_score: confidence,
      training_data_points: interactions.length,
      last_updated: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Error updating taste profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Clear old recommendations to force regeneration
  await supabase
    .from("personalized_recommendations")
    .delete()
    .eq("user_id", userId);

  return new Response(
    JSON.stringify({ 
      success: true,
      profile: {
        preferred_cuisines: preferredCuisines,
        preferred_ingredients: preferredIngredients,
        confidence_score: confidence
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
