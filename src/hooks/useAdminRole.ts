import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const useAdminRole = () => {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth({ showToast: false });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (authLoading) return;
      if (!user) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load roles", error);
        setIsAdmin(false);
      } else {
        const roles = (data || []).map((r) => r.role);
        setIsAdmin(roles.includes("admin") || roles.includes("moderator"));
      }
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading: authLoading || loading,
  };
};
