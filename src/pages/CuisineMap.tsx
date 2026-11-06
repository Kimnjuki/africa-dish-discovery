import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getCountryFlag } from "@/utils/countryFlags";
import { SaveButton } from "@/components/SaveButton";
import { toSlug } from "@/lib/recipeText";
import { MapPin, AlertTriangle } from "lucide-react";

// Approximate country centroids [lon, lat]
const C: Record<string, [number, number]> = {
  Morocco: [-6, 32], Algeria: [3, 28], Tunisia: [9.5, 34], Libya: [17, 27], Egypt: [30, 26], Sudan: [30, 15], "Western Sahara": [-13, 24.5], Mauritania: [-10.5, 20],
  Senegal: [-14.5, 14.5], Gambia: [-15.3, 13.4], "The Gambia": [-15.3, 13.4], "Guinea-Bissau": [-15, 12], Guinea: [-11, 10.5], "Sierra Leone": [-11.8, 8.5], Liberia: [-9.4, 6.4], "Ivory Coast": [-5.5, 7.5], "Côte d'Ivoire": [-5.5, 7.5], Ghana: [-1, 7.9], Togo: [0.9, 8.6], Benin: [2.3, 9.3], Nigeria: [8, 9.5], Niger: [9, 17], Mali: [-2, 17], "Burkina Faso": [-1.5, 12.3], "Cape Verde": [-23.6, 15.1], "Cabo Verde": [-23.6, 15.1],
  Cameroon: [12.5, 5.5], Chad: [18.7, 15.4], "Central African Republic": [21, 6.6], Gabon: [11.6, -0.8], "Equatorial Guinea": [10.3, 1.6], "Republic of the Congo": [15.2, -0.7], Congo: [15.2, -0.7], "DR Congo": [23.6, -2.9], "Democratic Republic of the Congo": [23.6, -2.9], "São Tomé and Príncipe": [6.6, 0.2], "Sao Tome and Principe": [6.6, 0.2],
  Ethiopia: [39.6, 8.6], Eritrea: [39, 15.2], Djibouti: [42.6, 11.8], Somalia: [46, 5.5], Kenya: [37.9, 0.2], Uganda: [32.3, 1.4], Rwanda: [29.9, -1.9], Burundi: [29.9, -3.4], Tanzania: [34.9, -6.4], "South Sudan": [31.3, 7.3], Seychelles: [55.5, -4.7], Comoros: [43.9, -11.9], Madagascar: [46.9, -19], Mauritius: [57.6, -20.3],
  Angola: [17.9, -12.3], Zambia: [27.8, -13.1], Malawi: [34.3, -13.3], Mozambique: [35.5, -18.7], Zimbabwe: [29.2, -19], Botswana: [24.7, -22.3], Namibia: [18.5, -22.6], "South Africa": [24.7, -29], Lesotho: [28.2, -29.6], Eswatini: [31.5, -26.5], Swaziland: [31.5, -26.5],
};
const REGION_OF: Record<string, string> = {};
const REGIONS: Record<string, string[]> = {
  "North Africa": ["Morocco", "Algeria", "Tunisia", "Libya", "Egypt", "Sudan", "Western Sahara", "Mauritania"],
  "West Africa": ["Senegal", "Gambia", "The Gambia", "Guinea-Bissau", "Guinea", "Sierra Leone", "Liberia", "Ivory Coast", "Côte d'Ivoire", "Ghana", "Togo", "Benin", "Nigeria", "Niger", "Mali", "Burkina Faso", "Cape Verde", "Cabo Verde"],
  "Central Africa": ["Cameroon", "Chad", "Central African Republic", "Gabon", "Equatorial Guinea", "Republic of the Congo", "Congo", "DR Congo", "Democratic Republic of the Congo", "São Tomé and Príncipe", "Sao Tome and Principe", "Angola"],
  "East Africa": ["Ethiopia", "Eritrea", "Djibouti", "Somalia", "Kenya", "Uganda", "Rwanda", "Burundi", "Tanzania", "South Sudan", "Seychelles", "Comoros", "Madagascar", "Mauritius"],
  "Southern Africa": ["Zambia", "Malawi", "Mozambique", "Zimbabwe", "Botswana", "Namibia", "South Africa", "Lesotho", "Eswatini", "Swaziland"],
};
Object.entries(REGIONS).forEach(([r, cs]) => cs.forEach((c) => (REGION_OF[c] = r)));

// Projection: lon -26..60, lat -36..39 into 860x750
const W = 860, H = 750;
const proj = ([lon, lat]: [number, number]) => [((lon + 26) / 86) * W, ((39 - lat) / 75) * H];

interface Row { id: string; name: string; slug: string | null; country: string; region: string | null; original_name_native: string | null; cultural_significance: string | null; }

const LOW = 10;

