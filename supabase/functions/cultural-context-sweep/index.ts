// Batched cultural-context enrichment for African dishes & recipes.
// Fills recipes.history, dishes.cultural_significance / original_name_native /
// phonetic_spelling, and seeds cultural_stories + pronunciation_guides.
// Every AI result is validated before it is written — anything that fails the
// accuracy checks is skipped and reported, never written half-baked.
//
// Invoke with { batch: 8, mode: "dish" | "recipe" | "story", dryRun?: true }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

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

interface CulturalContext {
  history?: string;
  cultural_significance?: string;
  origin_story_title?: string;
  origin_story?: string;
  native_name?: string;
  native_language?: string;
  phonetic_spelling?: string;
  ethnic_group?: string;
  confidence?: string;
  sources?: unknown;
}

interface LooseSource {
  title?: unknown;
  publisher?: unknown;
  url?: unknown;
}

const SYSTEM = `You are a culinary anthropologist and food historian specialising in African foodways.
You write factual, source-grounded cultural context for a specific dish from a SPECIFIC country.

Hard rules:
- Only state things you are confident are true of THAT dish in THAT country. If a detail is contested, say so ("commonly attributed to...", "regional accounts differ").
- Name the real ethnic group(s), region(s), language(s), occasions and historical influences (trade routes, colonial contact, migration, religious calendars) where they genuinely apply.
- NEVER invent tribes, festivals, dates, people or citations. NEVER use placeholder text, markdown, or code fences.
- If the dish is shared across borders, explain the version belonging to the given country.
- Write in clear plain prose, no headings, no bullet points.
- Every claim must be traceable: cite 2-4 REAL references that genuinely document this dish (e.g. Wikipedia article, national cultural institute, published cookbook or academic paper, established food encyclopedia such as TasteAtlas, reputable news/food publication). Use canonical URLs you are confident exist (e.g. https://en.wikipedia.org/wiki/<Dish>). NEVER fabricate a URL, DOI, author or page number. If you cannot name at least two real references, set confidence to "low".

Return STRICT JSON only, matching:
{
  "history": string,                 // 160-280 words: origin, region, historical influences, how it evolved
  "cultural_significance": string,   // 90-160 words: social role, who cooks it, occasions, etiquette, meaning
  "origin_story_title": string,      // short evocative title, max 70 chars, mentions the dish or its home
  "origin_story": string,            // 120-200 words: narrative origin/tradition story, factual, no invented characters
  "native_name": string,             // dish name in its home language, or "" if genuinely unknown
  "native_language": string,         // language of native_name, or ""
  "phonetic_spelling": string,       // simple English-reader phonetics e.g. "joh-LOFF rice", or "" if unknown
  "ethnic_group": string,            // primary tribe/ethnic group associated, or "" if not attributable
  "occasions": string[],             // 2-6 real occasions e.g. ["everyday","weddings","Ramadan"]
  "confidence": "high" | "medium" | "low",  // your confidence this is accurate for this dish+country
  "sources": [                       // 2-4 REAL, verifiable references you are relying on
    { "title": string, "publisher": string, "url": string }
  ]
}`;

async function callAI(apiKey: string, name: string, country: string, region: string, summary: string): Promise<CulturalContext> {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content:
          `Dish: ${name}\nCountry: ${country}\nRegion: ${region || "(unspecified)"}\n` +
          `Known summary: ${summary || "(none)"}\n\n` +
          `Write the cultural context for this dish as prepared in ${country}. Return the JSON only.`,
      },
    ],
    response_format: { type: "json_object" },
  };
  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1) + Math.random() * 1200));
      continue;
    }
    if (res.status === 402) throw new Error("AI credits exhausted (402)");
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    let raw = data.choices?.[0]?.message?.content ?? "{}";
    raw = raw.replace(/```json\n?|\n?```/g, "").trim();
    raw = replaceControlChars(raw);
    try {
      return JSON.parse(raw) as CulturalContext;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("AI retry exhausted");
}

