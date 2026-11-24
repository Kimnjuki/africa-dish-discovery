-- Ensure cooked-photo / made-it columns exist on recipe_reviews.
-- Production was missing these (client select of cooked_photo_url → HTTP 400).
ALTER TABLE public.recipe_reviews
  ADD COLUMN IF NOT EXISTS cooked_photo_url text,
  ADD COLUMN IF NOT EXISTS made_it boolean DEFAULT false;

COMMENT ON COLUMN public.recipe_reviews.cooked_photo_url IS
  'Optional photo of the finished dish uploaded by the cook';
COMMENT ON COLUMN public.recipe_reviews.made_it IS
  'True when the user marked I made this';
