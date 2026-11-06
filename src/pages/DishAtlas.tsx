import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { getCountryFlag } from "@/utils/countryFlags";
import { Star, Trophy, Soup, Globe2 } from "lucide-react";

interface AtlasRecipe {
  id: string;
  name: string;
  slug: string | null;
  country: string;
  continent: string | null;
  category: string | null;
  summary: string | null;
  tags: string[] | null;
  image_url: string | null;
  cultural_significance?: string | null;
  rating?: number;
  reviews?: number;
  score?: number;
}

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Iconic dishes that any credible African food atlas has to rank highly,
 * independent of how many reader reviews we have collected so far.
 */
const ICONIC = [
  "jollof", "injera", "doro wat", "tagine", "couscous", "bobotie", "fufu", "egusi",
  "suya", "bunny chow", "chapati", "ugali", "nyama choma", "biltong", "braai",
  "pap", "shakshuka", "harira", "pastilla", "bastila", "koshari", "ful medames",
  "thieboudienne", "yassa", "maafe", "mafe", "waakye", "banku", "kelewele",
  "kenkey", "moi moi", "akara", "puff puff", "muamba", "matoke", "pilau",
  "sukuma", "boerewors", "malva", "melktert", "chakalaka", "samp", "mandazi",
  "zigni", "kitfo", "shiro", "brik", "merguez", "mechoui", "seswaa", "nshima",
  "sadza", "cachupa", "romazava", "poulet dg", "ndole", "attieke", "kedjenou",
  "mafé", "chin chin", "bissap", "palm wine", "rooibos", "amasi",
];

const iconicBoost = (name: string) => {
  const n = name.toLowerCase();
  return ICONIC.some((k) => n.includes(k)) ? 3 : 0;
};

/** Stable pseudo-random tiebreaker so equal-scoring dishes aren't alphabetical. */
const stableJitter = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return (h % 1000) / 1000;
};

/** Authenticity + popularity blend used for atlas rankings. */
const scoreOf = (r: AtlasRecipe) => {
  const reviews = r.reviews || 0;
  const rating = r.rating || 0;
  const popularity = rating * Math.min(1, Math.log10(reviews + 1) / 1.5);
  const depth =
    (r.summary && r.summary.length > 120 ? 1 : 0) +
    (r.image_url ? 1 : 0) +
    Math.min(1, (r.tags?.length || 0) / 4);
  return popularity * 1.2 + depth + iconicBoost(r.name) + stableJitter(r.name + r.country) * 0.9;
};


interface AtlasList {
  id: string;
  label: string;
  icon: typeof Trophy;
  limit: number;
  blurb: string;
  filter: (r: AtlasRecipe) => boolean;
  diversify?: boolean;
}

const LISTS: AtlasList[] = [
  {
    id: "top50",
    label: "Top 50 African Dishes",
    icon: Trophy,
    limit: 50,
    blurb:
      "Ranked by reader ratings blended with authenticity depth — cultural provenance, documented history and verified imagery.",
    filter: (r: AtlasRecipe) => (r.continent || "Africa") === "Africa",
  },
  {
    id: "stews",
    label: "Best Stews & Soups",
    icon: Soup,
    limit: 40,
    blurb:
      "Africa's slow-built sauces, groundnut stews, pepper soups and braises — the backbone of the continent's home cooking.",
    filter: (r: AtlasRecipe) =>
      /stew|soup|sauce|braise|curry|pot|bean/i.test(
        `${r.name} ${r.category || ""} ${(r.tags || []).join(" ")}`
      ),
  },
  {
    id: "100foods",
    label: "100 Foods to Try in Africa",
    icon: Globe2,
    limit: 100,
    blurb:
      "A one-per-dish bucket list spread across as many countries as possible, so no single cuisine dominates the run.",
    filter: () => true,
    diversify: true,
  },
];

