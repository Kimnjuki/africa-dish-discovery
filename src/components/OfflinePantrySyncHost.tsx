import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOfflinePantrySync } from "@/hooks/useOfflinePantrySync";

/** Keeps pantry offline queue flush alive app-wide (not only on /pantry). */
export function OfflinePantrySyncHost() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useOfflinePantrySync(userId);
  return null;
}
