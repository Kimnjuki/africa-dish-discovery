/**
 * Recipe import helpers: parse pasted/JSON-LD text, adapt ingredients locally.
 */

import { lookupRankedSubstitutions, stripIngredientNoise } from "./substitutionGraph.ts";
import {
  getIngredientMarketInfo,
  resolveMarketId,
  type MarketId,
} from "./localMarket.ts";

export type ImportedRecipeDraft = {
  name: string;
  country: string;
  summary: string;
  ingredients: string[];
  steps: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cultural_notes: string;
  source_url?: string;
  source_attribution: string;
  import_method: "url" | "photo" | "voice" | "paste" | "manual";
  local_adaptations: LocalAdaptation[];
};

export type LocalAdaptation = {
  original: string;
  suggestion: string;
  reason: string;
  availability: number;
};

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          if (typeof o.text === "string") return o.text.trim();
          if (typeof o.name === "string") {
            const qty = o.quantity ?? o.amount;
            const unit = o.unit;
            return [qty, unit, o.name].filter(Boolean).join(" ").trim();
          }
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|•|\r/)
      .map((l) => l.replace(/^\d+[).\s]+/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function parseDurationMinutes(raw: unknown): number {
  if (typeof raw === "number" && isFinite(raw)) return Math.round(raw);
  if (typeof raw !== "string") return 0;
  const s = raw.trim();
  const iso = s.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (iso) {
    return (parseInt(iso[1] || "0", 10) * 60) + parseInt(iso[2] || "0", 10);
  }
  const mins = s.match(/(\d+)\s*(min|minute)/i);
  if (mins) return parseInt(mins[1], 10);
  const hours = s.match(/(\d+)\s*(h|hr|hour)/i);
  if (hours) return parseInt(hours[1], 10) * 60;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Extract Recipe JSON-LD objects from HTML or raw JSON. */
export function extractJsonLdRecipes(htmlOrJson: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const trimmed = htmlOrJson.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      collectRecipes(parsed, out);
      return out;
    } catch {
      /* fall through to HTML scrape */
    }
  }

  const scriptRe =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(htmlOrJson))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      collectRecipes(parsed, out);
    } catch {
      /* ignore bad blocks */
    }
  }
  return out;
}

function collectRecipes(node: unknown, out: Record<string, unknown>[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n) => collectRecipes(n, out));
    return;
  }
  if (typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type.map(String) : [String(type || "")];
  if (types.some((t) => /recipe/i.test(t))) {
    out.push(obj);
  }
  if (obj["@graph"]) collectRecipes(obj["@graph"], out);
}

export function draftFromJsonLd(
  recipe: Record<string, unknown>,
  meta?: { sourceUrl?: string; marketId?: MarketId }
): ImportedRecipeDraft {
  const name = String(recipe.name || "Imported recipe").trim();
  const ingredients = asStringArray(recipe.recipeIngredient || recipe.ingredients);
  const instructions = recipe.recipeInstructions || recipe.steps || recipe.instructions;
  let steps = asStringArray(instructions);
  if (!steps.length && Array.isArray(instructions)) {
    steps = asStringArray(instructions);
  }
  const cuisine = String(
    recipe.recipeCuisine || recipe.cuisine || recipe.country || ""
  ).trim();
  const draft: ImportedRecipeDraft = {
    name,
    country: cuisine || "Africa",
    summary: String(recipe.description || recipe.summary || "").trim() ||
      `Imported recipe: ${name}`,
    ingredients,
    steps,
    prep_time: parseDurationMinutes(recipe.prepTime || recipe.prep_time),
    cook_time: parseDurationMinutes(recipe.cookTime || recipe.cook_time || recipe.totalTime),
    servings: Number(recipe.recipeYield || recipe.yield || recipe.servings) || 4,
    difficulty: "medium",
    cultural_notes: "",
    source_url: meta?.sourceUrl,
    source_attribution: meta?.sourceUrl
      ? `Imported from ${meta.sourceUrl}`
      : "Imported recipe — attribution required",
    import_method: meta?.sourceUrl ? "url" : "paste",
    local_adaptations: [],
  };
  return adaptDraftForMarket(draft, meta?.marketId || resolveMarketId(cuisine));
}

