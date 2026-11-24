import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { NutritionBadge } from "@/components/NutritionBadge";
import { Clock, Users, ChefHat, Filter, X, Search } from "lucide-react";
import type { IngredientValue } from "@/types/content";
import {
  expandSearchQuery,
  recipeHasIngredient,
  recipeMatchesExpanded,
  explainRecipeMatch,
  scoreRecipeMatch,
} from "@/lib/recipeSearch";
import { loadRecipeGraphIngredientText } from "@/lib/graphIngredientIndex";
import { LocalNameToggle, usePreferLocalNames } from "@/components/recipe/LocalNameToggle";
import { shouldIndexFacetUrl, canonicalForFacetUrl } from "@/lib/facetIndexation";
import { track, EVENTS } from "@/lib/analytics";

/** Index-list recipe — steps intentionally omitted to reduce payload. */
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
  local_names?: string[] | null;
  ingredients: IngredientValue[] | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  graph_ingredient_text?: string | null;
}

const PAGE_SIZE = 24;
const MAX_TIME = 240;

/** Canonical insertion order for all supported URL params. */
const FACET_KEYS = [
  "q",
  "country",
  "continent",
  "category",
  "diet",
  "difficulty",
  "time",
  "ingredient",
] as const;
type FacetKey = (typeof FACET_KEYS)[number];

/** Build a new URLSearchParams with keys in the canonical FACET_KEYS order. */
function buildStableParams(current: URLSearchParams, key: FacetKey, value: string): URLSearchParams {
  const next = new URLSearchParams();
  for (const k of FACET_KEYS) {
    const v = k === key ? value : (current.get(k) || "");
    if (v) next.set(k, v);
  }
  return next;
}

