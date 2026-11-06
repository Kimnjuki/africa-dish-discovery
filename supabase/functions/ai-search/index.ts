import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build base query
    let dbQuery = supabase.from('recipes').select('*');

    // Apply filters
    if (filters?.country) {
      dbQuery = dbQuery.eq('country', filters.country);
    }
    if (filters?.difficulty) {
      dbQuery = dbQuery.eq('difficulty', filters.difficulty);
    }
    if (filters?.maxTime) {
      dbQuery = dbQuery.lte('cook_time', filters.maxTime);
    }
    if (filters?.dietary && filters.dietary.length > 0) {
      dbQuery = dbQuery.overlaps('tags', filters.dietary);
    }

    const { data: recipes, error: dbError } = await dbQuery.order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // If there's a natural language query, use AI to rank and filter results
    if (query && lovableApiKey && recipes && recipes.length > 0) {
      const recipesSummary = recipes.slice(0, 50).map(r => ({
        id: r.id,
        name: r.name,
        country: r.country,
        summary: r.summary,
        tags: r.tags,
        ingredients: Array.isArray(r.ingredients) 
          ? r.ingredients.map((i) => typeof i === 'string' ? i : i.name || i.item || '').join(', ')
          : '',
        prep_time: r.prep_time,
        cook_time: r.cook_time,
        difficulty: r.difficulty,
        calories: r.calories
      }));

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
              content: `You are a recipe search assistant. Given a user's natural language query and a list of recipes, return the IDs of the most relevant recipes in order of relevance. Consider:
- Ingredient mentions in the query
- Cuisine preferences
- Dietary requirements (vegetarian, vegan, gluten-free, etc.)
- Time constraints
- Cooking skill level
- Flavor preferences

Return ONLY a JSON array of recipe IDs, nothing else. Example: ["id1", "id2", "id3"]`
            },
            {
              role: 'user',
              content: `Query: "${query}"

Available recipes:
${JSON.stringify(recipesSummary, null, 2)}

Return the most relevant recipe IDs as a JSON array.`
            }
          ],
          max_completion_tokens: 500
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '[]';
        
        try {
          const relevantIds = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
          
          if (Array.isArray(relevantIds) && relevantIds.length > 0) {
            // Reorder recipes based on AI ranking
            const rankedRecipes = relevantIds
              .map((id: string) => recipes.find(r => r.id === id))
              .filter(Boolean);
            
            // Add remaining recipes not in the AI list
            const remainingRecipes = recipes.filter(r => !relevantIds.includes(r.id));
            
            return new Response(JSON.stringify({
              recipes: [...rankedRecipes, ...remainingRecipes],
              ai_enhanced: true,
              query_interpretation: `Searched for: ${query}`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      }
    }

    // Fallback: return recipes with basic text matching
    let filteredRecipes = recipes || [];
    
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => {
        const nameMatch = recipe.name?.toLowerCase().includes(searchTerm);
        const summaryMatch = recipe.summary?.toLowerCase().includes(searchTerm);
        const tagMatch = recipe.tags?.some((tag: string) => tag?.toLowerCase().includes(searchTerm));
        const ingredientMatch = Array.isArray(recipe.ingredients) && recipe.ingredients.some((ing) => {
          const ingName = typeof ing === 'string' ? ing : ing.name || ing.item || '';
          return ingName.toLowerCase().includes(searchTerm);
        });
        return nameMatch || summaryMatch || tagMatch || ingredientMatch;
      });
    }

    return new Response(JSON.stringify({
      recipes: filteredRecipes,
      ai_enhanced: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
