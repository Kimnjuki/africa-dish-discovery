import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lookupSubstitutions, stripIngredientNoise } from "@/lib/substitutionGraph";

interface Suggestion {
  name: string;
  ratio: string;
  notes: string;
  authenticity: "high" | "medium" | "low";
  regions?: string[];
  source?: "graph" | "db" | "ai";
}

interface Props {
  ingredient: string;
  country?: string;
  region?: string;
  dishName?: string;
}

const authColor: Record<string, string> = {
  high: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

export const IngredientSubstitutionPopover = ({
  ingredient,
  country,
  region,
  dishName,
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

      // 1) Local Africa-first substitution graph (offline, instant)
      const graphHits = lookupSubstitutions(cleaned || ingredient, {
        regionHint,
        limit: 5,
      });
      if (graphHits.length) {
        setSuggestions(
          graphHits.map((s) => ({
            name: s.name,
            ratio: s.ratio,
            notes: [s.notes, s.regions.length ? `(${s.regions.slice(0, 2).join(", ")})` : ""]
              .filter(Boolean)
              .join(" "),
            authenticity: s.authenticity,
            regions: s.regions,
            source: "graph",
          }))
        );
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
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchSubs(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Find substitutes for ${ingredient}`}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Substitutes for</p>
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
                  <Badge variant="outline" className={`text-[10px] ${authColor[s.authenticity] || ""}`}>
                    {s.authenticity}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Ratio: {s.ratio}</span>
                  {s.source === "graph" && <span>local graph</span>}
                </div>
                {s.notes && <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
