import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, BookOpen, ArrowLeft, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceCitations } from "@/components/cultural/SourceCitations";
import { RecipeCulturalContext } from "@/components/cultural/RecipeCulturalContext";

interface Dish {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  continent: string | null;
  region: string | null;
  summary: string | null;
  cultural_significance: string | null;
  primary_tribe_ethnicity: string | null;
  original_name_native: string | null;
  phonetic_spelling: string | null;
  cultural_sources?: unknown;
}

interface RecipeRow {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  brief_description: string | null;
}

const CulturalStory = () => {
  const { dishSlug } = useParams<{ dishSlug: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dishSlug) return;
    (async () => {
      setLoading(true);
      const { data: dishData } = await supabase
        .from("dishes")
        .select("*")
        .eq("slug", dishSlug)
        .maybeSingle();
      setDish(dishData as Dish | null);
      if (dishData) {
        const { data: recipeData } = await supabase
          .from("recipes")
          .select("id,name,slug,image_url,brief_description")
          .eq("dish_id", (dishData as Dish).id)
          .limit(12);
        setRecipes((recipeData as RecipeRow[]) || []);
      }
      setLoading(false);
    })();
  }, [dishSlug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-12 space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Story not found</h1>
          <Link to="/recipes"><Button>Browse Recipes</Button></Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${dish.name} — Cultural Story & Origin`,
    about: dish.name,
    inLanguage: "en",
    articleBody: dish.cultural_significance || dish.summary || "",
    locationCreated: dish.country
      ? { "@type": "Place", name: dish.country }
      : undefined,
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${dish.name} — Cultural Story, Origin & History | TasteAfrica`}
        description={(dish.cultural_significance || dish.summary || `Learn the cultural origin and history of ${dish.name} from ${dish.country}.`).slice(0, 160)}
        canonical={`https://tasteafrica.com/story/${dish.slug}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <Link to="/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to recipes
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {dish.country && (
              <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1" />{dish.country}</Badge>
            )}
            {dish.continent && <Badge variant="outline">{dish.continent}</Badge>}
            {dish.region && <Badge variant="outline">{dish.region}</Badge>}
            {dish.primary_tribe_ethnicity && (
              <Badge variant="outline">{dish.primary_tribe_ethnicity}</Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{dish.name}</h1>
          {dish.original_name_native && (
            <p className="text-xl text-muted-foreground mt-2 italic">{dish.original_name_native}</p>
          )}
          {dish.phonetic_spelling && (
            <p className="text-sm text-muted-foreground mt-1">Pronounced: <span className="font-mono">{dish.phonetic_spelling}</span></p>
          )}
        </header>

        {dish.summary && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">{dish.summary}</p>
            </CardContent>
          </Card>
        )}

        {dish.cultural_significance && (
          <Card className="mb-8 border-primary/30">
            <CardContent className="pt-6">
              <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                Cultural Significance
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line leading-relaxed">
                {dish.cultural_significance}
              </div>
              <SourceCitations sources={dish.cultural_sources} className="mt-4 pt-4 border-t" />
            </CardContent>
          </Card>
        )}

        {recipes.length > 0 && (
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
              <ChefHat className="h-6 w-6 text-primary" /> Recipes for {dish.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map(r => (
                <Link key={r.id} to={`/recipes?recipe=${r.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                    {r.image_url && (
                      <img src={r.image_url} alt={r.name} loading="lazy" className="w-full h-40 object-cover" />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{r.name}</h3>
                      {r.brief_description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.brief_description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recipes[0] && (
          <RecipeCulturalContext
            recipeId={recipes[0].id}
            recipeName={dish.name}
            country={dish.country || undefined}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CulturalStory;
