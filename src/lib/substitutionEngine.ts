/**
 * Substitution engine v0 — curated retrieval + hard filters + scoring.
 * AI never invents or ranks candidates. Optional LLM explain step is out of
 * scope for v0; callers get template reasons from the curated graph.
 */

import {
  conflictsWithAllergies,
  normalizeAlias,
  resolveAlias,
  satisfiesAllDiets,
  type AliasResolveResult,
} from "./aliasResolver.ts";
import {
  lookupSubstitutions,
  type SubstitutionSuggestion,
} from "./substitutionGraph.ts";
import {
  getIngredientMarketInfo,
  resolveMarketId,
  type DietTag,
  type MarketId,
} from "./localMarket.ts";

export type SubstitutionType = "direct" | "functional" | "flavor" | "texture" | "emergency";

export interface SubstitutionRequest {
  ingredient: string;
  ingredientId?: string;
  countryCode?: string;
  language?: string;
  recipeId?: string;
  servings?: number;
  requiredAmount?: number;
  unit?: string;
  dietTags?: string[];
  allergies?: string[];
  budget?: "budget" | "moderate" | "premium" | null;
  cookingMethod?: string;
  userPantry?: string[];
  marketId?: MarketId;
  limit?: number;
}

export interface SubstitutionCandidate {
  ingredient_id: string;
  slug: string;
  name: string;
  local_name: string | null;
  type: SubstitutionType;
  adjusted_amount: number;
  unit: string;
  score: number;
  confidence: "high" | "medium" | "low";
  flavor_impact: "low" | "medium" | "high";
  texture_impact: "low" | "medium" | "high";
  reason: string;
  cooking_adjustments: string[];
  warnings: string[];
  verified: boolean;
  availability: { score: number; known: boolean };
  dietary_tags: string[];
  allergens: string[];
}

export interface SubstitutionResponse {
  resolved_ingredient: {
    id: string | null;
    name: string;
    ambiguous: boolean;
    disambiguation_prompt?: string;
    matches?: AliasResolveResult["matches"];
  };
  substitutions: SubstitutionCandidate[];
  meta: {
    cached: boolean;
    llm_used: false;
    fallback: boolean;
    filtered_out: number;
    weights: ScoringWeights;
  };
}

export interface ScoringWeights {
  C: number;
  F: number;
  T: number;
  A: number;
  B: number;
  D: number;
  U: number;
}

/** Blueprint defaults — sum to 1.0 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  C: 0.3,
  F: 0.2,
  T: 0.15,
  A: 0.15,
  B: 0.1,
  D: 0.05,
  U: 0.05,
};

const UNKNOWN_AVAILABILITY = 0.3;

function authenticityToType(a: SubstitutionSuggestion["authenticity"]): SubstitutionType {
  if (a === "high") return "direct";
  if (a === "medium") return "functional";
  return "emergency";
}

function impactFromAuthenticity(a: SubstitutionSuggestion["authenticity"]): "low" | "medium" | "high" {
  if (a === "high") return "low";
  if (a === "medium") return "medium";
  return "high";
}

function confidenceBand(score: number): "high" | "medium" | "low" {
  if (score >= 0.85) return "high";
  if (score >= 0.65) return "medium";
  return "low";
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Hard filter: candidate must satisfy ALL required diets and must not conflict
 * with allergies. Missing availability does NOT exclude.
 */
export function passesHardFilters(
  candidate: {
    dietary_tags: string[];
    allergens: string[];
  },
  requiredDiets: string[],
  allergies: string[]
): boolean {
  if (!satisfiesAllDiets(requiredDiets, candidate.dietary_tags)) return false;
  if (conflictsWithAllergies(allergies, candidate.allergens)) return false;
  return true;
}