const RecipeIndex = () => {
  const [params, setParams] = useSearchParams();
  const [recipes, setRecipes] = useState<IndexRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { preferLocal, toggle: toggleLocalNames } = usePreferLocalNames();

  const get = (key: FacetKey) => params.get(key) || "";

  /**
   * setFacetClick — for filter button/chip clicks: pushes a new history entry
   * so Back/forward walks through filter changes.
   */
  const setFacetClick = (key: FacetKey, value: string) => {
    const next = buildStableParams(params, key, value);
    setParams(next, { replace: false });
    setVisible(PAGE_SIZE);
    if (value) {
      track(EVENTS.FILTER_APPLIED, { facet: key, value });
    }
  };

  /**
   * setFacetText — for free-text inputs (q, ingredient): replaces current
   * history entry while typing to avoid flooding the history stack.
   */
  const setFacetText = (key: FacetKey, value: string) => {
    const next = buildStableParams(params, key, value);
    setParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: false });
    setVisible(PAGE_SIZE);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      // steps intentionally omitted — reduces payload significantly.
      // Show list ASAP; enrich ingredient graph text afterward.
      const recipeRes = await supabase
        .from("recipes")
        .select(
          "id,name,slug,country,continent,category,summary,difficulty,prep_time,cook_time,servings,tags,dietary_tags,image_url,ingredients,calories,protein,carbs,fats,dishes(original_name_native)"
        )
        .order("name", { ascending: true })
        .limit(1500);
      if (cancelled) return;
      const { data, error } = recipeRes;
      if (!error && data) {
        setRecipes(
          (
            data as unknown as Array<
              IndexRecipe & {
                dishes?:
                  | { original_name_native?: string | null }
                  | { original_name_native?: string | null }[]
                  | null;
              }
            >
          ).map((row) => {
            const dish = Array.isArray(row.dishes) ? row.dishes[0] : row.dishes;
            const native = dish?.original_name_native?.trim();
            return {
              ...row,
              local_names: native ? [native] : row.local_names || null,
              graph_ingredient_text: null,
            };
          })
        );
      }
      setLoading(false);

      try {
        const graphText = await loadRecipeGraphIngredientText();
        if (cancelled || !graphText.size) return;
        setRecipes((prev) =>
          prev.map((r) => ({
            ...r,
            graph_ingredient_text: graphText.get(r.id) || r.graph_ingredient_text || null,
          }))
        );
      } catch {
        /* JSON ingredient fallback remains usable */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const queryExpansion = useMemo(() => expandSearchQuery(get("q")), [params]);

  /**
   * "Open facet" counting: for each facet group, count recipes that satisfy all
   * OTHER active filters, so the counts reflect what would remain if that facet
   * option were chosen.
   */
  const facets = useMemo(() => {
    const countryFilter = params.get("country") || "";
    const continentFilter = params.get("continent") || "";
    const categoryFilter = params.get("category") || "";
    const dietFilter = params.get("diet") || "";
    const difficultyFilter = params.get("difficulty") || "";
    const timeFilter = parseInt(params.get("time") || "0", 10);
    const ingredientFilter = params.get("ingredient") || "";

    /** Test recipe against all active filters EXCEPT the specified one. */
    const testExcept = (r: IndexRecipe, except: FacetKey): boolean => {
      if (except !== "country" && countryFilter && r.country !== countryFilter) return false;
      if (except !== "continent" && continentFilter && r.continent !== continentFilter) return false;
      if (except !== "category" && categoryFilter && r.category !== categoryFilter) return false;
      if (except !== "difficulty" && difficultyFilter && r.difficulty !== difficultyFilter)
        return false;
      if (except !== "diet" && dietFilter && !(r.dietary_tags || []).includes(dietFilter))
        return false;
      if (
        except !== "time" &&
        timeFilter > 0 &&
        (r.prep_time || 0) + (r.cook_time || 0) > timeFilter
      )
        return false;
      if (
        except !== "q" &&
        queryExpansion.normalized &&
        !recipeMatchesExpanded(r, queryExpansion)
      )
        return false;
      if (except !== "ingredient" && ingredientFilter) {
        if (!recipeHasIngredient(r, ingredientFilter)) return false;
      }
      return true;
    };

    const count = (
      facet: FacetKey,
      getter: (r: IndexRecipe) => string | null | undefined
    ): [string, number][] => {
      const m = new Map<string, number>();
      for (const r of recipes) {
        if (!testExcept(r, facet)) continue;
        const v = getter(r);
        if (v) m.set(v, (m.get(v) || 0) + 1);
      }
      return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    };

    const countDiet = (): [string, number][] => {
      const m = new Map<string, number>();
      for (const r of recipes) {
        if (!testExcept(r, "diet")) continue;
        for (const d of r.dietary_tags || []) {
          if (d) m.set(d, (m.get(d) || 0) + 1);
        }
      }
      return [...m.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 10);
    };

    return {
      countries: count("country", (r) => r.country).slice(0, 30),
      continents: count("continent", (r) => r.continent),
      categories: count("category", (r) => r.category).slice(0, 12),
      diets: countDiet(),
      difficulties: count("difficulty", (r) => r.difficulty),
    };
  }, [recipes, params, queryExpansion]);

  const results = useMemo(() => {
    const ingredient = get("ingredient").trim();
    const country = get("country");
    const continent = get("continent");
    const category = get("category");
    const diet = get("diet");
    const difficulty = get("difficulty");
    const time = parseInt(get("time") || "0", 10);

    const filtered = recipes.filter((r) => {
      if (country && r.country !== country) return false;
      if (continent && r.continent !== continent) return false;
      if (category && r.category !== category) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (diet && !(r.dietary_tags || []).includes(diet)) return false;
      if (time > 0 && (r.prep_time || 0) + (r.cook_time || 0) > time) return false;
      if (queryExpansion.normalized && !recipeMatchesExpanded(r, queryExpansion)) return false;
      if (ingredient && !recipeHasIngredient(r, ingredient)) return false;
      return true;
    });

    if (!queryExpansion.normalized) return filtered;
    return [...filtered].sort(
      (a, b) =>
        scoreRecipeMatch(b, queryExpansion) - scoreRecipeMatch(a, queryExpansion) ||
        a.name.localeCompare(b.name)
    );
  }, [recipes, params, queryExpansion]);

  // Track zero-result searches
  useEffect(() => {
    if (!loading && queryExpansion.normalized && results.length === 0) {
      track(EVENTS.SEARCH_ZERO_RESULT, { q: params.get("q") });
    }
    if (!loading && queryExpansion.normalized && results.length > 0) {
      track(EVENTS.SEARCH_PERFORMED, {
        q: params.get("q"),
        resultCount: results.length,
      });
    }
  }, [loading, results.length, queryExpansion.normalized]);

  const activeFacets = FACET_KEYS.filter((k) => get(k));

  // Compute SEO meta from current params
  const shouldIndex = shouldIndexFacetUrl(params);
  const canonicalUrl = canonicalForFacetUrl(params);

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
              className="h-11 text-xs sm:h-8"
              onClick={() => setFacetClick(facetKey, active ? "" : value)}
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
        canonical={canonicalUrl}
        noIndex={!shouldIndex}
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
                        placeholder="Jollof, nyama choma, egusi…"
                        value={get("q")}
                        onChange={(e) => setFacetText("q", e.target.value)}
                      />
                    </div>
                    {queryExpansion.suggestion &&
                      queryExpansion.suggestion !== queryExpansion.normalized && (
                        <p className="text-xs text-muted-foreground">
                          Showing results for{" "}
                          <button
                            type="button"
                            className="font-medium text-primary underline-offset-2 hover:underline"
                            onClick={() => setFacetClick("q", queryExpansion.suggestion!)}
                          >
                            {queryExpansion.suggestion}
                          </button>
                          {queryExpansion.expanded
                            ? " (local names, aliases, and close spellings included)"
                            : ""}
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="ingredient">
                      Has ingredient
                    </label>
                    <Input
                      id="ingredient"
                      placeholder="plantain, muhogo, egusi…"
                      value={get("ingredient")}
                      onChange={(e) => setFacetText("ingredient", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Matches mapped ingredients and local aliases (e.g. muhogo → cassava).
                    </p>
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
                      onValueChange={([v]) => setFacetClick("time", v ? String(v) : "")}
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading recipes…" : `${results.length} recipes`}
                </p>
                <LocalNameToggle preferLocal={preferLocal} onToggle={toggleLocalNames} />
                <div className="flex flex-wrap gap-2">
                  {activeFacets.map((k) => (
                    <Badge key={k} variant="secondary" className="capitalize">
                      {k}: {get(k)}
                      <button
                        className="ml-1.5"
                        aria-label={`Remove ${k} filter`}
                        onClick={() => setFacetClick(k, "")}
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
                      const local = (r.local_names || []).find(Boolean);
                      const heading = preferLocal && local ? local : r.name;
                      const gloss = preferLocal && local ? r.name : local;
                      const matchNote = explainRecipeMatch(r, queryExpansion);
                      const dietBadges = (r.dietary_tags || []).filter(Boolean).slice(0, 2);
                      return (
                        <Link
                          key={r.id}
                          to={`/recipe/${r.slug}`}
                          className="block group"
                          aria-label={`View recipe: ${r.name}`}
                        >
                          <Card className="overflow-hidden hover:shadow-warm transition-all h-full">
                            <div className="aspect-video overflow-hidden bg-muted">
                              <RecipeImagePlaceholder
                                name={r.name}
                                country={r.country}
                                imageUrl={r.image_url}
                                className="h-full w-full group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h2 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                                  {heading}
                                </h2>
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {r.country}
                                </Badge>
                              </div>
                              {gloss && (
                                <p className="text-xs italic text-muted-foreground mb-1">{gloss}</p>
                              )}
                              {matchNote && (
                                <p className="text-xs text-primary mb-1">{matchNote}</p>
                              )}
                              {r.summary && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {r.summary}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                                {total > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {total} min
                                  </span>
                                )}
                                {r.servings && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {r.servings}
                                  </span>
                                )}
                                {r.difficulty && (
                                  <span className="flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" /> {r.difficulty}
                                  </span>
                                )}
                              </div>
                              {dietBadges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {dietBadges.map((d) => (
                                    <Badge
                                      key={d}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {d}
                                    </Badge>
                                  ))}
                                </div>
                              )}
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
                        </Link>
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
