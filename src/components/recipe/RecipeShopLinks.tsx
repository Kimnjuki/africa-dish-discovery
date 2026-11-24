import { useEffect, useMemo, useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { track, EVENTS } from "@/lib/analytics";
import {
  preferredShopRegion,
  rankShopLinks,
  withAffiliateParams,
} from "@/lib/affiliateLinks";

type ShopLink = {
  id: string;
  supplier_name: string;
  url: string;
  region: string | null;
  ingredient_id: string | null;
  ingredient_name: string;
  ingredient_slug: string | null;
};

type Props = {
  recipeId?: string | null;
  recipeSlug?: string | null;
  country?: string | null;
};

export function RecipeShopLinks({ recipeId, recipeSlug, country }: Props) {
  const [links, setLinks] = useState<ShopLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recipeId) {
      setLinks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: joins, error: joinErr } = await supabase
          .from("recipe_ingredients")
          .select("ingredient_id,ingredients(id,name,slug)")
          .eq("recipe_id", recipeId);
        if (joinErr) throw joinErr;
        const ingredientIds = [
          ...new Set((joins || []).map((j) => j.ingredient_id).filter(Boolean)),
        ] as string[];
        if (!ingredientIds.length) {
          if (!cancelled) setLinks([]);
          return;
        }

        const nameById = new Map<string, { name: string; slug: string | null }>();
        for (const j of joins || []) {
          const ing = Array.isArray(j.ingredients) ? j.ingredients[0] : j.ingredients;
          if (j.ingredient_id && ing) {
            nameById.set(j.ingredient_id, {
              name: ing.name || "Ingredient",
              slug: ing.slug || null,
            });
          }
        }

        const { data: suppliers, error: supErr } = await supabase
          .from("affiliate_suppliers")
          .select("id,supplier_name,url,region,ingredient_id")
          .in("ingredient_id", ingredientIds);
        if (supErr) throw supErr;

        const mapped: ShopLink[] = (suppliers || [])
          .filter((s) => s.ingredient_id && nameById.has(s.ingredient_id))
          .map((s) => {
            const meta = nameById.get(s.ingredient_id!)!;
            return {
              id: s.id,
              supplier_name: s.supplier_name,
              url: s.url,
              region: s.region,
              ingredient_id: s.ingredient_id,
              ingredient_name: meta.name,
              ingredient_slug: meta.slug,
            };
          });

        if (!cancelled) setLinks(mapped);
      } catch {
        if (!cancelled) setLinks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  const preferred = preferredShopRegion(country);
  const ranked = useMemo(() => rankShopLinks(links, preferred), [links, preferred]);

  /** One link per ingredient (best region), max 6. */
  const display = useMemo(() => {
    const seen = new Set<string>();
    const out: ShopLink[] = [];
    for (const link of ranked) {
      const key = link.ingredient_id || link.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(link);
      if (out.length >= 6) break;
    }
    return out;
  }, [ranked]);

  if (loading || display.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          Shop staples
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Diaspora pilot links for hard-to-find ingredients. We may earn a commission
          when you buy through Amazon links (associate tag applied when configured).
        </p>
        <ul className="space-y-2">
          {display.map((link) => {
            const href = withAffiliateParams(link.url);
            return (
              <li key={link.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{link.ingredient_name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">{link.supplier_name}</span>
                    {link.region && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {link.region}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 h-9">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() =>
                      track(EVENTS.AFFILIATE_CLICK, {
                        supplier: link.supplier_name,
                        ingredient: link.ingredient_slug || link.ingredient_name,
                        region: link.region,
                        recipeSlug,
                      })
                    }
                  >
                    Shop
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
