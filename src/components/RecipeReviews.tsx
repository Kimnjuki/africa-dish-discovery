import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, ChefHat, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import { readErrorMessage } from "@/lib/errors";
import { markCooked } from "@/lib/recipeBox";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  cooked_photo_url?: string | null;
  created_at: string | null;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface RecipeReviewsProps {
  recipeId: string;
  recipeName?: string;
  recipeSlug?: string;
  recipeCountry?: string;
  /** Optional callback when rating summary changes (for JSON-LD). */
  onSummaryChange?: (summary: { average: number; count: number } | null) => void;
}

async function compressImage(file: File, maxEdge = 960, quality = 0.72): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process photo");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not compress photo"))),
      "image/jpeg",
      quality
    );
  });
}

export const RecipeReviews = ({
  recipeId,
  recipeName,
  recipeSlug,
  recipeCountry,
  onSummaryChange,
}: RecipeReviewsProps) => {
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          .select(
            "id, recipe_id, user_id, rating, review_text, cooked_photo_url, created_at, updated_at"
          )
          .eq("recipe_id", recipeId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const userIds = [...new Set((data || []).map((r) => r.user_id).filter(Boolean))];
        const nameById = new Map<string, string>();
        if (userIds.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          for (const p of profiles || []) {
            nameById.set(p.id, p.full_name || "Anonymous");
          }
        }

        const reviewsWithProfiles = (data || []).map((review) => ({
          ...review,
          profiles: { full_name: nameById.get(review.user_id) || "Anonymous" },
        }));

        setReviews(reviewsWithProfiles);

        if (currentUser) {
          const existingReview = reviewsWithProfiles.find((r) => r.user_id === currentUser.id);
          if (existingReview) {
            setUserReview(existingReview);
            setRating(existingReview.rating);
            setReviewText(existingReview.review_text || "");
            setPhotoPreview(existingReview.cooked_photo_url || null);
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

  const uploadCookedPhoto = async (uid: string): Promise<string | null> => {
    if (!photoFile) return photoPreview && photoPreview.startsWith("http") ? photoPreview : null;
    try {
      const blob = await compressImage(photoFile);
      const path = `${uid}/${recipeId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("cooked-photos")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("cooked-photos").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.warn("Cooked photo upload failed; keeping local preview", error);
      // Keep data-URL preview locally so the cook still sees their photo
      return photoPreview;
    }
  };

  const handlePhotoPick = (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(userReview?.cooked_photo_url || null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a photo");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Photo must be under 8MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
      const cookedPhotoUrl = await uploadCookedPhoto(user.id);
      // Photos and long reviews need a light moderation gate; simple star ratings can go live.
      const needsModeration = Boolean(cookedPhotoUrl) || (reviewText?.trim().length || 0) > 280;
      const payload = {
        rating,
        review_text: reviewText || null,
        made_it: true,
        cooked_photo_url: cookedPhotoUrl,
        moderation_status: needsModeration ? "pending" : "approved",
        updated_at: new Date().toISOString(),
      };

      if (userReview) {
        const { error } = await supabase
          .from("recipe_reviews")
          .update(payload)
          .eq("id", userReview.id);

        if (error) {
          // Column may not be migrated yet — fall back to text-only update
          const { error: fallbackError } = await supabase
            .from("recipe_reviews")
            .update({
              rating,
              review_text: reviewText,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userReview.id);
          if (fallbackError) throw fallbackError;
        }
        toast.success("Review updated");
      } else {
        const { error } = await supabase.from("recipe_reviews").insert({
          recipe_id: recipeId,
          user_id: user.id,
          ...payload,
        });

        if (error) {
          const { error: fallbackError } = await supabase.from("recipe_reviews").insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating,
            review_text: reviewText || null,
          });
          if (fallbackError) throw fallbackError;
        }
        toast.success(
          needsModeration
            ? "Thanks — photo/long reviews appear after a quick check"
            : "Thanks — your “I made this” rating is live"
        );
      }

      if (recipeSlug && recipeName) {
        markCooked(recipeId, recipeSlug, recipeName, recipeCountry);
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

                  <div className="space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handlePhotoPick(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {photoPreview ? "Change cooked photo" : "Add cooked photo"}
                      </Button>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePhotoPick(null)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Your cooked dish"
                        className="h-40 w-full max-w-sm rounded-md object-cover"
                      />
                    )}
                  </div>

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
                    {review.cooked_photo_url && (
                      <img
                        src={review.cooked_photo_url}
                        alt={`Cooked ${recipeName || "dish"}`}
                        className="mt-3 max-h-64 w-full max-w-md rounded-md object-cover"
                        loading="lazy"
                      />
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
