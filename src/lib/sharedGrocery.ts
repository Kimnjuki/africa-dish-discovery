/**
 * Household shared grocery write-sync (F10).
 * Upserts the current list so co-members see the same market stall list.
 */

import { supabase } from "@/integrations/supabase/client";
import type { GroceryListItem } from "@/lib/groceryEngine";
import type { MarketId } from "@/lib/localMarket";
import { fetchMyHousehold } from "@/lib/household";

export type SharedGroceryRow = {
  id: string;
  household_id: string;
  client_key: string;
  ingredient_name: string;
  quantity_display: string | null;
  stall: string | null;
  estimated_cost: number | null;
  market_id: string | null;
  substituted_from: string | null;
  checked: boolean;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
};

export async function getShareableHousehold(): Promise<{
  householdId: string;
  name: string;
  shareGrocery: boolean;
} | null> {
  const { household } = await fetchMyHousehold();
  if (!household) return null;
  const shareGrocery =
    (household as { share_grocery?: boolean }).share_grocery !== false;
  return {
    householdId: household.id,
    name: household.name,
    shareGrocery,
  };
}

export async function setHouseholdShareGrocery(
  householdId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from("households")
    .update({ share_grocery: enabled, updated_at: new Date().toISOString() } as never)
    .eq("id", householdId);
  if (error) throw error;
}

export async function loadSharedGrocery(
  householdId: string
): Promise<SharedGroceryRow[]> {
  const { data, error } = await supabase
    .from("household_grocery_items" as never)
    .select("*")
    .eq("household_id", householdId)
    .order("ingredient_name", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as SharedGroceryRow[];
}

export function sharedRowsToGroceryItems(rows: SharedGroceryRow[]): GroceryListItem[] {
  return rows.map((row, index) => ({
    id: row.client_key || `shared-${row.id}-${index}`,
    name: row.ingredient_name,
    normalizedKey: row.client_key,
    quantity: null,
    unit: "",
    unitFamily: "unknown" as const,
    quantityDisplay: row.quantity_display || "",
    aisle: "other" as const,
    stall: (row.stall as GroceryListItem["stall"]) || "other",
    estimatedCost: row.estimated_cost,
    availability: null,
    substitutedFrom: row.substituted_from || undefined,
    sources: ["Household"],
    notes: row.notes ? [row.notes] : [],
    checked: row.checked,
  }));
}

export async function syncGroceryToHousehold(
  householdId: string,
  items: GroceryListItem[],
  marketId: MarketId
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required");

  const payload = items.map((item) => ({
    household_id: householdId,
    client_key: item.normalizedKey || item.id,
    ingredient_name: item.name,
    quantity_display: item.quantityDisplay || null,
    stall: item.stall || null,
    estimated_cost: item.estimatedCost,
    market_id: marketId,
    substituted_from: item.substitutedFrom || null,
    checked: !!item.checked,
    notes: item.notes?.join("; ") || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }));

  // Replace-set sync: delete removed keys, upsert current
  const { data: existing, error: readErr } = await supabase
    .from("household_grocery_items" as never)
    .select("id, client_key")
    .eq("household_id", householdId);
  if (readErr) throw readErr;

  const nextKeys = new Set(payload.map((p) => p.client_key));
  const toDelete = ((existing || []) as { id: string; client_key: string }[])
    .filter((row) => !nextKeys.has(row.client_key))
    .map((row) => row.id);

  if (toDelete.length) {
    const { error: delErr } = await supabase
      .from("household_grocery_items" as never)
      .delete()
      .in("id", toDelete);
    if (delErr) throw delErr;
  }

  if (payload.length) {
    const { error: upErr } = await supabase
      .from("household_grocery_items" as never)
      .upsert(payload as never, { onConflict: "household_id,client_key" });
    if (upErr) throw upErr;
  }

  return payload.length;
}
