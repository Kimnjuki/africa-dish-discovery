import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { stripIngredientNoise } from "@/lib/substitutionGraph";
import {
  getDietPreferences,
  getMarketPreference,
  resolveMarketId,
  type MarketId,
} from "@/lib/localMarket";
import {
  findSubstitutions,
  type SubstitutionCandidate,
} from "@/lib/substitutionEngine";
import { track, EVENTS } from "@/lib/analytics";

interface Suggestion {
  name: string;
  ratio: string;
  notes: string;
  authenticity: "high" | "medium" | "low";
  regions?: string[];
  source?: "engine" | "db";
  priceLabel?: string;
  availability?: number;
  cookPrompt?: string;
  warnings?: string[];
  confidence?: string;
  verified?: boolean;
}

interface Props {
  ingredient: string;
  country?: string;
  region?: string;
  dishName?: string;
  marketId?: MarketId;
  dietTags?: string[];
  allergies?: string[];
  onSelect?: (substituteName: string) => void;
}

const authColor: Record<string, string> = {
  high: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

function confidenceToAuth(c: SubstitutionCandidate["confidence"]): Suggestion["authenticity"] {
  if (c === "high") return "high";
  if (c === "medium") return "medium";
  return "low";
}

function fromEngine(hits: SubstitutionCandidate[], marketId: MarketId): Suggestion[] {
  return hits.map((s) => ({
    name: s.name,
    ratio: `${s.adjusted_amount}:1`,
    notes: s.reason,
    authenticity: confidenceToAuth(s.confidence),
    source: "engine" as const,
    priceLabel:
      s.availability.known
        ? undefined
        : undefined,
    availability: Math.round(s.availability.score * 100),
    cookPrompt: s.cooking_adjustments[0],
    warnings: s.warnings,
    confidence: s.confidence,
    verified: s.verified,
    // keep marketId referenced for future price wiring
    ...(marketId ? {} : {}),
  }));
}

export const IngredientSubstitutionPopover = ({
  ingredient,
  country,
  region,
  dishName,
  marketId: marketProp,
  dietTags,
  allergies,
  onSelect,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [disambiguation, setDisambiguation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = async () => {
    if (suggestions.length || loading || disambiguation) return;
    setLoading(true);
    setError(null);
    track(EVENTS.SUBSTITUTION_REQUESTED, { ingredient, country, region, dishName });
    try {
      const cleaned = stripIngredientNoise(ingredient);
      const regionHint = country || region;
      const marketId = marketProp || resolveMarketId(regionHint) || getMarketPreference();
      const diets = dietTags?.length ? dietTags : getDietPreferences();

      // 1) Curated engine v0 — hard filters, no LLM invent
      const engine = findSubstitutions({
        ingredient: cleaned || ingredient,
        countryCode: country,
        marketId,
        dietTags: diets,
        allergies: allergies || [],
        limit: 5,
      });

      if (engine.resolved_ingredient.ambiguous) {
        setDisambiguation(
          engine.resolved_ingredient.disambiguation_prompt ||
            "This name matches more than one ingredient. Pick the one you mean."
        );
        setSuggestions([]);
        return;
      }

      if (engine.substitutions.length) {
        setSuggestions(fromEngine(engine.substitutions, marketId));
        return;
      }

      // 2) DB-backed verified substitutions only (no AI invent fallback)
      const { data: ing } = await supabase
        .from("ingredients")
        .select("id, name")
        .ilike("name", cleaned || ingredient)
        .limit(1)
        .maybeSingle();

      if (ing?.id) {
        const { data: subs } = await supabase
          .from("ingredient_substitutions")
          .select(
            "substitute_ingredient_id, quantity_ratio, reason, notes, ingredients!ingredient_substitutions_substitute_ingredient_id_fkey(name)"
          )
          .eq("original_ingredient_id", ing.id)
          .limit(5);

        if (subs && subs.length) {
          setSuggestions(
            subs.map((s) => ({
              name: (s.ingredients as { name?: string } | null)?.name ?? "Unknown",
              ratio: `${s.quantity_ratio ?? 1}:1`,
              notes: s.notes || s.reason || "",
              authenticity: "high" as const,
              source: "db" as const,
              verified: true,
            }))
          );
          return;
        }
      }

      setSuggestions([]);
    } catch (e) {
      setError((e as Error).message || "Could not load substitutes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) fetchSubs();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label={`Find substitutes for ${ingredient}`}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Local substitutes for</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{ingredient}</p>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {disambiguation && (
            <p className="text-xs text-amber-800 dark:text-amber-300">{disambiguation}</p>
          )}
          {!loading && !error && !disambiguation && suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No verified substitutes yet. We only show curated swaps — never invented ones.
            </p>
          )}
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${authColor[s.authenticity] || ""}`}
                  >
                    {s.confidence || s.authenticity}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Ratio: {s.ratio}</span>
                  {s.priceLabel && <span>{s.priceLabel}</span>}
                  {s.availability != null && s.availability < 45 && (
                    <span className="text-amber-700 dark:text-amber-400">Hard to find</span>
                  )}
                  {s.verified && <span>verified</span>}
                </div>
                {(s.cookPrompt || s.notes) && (
                  <p className="mt-1 text-xs text-muted-foreground">{s.cookPrompt || s.notes}</p>
                )}
                {s.warnings?.length ? (
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                    {s.warnings.join(" · ")}
                  </p>
                ) : null}
                {onSelect && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="mt-2 h-8"
                    onClick={() => {
                      onSelect(s.name);
                      setOpen(false);
                    }}
                  >
                    Use this
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
