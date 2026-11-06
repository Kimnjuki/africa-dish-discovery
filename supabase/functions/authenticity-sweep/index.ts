// One-shot admin function: AI-enriches recipes lacking authentic ingredients,
// steps, cultural history, or nutrition. Uses Lovable AI gateway (Gemini).
// Invoke with { batch: 20, mode: "empty" | "thin" | "history" }.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a culinary anthropologist and professional recipe developer specializing in authentic African cuisine.
Given a dish name, country, and short summary, produce a rigorously AUTHENTIC recipe. Do not invent fusion versions.
Return STRICT JSON matching this schema (no prose, no code fences):
{
  "ingredients": [ { "item": string, "quantity": string, "unit": string, "notes": string } ],  // 6-14 items with real measurements for the given servings
  "steps": [ string ],                                                                          // 6-12 clear numbered-style sentences, imperative voice, real technique
  "history": string,                                                                            // 120-260 words: origin region, cultural role, occasions, historical influences
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "calories": number,        // per serving
  "protein": number,         // grams per serving
  "carbs": number,           // grams per serving
  "fats": number,            // grams per serving
  "heat_level": number,      // 0-5
  "dietary_tags": string[],  // subset of ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","pescatarian","nut-free"]
  "occasion_tags": string[], // e.g. ["everyday","celebration","ramadan","funeral","harvest","street food","breakfast","holiday"]
  "allergen_tags": string[]  // e.g. ["peanut","dairy","gluten","shellfish","egg","sesame"]
}
Rules:
- Use ingredients and techniques authentic to the SPECIFIED COUNTRY, not a generic pan-African version.
- Prefer indigenous names in parentheses when useful.
- Never output placeholder text. Never output null. Numbers must be numeric.`;

function replaceControlChars(value: string): string {
  let cleaned = "";
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    const isControl =
      code <= 0x08 || code === 0x0b || code === 0x0c || (code >= 0x0e && code <= 0x1f);
    cleaned += isControl ? " " : value[index];
  }
  return cleaned;
}

interface RecipeUpdate {
  is_verified_authentic: boolean;
  updated_at: string;
  ingredients?: unknown;
  steps?: unknown;
  history?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: unknown;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  heat_level?: number;
  dietary_tags?: unknown;
  occasion_tags?: unknown;
  allergen_tags?: unknown;
}

async function callAI(apiKey: string, name: string, country: string, summary: string) {
  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Dish: ${name}\nCountry: ${country}\nSummary: ${summary || "(none)"}\nReturn the JSON only.` },
    ],
    response_format: { type: "json_object" },
  };
  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = 2000 * (attempt + 1) + Math.random() * 1500;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    let raw = data.choices?.[0]?.message?.content ?? "{}";
    raw = raw.replace(/```json\n?|\n?```/g, "").trim();
    // Strip unescaped control characters that break JSON.parse.
    raw = replaceControlChars(raw);
    try { return JSON.parse(raw); } catch (e) { lastErr = e; throw e; }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error("AI retry exhausted");
}

// Simple concurrency limiter — avoids hitting free-tier rate limits.
async function mapWithLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { batch = 15, mode = "empty" } = await req.json().catch(() => ({}));
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    // Pull the full recipe set and filter client-side (jsonb_array_length
    // isn't expressible in Supabase JS filters). 1500 rows is safe.
    const { data: rows, error } = await supabase
      .from("recipes")
      .select("id,name,country,summary,ingredients,steps,history,is_verified_authentic")
      .range(0, 1600);
    if (error) throw error;

    const toProcess = (rows || []).filter((r) => {
      const iLen = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
      const sLen = Array.isArray(r.steps) ? r.steps.length : 0;
      const hLen = (r.history || "").length;
      if (mode === "empty") return iLen === 0 || sLen === 0;
      if (mode === "thin") return iLen < 4 || sLen < 3;
      if (mode === "history") return hLen < 120;
      return false;
    }).slice(0, batch);

    // Process with limited concurrency to stay under free-tier rate limits.
    const results = await mapWithLimit(toProcess, 3, async (r) => {
      try {
        const ai = await callAI(apiKey, r.name, r.country, r.summary || "");
        const update: RecipeUpdate = { is_verified_authentic: true, updated_at: new Date().toISOString() };
        const iLen = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
        const sLen = Array.isArray(r.steps) ? r.steps.length : 0;
        const hLen = (r.history || "").length;
        if (iLen < 4 && Array.isArray(ai.ingredients)) update.ingredients = ai.ingredients;
        if (sLen < 3 && Array.isArray(ai.steps)) update.steps = ai.steps;
        if (hLen < 120 && typeof ai.history === "string") update.history = ai.history;
        if (typeof ai.prep_time_minutes === "number") update.prep_time_minutes = ai.prep_time_minutes;
        if (typeof ai.cook_time_minutes === "number") update.cook_time_minutes = ai.cook_time_minutes;
        if (typeof ai.servings === "number") update.servings = ai.servings;
        if (ai.difficulty) update.difficulty = ai.difficulty;
        if (typeof ai.calories === "number") update.calories = ai.calories;
        if (typeof ai.protein === "number") update.protein = ai.protein;
        if (typeof ai.carbs === "number") update.carbs = ai.carbs;
        if (typeof ai.fats === "number") update.fats = ai.fats;
        if (typeof ai.heat_level === "number") update.heat_level = ai.heat_level;
        if (Array.isArray(ai.dietary_tags)) update.dietary_tags = ai.dietary_tags;
        if (Array.isArray(ai.occasion_tags)) update.occasion_tags = ai.occasion_tags;
        if (Array.isArray(ai.allergen_tags)) update.allergen_tags = ai.allergen_tags;
        const { error: upErr } = await supabase.from("recipes").update(update).eq("id", r.id);
        if (upErr) throw upErr;
        return { id: r.id, name: r.name, country: r.country, status: "ok" };
      } catch (e) {
        return { id: r.id, name: r.name, status: "error", error: (e as Error).message };
      }
    });

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