export function scoreCandidate(signals: {
  curatedConfidence: number;
  flavorSimilarity: number;
  textureSimilarity: number;
  availability: number | null;
  budgetFit: number;
  dietPreferenceFit: number;
  userPreference: number;
  weights?: ScoringWeights;
}): { score: number; availabilityKnown: boolean; availabilityScore: number } {
  const w = signals.weights ?? DEFAULT_WEIGHTS;
  const known = signals.availability != null;
  const A = known ? clamp01(signals.availability as number) : UNKNOWN_AVAILABILITY;
  const score =
    w.C * clamp01(signals.curatedConfidence) +
    w.F * clamp01(signals.flavorSimilarity) +
    w.T * clamp01(signals.textureSimilarity) +
    w.A * A +
    w.B * clamp01(signals.budgetFit) +
    w.D * clamp01(signals.dietPreferenceFit) +
    w.U * clamp01(signals.userPreference);
  return { score: Math.round(score * 1000) / 1000, availabilityKnown: known, availabilityScore: A };
}

function dietTagsForName(name: string): string[] {
  const info = getIngredientMarketInfo(name);
  return info.diet ?? [];
}

function allergensForName(name: string): string[] {
  const n = normalizeAlias(name);
  if (/(peanut|groundnut|arachide)/.test(n)) return ["peanut"];
  if (/(cashew|almond|walnut|hazelnut)/.test(n)) return ["tree_nut"];
  if (/(milk|butter|ghee|cheese|yogurt|evaporated|cream)/.test(n) && !/coconut|cashew|groundnut/.test(n)) {
    return ["dairy"];
  }
  if (/(wheat|flour|semolina|bread)/.test(n) && !/cassava|plantain|teff|sorghum|rice|yam|coconut/.test(n)) {
    return ["gluten"];
  }
  if (/egg/.test(n)) return ["egg"];
  if (/(shrimp|crayfish|prawn|fish|stockfish|cod)/.test(n)) return ["shellfish_or_fish"];
  return [];
}

function availabilityFor(name: string, marketId: MarketId): number | null {
  const info = getIngredientMarketInfo(name, { marketId });
  // localMarket defaults unknown ingredients to availability 50, empty diet, null price.
  const unknown =
    info.availability === 50 && info.unitPrice == null && (info.diet?.length ?? 0) === 0;
  if (unknown) return null;
  return clamp01(info.availability / 100);
}

/**
 * Rank curated substitutes for an ingredient. No LLM.
 */
