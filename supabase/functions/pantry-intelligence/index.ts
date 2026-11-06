import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface PantryFreshness {
  status: string;
  daysLeft: number | null;
}

interface PantryItem {
  ingredient_name?: string;
  name?: string;
  freshness?: PantryFreshness | null;
}

interface MatchableRecipe {
  id: string;
  name: string;
  ingredients?: unknown;
  difficulty?: unknown;
  prep_time?: unknown;
  cook_time?: unknown;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pantryItems, recipes, mode, ingredient } = await req.json();

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode: 'match' for recipe matching, 'substitute' for substitution suggestions
    if (mode === 'substitute' && ingredient) {
      return await handleSubstitution(ingredient);
    }

    if (mode === 'match' && pantryItems && recipes) {
      return await handleRecipeMatching(pantryItems, recipes);
    }

    return new Response(
      JSON.stringify({ error: "Invalid request mode" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Pantry intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSubstitution(ingredient: string) {
  const systemPrompt = `You are an expert African cuisine chef with deep knowledge of ingredient substitutions. 
  Given an ingredient, provide 3-5 substitutes that work well in African cooking.
  Focus on practical substitutes that are commonly available and maintain the dish's authenticity.
  
  Return a JSON array with this structure:
  [
    {
      "name": "substitute name",
      "ratio": "1:1 or other ratio",
      "notes": "brief explanation of how this substitute works",
      "compatibilityScore": 0-100,
      "availabilityScore": 0-100
    }
  ]
  
  Only return valid JSON, no other text.`;

  const userPrompt = `What are the best substitutes for "${ingredient}" in African cooking? Consider both traditional African alternatives and commonly available options.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response
    let substitutes = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        substitutes = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse substitutes:", e);
      substitutes = [];
    }

    return new Response(
      JSON.stringify({ substitutes, ingredient }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Substitution error:", error);
    return new Response(
      JSON.stringify({ error: error.message, substitutes: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRecipeMatching(pantryItems: PantryItem[], recipes: MatchableRecipe[]) {
  // Prepare a summary for AI analysis - including freshness data
  const pantryWithFreshness = pantryItems.map(p => {
    const name = p.ingredient_name || p.name;
    const freshness = p.freshness;
    if (freshness && freshness.status !== 'unknown') {
      return `${name} (${freshness.status}${freshness.daysLeft !== null ? `, ${freshness.daysLeft} days left` : ''})`;
    }
    return name;
  });
  
  const expiringItems = pantryItems.filter(p => 
    p.freshness && ['expired', 'urgent', 'soon'].includes(p.freshness.status)
  ).map(p => p.ingredient_name || p.name);
  
  const pantryNames = pantryWithFreshness.join(", ");
  const recipeSummaries = recipes.slice(0, 20).map(r => ({
    id: r.id,
    name: r.name,
    ingredients: Array.isArray(r.ingredients) 
      ? r.ingredients.map((i) => typeof i === 'string' ? i : i.name || i.ingredient || '').join(", ")
      : '',
    difficulty: r.difficulty,
    prep_time: r.prep_time,
    cook_time: r.cook_time
  }));

  const systemPrompt = `You are an intelligent pantry assistant for African cooking.
  Analyze the user's pantry and available recipes to provide smart matching.
  
  CRITICAL: The user has items with expiration data. STRONGLY prioritize recipes that use expiring/urgent items!
  
  Consider (in order of importance):
  1. **Expiration urgency** - Recipes using items marked "expired", "urgent", or "soon" should be HIGH priority
  2. Ingredient match percentage (how many recipe ingredients are in pantry)
  3. Cooking complexity vs missing ingredients
  4. Possible substitutions that could increase match percentage
  
  Priority rules:
  - HIGH: Uses 2+ expiring ingredients OR 1 expired ingredient
  - MEDIUM: Uses 1 expiring ingredient OR has 80%+ match
  - LOW: Good match but no urgency
  
  Return a JSON object with this structure:
  {
    "matches": [
      {
        "recipeId": "uuid",
        "matchScore": 0-100,
        "matchedIngredients": ["list of matched ingredients"],
        "missingIngredients": ["list of missing ingredients"],
        "expiringIngredientsUsed": ["list of expiring ingredients this recipe uses"],
        "substitutionSuggestions": [
          {"missing": "ingredient", "substitute": "available ingredient", "note": "brief note"}
        ],
        "canCookNow": boolean,
        "priority": "high/medium/low",
        "priorityReason": "brief reason explaining priority, mention expiring items if relevant"
      }
    ],
    "insights": "Brief insight mentioning expiring items that should be used soon, and overall cooking options",
    "urgentAlert": "Optional: alert message if items are expiring today or expired"
  }
  
  Sort matches by priority (high first), then by matchScore.
  Only return valid JSON, no other text.`;

  const userPrompt = `My pantry contains (with freshness status): ${pantryNames}

${expiringItems.length > 0 ? `⚠️ ITEMS NEEDING ATTENTION: ${expiringItems.join(", ")}` : ''}

Available recipes to match:
${JSON.stringify(recipeSummaries, null, 2)}

Analyze and rank these recipes. Prioritize recipes that use my expiring items!`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let result = { matches: [], insights: "" };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse match results:", e);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Recipe matching error:", error);
    return new Response(
      JSON.stringify({ error: error.message, matches: [], insights: "" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
