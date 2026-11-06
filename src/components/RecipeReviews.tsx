import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import { readErrorMessage } from "@/lib/errors";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface RecipeReviewsProps {
  recipeId: string;
}

export const RecipeReviews = ({ recipeId }: RecipeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    checkAuth();
    loadReviews();
    loadRatingSummary();
  }, [recipeId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_reviews')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for reviews
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.user_id)
            .single();
          
          return {
            ...review,
            profiles: { full_name: profile?.full_name || 'Anonymous' }
          };
        })
      );

      setReviews(reviewsWithProfiles);
      
      // Check if current user has already reviewed
      if (user) {
        const existingReview = reviewsWithProfiles.find(r => r.user_id === user.id);
        if (existingReview) {
          setUserReview(existingReview);
          setRating(existingReview.rating);
          setReviewText(existingReview.review_text || "");
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const { data: allReviews } = await supabase
        .from('recipe_reviews')
        .select('rating')
        .eq('recipe_id', recipeId);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        setAverageRating(avg);
        setTotalReviews(allReviews.length);
      }
    } catch (error) {
      console.error('Error loading rating summary:', error);
    }
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
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('recipe_reviews')
          .update({
            rating,
            review_text: reviewText,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        const { error } = await supabase
          .from('recipe_reviews')
          .insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating,
            review_text: reviewText
          });

        if (error) throw error;
        toast.success("Review submitted successfully!");
      }

      await loadReviews();
      await loadRatingSummary();
      setReviewText("");
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      toast.error(readErrorMessage(error) || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const { error } = await supabase
        .from('recipe_reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast.success("Review deleted successfully!");
      setUserReview(null);
      setRating(0);
      setReviewText("");
      await loadReviews();
      await loadRatingSummary();
    } catch (error: unknown) {
      console.error('Error deleting review:', error);
      toast.error(readErrorMessage(error) || "Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ratings & Reviews
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
                        star <= averageRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground mb-6">No reviews yet. Be the first to review!</p>
          )}

          {/* Review Form */}
          {user && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold">
                {userReview ? "Update Your Review" : "Leave a Review"}
              </h3>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Your rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
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
                placeholder="Share your thoughts about this recipe (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={loading || rating === 0}
                  variant="hero"
                >
                  {loading ? "Submitting..." : (userReview ? "Update Review" : "Submit Review")}
                </Button>
                
                {userReview && (
                  <Button 
                    onClick={handleDeleteReview} 
                    variant="outline"
                  >
                    Delete Review
                  </Button>
                )}
              </div>
            </div>
          )}

          {!user && (
            <div className="border-t pt-6">
              <p className="text-muted-foreground">
                Please <a href="/auth" className="text-primary hover:underline">sign in</a> to leave a review
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Community Reviews</h3>
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
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {review.review_text && (
                      <p className="text-muted-foreground mt-2">
                        {review.review_text}
                      </p>
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