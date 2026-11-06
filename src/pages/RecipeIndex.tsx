import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedRecipePreparation } from "@/components/enhanced/EnhancedRecipePreparation";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { NutritionBadge } from "@/components/NutritionBadge";
import { Clock, Users, ChefHat, Filter, X, Search } from "lucide-react";
import type { IngredientValue, StepValue } from "@/types/content";

interface IndexRecipe {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string | null;
  category?: string | null;
  summary?: string | null;
  difficulty?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  tags?: string[] | null;
  dietary_tags?: string[] | null;
  image_url?: string | null;
  ingredients: IngredientValue[] | null;
  steps: StepValue[] | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

const PAGE_SIZE = 24;
const MAX_TIME = 240;

const FACET_KEYS = ["q", "country", "continent", "category", "diet", "difficulty", "time", "ingredient"] as const;
type FacetKey = (typeof FACET_KEYS)[number];

const RecipeIndex = () => {
  const [params, setParams] = useSearchParams();
  const [recipes, setRecipes] = useState<IndexRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<IndexRecipe | null>(null);

  const get = (key: FacetKey) => params.get(key) || "";

  const setFacet = (key: FacetKey, value: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    setVisible(PAGE_SIZE);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "id,name,slug,country,continent,category,summary,difficulty,prep_time,cook_time,servings,tags,dietary_tags,image_url,ingredients,steps,calories,protein,carbs,fats"
        )
        .order("name", { ascending: true })
        .limit(2000);
      if (!error && data) setRecipes(data as unknown as IndexRecipe[]);
      setLoading(false);
    };
    load();
  }, []);

  const facets = useMemo(() => {
    const countries = new Map<string, number>();
    const continents = new Map<string, number>();
    const categories = new Map<string, number>();
    const diets = new Map<string, number>();
    const difficulties = new Map<string, number>();
    for (const r of recipes) {
      if (r.country) countries.set(r.country, (countries.get(r.country) || 0) + 1);
      if (r.continent) continents.set(r.continent, (continents.get(r.continent) || 0) + 1);
      if (r.category) categories.set(r.category, (categories.get(r.category) || 0) + 1);
      if (r.difficulty) difficulties.set(r.difficulty, (difficulties.get(r.difficulty) || 0) + 1);
      for (const d of r.dietary_tags || []) if (d) diets.set(d, (diets.get(d) || 0) + 1);
    }
    const sorted = (m: Map<string, number>, limit?: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
    return {
      countries: sorted(countries),
      continents: sorted(continents),
      categories: sorted(categories, 12),
      diets: sorted(diets, 10),
      difficulties: sorted(difficulties),
    };
  }, [recipes]);

  const results = useMemo(() => {
    const q = get("q").toLowerCase().trim();
    const ingredient = get("ingredient").toLowerCase().trim();
    const country = get("country");
    const continent = get("continent");
    const category = get("category");
    const diet = get("diet");
    const difficulty = get("difficulty");
    const time = parseInt(get("time") || "0", 10);

    return recipes.filter((r) => {
      if (country && r.country !== country) return false;
      if (continent && r.continent !== continent) return false;
      if (category && r.category !== category) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (diet && !(r.dietary_tags || []).includes(diet)) return false;
      if (time > 0 && (r.prep_time || 0) + (r.cook_time || 0) > time) return false;
      if (q) {
        const haystack = `${r.name} ${r.country} ${r.summary || ""} ${(r.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (ingredient) {
        const raw = Array.isArray(r.ingredients) ? JSON.stringify(r.ingredients).toLowerCase() : "";
        if (!raw.includes(ingredient)) return false;
      }
      return true;
    });
  }, [recipes, params]);

  const activeFacets = FACET_KEYS.filter((k) => get(k));

  if (selected) {
    return <EnhancedRecipePreparation recipe={selected} onBack={() => setSelected(null)} />;
  }

  const FacetGroup = ({
    label,
    facetKey,
    options,
  }: {
    label: string;
    facetKey: FacetKey;
    options: [string, number][];
  }) => (
    <div>
      <h3 className="text-sm font-semibold mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, count]) => {
          const active = get(facetKey) === value;
          return (
            <Button
              key={value}
              size="sm"
              variant={active ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setFacet(facetKey, active ? "" : value)}
            >
              {value}
              <span className="ml-1.5 opacity-60">{count}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Recipe Index | Browse African & World Recipes by Country, Diet & Time"
        description="Browse every recipe on LadhaQuest with filters for country, region, meal type, ingredient, diet, cooking time and difficulty. Find exactly what you can cook tonight."
        keywords="recipe index, african recipes by country, browse recipes, recipe filter, meal type, dietary recipes"
        canonical="https://www.ladhaquest.com/recipe-index"
      />
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Recipe Index" }]} />
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Recipe Index</h1>
            <p className="text-muted-foreground max-w-2xl">
              Every dish in the collection, filterable by country, region, meal type, ingredient,
              diet, time and difficulty. Filters are saved in the page address, so you can share
              or bookmark any view.
            </p>
          </header>

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <Filter className="w-4 h-4 text-primary" /> Filters
                    </span>
                    {activeFacets.length > 0 && (
                      <Button size="sm" variant="ghost" onClick={clearAll}>
                        <X className="w-3.5 h-3.5 mr-1" /> Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="q">
                      Search dishes
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="q"
                        className="pl-8"
                        placeholder="Jollof, tagine, injera…"
                        value={get("q")}
                        onChange={(e) => setFacet("q", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="ingredient">
                      Has ingredient
                    </label>
                    <Input
                      id="ingredient"
                      placeholder="plantain, teff, peanut…"
                      value={get("ingredient")}
                      onChange={(e) => setFacet("ingredient", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Max total time{get("time") ? `: ${get("time")} min` : ""}
                    </label>
                    <Slider
                      min={0}
                      max={MAX_TIME}
                      step={15}
                      value={[parseInt(get("time") || "0", 10)]}
                      onValueChange={([v]) => setFacet("time", v ? String(v) : "")}
                    />
                  </div>

                  {facets.continents.length > 0 && (
                    <FacetGroup label="Region" facetKey="continent" options={facets.continents} />
                  )}
                  {facets.categories.length > 0 && (
                    <FacetGroup label="Meal type" facetKey="category" options={facets.categories} />
                  )}
                  {facets.diets.length > 0 && (
                    <FacetGroup label="Diet" facetKey="diet" options={facets.diets} />
                  )}
                  {facets.difficulties.length > 0 && (
                    <FacetGroup
                      label="Difficulty"
                      facetKey="difficulty"
                      options={facets.difficulties}
                    />
                  )}
                  {facets.countries.length > 0 && (
                    <FacetGroup
                      label="Country"
                      facetKey="country"
                      options={facets.countries.slice(0, 30)}
                    />
                  )}
                </CardContent>
              </Card>
            </aside>

            <section className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading recipes…" : `${results.length} recipes`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeFacets.map((k) => (
                    <Badge key={k} variant="secondary" className="capitalize">
                      {k}: {get(k)}
                      <button
                        className="ml-1.5"
                        aria-label={`Remove ${k} filter`}
                        onClick={() => setFacet(k, "")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ChefHat className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h2 className="font-semibold mb-1">No recipes match these filters</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try widening the time limit or clearing a filter.
                    </p>
                    <Button variant="outline" onClick={clearAll}>
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.slice(0, visible).map((r) => {
                      const total = (r.prep_time || 0) + (r.cook_time || 0);
                      return (
                        <Card
                          key={r.id}
                          className="group overflow-hidden hover:shadow-warm transition-all cursor-pointer"
                          onClick={() => setSelected(r)}
                        >
                          <div className="aspect-video overflow-hidden">
                            {r.image_url ? (
                              <img
                                src={r.image_url}
                                alt={`${r.name} from ${r.country}`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <RecipeImagePlaceholder name={r.name} country={r.country} />
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h2 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                                {r.name}
                              </h2>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {r.country}
                              </Badge>
                            </div>
                            {r.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {r.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {total} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {r.servings || 1}
                              </span>
                              <span className="flex items-center gap-1">
                                <ChefHat className="w-3 h-3" /> {r.difficulty || "—"}
                              </span>
                            </div>
                            {r.calories ? (
                              <NutritionBadge
                                calories={Math.round(r.calories)}
                                protein={r.protein || 0}
                                carbs={r.carbs || 0}
                                fats={r.fats || 0}
                                compact
                              />
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {visible < results.length && (
                    <div className="text-center mt-10">
                      <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                        Load more ({results.length - visible} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecipeIndex;
