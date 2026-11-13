import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalize(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haystackContainsTerm(haystack: string, term: string): boolean {
  if (!term || term.length < 2) return false;
  if (term.length >= 5) return haystack.includes(term);
  if (haystack === term) return true;
  const padded = ` ${haystack} `;
  if (padded.includes(` ${term} `)) return true;
  if (term.length >= 4) {
    return padded.split(/\s+/).some((w) => w === term || w.startsWith(term));
  }
  return false;
}

function recipeHaystack(recipe: Record<string, unknown>): string {
  const ingredients = recipe.ingredients;
  let ingText = "";
  if (Array.isArray(ingredients)) {
    ingText = ingredients
      .map((ing) => {
        if (typeof ing === "string") return ing;
        if (ing && typeof ing === "object") {
          const o = ing as Record<string, unknown>;
          return String(o.name || o.ingredient || o.item || o.text || "");
        }
        return "";
      })
      .join(" ");
  }
  const tags = Array.isArray(recipe.tags) ? (recipe.tags as string[]).join(" ") : "";
  return normalize(
    [recipe.name, recipe.country, recipe.summary, recipe.category, tags, ingText]
      .filter(Boolean)
      .join(" ")
  );
}

function matchesAnyTerm(recipe: Record<string, unknown>, terms: string[]): boolean {
  const haystack = recipeHaystack(recipe);
  return terms.some((term) => haystackContainsTerm(haystack, normalize(term)));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters, search_terms, suggestion } = await req.json();
    
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

    const aliasHint =
      Array.isArray(search_terms) && search_terms.length > 0
        ? ` Also treat these African dish aliases / spellings as equivalent: ${search_terms.slice(0, 12).join(", ")}.`
        : "";

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
- Common African dish spelling variants and local names (e.g. jolof→jollof, ugali≈nsima/sadza/pap)${aliasHint}

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
              query_interpretation: suggestion
                ? `Searched for: ${query} (including “${suggestion}”)`
                : `Searched for: ${query}`,
              suggestion: suggestion || null,
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      }
    }

    // Fallback: synonym/typo-aware text matching (search_terms from client expansion)
    let filteredRecipes = recipes || [];
    
    if (query || (Array.isArray(search_terms) && search_terms.length > 0)) {
      const terms: string[] =
        Array.isArray(search_terms) && search_terms.length > 0
          ? search_terms.map((t: string) => normalize(String(t))).filter(Boolean)
          : [normalize(String(query || ""))].filter(Boolean);

      filteredRecipes = filteredRecipes.filter((recipe) => matchesAnyTerm(recipe, terms));
    }

    return new Response(JSON.stringify({
      recipes: filteredRecipes,
      ai_enhanced: false,
      suggestion: suggestion || null,
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
