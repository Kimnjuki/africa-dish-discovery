import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Copy,
  Share2,
  Plus,
  Trash2,
  Pencil,
  Download,
  Repeat,
  Users,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { IngredientValue } from "@/types/content";
import {
  addManualGroceryItem,
  applyGrocerySubstitution,
  buildGroceryList,
  exportGroceryListText,
  groupGroceryByStall,
  removeGroceryItem,
  summarizeGroceryCost,
  toggleGroceryItemChecked,
  updateGroceryItemQuantity,
  type GroceryListItem,
} from "@/lib/groceryEngine";
import {
  MARKET_ORDER,
  MARKETS,
  formatMoney,
  getMarketPreference,
  setMarketPreference,
  type MarketId,
} from "@/lib/localMarket";
import { lookupRankedSubstitutions } from "@/lib/substitutionGraph";
import { saveGrocerySnapshot } from "@/lib/offlineStore";
import { buildCheckoutBundle } from "@/lib/commerceVendors";
import {
  getShareableHousehold,
  loadSharedGrocery,
  sharedRowsToGroceryItems,
  syncGroceryToHousehold,
} from "@/lib/sharedGrocery";
import { supabase } from "@/integrations/supabase/client";

export interface GroceryRecipeSource {
  recipeName?: string;
  ingredients: IngredientValue[] | null | undefined;
  recipeServings?: number | null;
  plannedServings?: number | null;
}

interface GroceryListPanelProps {
  planName: string;
  sources: GroceryRecipeSource[];
  onCostChange?: (total: number, marketId: MarketId) => void;
}