/** Heuristic parse for pasted family notes / voice transcripts. */
export function draftFromPlainText(
  text: string,
  meta?: { method?: ImportedRecipeDraft["import_method"]; marketId?: MarketId; source?: string }
): ImportedRecipeDraft {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const name = lines[0]?.replace(/^#\s*/, "").slice(0, 120) || "Family recipe";

  const ingIdx = lines.findIndex((l) => /ingredient/i.test(l));
  const stepIdx = lines.findIndex((l) => /instruction|method|step|direction/i.test(l));

  let ingredients: string[] = [];
  let steps: string[] = [];

  if (ingIdx >= 0 && stepIdx > ingIdx) {
    ingredients = lines.slice(ingIdx + 1, stepIdx).map((l) => l.replace(/^[-•*\d.)\s]+/, ""));
    steps = lines.slice(stepIdx + 1).map((l) => l.replace(/^[-•*\d.)\s]+/, ""));
  } else {
    // Split roughly: lines with qty-like tokens → ingredients
    for (const line of lines.slice(1)) {
      if (/^\d/.test(line) || /\b(cup|tbsp|tsp|g|kg|ml|bunch|clove)\b/i.test(line)) {
        ingredients.push(line.replace(/^[-•*]\s*/, ""));
      } else if (line.length > 20) {
        steps.push(line.replace(/^[-•*\d.)\s]+/, ""));
      }
    }
  }

  if (!ingredients.length && !steps.length) {
    steps = lines.slice(1);
  }

  const draft: ImportedRecipeDraft = {
    name,
    country: "Africa",
    summary: `Family/imported recipe captured via ${meta?.method || "paste"}.`,
    ingredients,
    steps: steps.length ? steps : ["Follow family method as described."],
    prep_time: 20,
    cook_time: 40,
    servings: 4,
    difficulty: "medium",
    cultural_notes: meta?.source || "",
    source_attribution: meta?.source || "Family / oral tradition — preserve attribution",
    import_method: meta?.method || "paste",
    local_adaptations: [],
  };
  return adaptDraftForMarket(draft, meta?.marketId);
}

export function adaptDraftForMarket(
  draft: ImportedRecipeDraft,
  marketId?: MarketId
): ImportedRecipeDraft {
  const mid = marketId || resolveMarketId(draft.country);
  const adaptations: LocalAdaptation[] = [];

  for (const line of draft.ingredients) {
    const cleaned = stripIngredientNoise(line);
    const info = getIngredientMarketInfo(cleaned, { marketId: mid });
    if (info.availability < 45) {
      const hit = lookupRankedSubstitutions(cleaned, {
        marketId: mid,
        preferCheap: true,
        limit: 1,
      })[0];
      if (hit) {
        adaptations.push({
          original: cleaned || line,
          suggestion: hit.name,
          reason: hit.cookHint || hit.notes || "More available locally",
          availability: hit.market.availability,
        });
      }
    }
  }

  return {
    ...draft,
    local_adaptations: adaptations.slice(0, 12),
    cultural_notes: [
      draft.cultural_notes,
      adaptations.length
        ? `Local adaptation notes (${mid}): ${adaptations
            .slice(0, 3)
            .map((a) => `${a.original}→${a.suggestion}`)
            .join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function draftToFormFields(draft: ImportedRecipeDraft) {
  return {
    name: draft.name,
    country: draft.country,
    summary: draft.summary.slice(0, 1000),
    ingredients: draft.ingredients.join("\n"),
    steps: draft.steps.join("\n"),
    prep_time: String(draft.prep_time || 20),
    cook_time: String(draft.cook_time || 30),
    servings: String(draft.servings || 4),
    difficulty: draft.difficulty,
    cultural_notes: [draft.source_attribution, draft.cultural_notes]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 2000),
  };
}
