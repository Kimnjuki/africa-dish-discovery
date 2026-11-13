import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RecipeSchema } from "@/components/seo/RecipeSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedRecipePreparation } from "@/components/enhanced/EnhancedRecipePreparation";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { IngredientChecklist } from "@/components/recipe/IngredientChecklist";
import { NutritionBadge } from "@/components/NutritionBadge";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import { CookMode } from "@/components/recipe/CookMode";
import { RecipeTrustNotice } from "@/components/recipe/RecipeTrustNotice";
import { RecipeProvenance } from "@/components/recipe/RecipeProvenance";
import { SourceCitations } from "@/components/cultural/SourceCitations";
import { RecipeReviews } from "@/components/RecipeReviews";
import { SaveButton } from "@/components/SaveButton";
import { getCountryFlag } from "@/utils/countryFlags";
import { itemText, toList, toSlug } from "@/lib/recipeText";
import { Clock, Users, ChefHat, Utensils, Lightbulb, Globe2, Minus, Plus, BookOpen } from "lucide-react";
import { withParsedRecipeFields, type CookableRecipe } from "@/types/content";
import { cacheRecipe, getCachedRecipes, isBrowserOffline } from "@/lib/offlineStore";
import { useDataSaver } from "@/hooks/useDataSaver";
import { DataSaverImage } from "@/components/DataSaverImage";

type DishProvenance = {
  original_name_native: string | null;
  primary_tribe_ethnicity: string | null;
  region: string | null;
  phonetic_spelling: string | null;
};

type RegionJoin = { name: string } | null;

type RecipeRow = CookableRecipe & {
  dish_id?: string | null;
  region_id?: string | null;
  local_names?: string[] | null;
  ethnic_group?: string | null;
  occasion_tags?: string[] | null;
  dishes?: DishProvenance | DishProvenance[] | null;
  regions?: RegionJoin | RegionJoin[] | null;
};

function firstJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

const RecipeDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [related, setRelated] = useState<CookableRecipe[]>([]);
  const [servings, setServings] = useState(4);
  const [cooking, setCooking] = useState(false);
  const [cookMode, setCookMode] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(
    null
  );
  const { dataSaver } = useDataSaver();

  const onSummaryChange = useCallback((summary: { average: number; count: number } | null) => {
    setRatingSummary(summary);
  }, []);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);

      if (isBrowserOffline()) {
        const cached = getCachedRecipes().find((r) => r.slug === slug);
        if (cached) {
          setRecipe(
            withParsedRecipeFields({
              ...cached,
              ingredients: cached.ingredients ?? null,
              steps: cached.steps ?? null,
            } as RecipeRow)
          );
          setServings(cached.servings || 4);
          setRelated([]);
          setLoading(false);
          return;
        }
      }

      const selectCols =
        "*, dishes(original_name_native, primary_tribe_ethnicity, region, phonetic_spelling), regions(name)";

      let { data: rec } = await supabase.from("recipes").select(selectCols).eq("slug", slug).maybeSingle();
      if (!rec) {
        const { data: d } = await supabase.from("dishes").select("id,name").eq("slug", slug).maybeSingle();
        if (d) {
          const { data } = await supabase
            .from("recipes")
            .select(selectCols)
            .or(`dish_id.eq.${d.id},name.eq.${d.name}`)
            .limit(1);
          rec = data?.[0] ?? null;
        }
      }
      const parsed = rec ? (withParsedRecipeFields(rec) as RecipeRow) : null;
      setRecipe(parsed);
      setServings(rec?.servings || 4);

      if (parsed?.id) {
        const { data: summary } = await supabase
          .from("recipe_ratings_summary")
          .select("average_rating, total_reviews")
          .eq("recipe_id", parsed.id)
          .maybeSingle();
        if (summary?.total_reviews && summary.total_reviews > 0) {
          setRatingSummary({
            average: Number(summary.average_rating) || 0,
            count: Number(summary.total_reviews) || 0,
          });
        } else {
          setRatingSummary(null);
        }
      } else {
        setRatingSummary(null);
      }

      if (parsed) {
        cacheRecipe({
          id: parsed.id!,
          name: parsed.name,
          country: parsed.country || "",
          image_url: parsed.image_url ?? null,
          prep_time: parsed.prep_time ?? null,
          cook_time: parsed.cook_time ?? null,
          servings: parsed.servings ?? null,
          difficulty: parsed.difficulty ?? null,
          summary: parsed.summary ?? null,
          slug: parsed.slug || slug,
          ingredients: parsed.ingredients,
          steps: parsed.steps,
        });
      }
      if (rec?.country) {
        const { data } = await supabase
          .from("recipes")
          .select("id,name,slug,country,image_url,category")
          .eq("country", rec.country)
          .neq("id", rec.id)
          .limit(6);
        setRelated(dataSaver ? (data || []).map((r) => ({ ...r, image_url: null })) : data || []);
      } else {
        setRelated([]);
      }
      setLoading(false);
    })();
  }, [slug, dataSaver]);

  const base = recipe?.servings || 4;
  const mult = servings / base;
  const steps = useMemo(() => toList(recipe?.steps).map(itemText).filter(Boolean), [recipe]);
  const tips = useMemo(() => {
    const t: string[] = [];
    const tagTips = toList(recipe?.tags).filter((x): x is string => typeof x === "string" && /tip|store|serve/i.test(x));
    t.push(...tagTips);
    if (recipe?.cuisine_type) t.push(`Serve as part of a ${recipe.cuisine_type} meal.`);
    if (recipe?.world_equivalent_dish) t.push(`Similar to ${recipe.world_equivalent_dish} — use that as a texture reference.`);
    t.push("Store leftovers covered in the fridge and eat within 2–3 days; reheat until piping hot.");
    t.push("Taste and adjust salt and heat at the end of cooking — village and city versions vary.");
    return t;
  }, [recipe]);

  const dish = firstJoin(recipe?.dishes);
  const regionJoin = firstJoin(recipe?.regions);
  const regionName = regionJoin?.name || dish?.region || null;
  const localNames = useMemo(() => {
    const fromRecipe = recipe?.local_names?.filter(Boolean) || [];
    const fromDish = dish?.original_name_native ? [dish.original_name_native] : [];
    return [...new Set([...fromRecipe, ...fromDish])];
  }, [recipe?.local_names, dish?.original_name_native]);
  const ethnicGroup = recipe?.ethnic_group || dish?.primary_tribe_ethnicity || null;

  if (cookMode && recipe) {
    return (
      <CookMode
        recipeName={recipe.name}
        steps={recipe.steps}
        ingredients={recipe.ingredients}
        multiplier={mult}
        onClose={() => setCookMode(false)}
      />
    );
  }

  if (cooking && recipe) return <EnhancedRecipePreparation recipe={recipe} onBack={() => setCooking(false)} />;

  const title = recipe?.name || "Recipe";
  const country = recipe?.country || "";

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${title} Recipe${country ? ` — ${country}` : ""} | LadhaQuest`}
        description={recipe?.summary || `How to cook ${title}: ingredients, step-by-step method, tips and cultural history.`}
        canonical={`https://www.ladhaquest.com/recipe/${slug}`}
        ogImage={recipe?.image_url || undefined}
        type="article"
      />
      {recipe && (
        <RecipeSchema
          recipe={{
            name: recipe.name,
            image_url: recipe.image_url,
            summary: recipe.summary,
            brief_description: recipe.brief_description,
            country: recipe.country,
            cuisine_type: recipe.cuisine_type,
            category: recipe.category,
            prep_time: recipe.prep_time ?? recipe.prep_time_minutes,
            cook_time: recipe.cook_time ?? recipe.cook_time_minutes,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            tags: recipe.tags,
            dietary_tags: recipe.dietary_tags,
            occasion_tags: recipe.occasion_tags,
            local_names: localNames,
            ethnic_group: ethnicGroup,
            created_at: recipe.created_at,
            slug: recipe.slug || slug,
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fats: recipe.fats,
          }}
          rating={ratingSummary}
        />
      )}
      <Navigation />
      <main className="pt-20 pb-28 md:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Recipes", href: "/recipe-index" },
              ...(country ? [{ label: country, href: `/country/${toSlug(country)}` }] : []),
              { label: title },
            ]}
          />
          {loading ? (
            <div className="space-y-4"><Skeleton className="h-72 w-full" /><Skeleton className="h-40 w-full" /></div>
          ) : !recipe ? (
            <Card><CardContent className="py-16 text-center">
              <ChefHat className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h1 className="text-xl font-semibold mb-4">Recipe not found</h1>
              <Button asChild variant="outline"><Link to="/atlas">Back to the atlas</Link></Button>
            </CardContent></Card>
          ) : (
            <>
              <header className="grid lg:grid-cols-5 gap-8 mb-10">
                <div className="lg:col-span-3 rounded-lg overflow-hidden h-64 lg:h-96">
                  {recipe.image_url ? (
                    <DataSaverImage
                      src={recipe.image_url}
                      alt={`${title} from ${country}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <RecipeImagePlaceholder name={title} country={country} className="h-full min-h-64" />
                  )}
                </div>
                <div className="lg:col-span-2">
                  <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
                  {localNames.length > 0 && (
                    <p className="mb-2 text-muted-foreground italic">{localNames.join(" · ")}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {country && <Badge variant="secondary">{getCountryFlag(country)} {country}</Badge>}
                    {regionName && <Badge variant="outline">{regionName}</Badge>}
                    {recipe.continent && <Badge variant="outline">{recipe.continent}</Badge>}
                    {recipe.category && <Badge variant="outline">{recipe.category}</Badge>}
                    {ratingSummary && ratingSummary.count > 0 && (
                      <Badge variant="outline">
                        ★ {ratingSummary.average.toFixed(1)} ({ratingSummary.count})
                      </Badge>
                    )}
                    <NutritionBadge calories={recipe.calories} protein={recipe.protein} carbs={recipe.carbs} fats={recipe.fats} />
                  </div>
                  <p className="text-muted-foreground mb-4">{recipe.summary || recipe.brief_description}</p>
                  <div className="mb-5 grid grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm">
                    <div className="rounded-md border p-2 sm:p-3"><Clock className="mb-1 h-4 w-4 text-primary" />Prep {recipe.prep_time || recipe.prep_time_minutes || "—"} min</div>
                    <div className="rounded-md border p-2 sm:p-3"><Clock className="mb-1 h-4 w-4 text-primary" />Cook {recipe.cook_time || recipe.cook_time_minutes || "—"} min</div>
                    <div className="rounded-md border p-2 sm:p-3"><ChefHat className="mb-1 h-4 w-4 text-primary" />{recipe.difficulty || "—"}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="hero" className="h-12 hover:scale-100" onClick={() => setCookMode(true)}><Utensils className="mr-2 h-4 w-4" />Start cooking</Button>
                    <Button variant="outline" className="h-12" onClick={() => setCooking(true)}>Full guide</Button>
                    <Button asChild variant="outline" className="h-12">
                      <a href="#reviews">I made this</a>
                    </Button>
                    <SaveButton type="recipe" slug={recipe.slug} id={recipe.id} label={recipe.name} />
                    <PrintRecipeButton recipe={recipe} servingMultiplier={mult} />
                  </div>
                  <RecipeTrustNotice verificationStatus={recipe.verification_status} safetyNotes={recipe.safety_notes} itemType={recipe.item_type} className="mt-4" />
                </div>
              </header>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-primary" />Servings</span>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" aria-label="Fewer servings" onClick={() => setServings((s) => Math.max(1, s - 1))}><Minus className="w-4 h-4" /></Button>
                        <span className="w-6 text-center font-semibold">{servings}</span>
                        <Button size="icon" variant="outline" aria-label="More servings" onClick={() => setServings((s) => s + 1)}><Plus className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                  <IngredientChecklist ingredients={recipe.ingredients} multiplier={mult} country={country} dishName={title} />
                  <RecipeProvenance
                    recipeName={recipe.name}
                    recipeSlug={recipe.slug || slug}
                    country={country}
                    region={regionName}
                    localNames={localNames}
                    ethnicGroup={ethnicGroup}
                    occasionTags={recipe.occasion_tags}
                    history={recipe.history}
                    historySources={recipe.history_sources}
                  />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Method</CardTitle></CardHeader>
                    <CardContent>
                      {steps.length ? (
                        <ol className="space-y-4">
                          {steps.map((s, i) => (
                            <li key={i} className="flex gap-4" id={`step${i + 1}`}>
                              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                              <p className="pt-1">{s}</p>
                            </li>
                          ))}
                        </ol>
                      ) : <p className="text-muted-foreground">Method is being verified for this dish.</p>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" />Tips & storage</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </CardContent>
                  </Card>

                  {recipe.history && (
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="w-5 h-5 text-primary" />Cultural history</CardTitle></CardHeader>
                      <CardContent className="text-muted-foreground space-y-3">
                        <p className="whitespace-pre-line">{recipe.history}</p>
                        <SourceCitations sources={recipe.history_sources} />
                        <Button asChild variant="link" className="px-0">
                          <Link to={`/dish/${recipe.slug}`}><BookOpen className="w-4 h-4 mr-1" />Read the encyclopedia entry</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {recipe.id && (
                    <RecipeReviews
                      recipeId={recipe.id}
                      recipeName={recipe.name}
                      onSummaryChange={onSummaryChange}
                    />
                  )}

                  {related.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>More from {country}</CardTitle></CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-3">
                        {related.map((r) => (
                          <Link key={r.id} to={`/recipe/${r.slug || toSlug(r.name)}`} className="flex gap-3 items-center rounded-md border p-2 hover:border-primary/50">
                            <div className="w-14 h-14 rounded overflow-hidden shrink-0">
                              {r.image_url ? <img src={r.image_url} alt={r.name} loading="lazy" className="w-full h-full object-cover" /> : <RecipeImagePlaceholder name={r.name} country={r.country} />}
                            </div>
                            <div className="min-w-0"><p className="font-medium text-sm truncate">{r.name}</p><p className="text-xs text-muted-foreground">{r.category || country}</p></div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      {recipe && !loading && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <Button variant="hero" className="h-12 w-full hover:scale-100" onClick={() => setCookMode(true)}>
            <Utensils className="mr-2 h-4 w-4" />
            Start cooking
          </Button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default RecipeDetail;
