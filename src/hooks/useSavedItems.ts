import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export type SavedItemType = "recipe" | "dish" | "country";

export interface SavedItem {
  id: string;
  item_type: SavedItemType;
  item_id: string | null;
  item_slug: string;
  label: string | null;
  created_at: string;
}

export interface SaveTarget {
  type: SavedItemType;
  slug: string;
  id?: string | null;
  label?: string | null;
}

const keyOf = (type: SavedItemType, slug: string) => `${type}:${slug}`;

/**
 * Personal saved list (dishes, recipes, countries) backed by public.saved_items.
 * Rows are private per account via RLS.
 */
export function useSavedItems() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_items")
      .select("id,item_type,item_id,item_slug,label,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading saved items:", error);
      return;
    }
    setItems((data || []) as SavedItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      if (data.user) await load(data.user.id);
      if (mounted) setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        void load(session.user.id);
      } else {
        setItems([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [load]);

  const isSaved = useCallback(
    (type: SavedItemType, slug: string) =>
      items.some((i) => keyOf(i.item_type, i.item_slug) === keyOf(type, slug)),
    [items]
  );

  const promptSignIn = useCallback(() => {
    toast.info("Sign in to save this to your list", {
      action: { label: "Sign In", onClick: () => navigate("/auth") },
    });
  }, [navigate]);

  const toggleSaved = useCallback(
    async (target: SaveTarget) => {
      if (!user) {
        promptSignIn();
        return false;
      }
      const existing = items.find(
        (i) => keyOf(i.item_type, i.item_slug) === keyOf(target.type, target.slug)
      );

      if (existing) {
        const { error } = await supabase.from("saved_items").delete().eq("id", existing.id);
        if (error) {
          toast.error("Could not remove that item");
          return false;
        }
        setItems((prev) => prev.filter((i) => i.id !== existing.id));
        toast.success("Removed from your list");
        return false;
      }

      const { data, error } = await supabase
        .from("saved_items")
        .insert({
          user_id: user.id,
          item_type: target.type,
          item_id: target.id ?? null,
          item_slug: target.slug,
          label: target.label ?? null,
        })
        .select("id,item_type,item_id,item_slug,label,created_at")
        .single();

      if (error) {
        console.error("Error saving item:", error);
        toast.error("Could not save that item");
        return false;
      }
      setItems((prev) => [data as SavedItem, ...prev]);
      toast.success("Saved to your list");
      return true;
    },
    [items, promptSignIn, user]
  );

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("saved_items").delete().eq("id", id);
    if (error) {
      toast.error("Could not remove that item");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed from your list");
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    items,
    loading,
    isSaved,
    toggleSaved,
    remove,
    refresh: () => (user ? load(user.id) : Promise.resolve()),
  };
}

export default useSavedItems;
