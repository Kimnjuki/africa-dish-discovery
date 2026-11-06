import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, ExternalLink, Search } from "lucide-react";

interface Dish {
  id: string;
  name: string;
  country: string | null;
  region: string | null;
  continent: string | null;
  slug: string | null;
}
interface Recipe {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  continent: string | null;
  dish_id: string | null;
  image_url: string | null;
}

const AFRICAN_COUNTRIES: { name: string; region: string }[] = [
  { name: "Algeria", region: "North Africa" }, { name: "Egypt", region: "North Africa" },
  { name: "Libya", region: "North Africa" }, { name: "Morocco", region: "North Africa" },
  { name: "Sudan", region: "North Africa" }, { name: "Tunisia", region: "North Africa" },
  { name: "Benin", region: "West Africa" }, { name: "Burkina Faso", region: "West Africa" },
  { name: "Cape Verde", region: "West Africa" }, { name: "Ivory Coast", region: "West Africa" },
  { name: "Gambia", region: "West Africa" }, { name: "Ghana", region: "West Africa" },
  { name: "Guinea", region: "West Africa" }, { name: "Guinea-Bissau", region: "West Africa" },
  { name: "Liberia", region: "West Africa" }, { name: "Mali", region: "West Africa" },
  { name: "Mauritania", region: "West Africa" }, { name: "Niger", region: "West Africa" },
  { name: "Nigeria", region: "West Africa" }, { name: "Senegal", region: "West Africa" },
  { name: "Sierra Leone", region: "West Africa" }, { name: "Togo", region: "West Africa" },
  { name: "Cameroon", region: "Central Africa" }, { name: "Central African Republic", region: "Central Africa" },
  { name: "Chad", region: "Central Africa" }, { name: "Republic of the Congo", region: "Central Africa" },
  { name: "Democratic Republic of the Congo", region: "Central Africa" },
  { name: "Equatorial Guinea", region: "Central Africa" }, { name: "Gabon", region: "Central Africa" },
  { name: "Sao Tome and Principe", region: "Central Africa" },
  { name: "Burundi", region: "East Africa" }, { name: "Comoros", region: "East Africa" },
  { name: "Djibouti", region: "East Africa" }, { name: "Eritrea", region: "East Africa" },
  { name: "Ethiopia", region: "East Africa" }, { name: "Kenya", region: "East Africa" },
  { name: "Madagascar", region: "East Africa" }, { name: "Mauritius", region: "East Africa" },
  { name: "Rwanda", region: "East Africa" }, { name: "Seychelles", region: "East Africa" },
  { name: "Somalia", region: "East Africa" }, { name: "South Sudan", region: "East Africa" },
  { name: "Tanzania", region: "East Africa" }, { name: "Uganda", region: "East Africa" },
  { name: "Angola", region: "Southern Africa" }, { name: "Botswana", region: "Southern Africa" },
  { name: "Eswatini", region: "Southern Africa" }, { name: "Lesotho", region: "Southern Africa" },
  { name: "Malawi", region: "Southern Africa" }, { name: "Mozambique", region: "Southern Africa" },
  { name: "Namibia", region: "Southern Africa" }, { name: "South Africa", region: "Southern Africa" },
  { name: "Zambia", region: "Southern Africa" }, { name: "Zimbabwe", region: "Southern Africa" },
];