const CuisineMap = () => {
  const [params, setParams] = useSearchParams();
  const region = params.get("region");
  const country = params.get("country");
  const [dishes, setDishes] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const all: Row[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("dishes")
          .select("id,name,slug,country,region,original_name_native,cultural_significance")
          .not("country", "is", null)
          .range(from, from + 999);
        if (error || !data?.length) break;
        all.push(...(data as Row[]));
        if (data.length < 1000) break;
      }
      setDishes(all.filter((d) => C[d.country]));
    })();
  }, []);

  const byCountry = useMemo(() => {
    const m: Record<string, Row[]> = {};
    dishes.forEach((d) => (m[d.country] ||= []).push(d));
    return m;
  }, [dishes]);

  const set = (r: string | null, c: string | null) => {
    const p = new URLSearchParams();
    if (r) p.set("region", r);
    if (c) p.set("country", c);
    setParams(p);
  };

  const visibleCountries = Object.keys(byCountry).filter((c) => !region || REGION_OF[c] === region);
  const selected = country ? byCountry[country] || [] : [];

  return (
    <div className="min-h-screen">
      <PageMeta title="Cuisine Map of Africa | LadhaQuest" description="Explore African dishes by region and country on an interactive map, with native names and cultural context." canonical="https://www.ladhaquest.com/cuisine-map" />
      <Navigation />
      <main className="pt-24 pb-16 container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-2">Cuisine map of Africa</h1>
        <p className="text-muted-foreground mb-6 max-w-3xl">Pick a region, then a country pin to see its dishes, native names and cultural story. Dashed pins mark countries with fewer than {LOW} entries.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button size="sm" variant={!region ? "hero" : "outline"} onClick={() => set(null, null)}>All regions</Button>
          {Object.keys(REGIONS).map((r) => (
            <Button key={r} size="sm" variant={region === r ? "hero" : "outline"} onClick={() => set(r, null)}>{r}</Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-muted/40" role="img" aria-label="Map of African countries with dish pins">
              {Object.keys(byCountry).map((c) => {
                const [x, y] = proj(C[c]);
                const n = byCountry[c].length;
                const dim = region && REGION_OF[c] !== region;
                const active = country === c;
                const r = Math.min(26, 8 + Math.sqrt(n) * 2);
                return (
                  <g key={c} className="cursor-pointer" opacity={dim ? 0.2 : 1} onClick={() => set(REGION_OF[c] || region, c)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && set(REGION_OF[c] || region, c)}>
                    <title>{`${c}: ${n} dishes`}</title>
                    <circle cx={x} cy={y} r={r} className={active ? "fill-primary" : "fill-primary/60"} stroke="hsl(var(--foreground))" strokeWidth={active ? 3 : 1} strokeDasharray={n < LOW ? "4 3" : undefined} />
                    <text x={x} y={y + 4} textAnchor="middle" className="fill-primary-foreground text-[11px] font-bold pointer-events-none">{n}</text>
                    {!dim && <text x={x} y={y + r + 13} textAnchor="middle" className="fill-foreground text-[11px] pointer-events-none">{c}</text>}
                  </g>
                );
              })}
            </svg>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {!country ? (
              <Card>
                <CardHeader><CardTitle>{region || "All regions"}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 max-h-[600px] overflow-auto">
                  {visibleCountries.sort().map((c) => (
                    <button key={c} onClick={() => set(REGION_OF[c], c)} className="text-left rounded-md border p-2 hover:border-primary/50 text-sm">
                      <span>{getCountryFlag(c)} {c}</span>
                      <span className="block text-xs text-muted-foreground">
                        {byCountry[c].length} dishes {byCountry[c].length < LOW && <AlertTriangle className="inline w-3 h-3 text-destructive" />}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>{getCountryFlag(country)} {country}</CardTitle>
                  <SaveButton type="country" slug={toSlug(country)} label={country} showLabel={false} />
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-auto">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{REGION_OF[country]}</Badge>
                    <Badge variant="outline">{selected.length} dishes</Badge>
                    <Button asChild size="sm" variant="link"><Link to={`/country/${toSlug(country)}`}>Country page</Link></Button>
                  </div>
                  {selected.map((d) => {
                    const s = d.slug || toSlug(d.name);
                    return (
                      <div key={d.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/dish/${s}`} className="font-medium hover:text-primary flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{d.name}</Link>
                          <Link to={`/recipe/${s}`} className="text-xs text-primary shrink-0">Recipe →</Link>
                        </div>
                        {d.original_name_native && <p className="text-xs text-muted-foreground">{d.original_name_native}</p>}
                        {d.region && <p className="text-xs text-muted-foreground">{d.region}</p>}
                        {d.cultural_significance && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.cultural_significance}</p>}
                      </div>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => set(region, null)}>Back to countries</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CuisineMap;