export function findSubstitutions(req: SubstitutionRequest): SubstitutionResponse {
  const weights = DEFAULT_WEIGHTS;
  const resolved = resolveAlias(req.ingredient, {
    countryCode: req.countryCode,
    language: req.language,
  });

  if (resolved.ambiguous && resolved.matches.length > 1) {
    return {
      resolved_ingredient: {
        id: null,
        name: req.ingredient,
        ambiguous: true,
        disambiguation_prompt: resolved.disambiguationPrompt,
        matches: resolved.matches,
      },
      substitutions: [],
      meta: { cached: false, llm_used: false, fallback: false, filtered_out: 0, weights },
    };
  }

  const primary = resolved.matches[0];
  const lookupName = primary?.name || req.ingredient;
  const marketId = req.marketId || resolveMarketId(req.countryCode) || "default";
  const requiredDiets = (req.dietTags || []).map((d) => d.toLowerCase().replace(/-/g, "_"));
  const allergies = req.allergies || [];
  const pantry = new Set((req.userPantry || []).map(normalizeAlias));

  const graphHits = lookupSubstitutions(lookupName, {
    regionHint: req.countryCode,
    limit: 20,
  });

  let filteredOut = 0;
  const candidates: SubstitutionCandidate[] = [];

  for (const hit of graphHits) {
    const dietary_tags = hit.dietTags?.length ? hit.dietTags : dietTagsForName(hit.name);
    const allergens = allergensForName(hit.name);

    if (!passesHardFilters({ dietary_tags, allergens }, requiredDiets, allergies)) {
      filteredOut += 1;
      continue;
    }

    const avail = availabilityFor(hit.name, marketId as MarketId);
    const market = getIngredientMarketInfo(hit.name, { marketId: marketId as MarketId });
    let budgetFit = 0.7;
    if (req.budget === "budget") {
      budgetFit = market.tier === "budget" ? 1 : market.tier === "specialty" ? 0.2 : 0.5;
    } else if (req.budget === "premium") {
      budgetFit = 0.85;
    }

    const dietPreferenceFit =
      requiredDiets.length === 0
        ? 0.7
        : satisfiesAllDiets(requiredDiets, dietary_tags)
          ? 1
          : 0;

    const curatedConfidence = clamp01((hit.compatibilityScore ?? 70) / 100);
    const flavorSimilarity =
      hit.authenticity === "high" ? 0.9 : hit.authenticity === "medium" ? 0.7 : 0.45;
    const textureSimilarity = flavorSimilarity;

    const { score, availabilityKnown, availabilityScore } = scoreCandidate({
      curatedConfidence,
      flavorSimilarity,
      textureSimilarity,
      availability: avail,
      budgetFit,
      dietPreferenceFit,
      userPreference: pantry.has(normalizeAlias(hit.name)) ? 1 : 0.5,
      weights,
    });

    const warnings: string[] = [];
    if (!availabilityKnown) warnings.push("availability unverified");
    if (availabilityKnown && availabilityScore < 0.4) {
      warnings.push("often hard to find in this market");
    }
    if (allergens.length) warnings.push(`contains: ${allergens.join(", ")}`);
    if (score < 0.65) warnings.push("not an exact replacement — expect tradeoffs");

    const ratio = hit.ratio.startsWith("0") || hit.ratio.includes(":")
      ? parseFloat(hit.ratio) || 1
      : 1;
    const amount = (req.requiredAmount ?? 1) * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1);

    const subResolved = resolveAlias(hit.name);
    const subPrimary = subResolved.matches[0];

    candidates.push({
      ingredient_id: subPrimary?.ingredientId || `graph:${normalizeAlias(hit.name)}`,
      slug: subPrimary?.slug || normalizeAlias(hit.name).replace(/\s+/g, "-"),
      name: hit.name,
      local_name: hit.regions?.[0] ? hit.name : null,
      type: authenticityToType(hit.authenticity),
      adjusted_amount: Math.round(amount * 100) / 100,
      unit: req.unit || "portion",
      score,
      confidence: confidenceBand(score),
      flavor_impact: impactFromAuthenticity(hit.authenticity),
      texture_impact: impactFromAuthenticity(hit.authenticity),
      reason: hit.reason || hit.notes,
      cooking_adjustments: [
        hit.cookAdjustment?.prompt,
        hit.cookAdjustment?.liquidNote,
        hit.cookAdjustment?.timeDeltaMin != null
          ? `Adjust cook time by ${hit.cookAdjustment.timeDeltaMin} min`
          : null,
      ].filter(Boolean) as string[],
      warnings,
      verified: true,
      availability: { score: availabilityScore, known: availabilityKnown },
      dietary_tags,
      allergens,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const limit = req.limit ?? 6;

  return {
    resolved_ingredient: {
      id: primary?.ingredientId ?? null,
      name: primary?.name || req.ingredient,
      ambiguous: false,
    },
    substitutions: candidates.slice(0, limit),
    meta: {
      cached: false,
      llm_used: false,
      fallback: candidates.length === 0 && graphHits.length === 0,
      filtered_out: filteredOut,
      weights,
    },
  };
}

/** Convenience for vegan coconut-milk case in the blueprint corrections. */
export function safeCoconutMilkSubstitutes(dietTags: string[]): string[] {
  const res = findSubstitutions({
    ingredient: "coconut milk",
    dietTags,
    allergies: dietTags.includes("vegan") || dietTags.includes("dairy_free") ? ["dairy"] : [],
  });
  return res.substitutions.map((s) => s.name);
}
