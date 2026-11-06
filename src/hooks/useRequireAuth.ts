import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface UseRequireAuthOptions {
  redirectTo?: string;
  showToast?: boolean;
  toastMessage?: string;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const {
    redirectTo = "/auth",
    showToast = true,
    toastMessage = "Please sign in to access this feature"
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const requireAuth = (callback?: () => void): boolean => {
    if (!user) {
      if (showToast) {
        toast.info(toastMessage, {
          action: {
            label: "Sign In",
            onClick: () => navigate(redirectTo)
          }
        });
      }
      return false;
    }
    if (callback) {
      callback();
    }
    return true;
  };

  const navigateWithAuth = (path: string) => {
    if (!user) {
      if (showToast) {
        toast.info(toastMessage, {
          action: {
            label: "Sign In",
            onClick: () => navigate(redirectTo)
          }
        });
      }
      return;
    }
    navigate(path);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    requireAuth,
    navigateWithAuth
  };
};

export default useRequireAuth;
