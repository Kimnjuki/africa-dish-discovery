import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCountryFlag, getContinent } from "@/utils/countryFlags";
import { Progress } from "@/components/ui/progress";

interface CountryStat {
  country: string;
  continent: string | null;
  count: number;
}

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CountriesIndex = () => {
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows: { country: string | null; continent: string | null }[] = [];
      const PAGE = 1000;
      for (let from = 0; from < 6000; from += PAGE) {
        const { data, error } = await supabase
          .from("recipes")
          .select("country,continent")
          .not("country", "is", null)
          .range(from, from + PAGE - 1);
        if (error || !data || data.length === 0) break;
        rows.push(...data);
        if (data.length < PAGE) break;
      }
      const map = new Map<string, CountryStat>();
      rows.forEach((r) => {
        const c = r.country?.trim();
        if (!c) return;
        const cur = map.get(c) || { country: c, continent: r.continent, count: 0 };
        cur.count += 1;
        map.set(c, cur);
      });
      setCountries([...map.values()].sort((a, b) => b.count - a.count));
      setLoading(false);
    })();
  }, []);

  const grouped = countries.reduce((acc, c) => {
    const k = c.continent || "Other";
    (acc[k] = acc[k] || []).push(c);
    return acc;
  }, {} as Record<string, CountryStat[]>);

  const africanCovered = countries.filter(
    (c) => (c.continent || getContinent(c.country)) === "Africa"
  ).length;
  const africanPct = Math.min(100, Math.round((africanCovered / 54) * 100));
  const totalRecipes = countries.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Browse Recipes by Country | LadhaQuest"
        description="Explore authentic recipes from every country, organized by continent. Discover regional cuisines, cultural stories, and traditional dishes from around the world."
        canonical="https://www.ladhaquest.com/countries"
      />
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Recipes by Country</h1>
          <p className="text-muted-foreground mt-2">
            Explore {countries.length} cuisines and {totalRecipes} recipes from around the world
          </p>
        </header>

        <Card className="mb-10 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Every African country we've cooked</span>
              <span className="text-sm text-muted-foreground">{africanCovered}/54</span>
            </div>
            <Progress value={africanPct} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {africanPct}% of the continent covered with authentic, country-attributed recipes.
            </p>
          </CardContent>
        </Card>


        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          Object.entries(grouped).map(([continent, list]) => (
            <section key={continent} className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{continent}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {list.map(c => (
                  <Link key={c.country} to={`/country/${toSlug(c.country)}`}>
                    <Card className="hover:shadow-md hover:border-primary/50 transition-all">
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-3xl">{getCountryFlag(c.country)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{c.country}</p>
                          <p className="text-xs text-muted-foreground">{c.count} recipes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CountriesIndex;
