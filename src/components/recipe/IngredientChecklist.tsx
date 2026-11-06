import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IngredientSubstitutionPopover } from "@/components/IngredientSubstitutionPopover";
import { ShoppingCart, ListChecks } from "lucide-react";
import { prepareIngredientLine, ingredientToText, type UnitSystem } from "@/lib/recipeUnits";
import type { IngredientValue } from "@/types/content";

interface IngredientChecklistProps {
  ingredients: IngredientValue[] | null;
  multiplier: number;
  country: string;
  dishName: string;
  onAddToShoppingList?: (ingredient: string) => void;
}

/**
 * Checkable ingredient list with live quantity scaling and a
 * metric / US customary unit toggle.
 */
export const IngredientChecklist = ({
  ingredients,
  multiplier,
  country,
  dishName,
  onAddToShoppingList,
}: IngredientChecklistProps) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [system, setSystem] = useState<UnitSystem>("original");

  const lines = useMemo(() => {
    if (!Array.isArray(ingredients)) return [] as { raw: string; display: string }[];
    return ingredients.map((ing) => ({
      raw: ingredientToText(ing),
      display: prepareIngredientLine(ing, multiplier, system),
    }));
  }, [ingredients, multiplier, system]);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  if (lines.length === 0) {
    return (
      <Card id="recipe-ingredients" className="scroll-mt-24">
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No ingredients listed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="recipe-ingredients" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Ingredients
            <Badge variant="secondary" className="ml-1">
              {checkedCount}/{lines.length}
            </Badge>
          </CardTitle>
          <ToggleGroup
            type="single"
            size="sm"
            value={system}
            onValueChange={(v) => v && setSystem(v as UnitSystem)}
            aria-label="Unit system"
          >
            <ToggleGroupItem value="original">Original</ToggleGroupItem>
            <ToggleGroupItem value="metric">Metric</ToggleGroupItem>
            <ToggleGroupItem value="us">US</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {lines.map((line, index) => (
            <li
              key={index}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 group"
            >
              <Checkbox
                id={`ing-${index}`}
                checked={!!checked[index]}
                onCheckedChange={(v) =>
                  setChecked((prev) => ({ ...prev, [index]: v === true }))
                }
              />
              <label
                htmlFor={`ing-${index}`}
                className={`flex-1 text-sm cursor-pointer ${
                  checked[index] ? "line-through text-muted-foreground" : ""
                }`}
              >
                {line.display}
              </label>
              <div className="flex items-center">
                <IngredientSubstitutionPopover
                  ingredient={line.raw}
                  country={country}
                  dishName={dishName}
                />
                {onAddToShoppingList && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Add ${line.raw} to shopping list`}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    onClick={() => onAddToShoppingList(line.raw)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default IngredientChecklist;