const countrySlug = (c: string) =>
  c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminDishQA = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: ds }, { data: rs }] = await Promise.all([
        supabase.from("dishes").select("id,name,country,region,continent,slug").limit(5000),
        supabase.from("recipes").select("id,name,slug,country,continent,dish_id,image_url").limit(5000),
      ]);
      setDishes((ds as Dish[]) || []);
      setRecipes((rs as Recipe[]) || []);
      setLoading(false);
    })();
  }, []);

  const issues = useMemo(() => {
    const missingCountry = dishes.filter(d => !d.country?.trim());
    const missingRegion = dishes.filter(d => !d.region?.trim());
    const missingContinent = dishes.filter(d => !d.continent?.trim());

    // Dishes with same name appearing across multiple countries (variants OK, but flag for review)
    const byName = new Map<string, Dish[]>();
    dishes.forEach(d => {
      const k = (d.name || "").toLowerCase().trim();
      if (!k) return;
      if (!byName.has(k)) byName.set(k, []);
      byName.get(k)!.push(d);
    });
    const multiCountry = [...byName.values()].filter(arr => new Set(arr.map(x => x.country)).size > 1);

    // Same name+country duplicated (should be unique by constraint, but verify)
    const dupKey = new Map<string, Dish[]>();
    dishes.forEach(d => {
      const k = `${(d.name || "").toLowerCase()}|${d.country || ""}`;
      if (!dupKey.has(k)) dupKey.set(k, []);
      dupKey.get(k)!.push(d);
    });
    const exactDuplicates = [...dupKey.values()].filter(arr => arr.length > 1);

    // Region/country mismatch: if same country maps to >1 region, flag
    const countryRegion = new Map<string, Set<string>>();
    dishes.forEach(d => {
      if (!d.country || !d.region) return;
      if (!countryRegion.has(d.country)) countryRegion.set(d.country, new Set());
      countryRegion.get(d.country)!.add(d.region);
    });
    const inconsistentRegion = [...countryRegion.entries()].filter(([, regions]) => regions.size > 1);

    // Recipes whose country doesn't match linked dish.country
    const dishById = new Map(dishes.map(d => [d.id, d] as const));
    const recipeCountryMismatch = recipes.filter(r => {
      if (!r.dish_id) return false;
      const d = dishById.get(r.dish_id);
      return d && d.country && r.country && d.country.toLowerCase() !== r.country.toLowerCase();
    });

    // Recipes with no dish link
    const orphanRecipes = recipes.filter(r => !r.dish_id);

    return {
      missingCountry, missingRegion, missingContinent,
      multiCountry, exactDuplicates, inconsistentRegion,
      recipeCountryMismatch, orphanRecipes,
    };
  }, [dishes, recipes]);

  const countries = useMemo(() => {
    const map = new Map<string, { region: string | null; dishes: number; recipes: number }>();
    dishes.forEach(d => {
      if (!d.country) return;
      const cur = map.get(d.country) || { region: d.region, dishes: 0, recipes: 0 };
      cur.dishes += 1;
      if (!cur.region && d.region) cur.region = d.region;
      map.set(d.country, cur);
    });
    recipes.forEach(r => {
      if (!r.country) return;
      const cur = map.get(r.country) || { region: null, dishes: 0, recipes: 0 };
      cur.recipes += 1;
      map.set(r.country, cur);
    });
    return [...map.entries()]
      .map(([country, v]) => ({ country, ...v }))
      .filter(c => !q || c.country.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [dishes, recipes, q]);

  const regions = useMemo(() => {
    const map = new Map<string, { dishes: number; countries: Set<string> }>();
    dishes.forEach(d => {
      if (!d.region) return;
      const cur = map.get(d.region) || { dishes: 0, countries: new Set<string>() };
      cur.dishes += 1;
      if (d.country) cur.countries.add(d.country);
      map.set(d.region, cur);
    });
    return [...map.entries()]
      .map(([region, v]) => ({ region, dishes: v.dishes, countries: v.countries.size }))
      .sort((a, b) => b.dishes - a.dishes);
  }, [dishes]);

  const totalIssues =
    issues.missingCountry.length + issues.missingRegion.length +
    issues.missingContinent.length + issues.exactDuplicates.length +
    issues.inconsistentRegion.length + issues.recipeCountryMismatch.length;

  return (
    <div className="min-h-screen">
      <PageMeta title="Admin · Dish QA Dashboard | LadhaQuest" description="Verify dish country/region assignments and filter correctness." canonical="https://www.ladhaquest.com/admin/dish-qa" />
      <Navigation />
      <main className="container mx-auto px-6 py-10 space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold">Dish QA Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Verifies each dish has exactly one country and one region, and that filter pages return the right results.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total dishes" value={dishes.length} />
              <StatCard label="Total recipes" value={recipes.length} />
              <StatCard label="Countries" value={countries.length} />
              <StatCard
                label="QA issues"
                value={totalIssues}
                tone={totalIssues === 0 ? "ok" : "warn"}
              />
            </section>

            <AfricaCoverage dishes={dishes} recipes={recipes} />

            <Tabs defaultValue="countries">
              <TabsList>
                <TabsTrigger value="countries">Countries</TabsTrigger>
                <TabsTrigger value="regions">Regions</TabsTrigger>
                <TabsTrigger value="issues">Issues ({totalIssues})</TabsTrigger>
              </TabsList>

              <TabsContent value="countries" className="space-y-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter country…" />
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Country</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead className="text-right">Dishes</TableHead>
                          <TableHead className="text-right">Recipes</TableHead>
                          <TableHead className="text-right">Drill down</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countries.map((c) => (
                          <TableRow key={c.country}>
                            <TableCell className="font-medium">{c.country}</TableCell>
                            <TableCell>{c.region || <span className="text-destructive">missing</span>}</TableCell>
                            <TableCell className="text-right">{c.dishes}</TableCell>
                            <TableCell className="text-right">{c.recipes}</TableCell>
                            <TableCell className="text-right">
                              <Link className="inline-flex items-center gap-1 text-primary hover:underline" to={`/country/${countrySlug(c.country)}`}>
                                Open <ExternalLink className="h-3 w-3" />
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="regions">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Region</TableHead>
                          <TableHead className="text-right">Countries</TableHead>
                          <TableHead className="text-right">Dishes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regions.map((r) => (
                          <TableRow key={r.region}>
                            <TableCell className="font-medium">{r.region}</TableCell>
                            <TableCell className="text-right">{r.countries}</TableCell>
                            <TableCell className="text-right">{r.dishes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="space-y-6">
                <IssueGroup title="Dishes missing country" items={issues.missingCountry.map(d => ({ id: d.id, label: d.name, sub: d.slug || "" }))} />
                <IssueGroup title="Dishes missing region" items={issues.missingRegion.map(d => ({ id: d.id, label: d.name, sub: d.country || "" }))} />
                <IssueGroup title="Dishes missing continent" items={issues.missingContinent.map(d => ({ id: d.id, label: d.name, sub: `${d.country} · ${d.region}` }))} />
                <IssueGroup
                  title="Duplicate (name, country) pairs"
                  items={issues.exactDuplicates.map(arr => ({ id: arr[0].id, label: arr[0].name, sub: `${arr[0].country} · ${arr.length} copies` }))}
                />
                <IssueGroup
                  title="Countries mapped to >1 region"
                  items={issues.inconsistentRegion.map(([c, regs]) => ({ id: c, label: c, sub: [...regs].join(", ") }))}
                />
                <IssueGroup
                  title="Recipes whose country ≠ linked dish's country"
                  items={issues.recipeCountryMismatch.slice(0, 100).map(r => ({ id: r.id, label: r.name, sub: r.country || "" }))}
                />
                <IssueGroup
                  title={`Recipes not linked to a dish (${issues.orphanRecipes.length})`}
                  items={issues.orphanRecipes.slice(0, 50).map(r => ({ id: r.id, label: r.name, sub: r.country || "" }))}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${tone === "warn" ? "text-destructive" : tone === "ok" ? "text-primary" : ""}`}>
        {value}
      </div>
    </CardContent>
  </Card>
);

const IssueGroup = ({ title, items }: { title: string; items: { id: string; label: string; sub?: string }[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-base flex items-center gap-2">
        {items.length === 0 ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
        {title}
      </CardTitle>
      <Badge variant={items.length === 0 ? "secondary" : "destructive"}>{items.length}</Badge>
    </CardHeader>
    {items.length > 0 && (
      <CardContent>
        <ul className="space-y-1 text-sm max-h-64 overflow-auto">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between border-b border-border/40 py-1">
              <span className="font-medium">{it.label}</span>
              {it.sub && <span className="text-muted-foreground">{it.sub}</span>}
            </li>
          ))}
        </ul>
      </CardContent>
    )}
  </Card>
);

const AfricaCoverage = ({ dishes, recipes }: { dishes: Dish[]; recipes: Recipe[] }) => {
  const africanDishes = dishes.filter(d => (d.continent || "").toLowerCase() === "africa");
  const africanRecipes = recipes.filter(r => (r.continent || "").toLowerCase() === "africa");

  const dishByCountry = new Map<string, number>();
  africanDishes.forEach(d => {
    if (!d.country) return;
    dishByCountry.set(d.country, (dishByCountry.get(d.country) || 0) + 1);
  });
  const recipeByCountry = new Map<string, number>();
  africanRecipes.forEach(r => {
    if (!r.country) return;
    recipeByCountry.set(r.country, (recipeByCountry.get(r.country) || 0) + 1);
  });

  // Image duplication across African recipes.
  const imgCount = new Map<string, number>();
  africanRecipes.forEach(r => {
    if (!r.image_url) return;
    imgCount.set(r.image_url, (imgCount.get(r.image_url) || 0) + 1);
  });
  const duplicateImages = [...imgCount.values()].filter(n => n > 1).reduce((a, b) => a + b, 0);
  const missingImages = africanRecipes.filter(r => !r.image_url).length;

  const rows = AFRICAN_COUNTRIES.map(c => {
    const dc = dishByCountry.get(c.name) || 0;
    const rc = recipeByCountry.get(c.name) || 0;
    let status: "ok" | "low" | "missing" = "ok";
    if (dc === 0) status = "missing";
    else if (dc < 10) status = "low";
    return { ...c, dishes: dc, recipes: rc, status };
  });

  const covered = rows.filter(r => r.status === "ok").length;
  const low = rows.filter(r => r.status === "low").length;
  const missing = rows.filter(r => r.status === "missing").length;

  const byRegion = new Map<string, typeof rows>();
  rows.forEach(r => {
    if (!byRegion.has(r.region)) byRegion.set(r.region, [] as typeof rows);
    byRegion.get(r.region)!.push(r);
  });

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl md:text-2xl font-semibold">Africa Coverage Report</h2>
        <div className="text-sm text-muted-foreground">
          {covered}/54 well-covered · {low} low · {missing} missing · {duplicateImages} duplicate images · {missingImages} without image
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...byRegion.entries()].map(([region, list]) => (
          <Card key={region}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{region}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {list.sort((a, b) => a.name.localeCompare(b.name)).map(r => (
                  <li key={r.name} className="flex items-center justify-between">
                    <Link to={`/country/${countrySlug(r.name)}`} className="hover:underline">
                      {r.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{r.dishes}d · {r.recipes}r</span>
                      {r.status === "ok" && <Badge variant="secondary">ok</Badge>}
                      {r.status === "low" && <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/40">low</Badge>}
                      {r.status === "missing" && <Badge variant="destructive">missing</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AdminDishQA;
