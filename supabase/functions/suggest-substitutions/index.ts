/**
 * Legacy endpoint — redirects callers to curated retrieval.
 * Does NOT invent substitutes with an LLM (blueprint guardrail).
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ingredient = typeof body?.ingredient === "string" ? body.ingredient : "";
    if (!ingredient || ingredient.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid ingredient" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Proxy shape to the safe substitutions function contract.
    // Clients should call `substitutions` directly; this remains for older callers.
    return new Response(
      JSON.stringify({
        suggestions: [],
        error: null,
        meta: {
          llm_used: false,
          message:
            "AI invent mode disabled. Use curated graph /functions/v1/substitutions or the client substitutionEngine.",
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
