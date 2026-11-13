import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Copy, Share2, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { IngredientValue } from "@/types/content";
import {
  addManualGroceryItem,
  buildGroceryList,
  exportGroceryListText,
  groupGroceryByAisle,
  removeGroceryItem,
  toggleGroceryItemChecked,
  updateGroceryItemQuantity,
  type GroceryListItem,
} from "@/lib/groceryEngine";

export interface GroceryRecipeSource {
  recipeName?: string;
  ingredients: IngredientValue[] | null | undefined;
  recipeServings?: number | null;
  plannedServings?: number | null;
}

interface GroceryListPanelProps {
  planName: string;
  sources: GroceryRecipeSource[];
}

const GroceryListPanel = ({ planName, sources }: GroceryListPanelProps) => {
  const engineSources = useMemo(
    () =>
      sources.map((s) => {
        const base = s.recipeServings && s.recipeServings > 0 ? s.recipeServings : 1;
        const planned = s.plannedServings && s.plannedServings > 0 ? s.plannedServings : base;
        return {
          recipeName: s.recipeName,
          ingredients: s.ingredients,
          servingsMultiplier: planned / base,
        };
      }),
    [sources]
  );

  const generated = useMemo(() => buildGroceryList(engineSources), [engineSources]);
  const [items, setItems] = useState<GroceryListItem[]>(generated);
  const [manualName, setManualName] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");

  useEffect(() => {
    setItems(generated);
    setEditingId(null);
  }, [generated]);

  const groups = useMemo(() => groupGroceryByAisle(items), [items]);
  const remaining = items.filter((i) => !i.checked).length;

  const handleCopy = async () => {
    const text = exportGroceryListText(items, `Shopping list — ${planName}`);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Shopping list copied");
    } catch {
      toast.error("Could not copy list");
    }
  };

  const handleShare = async () => {
    const text = exportGroceryListText(items, `Shopping list — ${planName}`);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Shopping list — ${planName}`, text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Share unavailable — list copied instead");
    } catch {
      toast.error("Could not share list");
    }
  };

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    setItems((prev) => addManualGroceryItem(prev, manualName, manualQty.trim()));
    setManualName("");
    setManualQty("");
    toast.success("Item added");
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shopping List for {planName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Add meals to your plan to generate a shopping list
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List for {planName}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{remaining} to buy</Badge>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-4 w-4" />
              Copy
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Quantities merged across recipes with unit conversion, grouped by market section.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Add item…"
            className="sm:flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
          />
          <Input
            value={manualQty}
            onChange={(e) => setManualQty(e.target.value)}
            placeholder="Qty"
            className="sm:w-28"
            onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
          />
          <Button type="button" onClick={handleAddManual} className="sm:w-auto">
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>

        {groups.map((group) => (
          <div key={group.aisle} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 rounded-lg bg-muted/50 p-3 ${
                    item.checked ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox
                    checked={!!item.checked}
                    onCheckedChange={() =>
                      setItems((prev) => toggleGroceryItemChecked(prev, item.id))
                    }
                    className="mt-1"
                    aria-label={`Mark ${item.name} bought`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className={`font-medium ${item.checked ? "line-through" : ""}`}
                      >
                        {item.name}
                      </span>
                      {editingId === item.id ? (
                        <Input
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="h-8 w-32"
                          autoFocus
                          onBlur={() => {
                            setItems((prev) =>
                              updateGroceryItemQuantity(prev, item.id, editQty.trim())
                            );
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setItems((prev) =>
                                updateGroceryItemQuantity(prev, item.id, editQty.trim())
                              );
                              setEditingId(null);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {item.quantityDisplay || "—"}
                        </span>
                      )}
                    </div>
                    {item.sources.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        From: {item.sources.slice(0, 3).join(", ")}
                        {item.sources.length > 3 ? ` +${item.sources.length - 3}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Edit quantity for ${item.name}`}
                      onClick={() => {
                        setEditingId(item.id);
                        setEditQty(item.quantityDisplay);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => setItems((prev) => removeGroceryItem(prev, item.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GroceryListPanel;
