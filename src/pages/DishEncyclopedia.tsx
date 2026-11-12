import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CookMode } from "@/components/recipe/CookMode";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";
import { getCountryFlag } from "@/utils/countryFlags";
import { MapPin, Volume2, ChefHat, Globe2, Utensils } from "lucide-react";
import { SourceCitations } from "@/components/cultural/SourceCitations";
import { RecipeTrustNotice } from "@/components/recipe/RecipeTrustNotice";
import { SaveButton } from "@/components/SaveButton";
import { withParsedRecipeFields, type CookableRecipe, type VenueRecord } from "@/types/content";

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface DishRow {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  region: string | null;
  continent: string | null;
  original_name_native: string | null;
  phonetic_spelling: string | null;
  primary_tribe_ethnicity: string | null;
  cultural_significance: string | null;
  cultural_sources?: unknown;
  history_sources?: unknown;
  summary: string | null;
}

const DishEncyclopedia = () => {
  const { dishSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [dish, setDish] = useState<DishRow | null>(null);
  const [recipe, setRecipe] = useState<CookableRecipe | null>(null);
  const [related, setRelated] = useState<CookableRecipe[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [cooking, setCooking] = useState(false);

  useEffect(() => {
    if (!dishSlug) return;
    (async () => {
      setLoading(true);

      const { data: recipeBySlug } = await supabase
        .from("recipes")
        .select("*")
        .eq("slug", dishSlug)
        .maybeSingle();

      let rec: CookableRecipe | null = recipeBySlug ? withParsedRecipeFields(recipeBySlug) : null;
      let dishRow: DishRow | null = null;

      const { data: dishBySlug } = await supabase
        .from("dishes")
        .select(
          "id,name,slug,country,region,continent,original_name_native,phonetic_spelling,primary_tribe_ethnicity,cultural_significance,cultural_sources,summary"
        )
        .eq("slug", dishSlug)
        .maybeSingle();
      dishRow = (dishBySlug as DishRow) || null;

      if (!rec && dishRow) {
        const { data } = await supabase
          .from("recipes")
          .select("*")
          .eq("name", dishRow.name)
          .limit(1);
        rec = data?.[0] ? withParsedRecipeFields(data[0]) : null;
      }

      if (!dishRow && rec) {
        const { data } = await supabase
          .from("dishes")
          .select(
            "id,name,slug,country,region,continent,original_name_native,phonetic_spelling,primary_tribe_ethnicity,cultural_significance,cultural_sources,summary"
          )
          .eq("name", rec.name)
          .limit(1);
        dishRow = (data?.[0] as DishRow) || null;
      }

      setDish(dishRow);
      setRecipe(rec);

      const country = dishRow?.country || rec?.country;
      if (country) {
        const { data } = await supabase
          .from("recipes")
          .select("id,name,slug,country,image_url,summary,category")
          .eq("country", country)
          .neq("id", rec?.id || "00000000-0000-0000-0000-000000000000")
          .limit(6);
        setRelated(data || []);
      }

      const { data: v } = await supabase
        .from("venues")
        .select("id,name,type,address,description,website_url,is_verified")
        .limit(4);
      setVenues(v || []);

      setLoading(false);
    })();
  }, [dishSlug]);

  const title = dish?.name || recipe?.name || "Dish";
  const country = dish?.country || recipe?.country || "";

  const jsonLd = useMemo(() => {
    if (!title) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${title} — dish encyclopedia entry`,
      about: title,
      articleSection: country,
      description:
        dish?.summary || recipe?.summary || `Encyclopedia entry for ${title} from ${country}.`,
    };
  }, [title, country, dish, recipe]);

  if (cooking && recipe) {
    return (
      <CookMode
        recipeName={recipe.name}
        steps={recipe.steps}
        ingredients={recipe.ingredients}
        onClose={() => setCooking(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${title} | Dish Encyclopedia${country ? ` — ${country}` : ""}`}
        description={
          dish?.summary ||
          recipe?.summary ||
          `${title}: native name, pronunciation, region, cultural history and where to eat it.`
        }
        canonical={`https://www.ladhaquest.com/dish/${dishSlug}`}
      />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Food Atlas", href: "/atlas" },
              ...(country
                ? [{ label: country, href: `/country/${toSlug(country)}` }]
                : []),
              { label: title },
            ]}
          />

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !dish && !recipe ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ChefHat className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h1 className="text-xl font-semibold mb-2">Dish not found</h1>
                <Button asChild variant="outline">
                  <Link to="/atlas">Back to the atlas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <header className="grid lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                  <h1 className="text-4xl font-bold mb-2">{title}</h1>
                  {dish?.original_name_native && (
                    <p className="text-lg text-muted-foreground mb-1">
                      {dish.original_name_native}
                    </p>
                  )}
                  {dish?.phonetic_spelling && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                      <Volume2 className="w-4 h-4 text-primary" />
                      Pronounced <em>{dish.phonetic_spelling}</em>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {country && (
                      <Badge variant="secondary">
                        {getCountryFlag(country)} {country}
                      </Badge>
                    )}
                    {dish?.region && <Badge variant="outline">{dish.region}</Badge>}
                    {dish?.primary_tribe_ethnicity && (
                      <Badge variant="outline">{dish.primary_tribe_ethnicity}</Badge>
                    )}
                    {recipe?.category && <Badge variant="outline">{recipe.category}</Badge>}
                  </div>
                  <p className="text-muted-foreground">
                    {dish?.summary || recipe?.summary}
                  </p>
                  {recipe && (
                    <RecipeTrustNotice
                      verificationStatus={recipe.verification_status}
                      safetyNotes={recipe.safety_notes}
                      itemType={recipe.item_type}
                      className="mt-4"
                    />
                  )}
                  {recipe && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button variant="hero" onClick={() => setCooking(true)}>
                        <Utensils className="w-4 h-4 mr-2" /> Start cooking
                      </Button>
                      <Button asChild variant="default">
                        <Link to={`/recipe/${recipe.slug || dishSlug}`}>View full recipe</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to={`/country/${toSlug(country)}`}>More from {country}</Link>
                      </Button>
                      <SaveButton type="dish" slug={dishSlug || ""} id={dish?.id} label={title} />
                      <Button asChild variant="ghost">
                        <Link to={`/cuisine-map?country=${encodeURIComponent(country)}`}>On the map</Link>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="rounded-lg overflow-hidden h-56 lg:h-full">
                  {recipe?.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={`${title} from ${country}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RecipeImagePlaceholder name={title} country={country} />
                  )}
                </div>
              </header>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {(dish?.cultural_significance || recipe?.cultural_significance) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe2 className="w-5 h-5 text-primary" /> Cultural history
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                        <p>{dish?.cultural_significance || recipe?.cultural_significance}</p>
                        <SourceCitations
                          sources={dish?.cultural_sources ?? recipe?.cultural_sources}
                          className="not-prose pt-2"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {related.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Related dishes from {country}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-3">
                        {related.map((r) => (
                          <Link key={r.id} to={`/dish/${r.slug || toSlug(r.name)}`}>
                            <Card className="hover:border-primary/50 transition-all">
                              <CardContent className="p-3 flex gap-3 items-center">
                                <div className="w-14 h-14 rounded overflow-hidden shrink-0">
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
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{r.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {r.category || country}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <aside className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="w-4 h-4 text-primary" /> Where to eat it
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {venues.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Restaurant and market references for {title} are being verified. Meanwhile,
                          look for it at local markets and family-run kitchens in{" "}
                          {dish?.region || country}.
                        </p>
                      ) : (
                        venues.map((v) => (
                          <div key={v.id} className="text-sm">
                            <p className="font-medium">{v.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[v.type, v.address].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">At a glance</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country</span>
                        <span>{country || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region</span>
                        <span>{dish?.region || recipe?.continent || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meal type</span>
                        <span>{recipe?.category || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difficulty</span>
                        <span>{recipe?.difficulty || "—"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DishEncyclopedia;
