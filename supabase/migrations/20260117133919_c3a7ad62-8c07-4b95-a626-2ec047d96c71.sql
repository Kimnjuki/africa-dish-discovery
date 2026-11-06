-- Add global comparison columns to recipes table
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS world_equivalent_dish text,
ADD COLUMN IF NOT EXISTS global_rank_taste_atlas integer,
ADD COLUMN IF NOT EXISTS cultural_heritage_status text DEFAULT 'None',
ADD COLUMN IF NOT EXISTS umami_level integer CHECK (umami_level >= 1 AND umami_level <= 10),
ADD COLUMN IF NOT EXISTS carbon_footprint_score integer CHECK (carbon_footprint_score >= 1 AND carbon_footprint_score <= 100);

-- Add comments for documentation
COMMENT ON COLUMN public.recipes.world_equivalent_dish IS 'Global cuisine equivalent (e.g., Spanish Paella for Jollof Rice)';
COMMENT ON COLUMN public.recipes.global_rank_taste_atlas IS 'TasteAtlas global ranking position';
COMMENT ON COLUMN public.recipes.cultural_heritage_status IS 'Heritage status: UNESCO, Regional Heritage, Emerging, or None';
COMMENT ON COLUMN public.recipes.umami_level IS 'Umami flavor intensity on scale of 1-10';
COMMENT ON COLUMN public.recipes.carbon_footprint_score IS 'Environmental impact score 1-100 (lower is better)';