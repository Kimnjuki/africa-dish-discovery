import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import { readErrorMessage } from "@/lib/errors";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string | null;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface RecipeReviewsProps {
  recipeId: string;
  recipeName?: string;
  /** Optional callback when rating summary changes (for JSON-LD). */
  onSummaryChange?: (summary: { average: number; count: number } | null) => void;
}

export const RecipeReviews = ({ recipeId, recipeName, onSummaryChange }: RecipeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const loadRatingSummary = useCallback(async () => {
    try {
      const { data: summary } = await supabase
        .from("recipe_ratings_summary")
        .select("average_rating, total_reviews")
        .eq("recipe_id", recipeId)
        .maybeSingle();

      if (summary && summary.total_reviews && summary.total_reviews > 0) {
        const avg = Number(summary.average_rating) || 0;
        const count = Number(summary.total_reviews) || 0;
        setAverageRating(avg);
        setTotalReviews(count);
        onSummaryChange?.({ average: avg, count });
        return;
      }

      // Fallback if view empty
      const { data: allReviews } = await supabase
        .from("recipe_reviews")
        .select("rating")
        .eq("recipe_id", recipeId);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        setAverageRating(avg);
        setTotalReviews(allReviews.length);
        onSummaryChange?.({ average: avg, count: allReviews.length });
      } else {
        setAverageRating(0);
        setTotalReviews(0);
        onSummaryChange?.(null);
      }
    } catch (error) {
      console.error("Error loading rating summary:", error);
    }
  }, [recipeId, onSummaryChange]);

  const loadReviews = useCallback(
    async (currentUser: User | null) => {
      try {
        const { data, error } = await supabase
          .from("recipe_reviews")
          .select("*")
          .eq("recipe_id", recipeId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const reviewsWithProfiles = await Promise.all(
          (data || []).map(async (review) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", review.user_id)
              .single();

            return {
              ...review,
              profiles: { full_name: profile?.full_name || "Anonymous" },
            };
          })
        );

        setReviews(reviewsWithProfiles);

        if (currentUser) {
          const existingReview = reviewsWithProfiles.find((r) => r.user_id === currentUser.id);
          if (existingReview) {
            setUserReview(existingReview);
            setRating(existingReview.rating);
            setReviewText(existingReview.review_text || "");
            setShowForm(true);
          } else {
            setUserReview(null);
          }
        } else {
          setUserReview(null);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    },
    [recipeId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(authUser);
      await loadReviews(authUser);
      await loadRatingSummary();
    })();
    return () => {
      cancelled = true;
    };
  }, [recipeId, loadReviews, loadRatingSummary]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      if (userReview) {
        const { error } = await supabase
          .from("recipe_reviews")
          .update({
            rating,
            review_text: reviewText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userReview.id);

        if (error) throw error;
        toast.success("Review updated");
      } else {
        const { error } = await supabase.from("recipe_reviews").insert({
          recipe_id: recipeId,
          user_id: user.id,
          rating,
          review_text: reviewText || null,
        });

        if (error) throw error;
        toast.success("Thanks — your “I made this” rating is live");
      }

      await loadReviews(user);
      await loadRatingSummary();
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      toast.error(readErrorMessage(error) || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const { error } = await supabase.from("recipe_reviews").delete().eq("id", userReview.id);

      if (error) throw error;

      toast.success("Review deleted");
      setUserReview(null);
      setRating(0);
      setReviewText("");
      setShowForm(false);
      await loadReviews(user);
      await loadRatingSummary();
    } catch (error: unknown) {
      console.error("Error deleting review:", error);
      toast.error(readErrorMessage(error) || "Failed to delete review");
    }
  };

  const dishLabel = recipeName ? `“${recipeName}”` : "this recipe";

  return (
    <div className="space-y-6" id="reviews">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ratings & reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {totalReviews} cook{totalReviews !== 1 ? "s" : ""} rated this
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-md border border-dashed p-5 text-center">
              <ChefHat className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="font-medium">No ratings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first cook to rate {dishLabel}. We only show real reviews — nothing invented.
              </p>
            </div>
          )}

          {user ? (
            <div className="space-y-4 border-t pt-6">
              {!showForm && !userReview ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Did you cook this?</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark “I made this” and leave an honest star rating.
                    </p>
                  </div>
                  <Button variant="hero" onClick={() => setShowForm(true)}>
                    I made this
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold">
                    {userReview ? "Update your rating" : "I made this — rate it"}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Your rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Optional notes — tips, substitutions, or how it turned out"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={loading || rating === 0}
                      variant="hero"
                    >
                      {loading ? "Submitting..." : userReview ? "Update review" : "Submit rating"}
                    </Button>

                    {userReview && (
                      <Button onClick={handleDeleteReview} variant="outline">
                        Delete review
                      </Button>
                    )}

                    {!userReview && showForm && (
                      <Button variant="ghost" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="border-t pt-6">
              <p className="text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to mark “I made this” and leave a rating. Guest reviews are not accepted so scores
                stay honest.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">From cooks who made it</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">
                          {review.profiles?.full_name || "Anonymous"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </div>

                    {review.review_text && (
                      <p className="text-muted-foreground mt-2">{review.review_text}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
