import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  clearPantryQueue,
  getPantryQueue,
  getPantrySnapshot,
  savePantrySnapshot,
  setPantryQueue,
  type PantryQueueOp,
} from "@/lib/offlineStore";
import { toast } from "sonner";

/**
 * Flushes queued pantry mutations when the browser comes back online.
 */
export function useOfflinePantrySync(userId: string | null | undefined) {
  const flushing = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const flush = async () => {
      if (flushing.current || !navigator.onLine) return;
      const queue = getPantryQueue();
      if (queue.length === 0) return;

      flushing.current = true;
      const remaining: PantryQueueOp[] = [];
      let applied = 0;

      try {
        for (const op of queue) {
          try {
            if (op.type === "insert") {
              const { error } = await supabase.from("pantry_items").insert({
                user_id: userId,
                ingredient_name: op.payload.ingredient_name,
                quantity: op.payload.quantity ?? 1,
                unit: op.payload.unit ?? "piece",
                expires_at: op.payload.expires_at ?? null,
              });
              if (error) throw error;
              applied += 1;
            } else if (op.type === "update") {
              // Skip temp local ids that never reached the server
              if (String(op.payload.id).startsWith("local_")) {
                applied += 1;
                continue;
              }
              const { error } = await supabase
                .from("pantry_items")
                .update({
                  ingredient_name: op.payload.ingredient_name,
                  quantity: op.payload.quantity,
                  unit: op.payload.unit,
                  expires_at: op.payload.expires_at,
                })
                .eq("id", op.payload.id)
                .eq("user_id", userId);
              if (error) throw error;
              applied += 1;
            } else if (op.type === "delete") {
              if (String(op.payload.id).startsWith("local_")) {
                applied += 1;
                continue;
              }
              const { error } = await supabase
                .from("pantry_items")
                .delete()
                .eq("id", op.payload.id)
                .eq("user_id", userId);
              if (error) throw error;
              applied += 1;
            }
          } catch (err) {
            console.error("Pantry queue op failed", op, err);
            remaining.push(op);
          }
        }

        if (remaining.length === 0) {
          clearPantryQueue();
        } else {
          setPantryQueue(remaining);
        }

        // Refresh snapshot from server after successful flush
        if (applied > 0) {
          const { data } = await supabase
            .from("pantry_items")
            .select("*")
            .eq("user_id", userId)
            .order("added_at", { ascending: false });
          if (data) savePantrySnapshot(userId, data);
          toast.success(
            remaining.length === 0
              ? `Synced ${applied} offline pantry change${applied === 1 ? "" : "s"}`
              : `Synced ${applied}; ${remaining.length} still pending`
          );
        }
      } finally {
        flushing.current = false;
      }
    };

    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [userId]);
}

export function pendingPantryCount(): number {
  return getPantryQueue().length;
}

export function hasOfflinePantry(userId?: string | null): boolean {
  return Boolean(getPantrySnapshot(userId));
}
