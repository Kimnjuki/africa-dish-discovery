import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsAuthenticated(false);
          setShowOnboarding(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Check if user has a taste profile
        const { data: tasteProfile } = await supabase
          .from("user_taste_profiles")
          .select("id, training_data_points")
          .eq("user_id", session.user.id)
          .single();

        // Show onboarding if no taste profile exists
        if (!tasteProfile) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        checkOnboardingStatus();
      } else if (event === "SIGNED_OUT") {
        setShowOnboarding(false);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    // Store skip preference in localStorage to not show again this session
    localStorage.setItem("onboarding_skipped", "true");
  };

  const triggerOnboarding = () => {
    if (isAuthenticated) {
      setShowOnboarding(true);
    }
  };

  return {
    showOnboarding,
    isLoading,
    isAuthenticated,
    completeOnboarding,
    skipOnboarding,
    triggerOnboarding,
  };
}
