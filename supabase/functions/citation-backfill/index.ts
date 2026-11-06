// Backfills REAL, verified source citations onto cultural text that was written
// before citations existed. Uses no AI: every citation is resolved against the
// live Wikipedia API, so a URL is only written if the article actually exists.
//
// Invoke with { batch: 40, mode: "dish" | "recipe" | "story", dryRun?: true }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Source = { title: string; publisher: string; url: string };

interface WikiSearchHit {
  title?: string;
}

const WIKI = "https://en.wikipedia.org/w/api.php";
const cache = new Map<string, Source | null>();

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

/** Resolve a query to a real Wikipedia article, or null. Title must overlap the query. */
async function wiki(query: string, requireOverlap = true): Promise<Source | null> {
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  let result: Source | null = null;
  for (let attempt = 0; attempt < 4 && !result; attempt++) {
  if (attempt) await new Promise((r) => setTimeout(r, 700 * attempt + Math.random() * 500));
  try {
    const url = `${WIKI}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`;
    const res = await fetch(url, { headers: { "User-Agent": "TasteAfrica/1.0 (citation-backfill)" } });
    if (res.ok) {
      const data = await res.json();
      const hits: WikiSearchHit[] = data?.query?.search ?? [];
      const qTokens = norm(query);
      for (const h of hits) {
        const title = String(h?.title ?? "");
        if (!title) continue;
        const tTokens = norm(title);
        const overlap = qTokens.some((t) => t.length > 2 && tTokens.includes(t));
        if (requireOverlap && !overlap) continue;
        result = {
          title,
          publisher: "Wikipedia",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        };
        break;
      }
    }
  } catch {
    result = null;
  }
  }
  if (result) cache.set(key, result);
  return result;
}

/** Plain-text extract of a real Wikipedia article. */
async function extract(title: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 500 * attempt + Math.random() * 400));
    try {
      const url =
        `${WIKI}?action=query&prop=extracts&explaintext=1&redirects=1&format=json&origin=*&titles=` +
        encodeURIComponent(title);
      const res = await fetch(url, { headers: { "User-Agent": "TasteAfrica/1.0 (citation-backfill)" } });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages ?? {};
      for (const k of Object.keys(pages)) {
        const t = String(pages[k]?.extract ?? "");
        if (t) return t;
      }
    } catch {
      // retry
    }
  }
  return "";
}

/** First `n` clean sentences of an article body. */
function sentences(text: string, n: number): string[] {
  const clean = text.replace(/==+[^=]+==+/g, " ").replace(/\s+/g, " ").trim();
  return clean
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 40 && s.length < 400)
    .slice(0, n);
}

const DEMONYM: Record<string, string> = {
  "Nigeria": "Nigerian", "Ghana": "Ghanaian", "Kenya": "Kenyan", "Ethiopia": "Ethiopian",
  "Morocco": "Moroccan", "Egypt": "Egyptian", "Algeria": "Algerian", "Tunisia": "Tunisian",
  "Libya": "Libyan", "Senegal": "Senegalese", "Mali": "Malian", "Cameroon": "Cameroonian",
  "Tanzania": "Tanzanian", "Uganda": "Ugandan", "Rwanda": "Rwandan", "Burundi": "Burundian",
  "Somalia": "Somali", "Sudan": "Sudanese", "South Africa": "South African",
  "Zimbabwe": "Zimbabwean", "Zambia": "Zambian", "Botswana": "Botswana", "Namibia": "Namibian",
  "Mozambique": "Mozambican", "Angola": "Angolan", "Malawi": "Malawian", "Lesotho": "Lesotho",
  "Eswatini": "Eswatini", "Madagascar": "Malagasy", "Mauritius": "Mauritian",
  "Ivory Coast": "Ivorian", "Côte d'Ivoire": "Ivorian", "Benin": "Beninese", "Togo": "Togolese",
  "Guinea": "Guinean", "Liberia": "Liberian", "Sierra Leone": "Sierra Leonean",
  "Gambia": "Gambian", "The Gambia": "Gambian", "Niger": "Niger", "Chad": "Chadian",
  "Burkina Faso": "Burkina Faso", "Mauritania": "Mauritanian", "Eritrea": "Eritrean",
  "Djibouti": "Djiboutian", "Gabon": "Gabonese", "Congo": "Congolese",
  "Republic of the Congo": "Republic of the Congo", "Democratic Republic of the Congo": "Democratic Republic of the Congo",
  "Central African Republic": "Central African Republic", "Seychelles": "Seychellois",
  "Cape Verde": "Cape Verdean", "Comoros": "Comorian", "Equatorial Guinea": "Equatorial Guinean",
  "Guinea-Bissau": "Guinea-Bissau", "South Sudan": "South Sudanese",
  "São Tomé and Príncipe": "São Toméan",
};

