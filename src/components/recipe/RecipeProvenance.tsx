import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Languages, Users, CalendarHeart, BookOpen, MessageCircleWarning } from "lucide-react";
import { SourceCitations } from "@/components/cultural/SourceCitations";
import { toSlug } from "@/lib/recipeText";

export interface RecipeProvenanceProps {
  recipeName: string;
  recipeSlug?: string | null;
  country?: string | null;
  region?: string | null;
  localNames?: string[] | null;
  ethnicGroup?: string | null;
  occasionTags?: string[] | null;
  history?: string | null;
  historySources?: unknown;
  /** Prefer a short blurb on the provenance card; full history can live below. */
  historyMaxChars?: number;
}

function uniqueNames(names?: string[] | null): string[] {
  if (!names?.length) return [];
  return [...new Set(names.map((n) => n.trim()).filter(Boolean))];
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

/**
 * Cultural authenticity block: place, local names, people, occasions, history teaser,
 * plus a light “suggest a correction” path via Contact.
 */
export function RecipeProvenance({
  recipeName,
  recipeSlug,
  country,
  region,
  localNames,
  ethnicGroup,
  occasionTags,
  history,
  historySources,
  historyMaxChars = 320,
}: RecipeProvenanceProps) {
  const aka = uniqueNames(localNames);
  const occasions = uniqueNames(occasionTags);
  const hasPlace = Boolean(country || region);
  const hasHistory = Boolean(history?.trim());
  const hasAny =
    hasPlace || aka.length > 0 || Boolean(ethnicGroup) || occasions.length > 0 || hasHistory;

  if (!hasAny) return null;

  const correctionSubject = encodeURIComponent(`Correction: ${recipeName}`);
  const correctionMessage = encodeURIComponent(
    `Recipe: ${recipeName}${recipeSlug ? ` (/recipe/${recipeSlug})` : ""}\n\nWhat should we correct?\n`
  );
  const correctionHref = `/contact?subject=${correctionSubject}&message=${correctionMessage}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Provenance & authenticity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {hasPlace && (
          <div className="flex flex-wrap items-center gap-2">
            {country && (
              <Link to={`/country/${toSlug(country)}`}>
                <Badge variant="secondary">{country}</Badge>
              </Link>
            )}
            {region && <Badge variant="outline">{region}</Badge>}
          </div>
        )}

        {aka.length > 0 && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Languages className="h-4 w-4 text-primary" />
              Also known as
            </p>
            <p className="text-muted-foreground italic">{aka.join(" · ")}</p>
          </div>
        )}

        {ethnicGroup && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Cultural roots
            </p>
            <p className="text-muted-foreground">{ethnicGroup}</p>
          </div>
        )}

        {occasions.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
              <CalendarHeart className="h-4 w-4 text-primary" />
              Occasions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {occasions.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hasHistory && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              History & context
            </p>
            <p className="whitespace-pre-line text-muted-foreground">
              {truncate(history!.trim(), historyMaxChars)}
            </p>
            <SourceCitations sources={historySources} />
            {recipeSlug && (
              <Button asChild variant="link" className="mt-1 h-auto px-0">
                <Link to={`/dish/${recipeSlug}`}>Full encyclopedia entry</Link>
              </Button>
            )}
          </div>
        )}

        <div className="border-t pt-3">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link to={correctionHref}>
              <MessageCircleWarning className="mr-2 h-4 w-4" />
              Suggest a correction
            </Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Spot a naming, region, or history error? Help us keep this dish culturally accurate.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