const GroceryListPanel = ({ planName, sources, onCostChange }: GroceryListPanelProps) => {
  const [marketId, setMarketId] = useState<MarketId>(() => getMarketPreference());
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

  const generated = useMemo(
    () => buildGroceryList(engineSources, { marketId }),
    [engineSources, marketId]
  );
  const [items, setItems] = useState<GroceryListItem[]>(generated);
  const [manualName, setManualName] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [swapForId, setSwapForId] = useState<string | null>(null);
  const [householdInfo, setHouseholdInfo] = useState<{
    householdId: string;
    name: string;
    shareGrocery: boolean;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [skipNextGenerate, setSkipNextGenerate] = useState(false);

  useEffect(() => {
    void getShareableHousehold()
      .then(setHouseholdInfo)
      .catch(() => setHouseholdInfo(null));
  }, []);

  useEffect(() => {
    if (skipNextGenerate) {
      setSkipNextGenerate(false);
      return;
    }
    setItems(generated);
    setEditingId(null);
    setSwapForId(null);
  }, [generated]);

  const groups = useMemo(() => groupGroceryByStall(items), [items]);
  const cost = useMemo(() => summarizeGroceryCost(items, marketId), [items, marketId]);
  const remaining = items.filter((i) => !i.checked).length;
  const checkoutOptions = useMemo(
    () => buildCheckoutBundle(items, planName, marketId),
    [items, planName, marketId]
  );

  useEffect(() => {
    onCostChange?.(cost.total, marketId);
  }, [cost.total, marketId, onCostChange]);

  const handleMarketChange = (id: MarketId) => {
    setMarketId(id);
    setMarketPreference(id);
  };

  const handleCopy = async () => {
    const text = exportGroceryListText(items, `Shopping list — ${planName}`, { marketId });
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Shopping list copied");
    } catch {
      toast.error("Could not copy list");
    }
  };

  const handleShare = async () => {
    const text = exportGroceryListText(items, `Shopping list — ${planName}`, { marketId });
    if (navigator.share) {
      try {
        await navigator.share({ title: `Shopping list — ${planName}`, text });
        return;
      } catch {
        // fall through
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Share unavailable — list copied instead");
    } catch {
      toast.error("Could not share list");
    }
  };

  const handleSaveOffline = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    saveGrocerySnapshot({
      userId: user?.id ?? null,
      planName,
      marketId,
      estimatedTotal: cost.total,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantityDisplay: i.quantityDisplay,
        stall: i.stall,
        estimatedCost: i.estimatedCost,
        checked: i.checked,
        substitutedFrom: i.substitutedFrom,
      })),
    });
    toast.success("List saved for offline use");
  };

  const handleSyncHousehold = async () => {
    if (!householdInfo?.shareGrocery) {
      toast.error("Enable grocery sharing on the Household page first");
      return;
    }
    setSyncing(true);
    try {
      const count = await syncGroceryToHousehold(
        householdInfo.householdId,
        items,
        marketId
      );
      toast.success(`Synced ${count} items to ${householdInfo.name}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not sync — apply the shared grocery migration if this is first use"
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadHousehold = async () => {
    if (!householdInfo) {
      toast.error("Join or create a household first");
      return;
    }
    setSyncing(true);
    try {
      const rows = await loadSharedGrocery(householdInfo.householdId);
      if (!rows.length) {
        toast.info("No shared list yet — sync from a member who has one");
        return;
      }
      setSkipNextGenerate(true);
      setItems(sharedRowsToGroceryItems(rows));
      const mid = rows[0]?.market_id as MarketId | undefined;
      if (mid && MARKETS[mid]) {
        setMarketId(mid);
        setMarketPreference(mid);
      }
      toast.success(`Loaded ${rows.length} shared items`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not load shared list");
    } finally {
      setSyncing(false);
    }
  };

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    setItems((prev) => addManualGroceryItem(prev, manualName, manualQty.trim(), "other", marketId));
    setManualName("");
    setManualQty("");
    toast.success("Item added");
  };

  const handleApplySwap = (itemId: string, substituteName: string) => {
    setItems((prev) => applyGrocerySubstitution(prev, itemId, substituteName, marketId));
    setSwapForId(null);
    toast.success(`Swapped to ${substituteName}`);
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
            {cost.pricedCount > 0 && (
              <Badge variant="outline">~{cost.formatted}</Badge>
            )}
            <Button type="button" variant="outline" size="sm" onClick={handleSaveOffline}>
              <Download className="mr-1.5 h-4 w-4" />
              Offline
            </Button>
            {householdInfo && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={syncing || !householdInfo.shareGrocery}
                  onClick={handleSyncHousehold}
                >
                  <Users className="mr-1.5 h-4 w-4" />
                  Sync household
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={syncing}
                  onClick={handleLoadHousehold}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Load shared
                </Button>
              </>
            )}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Grouped by market stall with local cost estimates. Tap swap when an ingredient is
            scarce or expensive.
          </p>
          <Select value={marketId} onValueChange={(v) => handleMarketChange(v as MarketId)}>
            <SelectTrigger className="w-full sm:w-52" aria-label="Market / currency">
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              {MARKET_ORDER.map((id) => (
                <SelectItem key={id} value={id}>
                  {MARKETS[id].label} ({MARKETS[id].currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Checkout & mobile money</h3>
            <p className="text-xs text-muted-foreground">
              Open a marketplace, send the list on WhatsApp, or follow M-Pesa / MoMo notes.
              LadhaQuest does not take payment — you settle with the vendor.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {checkoutOptions.map(({ vendor, url }) => (
              <a
                key={vendor.id}
                href={url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 rounded-md border p-3 text-sm hover:border-primary/50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {vendor.description}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{vendor.checkoutHint}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.stall} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
              {group.estimatedTotal > 0 && (
                <span className="text-xs text-muted-foreground">
                  ~{formatMoney(group.estimatedTotal, marketId)}
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const swaps =
                  swapForId === item.id
                    ? lookupRankedSubstitutions(item.name, {
                        marketId,
                        preferCheap: true,
                        limit: 4,
                      })
                    : [];
                return (
                  <li key={item.id} className="space-y-2">
                    <div
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
                          {item.estimatedCost != null && (
                            <span className="text-xs text-muted-foreground">
                              {formatMoney(item.estimatedCost, marketId)}
                            </span>
                          )}
                          {item.availability != null && item.availability < 45 && (
                            <Badge variant="outline" className="text-[10px]">
                              Hard to find
                            </Badge>
                          )}
                        </div>
                        {item.substitutedFrom && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Was: {item.substitutedFrom}
                          </p>
                        )}
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
                          aria-label={`Find substitute for ${item.name}`}
                          onClick={() =>
                            setSwapForId((id) => (id === item.id ? null : item.id))
                          }
                        >
                          <Repeat className="h-3.5 w-3.5" />
                        </Button>
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
                    </div>
                    {swaps.length > 0 && (
                      <ul className="ml-8 space-y-1 rounded-md border p-2">
                        {swaps.map((s) => (
                          <li key={s.name} className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{s.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {s.cookHint || s.notes}
                                {s.market.unitPrice != null
                                  ? ` · ~${formatMoney(s.market.unitPrice, marketId)}/${s.market.unit}`
                                  : ""}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleApplySwap(item.id, s.name)}
                            >
                              Use
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GroceryListPanel;
