/**
 * One-shot / repeatable admin backfill:
 * recipes.ingredients JSON → recipe_ingredients join rows.
 *
 * Auth: Authorization Bearer must equal BACKFILL_SECRET or service role key.
 * Uses SUPABASE_SERVICE_ROLE_KEY for DB writes.
 *
 * POST JSON: { "dry_run"?: boolean, "limit"?: number }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-backfill-secret",
};

const SYNONYMS: Record<string, string> = {
  onion: "onion",
  onions: "onion",
  tomato: "tomato",
  tomatoes: "tomato",
  pepper: "black pepper",
  "black pepper": "black pepper",
  "bay leaf": "bay leaves",
  "bay leaves": "bay leaves",
  maggi: "maggi",
  "maggi cube": "maggi",
  "stock cube": "maggi",
  "warm water": "water",
  "hot water": "water",
  water: "water",
  saffron: "saffron",
  "ras el hanout": "ras el hanout",
  ugwu: "ugwu",
  ugu: "ugwu",
  "sukuma wiki": "sukuma wiki",
  sukuma: "sukuma wiki",
  egusi: "egusi",
  garlic: "garlic",
  ginger: "ginger",
  salt: "salt",
  sugar: "sugar",
  rice: "rice",
  chicken: "chicken",
  beef: "beef",
  oil: "vegetable oil",
  "palm oil": "palm oil",
  "olive oil": "olive oil",
  "vegetable oil": "vegetable oil",
  spinach: "spinach",
  kale: "kale",
  cream: "heavy cream",
};

function normalize(input: string): string {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripNoise(raw: string): string {
  let s = String(raw || "").trim();
  s = s.replace(/^[¼½¾⅓⅔⅛⅜⅝⅞]\s*/, "");
  s = s.replace(/^\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]\s*/, "");
  s = s.replace(/^\d+([./]\d+)?(\s*-\s*\d+([./]\d+)?)?\s*/, "");
  s = s.replace(
    /^(cups?|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|cloves?|pieces?|cans?|bunch(?:es)?|handfuls?|tins?|pinch(?:es)?|dash(?:es)?|slices?|stalks?|heads?|medium|large|small)\s+/i,
    "",
  );
  s = s.replace(/^\d+\s+/, "");
  s = s.replace(/\s*\(.*?\)\s*/g, " ");
  s = s.replace(
    /\s*(optional|to taste|or to taste|for serving|for frying|for boiling|drained|peeled|chopped|diced|sliced|minced|fresh|dried|ground|freshly ground|whole)\s*$/i,
    " ",
  );
  s = s.replace(/,.*$/, "");
  s = s.replace(/\s+or\s+.*$/i, "");
  s = s.replace(/^(warm|hot|cold|boiling)\s+/i, "");
  return s.trim();
}

function extractDisplay(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return String(o.item || o.name || o.text || o.ingredient || "").trim();
  }
  return String(raw);
}

type Ing = { id: string; name: string; slug: string | null; canonical_name: string | null };

function buildLookup(ingredients: Ing[], aliases: { ingredient_id: string; alias: string; alias_normalized: string }[]) {
  const exact = new Map<string, Ing>();
  const list: Array<Ing & { norm: string }> = [];

  for (const ing of ingredients) {
    const norm = normalize(ing.name);
    list.push({ ...ing, norm });
    for (const key of [ing.name, ing.canonical_name, ing.slug]) {
      const n = normalize(key || "");
      if (n && !exact.has(n)) exact.set(n, ing);
    }
    if (norm.endsWith("s") && norm.length > 4 && !exact.has(norm.slice(0, -1))) exact.set(norm.slice(0, -1), ing);
    if (!norm.endsWith("s") && !exact.has(norm + "s")) exact.set(norm + "s", ing);
  }
  for (const a of aliases) {
    const n = normalize(a.alias || a.alias_normalized);
    const ing = ingredients.find((i) => i.id === a.ingredient_id);
    if (n && ing && !exact.has(n)) exact.set(n, ing);
  }
  for (const [from, to] of Object.entries(SYNONYMS)) {
    const target = exact.get(normalize(to));
    if (target) exact.set(normalize(from), target);
  }
  list.sort((a, b) => b.norm.length - a.norm.length);
  return { exact, list };
}