const BANNED = /lorem ipsum|placeholder|as an ai|i cannot|unknown dish|\[insert|todo|n\/a/i;

function words(s: unknown) {
  return typeof s === "string" ? s.trim().split(/\s+/).filter(Boolean).length : 0;
}

/** Accuracy gate: reject vague, generic or fabricated-looking output. */
function validate(ai: CulturalContext, name: string, country: string): string | null {
  if (!ai || typeof ai !== "object") return "not an object";
  if (ai.confidence === "low") return "model reported low confidence";
  if (words(ai.history) < 95) return `history too short (${words(ai.history)}w)`;
  if (words(ai.cultural_significance) < 60) return `significance too short (${words(ai.cultural_significance)}w)`;
  if (words(ai.origin_story) < 80) return `origin story too short (${words(ai.origin_story)}w)`;
  const blob = `${ai.history} ${ai.cultural_significance} ${ai.origin_story}`;
  if (BANNED.test(blob)) return "contains placeholder/refusal text";
  // Must actually be about this dish and this country, not generic pan-African filler.
  const head = name.split(/[(/,]/)[0].trim().toLowerCase();
  const token = head.split(/\s+/)[0];
  if (token.length > 2 && !blob.toLowerCase().includes(token)) return "does not mention the dish";
  const c = country.toLowerCase();
  const cToken = c.split(/\s+/).pop()!;
  if (!blob.toLowerCase().includes(cToken)) return `does not mention ${country}`;
  if (cleanSources(ai.sources).length < 2) return "fewer than 2 usable sources";
  return null;
}

type Source = { title: string; publisher: string; url: string };

/** Keep only citations that look real: absolute https URL, known-plausible host, real title. */
function cleanSources(raw: unknown): Source[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const source = s as LooseSource;
    const title = String(source.title ?? "").trim();
    const publisher = String(source.publisher ?? "").trim();
    let url = String(source.url ?? "").trim();
    if (!title || title.length < 4 || BANNED.test(title)) continue;
    if (!/^https?:\/\//i.test(url)) continue;
    let host = "";
    try {
      const u = new URL(url);
      host = u.hostname.toLowerCase();
      url = u.toString();
    } catch {
      continue;
    }
    if (host.startsWith("www.")) host = host.slice(4);
    if (!host.includes(".") || /example\.|localhost|test\.com/.test(host)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title: title.slice(0, 200), publisher: (publisher || host).slice(0, 120), url });
    if (out.length >= 4) break;
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function mapWithLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    for (;;) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { batch = 8, mode = "dish", dryRun = false } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    type Target = {
      kind: "dish" | "recipe";
      id: string;
      name: string;
      country: string;
      region: string;
      summary: string;
      recipeId?: string;
      dishId?: string;
    };
    let targets: Target[] = [];

    if (mode === "dish") {
      // African dishes with no / thin cultural_significance.
      const { data, error } = await supabase
        .from("dishes")
        .select("id,name,country,region,continent,summary,cultural_significance")
        .eq("continent", "Africa")
        .order("name")
        .limit(1500);
      if (error) throw error;
      targets = shuffle(
        (data || []).filter((d) => (d.cultural_significance || "").length < 150 && d.country),
      )
        .slice(0, batch)

        .map((d) => ({
          kind: "dish" as const,
          id: d.id,
          name: d.name,
          country: d.country,
          region: d.region || "",
          summary: d.summary || "",
          dishId: d.id,
        }));
    } else if (mode === "recipe") {
      const { data, error } = await supabase
        .from("recipes")
        .select("id,name,country,continent,summary,history,dish_id")
        .eq("continent", "Africa")
        .order("name")
        .limit(1600);
      if (error) throw error;
      targets = shuffle(
        (data || []).filter((r) => (r.history || "").length < 150 && r.country),
      ).slice(0, batch)
        .map((r) => ({
          kind: "recipe" as const,
          id: r.id,
          name: r.name,
          country: r.country,
          region: "",
          summary: r.summary || "",
          recipeId: r.id,
          dishId: r.dish_id || undefined,
        }));
    } else if (mode === "story") {
      // Recipes with real history but no cultural story yet.
      const { data: existing } = await supabase.from("cultural_stories").select("recipe_id").limit(5000);
      const have = new Set((existing || []).map((s) => s.recipe_id));
      const { data, error } = await supabase
        .from("recipes")
        .select("id,name,country,continent,summary,history,dish_id")
        .eq("continent", "Africa")
        .order("name")
        .limit(1600);
      if (error) throw error;
      targets = shuffle(
        (data || []).filter(
          (r) => !have.has(r.id) && r.country && (r.history || "").length >= 150,
        ),
      ).slice(0, batch)
        .map((r) => ({
          kind: "recipe" as const,
          id: r.id,
          name: r.name,
          country: r.country,
          region: "",
          summary: r.summary || r.history || "",
          recipeId: r.id,
          dishId: r.dish_id || undefined,
        }));
    } else {
      throw new Error(`unknown mode "${mode}"`);
    }

    const results = await mapWithLimit(targets, 3, async (t) => {
      try {
        const ai = await callAI(apiKey, t.name, t.country, t.region, t.summary);
        const problem = validate(ai, t.name, t.country);
        if (problem) return { id: t.id, name: t.name, country: t.country, status: "rejected", reason: problem };
        if (dryRun) {
          return {
            id: t.id,
            name: t.name,
            country: t.country,
            status: "dry-run",
            preview: String(ai.history).slice(0, 160),
            sources: cleanSources(ai.sources),
          };
        }

        const sources = cleanSources(ai.sources);
        const wrote: string[] = [];

        if (t.kind === "dish") {
          const upd: Record<string, unknown> = {
            cultural_significance: ai.cultural_significance,
            cultural_sources: sources,
            updated_at: new Date().toISOString(),
          };
          if (ai.native_name) upd.original_name_native = ai.native_name;
          if (ai.phonetic_spelling) upd.phonetic_spelling = ai.phonetic_spelling;
          if (ai.ethnic_group) upd.primary_tribe_ethnicity = ai.ethnic_group;
          const { error } = await supabase.from("dishes").update(upd).eq("id", t.id);
          if (error) throw error;
          wrote.push("dish.cultural_significance");

          // Backfill history onto recipes of this dish that still lack it.
          const { data: recs } = await supabase
            .from("recipes")
            .select("id,history")
            .eq("dish_id", t.id);
          for (const r of recs || []) {
            if ((r.history || "").length < 150) {
              await supabase
                .from("recipes")
                .update({ history: ai.history, history_sources: sources })
                .eq("id", r.id);
              wrote.push("recipe.history");
            }
          }
        } else {
          const { error } = await supabase
            .from("recipes")
            .update({ history: ai.history, history_sources: sources, updated_at: new Date().toISOString() })
            .eq("id", t.id);
          if (error) throw error;
          wrote.push("recipe.history");

          if (t.dishId) {
            const { data: d } = await supabase
              .from("dishes")
              .select("id,cultural_significance")
              .eq("id", t.dishId)
              .maybeSingle();
            if (d && (d.cultural_significance || "").length < 150) {
              await supabase
                .from("dishes")
                .update({
                  cultural_significance: ai.cultural_significance,
                  cultural_sources: sources,
                  ...(ai.native_name ? { original_name_native: ai.native_name } : {}),
                  ...(ai.phonetic_spelling ? { phonetic_spelling: ai.phonetic_spelling } : {}),
                  ...(ai.ethnic_group ? { primary_tribe_ethnicity: ai.ethnic_group } : {}),
                })
                .eq("id", d.id);
              wrote.push("dish.cultural_significance");
            }
          }
        }

        // Cultural story — only for recipe-anchored targets, and only once.
        if (t.recipeId && ai.origin_story_title) {
          const { data: dup } = await supabase
            .from("cultural_stories")
            .select("id")
            .eq("recipe_id", t.recipeId)
            .limit(1);
          if (!dup || dup.length === 0) {
            const { error } = await supabase.from("cultural_stories").insert({
              recipe_id: t.recipeId,
              dish_id: t.dishId ?? null,
              story_type: "origin",
              title: String(ai.origin_story_title).slice(0, 120),
              content: ai.origin_story,
              author_role: "Culinary historian",
              sources,
              language: "en",
              is_verified: ai.confidence === "high",
            });
            if (!error) wrote.push("cultural_story");
          }
        }

        // Pronunciation guide.
        if (ai.phonetic_spelling && (t.recipeId || t.dishId)) {
          const key = t.recipeId ? "recipe_id" : "dish_id";
          const val = t.recipeId ?? t.dishId!;
          const { data: dup } = await supabase
            .from("pronunciation_guides")
            .select("id")
            .eq(key, val)
            .limit(1);
          if (!dup || dup.length === 0) {
            const { error } = await supabase.from("pronunciation_guides").insert({
              recipe_id: t.recipeId ?? null,
              dish_id: t.dishId ?? null,
              phonetic_spelling: ai.phonetic_spelling,
              language: ai.native_language || "en",
            });
            if (!error) wrote.push("pronunciation_guide");
          }
        }

        return {
          id: t.id,
          name: t.name,
          country: t.country,
          status: "ok",
          confidence: ai.confidence,
          sources: sources.length,
          wrote,
        };
      } catch (e) {
        return { id: t.id, name: t.name, country: t.country, status: "error", error: (e as Error).message };
      }
    });

    const summary = {
      mode,
      requested: batch,
      processed: results.length,
      ok: results.filter((r) => r.status === "ok").length,
      rejected: results.filter((r) => r.status === "rejected").length,
      errors: results.filter((r) => r.status === "error").length,
    };
    return new Response(JSON.stringify({ ...summary, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
