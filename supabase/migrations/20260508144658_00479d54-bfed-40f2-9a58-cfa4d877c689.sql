ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS dietary_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS occasion_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allergen_tags text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON public.recipes USING GIN (dietary_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_occasion_tags ON public.recipes USING GIN (occasion_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_allergen_tags ON public.recipes USING GIN (allergen_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_country ON public.recipes (country);
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON public.recipes (slug);

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.dishes
SET slug = lower(regexp_replace(regexp_replace(name || '-' || COALESCE(country,''), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_dishes_slug ON public.dishes (slug);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view dishes" ON public.dishes;
CREATE POLICY "Anyone can view dishes" ON public.dishes FOR SELECT USING (true);