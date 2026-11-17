import { Badge } from "@/components/ui/badge";
import { Check, Minus } from "lucide-react";

function hasCitedSource(sources: unknown): boolean {
  if (!sources) return false;
  if (Array.isArray(sources)) return sources.length > 0;
  if (typeof sources === "object") return Object.keys(sources as object).length > 0;
  return String(sources).trim().length > 0;
}

export function RecipeRecordStatus({
  hasPhoto,
  localNameCount,
  ingredientCount,
  stepCount,
  sources,
}: {
  hasPhoto: boolean;
  localNameCount: number;
  ingredientCount: number;
  stepCount: number;
  sources: unknown;
}) {
  const cited = hasCitedSource(sources);
  const rows: Array<[boolean, string]> = [
    [hasPhoto, "Photo"],
    [localNameCount > 0, "Local name"],
    [ingredientCount > 0, "Ingredients"],
    [stepCount > 0, "Method"],
    [cited, "Cited source"],
  ];
  const done = rows.filter(([ok]) => ok).length;

  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-medium">Recipe record</p>
        <Badge variant={done === rows.length ? "secondary" : "outline"}>
          {done}/{rows.length} complete
        </Badge>
      </div>
      <ul className="mb-2 grid grid-cols-2 gap-1">
        {rows.map(([ok, label]) => (
          <li key={label} className="flex items-center gap-1.5 text-muted-foreground">
            {ok ? <Check className="h-3.5 w-3.5 text-primary" /> : <Minus className="h-3.5 w-3.5" />}
            {label}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        {cited
          ? "Source cited. This page is an editorial summary for cooking, not a transfer of exclusive rights."
          : "Permission not recorded. Use it to cook here. Don’t republish the wording as your own."}
      </p>
    </div>
  );
}