function matchIngredient(display: string, lookup: ReturnType<typeof buildLookup>) {
  const candidates = [
    normalize(display),
    normalize(stripNoise(display)),
    normalize(SYNONYMS[normalize(display)] || ""),
    normalize(SYNONYMS[normalize(stripNoise(display))] || ""),
  ].filter(Boolean);

  for (const c of candidates) {
    const hit = lookup.exact.get(c);
    if (hit) return { ...hit, method: "exact" as const };
  }

  const stripped = normalize(stripNoise(display));
  if (stripped.length >= 3) {
    for (const ing of lookup.list) {
      if (stripped === ing.norm) return { ...ing, method: "exact-list" as const };
      if (ing.norm.length < 4) continue;
      const re = new RegExp(`(?:^|\\s)${ing.norm.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(?:\\s|$)`);
      if (re.test(stripped)) return { ...ing, method: "contains" as const };
    }
  }
  return null;
}

const STAPLES = [
  { name: "Black Pepper", slug: "black-pepper", category: "spice" },
  { name: "Bay Leaves", slug: "bay-leaves", category: "spice" },
  { name: "Saffron", slug: "saffron", category: "spice" },
  { name: "Maggi", slug: "maggi", category: "seasoning" },
  { name: "Water", slug: "water", category: "liquid" },
  { name: "Ras El Hanout", slug: "ras-el-hanout", category: "spice" },
  { name: "Iru", slug: "iru", category: "seasoning" },
  { name: "Egusi", slug: "egusi", category: "seed" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const backfillSecret = Deno.env.get("BACKFILL_SECRET") || serviceKey;
    if (!serviceKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: "Missing service role env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-backfill-secret") ||
      "";
    if (!auth || auth !== backfillSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const dryRun = Boolean(body?.dry_run);
    const limit = typeof body?.limit === "number" ? body.limit : 0;

    const sb = createClient(supabaseUrl, serviceKey);

    // Ensure staples exist
    for (const s of STAPLES) {
      const { data: existing } = await sb.from("ingredients").select("id").eq("slug", s.slug).maybeSingle();
      if (!existing) {
        await sb.from("ingredients").upsert(
          {
            name: s.name,
            slug: s.slug,
            canonical_name: s.name,
            category: s.category,
            review_status: "approved",
            source: "ladhaquest-staple-backfill-v1",
          },
          { onConflict: "name" },
        );
      }
    }

    const { data: ingredients, error: ingErr } = await sb
      .from("ingredients")
      .select("id,name,slug,canonical_name");
    if (ingErr) throw ingErr;

    const { data: aliases, error: aliasErr } = await sb
      .from("ingredient_aliases")
      .select("ingredient_id,alias,alias_normalized");
    if (aliasErr) throw aliasErr;

    let recipeQuery = sb.from("recipes").select("id,slug,ingredients").order("slug");
    if (limit > 0) recipeQuery = recipeQuery.limit(limit);
    const { data: recipes, error: recErr } = await recipeQuery;
    if (recErr) throw recErr;

    const lookup = buildLookup(ingredients || [], aliases || []);
    const rows: Record<string, unknown>[] = [];
    let lineTotal = 0;
    let matched = 0;
    const methodCounts: Record<string, number> = {};
    const unmatched = new Map<string, number>();

    for (const recipe of recipes || []) {
      const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const seen = new Set<string>();
      let sort = 0;
      for (const raw of ings) {
        lineTotal++;
        sort++;
        const display = extractDisplay(raw);
        if (!display) continue;
        const hit = matchIngredient(display, lookup);
        if (!hit) {
          unmatched.set(display, (unmatched.get(display) || 0) + 1);
          continue;
        }
        if (seen.has(hit.id)) continue;
        seen.add(hit.id);
        matched++;
        methodCounts[hit.method] = (methodCounts[hit.method] || 0) + 1;
        const optional = /\boptional\b/i.test(display);
        rows.push({
          recipe_id: recipe.id,
          ingredient_id: hit.id,
          quantity: 1,
          unit: "piece",
          is_optional: optional,
          display_text: display.slice(0, 500),
          sort_order: sort,
          source: "json-backfill-v1",
          review_status: "approved",
        });
      }
    }

    let upserted = 0;
    if (!dryRun) {
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200);
        const { error } = await sb.from("recipe_ingredients").upsert(batch, {
          onConflict: "recipe_id,ingredient_id",
        });
        if (error) throw error;
        upserted += batch.length;
      }
    }

    const topUnmatched = [...unmatched.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([text, count]) => ({ text, count }));

    return new Response(
      JSON.stringify({
        dry_run: dryRun,
        recipes: (recipes || []).length,
        ingredient_lines: lineTotal,
        matched_lines: matched,
        join_rows: rows.length,
        match_rate: lineTotal ? matched / lineTotal : 0,
        upserted,
        method_counts: methodCounts,
        top_unmatched: topUnmatched,
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
