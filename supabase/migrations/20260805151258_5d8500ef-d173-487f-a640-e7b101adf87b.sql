ALTER TABLE public.cultural_stories ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS cultural_sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS history_sources jsonb NOT NULL DEFAULT '[]'::jsonb;