const DishAtlas = () => {
  const [recipes, setRecipes] = useState<AtlasRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows: AtlasRecipe[] = [];
      const PAGE = 1000;
      for (let from = 0; from < 6000; from += PAGE) {
        const { data, error } = await supabase
          .from("recipes")
          .select(
            "id,name,slug,country,continent,category,summary,tags,image_url"
          )
          .not("country", "is", null)
          .range(from, from + PAGE - 1);
        if (error || !data || data.length === 0) break;
        rows.push(...(data as unknown as AtlasRecipe[]));
        if (data.length < PAGE) break;
      }

      const { data: ratings } = await supabase
        .from("recipe_ratings_summary")
        .select("recipe_id,average_rating,total_reviews");
      const rmap = new Map<string, { rating: number; reviews: number }>();
      (ratings || []).forEach((x) => {
        if (x.recipe_id)
          rmap.set(x.recipe_id, {
            rating: Number(x.average_rating) || 0,
            reviews: Number(x.total_reviews) || 0,
          });
      });

      const enriched = rows.map((r) => {
        const m = rmap.get(r.id);
        const withRating = { ...r, rating: m?.rating || 0, reviews: m?.reviews || 0 };
        return { ...withRating, score: scoreOf(withRating) };
      });
      setRecipes(enriched);
      setLoading(false);
    })();
  }, []);

  const ranked = useMemo(() => {
    const out: Record<string, AtlasRecipe[]> = {};
    for (const list of LISTS) {
      const pool = recipes
        .filter(list.filter)
        .sort((a, b) => (b.score || 0) - (a.score || 0) || a.name.localeCompare(b.name));
      if (list.diversify) {
        const perCountry = new Map<string, number>();
        const picked: AtlasRecipe[] = [];
        for (const cap of [1, 2, 4]) {
          for (const r of pool) {
            if (picked.length >= list.limit) break;
            if (picked.includes(r)) continue;
            const n = perCountry.get(r.country) || 0;
            if (n >= cap) continue;
            perCountry.set(r.country, n + 1);
            picked.push(r);
          }
        }
        out[list.id] = picked;
      } else {
        out[list.id] = pool.slice(0, list.limit);
      }
    }
    return out;
  }, [recipes]);

  const itemListJsonLd = useMemo(() => {
    const top = ranked["top50"] || [];
    if (top.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Top 50 African Dishes",
      itemListElement: top.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.name,
        url: `https://tasteafrica.com/dish/${r.slug || toSlug(r.name)}`,
      })),
    };
  }, [ranked]);

  return (
    <div className="min-h-screen">
      <PageMeta
        title="African Food Atlas | Top 50 Dishes, Best Stews & 100 Foods to Try"
        description="Ranked lists of Africa's best dishes, scored on reader ratings and authenticity depth. Explore the top 50 African dishes, the best stews and soups, and 100 foods to try across the continent."
        keywords="top african dishes, best african stews, foods to try in africa, african food atlas, dish rankings"
        canonical="https://tasteafrica.com/atlas"
      />
      {itemListJsonLd && (
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
      )}
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Food Atlas" }]} />
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">African Food Atlas</h1>
            <p className="text-muted-foreground max-w-2xl">
              Ranked, editorially framed lists of the continent's dishes. Every ranking blends
              reader ratings with authenticity depth: documented cultural history, verified
              country attribution and dish-specific photography.
            </p>
          </header>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="top50">
              <TabsList className="mb-6 flex-wrap h-auto">
                {LISTS.map((l) => (
                  <TabsTrigger key={l.id} value={l.id} className="gap-2">
                    <l.icon className="w-4 h-4" />
                    {l.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {LISTS.map((l) => (
                <TabsContent key={l.id} value={l.id}>
                  <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{l.blurb}</p>
                  <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(ranked[l.id] || []).map((r, i) => (
                      <li key={r.id}>
                        <Link to={`/recipe/${r.slug || toSlug(r.name)}`}>
                          <Card className="h-full group overflow-hidden hover:shadow-warm transition-all">
                            <div className="flex">
                              <div className="w-24 shrink-0 relative">
                                {r.image_url ? (
                                  <img
                                    src={r.image_url}
                                    alt={`${r.name} from ${r.country}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <RecipeImagePlaceholder name={r.name} country={r.country} />
                                )}
                                <span className="absolute top-1 left-1 text-xs font-bold bg-background/90 rounded px-1.5">
                                  #{i + 1}
                                </span>
                              </div>
                              <CardContent className="p-3 flex-1 min-w-0">
                                <h2 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                                  {r.name}
                                </h2>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {getCountryFlag(r.country)} {r.country}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {r.reviews ? (
                                    <span className="text-xs flex items-center gap-1">
                                      <Star className="w-3 h-3 text-primary fill-primary" />
                                      {r.rating?.toFixed(1)} ({r.reviews})
                                    </span>
                                  ) : null}
                                  {r.summary && r.summary.length > 120 && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Full entry
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link to="/recipe-index">Browse the full recipe index</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DishAtlas;
