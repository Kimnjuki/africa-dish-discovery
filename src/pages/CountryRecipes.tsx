import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CountryGuideSection } from "@/components/country/CountryGuideSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin } from "lucide-react";
import { getCountryFlag } from "@/utils/countryFlags";
import { NutritionBadge } from "@/components/NutritionBadge";
import type { IngredientValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  brief_description: string | null;
  difficulty: string | null;
  category: string | null;
  continent: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  tags: string[] | null;
  ingredients: IngredientValue[] | null;
}

const slugToCountry = (slug: string) =>
  slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

const STOP_WORDS = new Set([
  "cup","cups","tablespoon","tablespoons","teaspoon","teaspoons","gram","grams","g","kg","ml","litre",
  "liter","large","small","medium","fresh","chopped","sliced","diced","ground","to","taste","optional",
  "and","or","of","the","a","for","cut","into","pieces","finely","water","salt","pepper","plus","more",
  "cloves","clove","bunch","pinch","can","cans","tin","tins","peeled","washed","warm","cold","hot",
]);

const ingredientText = (ing: unknown): string => {
  if (!ing) return "";
  if (typeof ing === "string") return ing;
  if (Array.isArray(ing)) return ing.map((item) => ingredientText(item)).join(" ");
  if (typeof ing === "object") {
    const item = ing as { name?: unknown; item?: unknown; ingredient?: unknown; text?: unknown };
    return [item.name, item.item, item.ingredient, item.text]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ");
  }
  return "";
};

const CountryRecipes = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const country = useMemo(() => (countrySlug ? slugToCountry(countrySlug) : ""), [countrySlug]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    if (!country) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("recipes")
        .select("id,name,slug,image_url,brief_description,difficulty,category,continent,prep_time,cook_time,servings,calories,protein,carbs,fats,tags,ingredients")
        .ilike("country", country)
        .order("name")
        .limit(300);
      setRecipes((data as unknown as Recipe[]) || []);
      setActiveCategory("");
      setLoading(false);
    })();
  }, [country]);

  const flag = getCountryFlag(country);
  const region = recipes.find(r => r.continent)?.continent || null;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of recipes) if (r.category) map.set(r.category, (map.get(r.category) || 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [recipes]);

  const pantry = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of recipes) {
      const words = ingredientText(r.ingredients)
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w));
      for (const w of new Set(words)) counts.set(w, (counts.get(w) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([w]) => w);
  }, [recipes]);

  const festiveDishes = useMemo(
    () =>
      recipes
        .filter(r =>
          (r.tags || []).some(t =>
            /festive|celebration|holiday|wedding|christmas|eid|ceremon/i.test(t || "")
          )
        )
        .map(r => ({ name: r.name, slug: r.slug })),
    [recipes]
  );

  const visible = useMemo(
    () => (activeCategory ? recipes.filter(r => r.category === activeCategory) : recipes),
    [recipes, activeCategory]
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${country} Recipes`,
    about: { "@type": "Country", name: country },
    hasPart: recipes.slice(0, 20).map(r => ({
      "@type": "Recipe",
      name: r.name,
      url: `https://tasteafrica.com/recipes?recipe=${r.slug}`,
      image: r.image_url || undefined,
    })),
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${country} Food Guide — Authentic Recipes & Cuisine | TasteAfrica`}
        description={`A complete guide to ${country} cuisine: staple pantry, meal structure, festive dishes and ${recipes.length}+ authentic recipes with cultural context and step-by-step instructions.`}
        canonical={`https://tasteafrica.com/country/${countrySlug}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="container mx-auto px-6 py-12 pt-24">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Countries", href: "/countries" },
            ...(region ? [{ label: region, href: `/recipe-index?continent=${encodeURIComponent(region)}` }] : []),
            { label: country },
          ]}
        />
        <Link to="/countries" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> All countries
        </Link>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
            <span className="text-5xl">{flag}</span> {country} Food Guide
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {recipes.length} authentic recipes
            {region ? ` · ${region}` : ""}
          </p>
        </header>

        {!loading && recipes.length > 0 && (
          <CountryGuideSection
            country={country}
            region={region}
            pantry={pantry}
            festiveDishes={festiveDishes}
            recipeCount={recipes.length}
          />
        )}

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              size="sm"
              variant={activeCategory ? "outline" : "default"}
              className="h-7 text-xs"
              onClick={() => setActiveCategory("")}
            >
              All ({recipes.length})
            </Button>
            {categories.map(([c, n]) => (
              <Button
                key={c}
                size="sm"
                variant={activeCategory === c ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
              >
                {c} <span className="ml-1.5 opacity-60">{n}</span>
              </Button>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">
          {activeCategory ? `${activeCategory} recipes` : `All ${country} recipes`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground">No recipes found for {country} yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(r => (
              <Link key={r.id} to={`/recipes?recipe=${r.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                  {r.image_url && (
                    <img src={r.image_url} alt={`${r.name} — traditional dish from ${country}`} loading="lazy" className="w-full h-48 object-cover" />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{r.name}</h3>
                    {r.brief_description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.brief_description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                      {r.category && <Badge variant="secondary">{r.category}</Badge>}
                      {r.difficulty && <Badge variant="outline">{r.difficulty}</Badge>}
                      <NutritionBadge calories={r.calories ?? undefined} protein={r.protein ?? undefined} carbs={r.carbs ?? undefined} fats={r.fats ?? undefined} />
                    </div>
                    {(r.prep_time || r.cook_time || r.servings) && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {(r.prep_time || r.cook_time) && <span>⏱️ {(r.prep_time ?? 0) + (r.cook_time ?? 0)} min</span>}
                        {r.servings && <span>🍽️ {r.servings} servings</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CountryRecipes;
