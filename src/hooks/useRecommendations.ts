import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  name: string;
  summary: string;
  country: string;
  cuisine_type: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  tags: string[];
  image_url: string;
  recommendation_reason?: string;
  score?: number;
}

interface RecommendationsState {
  recommendations: Recipe[];
  isLoading: boolean;
  error: string | null;
  category: string;
  personalized: boolean;
}

export function useRecommendations(category: string = "for_you", limit: number = 10) {
  const [state, setState] = useState<RecommendationsState>({
    recommendations: [],
    isLoading: true,
    error: null,
    category,
    personalized: false,
  });

  const fetchRecommendations = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        "https://qfctezxqcomhrasrsvjg.supabase.co/functions/v1/ai-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            action: "get_recommendations",
            category,
            limit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      setState({
        recommendations: data.recommendations || [],
        isLoading: false,
        error: null,
        category: data.category,
        personalized: data.personalized,
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [category, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const trackInteraction = useCallback(async (
    recipeId: string,
    interactionType: "view" | "cook" | "save" | "share" | "rate" | "abandon",
    metadata?: Record<string, unknown>
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return; // Only track for authenticated users

      await fetch(
        "https://qfctezxqcomhrasrsvjg.supabase.co/functions/v1/ai-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "track_interaction",
            recipe_id: recipeId,
            interaction_type: interactionType,
            metadata,
          }),
        }
      );
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  }, []);

  const getSimilarRecipes = useCallback(async (recipeId: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(
        "https://qfctezxqcomhrasrsvjg.supabase.co/functions/v1/ai-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_similar",
            recipe_id: recipeId,
            limit: 6,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch similar recipes");
      }

      const data = await response.json();
      return data.similar_recipes || [];
    } catch (error) {
      console.error("Error fetching similar recipes:", error);
      return [];
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "https://qfctezxqcomhrasrsvjg.supabase.co/functions/v1/ai-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "refresh_profile",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh profile");
      }

      const data = await response.json();
      
      // Refresh recommendations after profile update
      await fetchRecommendations();
      
      return data;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      throw error;
    }
  }, [fetchRecommendations]);

  return {
    ...state,
    refetch: fetchRecommendations,
    trackInteraction,
    getSimilarRecipes,
    refreshProfile,
  };
}
