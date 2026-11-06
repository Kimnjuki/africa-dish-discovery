import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, UtensilsCrossed, PartyPopper, Sprout, MapPin } from "lucide-react";
import { getCountryGuide } from "@/data/countryGuides";

interface CountryGuideSectionProps {
  country: string;
  region?: string | null;
  /** Most frequent ingredient words across the country's recipes. */
  pantry: string[];
  /** Recipes flagged as festive/celebration dishes. */
  festiveDishes: { name: string; slug: string }[];
  recipeCount: number;
}

export const CountryGuideSection = ({
  country,
  region,
  pantry,
  festiveDishes,
  recipeCount,
}: CountryGuideSectionProps) => {
  const guide = getCountryGuide(country, region);

  return (
    <section aria-label={`${country} cuisine guide`} className="grid gap-6 lg:grid-cols-3 mb-10">
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-3">
            <BookOpen className="h-5 w-5 text-primary" /> The cuisine of {country}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{guide.intro}</p>

          {guide.flavours.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {guide.flavours.map((f) => (
                <Badge key={f} variant="secondary" className="capitalize">
                  {f}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="flex items-center gap-2 font-semibold mt-6 mb-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" /> How meals are structured
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {guide.mealStructure.map((m) => (
              <li key={m} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>

          <h3 className="flex items-center gap-2 font-semibold mt-6 mb-2">
            <PartyPopper className="h-4 w-4 text-primary" /> Festive &amp; ceremonial cooking
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{guide.festive}</p>

          {festiveDishes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {festiveDishes.slice(0, 8).map((d) => (
                <Link key={d.slug} to={`/recipes?recipe=${d.slug}`}>
                  <Badge variant="outline" className="hover:bg-accent transition-colors">
                    {d.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 font-semibold mb-3">
              <Sprout className="h-5 w-5 text-primary" /> Staple pantry
            </h2>
            {pantry.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                {pantry.map((p) => (
                  <li key={p} className="capitalize truncate">
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pantry staples are being catalogued for this country.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 font-semibold mb-2">
              <MapPin className="h-5 w-5 text-primary" /> At a glance
            </h2>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Region</dt>
                <dd className="font-medium text-right">{region || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Recipes documented</dt>
                <dd className="font-medium">{recipeCount}</dd>
              </div>
            </dl>
            <Link
              to={`/recipe-index?country=${encodeURIComponent(country)}`}
              className="inline-block mt-4 text-sm text-primary hover:underline"
            >
              Filter these recipes in the Recipe Index →
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