async function citationsFor(name: string, country: string): Promise<Source[]> {
  const out: Source[] = [];
  const seen = new Set<string>();
  const push = (s: Source | null) => {
    if (s && !seen.has(s.url)) {
      seen.add(s.url);
      out.push(s);
    }
  };

  const head = name.split(/[(/,]/)[0].trim();
  push(await wiki(head));
  if (out.length === 0) push(await wiki(`${head} ${country} food`));

  if (country) {
    const dem = DEMONYM[country] ?? country;
    push(await wiki(`${dem} cuisine`, false));
    if (out.length < 2) push(await wiki(`Cuisine of ${country}`, false));
  }
  return out.slice(0, 3);
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
    const { batch = 40, mode = "dish", dryRun = false, offset = 0 } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    type Target = { id: string; name: string; country: string };
    let targets: Target[] = [];

    // ---- history mode: compose sourced history prose for recipes with thin/no history ----
    if (mode === "history") {
      const { data, error } = await supabase
        .from("recipes")
        .select("id,name,country,history")
        .eq("continent", "Africa")
        .limit(2000);
      if (error) throw error;
      const thin = (data || [])
        .filter((r) => (r.history || "").length < 150 && r.country)
        .slice(0, batch);

      const results = await mapWithLimit(thin, 1, async (r) => {
        try {
          const head = String(r.name).split(/[(/,]/)[0].trim();
          const tokens = norm(head).filter((t) => t.length > 3);
          const parts: string[] = [];
          const sources: Source[] = [];
          const seen = new Set<string>();
          const push = (s: Source | null) => {
            if (s && !seen.has(s.url)) {
              seen.add(s.url);
              sources.push(s);
              return true;
            }
            return false;
          };

          // 1. The dish's own article, only when the title genuinely matches the dish name.
          const dishHit = await wiki(head);
          if (dishHit && tokens.some((t) => norm(dishHit.title).includes(t))) {
            const s = sentences(await extract(dishHit.title), 4);
            if (s.length && push(dishHit)) parts.push(s.join(" "));
          }

          // 2. The national cuisine article for wider context.
          const dem = DEMONYM[r.country] ?? r.country;
          const cuisineHit =
            (await wiki(`${dem} cuisine`, false)) ?? (await wiki(`Cuisine of ${r.country}`, false));
          if (cuisineHit && /cuisine/i.test(cuisineHit.title)) {
            const s = sentences(await extract(cuisineHit.title), 4);
            if (s.length && push(cuisineHit)) {
              parts.push(`Within the wider food culture of ${r.country}: ${s.join(" ")}`);
            }
          }

          const base = String(r.history || "").trim();
          const history = `${base ? base + " " : ""}${parts.join(" ")}`.replace(/\s+/g, " ").trim();
          if (history.length < 200 || sources.length === 0) {
            return { id: r.id, name: r.name, status: "skipped", reason: "no verifiable article found" };
          }
          if (dryRun) {
            return { id: r.id, name: r.name, status: "dry-run", chars: history.length, sources };
          }
          const { error: upErr } = await supabase
            .from("recipes")
            .update({
              history: history.slice(0, 2600),
              history_sources: sources,
              updated_at: new Date().toISOString(),
            })
            .eq("id", r.id);
          if (upErr) throw upErr;
          return { id: r.id, name: r.name, status: "ok", chars: history.length, sources: sources.length };
        } catch (e) {
          return { id: r.id, name: r.name, status: "error", error: (e as Error).message };
        }
      });

      return new Response(
        JSON.stringify({
          mode,
          processed: results.length,
          ok: results.filter((x) => x.status === "ok").length,
          skipped: results.filter((x) => x.status === "skipped").length,
          errors: results.filter((x) => x.status === "error").length,
          results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- image mode: attach a real, freely-licensed Wikipedia/Commons photo ----
    if (mode === "image") {
      const { data, error } = await supabase
        .from("recipes")
        .select("id,name,country,image_url,history_sources")
        .eq("continent", "Africa")
        .limit(5000);
      if (error) throw error;

      const used = new Set(
        (data || []).map((r) => r.image_url).filter((u): u is string => !!u),
      );
      const missing = (data || []).filter((r) => !r.image_url && r.country).slice(offset, offset + batch);

      const results = await mapWithLimit(missing, 2, async (r) => {
        try {
          const head = String(r.name).split(/[(/,]/)[0].trim();
          const tokens = norm(head).filter((t) => t.length > 3);
          const hit = await wiki(head);
          if (!hit || !tokens.some((t) => norm(hit.title).includes(t))) {
            return { id: r.id, name: r.name, status: "skipped", reason: "no matching article" };
          }
          const url =
            `${WIKI}?action=query&prop=pageimages&piprop=original&redirects=1&format=json&origin=*&titles=` +
            encodeURIComponent(hit.title);
          const res = await fetch(url, { headers: { "User-Agent": "TasteAfrica/1.0 (image-backfill)" } });
          if (!res.ok) return { id: r.id, name: r.name, status: "skipped", reason: `wiki ${res.status}` };
          const json = await res.json();
          const pages = json?.query?.pages ?? {};
          let img = "";
          for (const k of Object.keys(pages)) {
            const candidate = String(pages[k]?.original?.source ?? "");
            if (candidate) img = candidate;
          }
          if (!img) return { id: r.id, name: r.name, status: "skipped", reason: "article has no image" };
          if (used.has(img)) return { id: r.id, name: r.name, status: "skipped", reason: "image already used" };
          used.add(img);
          if (dryRun) return { id: r.id, name: r.name, status: "dry-run", image: img };

          const patch: Record<string, unknown> = { image_url: img, updated_at: new Date().toISOString() };
          if (!Array.isArray(r.history_sources) || r.history_sources.length === 0) {
            patch.history_sources = [hit];
          }
          const { error: upErr } = await supabase.from("recipes").update(patch).eq("id", r.id);
          if (upErr) throw upErr;
          return { id: r.id, name: r.name, status: "ok", image: img };
        } catch (e) {
          return { id: r.id, name: r.name, status: "error", error: (e as Error).message };
        }
      });

      return new Response(
        JSON.stringify({
          mode,
          remaining: (data || []).filter((r) => !r.image_url).length,
          processed: results.length,
          ok: results.filter((x) => x.status === "ok").length,
          skipped: results.filter((x) => x.status === "skipped").length,
          errors: results.filter((x) => x.status === "error").length,
          results: results.slice(0, 15),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "dish") {
      const { data, error } = await supabase
        .from("dishes")
        .select("id,name,country,cultural_significance,cultural_sources")
        .eq("continent", "Africa")
        .limit(2000);
      if (error) throw error;
      targets = (data || [])
        .filter(
          (d) =>
            (d.cultural_significance || "").length >= 150 &&
            (!Array.isArray(d.cultural_sources) || d.cultural_sources.length === 0) &&
            d.country,
        )
        .slice(0, batch)
        .map((d) => ({ id: d.id, name: d.name, country: d.country }));
    } else if (mode === "recipe") {
      const { data, error } = await supabase
        .from("recipes")
        .select("id,name,country,history,history_sources")
        .eq("continent", "Africa")
        .limit(2000);
      if (error) throw error;
      targets = (data || [])
        .filter(
          (r) =>
            (r.history || "").length >= 150 &&
            (!Array.isArray(r.history_sources) || r.history_sources.length === 0) &&
            r.country,
        )
        .slice(0, batch)
        .map((r) => ({ id: r.id, name: r.name, country: r.country }));
    } else if (mode === "story") {
      const { data, error } = await supabase
        .from("cultural_stories")
        .select("id,title,sources,recipe_id,recipes(name,country)")
        .limit(2000);
      if (error) throw error;
      targets = (data || [])
        .filter((s) => !Array.isArray(s.sources) || s.sources.length === 0)
        .slice(0, batch)
        .map((s) => ({
          id: s.id,
          name: s.recipes?.name || s.title,
          country: s.recipes?.country || "",
        }));
    } else {
      throw new Error(`unknown mode "${mode}"`);
    }

    const results = await mapWithLimit(targets, 5, async (t) => {
      try {
        const sources = await citationsFor(t.name, t.country);
        if (sources.length < 1) {
          return { id: t.id, name: t.name, status: "skipped", reason: "no verifiable article found" };
        }
        if (dryRun) return { id: t.id, name: t.name, status: "dry-run", sources };

        const table = mode === "dish" ? "dishes" : mode === "recipe" ? "recipes" : "cultural_stories";
        const col = mode === "dish" ? "cultural_sources" : mode === "recipe" ? "history_sources" : "sources";
        const { error } = await supabase.from(table).update({ [col]: sources }).eq("id", t.id);
        if (error) throw error;
        return { id: t.id, name: t.name, status: "ok", sources: sources.length };
      } catch (e) {
        return { id: t.id, name: t.name, status: "error", error: (e as Error).message };
      }
    });

    return new Response(
      JSON.stringify({
        mode,
        processed: results.length,
        ok: results.filter((r) => r.status === "ok").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        errors: results.filter((r) => r.status === "error").length,
        results: results.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
