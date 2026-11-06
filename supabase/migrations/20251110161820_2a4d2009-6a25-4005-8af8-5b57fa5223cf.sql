-- Create recipe_reviews table for ratings and reviews
CREATE TABLE IF NOT EXISTS public.recipe_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_reviews
CREATE POLICY "Anyone can view recipe reviews"
ON public.recipe_reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.recipe_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.recipe_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.recipe_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_recipe_reviews_recipe_id ON public.recipe_reviews(recipe_id);
CREATE INDEX idx_recipe_reviews_user_id ON public.recipe_reviews(user_id);
CREATE INDEX idx_recipe_reviews_rating ON public.recipe_reviews(rating);

-- Add user preferences columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dietary_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_cuisines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_difficulty text,
ADD COLUMN IF NOT EXISTS cooking_time_preference integer;

-- Create a view for recipe ratings summary
CREATE OR REPLACE VIEW public.recipe_ratings_summary AS
SELECT 
  recipe_id,
  COUNT(*) as total_reviews,
  AVG(rating)::numeric(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
FROM public.recipe_reviews
GROUP BY recipe_id;

-- Add trigger for updating recipe_reviews updated_at
CREATE TRIGGER update_recipe_reviews_updated_at
BEFORE UPDATE ON public.recipe_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.recipe_reviews IS 'Stores user ratings and reviews for recipes';
COMMENT ON COLUMN public.profiles.dietary_restrictions IS 'User dietary restrictions (e.g., vegan, gluten-free)';
COMMENT ON COLUMN public.profiles.favorite_cuisines IS 'User favorite cuisine types';
COMMENT ON COLUMN public.profiles.preferred_difficulty IS 'User preferred cooking difficulty level';
COMMENT ON COLUMN public.profiles.cooking_time_preference IS 'User preferred maximum cooking time in minutes';