/**
 * POST /functions/v1/substitutions
 * Curated substitution engine v0 — hard diet/allergen filters, no LLM invent.
 * Response shape matches blueprint substitution_engine.api.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Inline a minimal mirror of the client engine contract for Deno.
// The authoritative scoring lives in src/lib/substitutionEngine.ts;
// this edge function retrieves curated DB rows when available and applies
// the same hard-filter rules. Until DB seed is applied, it returns a clear
// empty result rather than inventing substitutes.

interface ReqBody {
  ingredient?: string;
  ingredient_id?: string;
  country_code?: string;
  language?: string;
  recipe_id?: string;
  servings?: number;
  required_amount?: number;
  unit?: string;
  diet_tags?: string[];
  allergies?: string[];
  budget?: string | null;
  cooking_method?: string;
  user_pantry?: string[];
  limit?: number;
}

function normalize(s: string): string {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function satisfiesAllDiets(required: string[], candidate: string[]): boolean {
  if (!required.length) return true;
  const set = new Set(candidate.map((d) => d.toLowerCase().replace(/-/g, "_")));
  return required.every((d) => set.has(d.toLowerCase().replace(/-/g, "_")));
}

function conflictsWithAllergies(user: string[], candidate: string[]): boolean {
  if (!user.length || !candidate.length) return false;
  const expand = (a: string) => {
    const n = a.toLowerCase().replace(/-/g, "_");
    if (n === "peanut" || n === "groundnut") return ["peanut", "groundnut"];
    if (n === "dairy" || n === "milk") return ["dairy", "milk"];
    return [n];
  };
  const set = new Set(user.flatMap(expand));
  return candidate.flatMap(expand).some((a) => set.has(a));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST required" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ReqBody;
    const ingredient = String(body.ingredient || "").trim();
    if (!ingredient || ingredient.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid ingredient" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    const dietTags = body.diet_tags || [];
    const allergies = body.allergies || [];
    const country = (body.country_code || "").toUpperCase();
    const limit = Math.min(body.limit || 6, 12);

    let substitutions: unknown[] = [];
    let resolved: Record<string, unknown> = {
      id: body.ingredient_id || null,
      name: ingredient,
      ambiguous: false,
    };
    let filteredOut = 0;

    if (supabaseUrl && serviceKey) {
      const headers = {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      };

      // Resolve ingredient by name / slug / alias
      const q = encodeURIComponent(ingredient);
      const aliasRes = await fetch(
        `${supabaseUrl}/rest/v1/ingredient_aliases?select=ingredient_id,alias,alias_normalized,is_ambiguous,match_confidence,ingredients(id,slug,canonical_name,name,dietary_tags,allergens)&alias_normalized=eq.${encodeURIComponent(normalize(ingredient))}&limit=10`,
        { headers }
      );

      let ingredientId = body.ingredient_id || null;
      if (aliasRes.ok) {
        const aliases = await aliasRes.json();
        if (Array.isArray(aliases) && aliases.length) {
          const uniqueIds = [...new Set(aliases.map((a: { ingredient_id: string }) => a.ingredient_id))];
          if (uniqueIds.length > 1 || aliases.some((a: { is_ambiguous: boolean }) => a.is_ambiguous)) {
            resolved = {
              id: null,
              name: ingredient,
              ambiguous: true,
              disambiguation_prompt: `"${ingredient}" matches multiple ingredients. Please choose one.`,
              matches: aliases.map((a: {
                ingredient_id: string;
                alias: string;
                match_confidence: number;
                ingredients: { slug?: string; canonical_name?: string; name?: string } | null;
              }) => ({
                ingredientId: a.ingredient_id,
                slug: a.ingredients?.slug,
                name: a.ingredients?.canonical_name || a.ingredients?.name,
                matchConfidence: a.match_confidence,
                matchedAlias: a.alias,
              })),
            };
            return new Response(
              JSON.stringify({
                resolved_ingredient: resolved,
                substitutions: [],
                meta: { cached: false, llm_used: false, fallback: false, filtered_out: 0 },
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          ingredientId = uniqueIds[0];
          const ing = aliases[0]?.ingredients;
          resolved = {
            id: ingredientId,
            name: ing?.canonical_name || ing?.name || ingredient,
            ambiguous: false,
          };
        }
      }

      if (!ingredientId) {
        const ingRes = await fetch(
          `${supabaseUrl}/rest/v1/ingredients?select=id,slug,canonical_name,name,dietary_tags,allergens&or=(name.ilike.${q},slug.eq.${encodeURIComponent(normalize(ingredient).replace(/\s+/g, "-"))})&limit=1`,
          { headers }
        );
        if (ingRes.ok) {
          const rows = await ingRes.json();
          if (rows?.[0]) {
            ingredientId = rows[0].id;
            resolved = {
              id: ingredientId,
              name: rows[0].canonical_name || rows[0].name,
              ambiguous: false,
            };
          }
        }
      }

      if (ingredientId) {
        const subRes = await fetch(
          `${supabaseUrl}/rest/v1/ingredient_substitutions?select=*,ingredients!ingredient_substitutions_substitute_ingredient_id_fkey(id,slug,canonical_name,name,dietary_tags,allergens)&original_ingredient_id=eq.${ingredientId}&or=(review_status.eq.approved,is_verified.eq.true)&limit=40`,
          { headers }
        );
        if (subRes.ok) {
          const rows = await subRes.json();
          const out = [];
          for (const row of rows || []) {
            const target = row.ingredients || {};
            const tags = target.dietary_tags || row.dietary_tags || [];
            const alls = target.allergens || row.allergens || [];
            if (!satisfiesAllDiets(dietTags, tags) || conflictsWithAllergies(allergies, alls)) {
              filteredOut += 1;
              continue;
            }

            // Availability LEFT JOIN semantics — missing = unknown 0.3
            let availScore = 0.3;
            let availKnown = false;
            if (country) {
              const avRes = await fetch(
                `${supabaseUrl}/rest/v1/ingredient_availability?select=availability_score,confidence&ingredient_id=eq.${target.id}&country_code=eq.${country}&limit=1`,
                { headers }
              );
              if (avRes.ok) {
                const av = await avRes.json();
                if (av?.[0]?.availability_score != null) {
                  availScore = Number(av[0].availability_score);
                  if (availScore > 1) availScore = availScore / 100;
                  availKnown = true;
                }
              }
            }

            const curated = Number(row.confidence ?? row.compatibility_score ?? 0.7);
            const C = curated > 1 ? curated / 100 : curated;
            const score = 0.3 * C + 0.2 * 0.75 + 0.15 * 0.75 + 0.15 * availScore + 0.1 * 0.7 + 0.05 * 1 + 0.05 * 0.5;

            out.push({
              ingredient_id: target.id,
              slug: target.slug,
              name: target.canonical_name || target.name,
              local_name: null,
              type: row.substitution_type || "functional",
              adjusted_amount: (body.required_amount || 1) * Number(row.quantity_ratio || 1),
              unit: body.unit || "portion",
              score: Math.round(score * 1000) / 1000,
              confidence: score >= 0.85 ? "high" : score >= 0.65 ? "medium" : "low",
              flavor_impact: row.flavor_impact || "medium",
              texture_impact: row.texture_impact || "medium",
              reason: row.reason || row.notes || "",
              cooking_adjustments: Array.isArray(row.cooking_adjustments)
                ? row.cooking_adjustments
                : [],
              warnings: [
                !availKnown ? "availability unverified" : null,
                alls.length ? `contains: ${alls.join(", ")}` : null,
              ].filter(Boolean),
              verified: Boolean(row.is_verified),
              availability: { score: availScore, known: availKnown },
            });
          }
          out.sort((a, b) => b.score - a.score);
          substitutions = out.slice(0, limit);
        }
      }
    }

    return new Response(
      JSON.stringify({
        resolved_ingredient: resolved,
        substitutions,
        meta: {
          cached: false,
          llm_used: false,
          fallback: substitutions.length === 0,
          filtered_out: filteredOut,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
