import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  name: string;
  ratio: string;
  notes: string;
  authenticity: "high" | "medium" | "low";
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
      // 1) Try DB-backed substitutions first (accurate dish/ingredient match by name)
      const { data: ing } = await supabase
        .from("ingredients")
        .select("id, name")
        .ilike("name", ingredient.replace(/^\d+[\d/.\s]*\w*\s+/, "").trim())
        .limit(1)
        .maybeSingle();

      if (ing?.id) {
        const { data: subs } = await supabase
          .from("ingredient_substitutions")
          .select("substitute_ingredient_id, quantity_ratio, reason, notes, ingredients!ingredient_substitutions_substitute_ingredient_id_fkey(name)")
          .eq("original_ingredient_id", ing.id)
          .limit(5);

        if (subs && subs.length) {
          setSuggestions(
            subs.map((s) => ({
              name: s.ingredients?.name ?? "Unknown",
              ratio: `${s.quantity_ratio ?? 1}:1`,
              notes: s.notes || s.reason || "",
              authenticity: "high",
            }))
          );
          return;
        }
      }

      // 2) Fallback to AI gateway with cultural context
      const { data, error } = await supabase.functions.invoke("suggest-substitutions", {
        body: { ingredient, country, region, dish_name: dishName },
      });
      if (error) throw error;
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
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
