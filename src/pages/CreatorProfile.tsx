import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCreatorBySlug, sameAsLinks, type CreatorProfile } from "@/lib/creatorProfile";
import RecipeImagePlaceholder from "@/components/RecipeImagePlaceholder";

type RecipeCard = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  image_url: string | null;
  summary: string | null;
};

export default function CreatorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const p = await fetchCreatorBySlug(slug);
        if (!p) {
          setMissing(true);
          setProfile(null);
          setRecipes([]);
          return;
        }
        setProfile(p);
        setMissing(false);
        const { data } = await supabase
          .from("recipes")
          .select("id,slug,name,country,image_url,summary")
          .eq("created_by", p.user_id)
          .order("created_at", { ascending: false })
          .limit(48);
        setRecipes((data || []) as RecipeCard[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!profile) return;
    const sameAs = sameAsLinks(profile.social_links);
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.display_name,
      description: profile.bio || undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      image: profile.avatar_url || undefined,
      nationality: profile.country_name || undefined,
      knowsLanguage: profile.languages || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    };
    const el = document.getElementById("creator-person-jsonld") || document.createElement("script");
    el.id = "creator-person-jsonld";
    el.setAttribute("type", "application/ld+json");
    el.textContent = JSON.stringify(person);
    if (!el.parentElement) document.head.appendChild(el);
    return () => {
      document.getElementById("creator-person-jsonld")?.remove();
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (missing || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold">Creator not found</h1>
          <Button asChild variant="outline">
            <Link to="/recipe-index">Browse recipes</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const links = sameAsLinks(profile.social_links);

  return (
    <div className="min-h-screen flex flex-col">
      <PageMeta
        title={`${profile.display_name} | LadhaQuest creators`}
        description={
          profile.bio ||
          `African recipes and kitchen stories from ${profile.display_name}${
            profile.country_name ? ` (${profile.country_name})` : ""
          }.`
        }
        canonical={`https://www.ladhaquest.com/creators/${profile.slug}`}
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl font-bold">{profile.display_name}</h1>
            {profile.verified && <Badge>Verified</Badge>}
          </div>
          {profile.country_name && (
            <p className="text-muted-foreground">{profile.country_name}</p>
          )}
          {profile.bio && <p className="max-w-2xl text-lg leading-relaxed">{profile.bio}</p>}
          {(profile.languages || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(profile.languages || []).map((lang) => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center text-sm text-primary underline underline-offset-2"
                >
                  {url.replace(/^https?:\/\//, "").slice(0, 40)}
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          )}
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Recipes</h2>
          {recipes.length === 0 ? (
            <p className="text-muted-foreground">No published recipes yet.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/recipe/${r.slug}`}
                    className="block overflow-hidden rounded-lg border hover:border-primary/40 transition-colors"
                  >
                    <RecipeImagePlaceholder
                      name={r.name}
                      country={r.country || undefined}
                      imageUrl={r.image_url}
                      className="aspect-[4/3] w-full"
                    />
                    <div className="p-3 space-y-1">
                      <p className="font-medium leading-snug">{r.name}</p>
                      {r.country && <p className="text-xs text-muted-foreground">{r.country}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
