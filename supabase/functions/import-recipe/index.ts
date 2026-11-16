import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

type ImportBody = {
  mode: "url" | "text" | "image";
  url?: string;
  text?: string;
  image_base64?: string;
  mime_type?: string;
  market_hint?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as ImportBody;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sourceMaterial = "";
    let sourceUrl = body.url || "";

    if (body.mode === "url") {
      if (!body.url || !/^https?:\/\//i.test(body.url)) {
        return new Response(JSON.stringify({ error: "Valid http(s) URL required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const pageRes = await fetch(body.url, {
        headers: { "User-Agent": "LadhaQuestImportBot/1.0" },
        redirect: "follow",
      });
      if (!pageRes.ok) {
        return new Response(JSON.stringify({ error: "Could not fetch URL", status: pageRes.status }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const html = await pageRes.text();
      sourceMaterial = html.slice(0, 120_000);
      sourceUrl = body.url;
    } else if (body.mode === "text") {
      sourceMaterial = String(body.text || "").slice(0, 40_000);
      if (sourceMaterial.length < 20) {
        return new Response(JSON.stringify({ error: "Paste more recipe text" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (body.mode === "image") {
      if (!body.image_base64) {
        return new Response(JSON.stringify({ error: "image_base64 required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system =
      "You extract recipes for an Africa-first cooking app. Respond with valid JSON only — no markdown fences.";
    const schemaHint = `Return JSON: {"name":"","country":"","summary":"","ingredients":[""],"steps":[""],"prep_time":0,"cook_time":0,"servings":4,"difficulty":"easy|medium|hard","source_attribution":"","cultural_notes":""}. Prefer African country when cuisine is African. Preserve source attribution. Ingredients and steps as string arrays.`;

    const messages: Array<Record<string, unknown>> = [
      { role: "system", content: system },
    ];

    if (body.mode === "image") {
      const mime = body.mime_type || "image/jpeg";
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `${schemaHint}\nMarket hint: ${body.market_hint || "Africa"}. Extract the handwritten or photographed recipe.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mime};base64,${body.image_base64}`,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `${schemaHint}\nMarket hint: ${body.market_hint || "Africa"}\nSource URL: ${sourceUrl || "n/a"}\n\nCONTENT:\n${sourceMaterial.slice(0, 90_000)}`,
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI request failed", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let recipe: Record<string, unknown> = {};
    try {
      const cleaned = String(raw).replace(/```json\s*|\s*```/g, "").trim();
      recipe = JSON.parse(cleaned);
    } catch {
      recipe = {};
    }

    if (sourceUrl && !recipe.source_attribution) {
      recipe.source_attribution = `Imported from ${sourceUrl}`;
    }
    if (sourceUrl) recipe.source_url = sourceUrl;

    return new Response(JSON.stringify({ recipe, needs_human_review: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
