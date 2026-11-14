import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  lookupRankedSubstitutions,
  stripIngredientNoise,
  type MarketRankedSubstitute,
} from "@/lib/substitutionGraph";
import {
  formatMoney,
  getMarketPreference,
  resolveMarketId,
  type MarketId,
} from "@/lib/localMarket";

interface Suggestion {
  name: string;
  ratio: string;
  notes: string;
  authenticity: "high" | "medium" | "low";
  regions?: string[];
  source?: "graph" | "db" | "ai";
  priceLabel?: string;
  availability?: number;
  cookPrompt?: string;
}

interface Props {
  ingredient: string;
  country?: string;
  region?: string;
  dishName?: string;
  marketId?: MarketId;
  onSelect?: (substituteName: string) => void;
}

const authColor: Record<string, string> = {
  high: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

function fromRanked(hits: MarketRankedSubstitute[], marketId: MarketId): Suggestion[] {
  return hits.map((s) => ({
    name: s.name,
    ratio: s.ratio,
    notes: s.cookHint || s.notes,
    authenticity: s.authenticity,
    regions: s.regions,
    source: "graph" as const,
    priceLabel:
      s.market.unitPrice != null
        ? `~${formatMoney(s.market.unitPrice, marketId)}/${s.market.unit}`
        : undefined,
    availability: s.market.availability,
    cookPrompt: s.cookAdjustment?.prompt,
  }));
}

export const IngredientSubstitutionPopover = ({
  ingredient,
  country,
  region,
  dishName,
  marketId: marketProp,
  onSelect,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = async () => {
    if (suggestions.length || loading) return;
    setLoading(true);
    setError(null);
    try {
      const cleaned = stripIngredientNoise(ingredient);
      const regionHint = country || region;
      const marketId = marketProp || resolveMarketId(regionHint) || getMarketPreference();

      // 1) Local Africa-first graph, ranked by market price / availability
      const graphHits = lookupRankedSubstitutions(cleaned || ingredient, {
        regionHint,
        marketId,
        preferCheap: true,
        limit: 5,
      });
      if (graphHits.length) {
        setSuggestions(fromRanked(graphHits, marketId));
        return;
      }

      // 2) DB-backed substitutions
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
            }))
          );
          return;
        }
      }

      // 3) Fallback to AI gateway with cultural context
      const { data, error: fnError } = await supabase.functions.invoke("suggest-substitutions", {
        body: { ingredient, country, region, dish_name: dishName },
      });
      if (fnError) throw fnError;
      setSuggestions(
        (Array.isArray(data?.suggestions) ? data.suggestions : []).map(
          (s: Suggestion) => ({ ...s, source: "ai" as const })
        )
      );
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
          {!loading && !error && suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground">No substitutes found.</p>
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
                    {s.authenticity}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Ratio: {s.ratio}</span>
                  {s.priceLabel && <span>{s.priceLabel}</span>}
                  {s.availability != null && s.availability < 45 && (
                    <span className="text-amber-700 dark:text-amber-400">Hard to find</span>
                  )}
                  {s.source === "graph" && <span>local graph</span>}
                </div>
                {(s.cookPrompt || s.notes) && (
                  <p className="mt-1 text-xs text-muted-foreground">{s.cookPrompt || s.notes}</p>
                )}
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
