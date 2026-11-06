import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ReqBody {
  ingredient: string;
  country?: string;
  region?: string;
  dish_name?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.ingredient || typeof body.ingredient !== "string" || body.ingredient.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid ingredient" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = [
      body.dish_name && `Dish: ${body.dish_name}`,
      body.country && `Country: ${body.country}`,
      body.region && `Region: ${body.region}`,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a culinary expert specializing in African and global cuisine. Given the ingredient "${body.ingredient}" used in this context:\n${ctx}\n\nReturn 3-5 culturally appropriate substitutes that preserve the dish's authentic flavor profile. Prefer regionally available alternatives. Return ONLY a JSON array of objects with this exact shape: [{"name":"<substitute>","ratio":"<e.g. 1:1>","notes":"<short flavor/texture note>","authenticity":"high|medium|low"}]`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Respond with valid JSON only — no prose, no markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI request failed", detail: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "[]";
    let suggestions: unknown = [];
    try {
      const cleaned = String(raw).replace(/```json\s*|\s*```/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
