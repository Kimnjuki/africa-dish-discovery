import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { resolveAlias, type ResolvedIngredient } from "@/lib/aliasResolver";

export type StructuredIngredient = {
  display_text: string;
  name: string;
  quantity: string;
  unit: string;
  ingredient_id?: string;
  slug?: string;
  is_optional: boolean;
  allergens?: string[];
  dietary_tags?: string[];
};

type Props = {
  value: StructuredIngredient[];
  onChange: (next: StructuredIngredient[]) => void;
};

function parseLine(line: string): { quantity: string; unit: string; name: string } {
  const trimmed = line.trim();
  const m = trimmed.match(/^(\d+[\/\d.]*)\s*([a-zA-Z]+)?\s+(.+)$/);
  if (m) {
    return { quantity: m[1], unit: m[2] || "", name: m[3].trim() };
  }
  return { quantity: "", unit: "", name: trimmed };
}

export function IngredientAliasPicker({ value, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [ambiguous, setAmbiguous] = useState<{
    query: string;
    matches: ResolvedIngredient[];
    parsed: ReturnType<typeof parseLine>;
  } | null>(null);

  const suggestedTags = useMemo(() => {
    const diets = new Set<string>();
    const allergens = new Set<string>();
    for (const row of value) {
      row.dietary_tags?.forEach((d) => diets.add(d));
      row.allergens?.forEach((a) => allergens.add(a));
    }
    return { diets: [...diets], allergens: [...allergens] };
  }, [value]);

  const addResolved = (parsed: ReturnType<typeof parseLine>, match?: ResolvedIngredient) => {
    const next: StructuredIngredient = {
      display_text: [parsed.quantity, parsed.unit, parsed.name].filter(Boolean).join(" "),
      name: match?.name || parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      ingredient_id: match?.ingredientId,
      slug: match?.slug,
      is_optional: false,
      allergens: match?.allergens || [],
      dietary_tags: match?.dietaryTags || [],
    };
    onChange([...value, next]);
    setDraft("");
    setAmbiguous(null);
  };

  const tryAdd = () => {
    const line = draft.trim();
    if (!line) return;
    const parsed = parseLine(line);
    const result = resolveAlias(parsed.name);
    if (result.ambiguous && result.matches.length > 1) {
      setAmbiguous({ query: parsed.name, matches: result.matches, parsed });
      return;
    }
    addResolved(parsed, result.matches[0]);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Ingredients *</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Add one per line. Local names (sukuma wiki, ugwu, egusi) resolve via the ingredient graph.
        </p>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 1 bunch sukuma wiki"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                tryAdd();
              }
            }}
          />
          <Button type="button" onClick={tryAdd} variant="secondary">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {ambiguous && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
          <p className="text-sm font-medium">
            “{ambiguous.query}” matches more than one ingredient — pick one:
          </p>
          <div className="flex flex-wrap gap-2">
            {ambiguous.matches.map((m) => (
              <Button
                key={m.ingredientId}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addResolved(ambiguous.parsed, m)}
              >
                {m.name}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => addResolved(ambiguous.parsed)}
            >
              Keep as written
            </Button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {value.map((ing, idx) => (
          <li
            key={`${ing.name}-${idx}`}
            className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{ing.display_text}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ing.slug && <Badge variant="secondary">{ing.slug}</Badge>}
                {ing.allergens?.map((a) => (
                  <Badge key={a} variant="destructive" className="text-[10px]">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              aria-label="Remove ingredient"
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {(suggestedTags.allergens.length > 0 || suggestedTags.diets.length > 0) && (
        <p className="text-xs text-muted-foreground">
          Auto-detected from graph:{" "}
          {[...suggestedTags.allergens, ...suggestedTags.diets].join(", ")}
        </p>
      )}
    </div>
  );
}
