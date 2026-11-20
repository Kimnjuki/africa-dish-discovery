-- S1-03: African Ingredient Graph — schema migration
-- Sprint 1, LadhaQuest. Idempotent: safe to run multiple times.
-- Extends ingredients, creates ingredient_aliases, extends ingredient_substitutions,
-- creates ingredient_availability, extends recipe_ingredients, creates ai_audit_log.

-- ─── pg_trgm (best-effort; already enabled on most Supabase projects) ──────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1) Extend public.ingredients with graph + provenance fields
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS slug                  text,
  ADD COLUMN IF NOT EXISTS canonical_name        text,
  ADD COLUMN IF NOT EXISTS scientific_name       text,
  ADD COLUMN IF NOT EXISTS food_group            text,
  ADD COLUMN IF NOT EXISTS flavor_profile        jsonb,
  ADD COLUMN IF NOT EXISTS texture_profile       jsonb,
  ADD COLUMN IF NOT EXISTS function_tags         text[],
  ADD COLUMN IF NOT EXISTS cooking_methods       text[],
  ADD COLUMN IF NOT EXISTS nutrition             jsonb,
  ADD COLUMN IF NOT EXISTS nutrition_source_id   text,
  ADD COLUMN IF NOT EXISTS allergens             text[],
  ADD COLUMN IF NOT EXISTS dietary_tags          text[],
  ADD COLUMN IF NOT EXISTS default_unit          text,
  ADD COLUMN IF NOT EXISTS gram_per_unit         numeric,
  ADD COLUMN IF NOT EXISTS safety_flags          text[],
  ADD COLUMN IF NOT EXISTS storage_notes         text,
  ADD COLUMN IF NOT EXISTS seasonality           jsonb,
  ADD COLUMN IF NOT EXISTS image_id              text,
  ADD COLUMN IF NOT EXISTS source                text,
  ADD COLUMN IF NOT EXISTS source_url            text,
  ADD COLUMN IF NOT EXISTS licence               text,
  ADD COLUMN IF NOT EXISTS imported_at           timestamptz,
  ADD COLUMN IF NOT EXISTS confidence            numeric,
  ADD COLUMN IF NOT EXISTS review_status         text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS reviewed_by           text,
  ADD COLUMN IF NOT EXISTS reviewed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS version               int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at            timestamptz;

-- Backfill slug from name (lowercase; non-alphanum runs → hyphen; trim hyphens)
UPDATE public.ingredients
  SET slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
  WHERE slug IS NULL AND name IS NOT NULL;

-- Backfill canonical_name from name where null
UPDATE public.ingredients
  SET canonical_name = name
  WHERE canonical_name IS NULL AND name IS NOT NULL;

-- Unique constraint on slug (guard with existence check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ingredients'::regclass
      AND conname  = 'ingredients_slug_key'
  ) THEN
    ALTER TABLE public.ingredients ADD CONSTRAINT ingredients_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ingredients_slug_idx          ON public.ingredients (slug);
CREATE INDEX IF NOT EXISTS ingredients_review_status_idx ON public.ingredients (review_status);
CREATE INDEX IF NOT EXISTS ingredients_food_group_idx    ON public.ingredients (food_group);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2) ingredient_aliases
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ingredient_aliases (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id         uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  alias                 text        NOT NULL,
  alias_normalized      text        NOT NULL,
  language              text        NOT NULL DEFAULT 'en',
  country_code          text        NOT NULL DEFAULT '',
  region                text,
  is_primary_local_name boolean     NOT NULL DEFAULT false,
  match_confidence      numeric     NOT NULL DEFAULT 1,
  is_ambiguous          boolean     NOT NULL DEFAULT false,
  source                text,
  licence               text,
  review_status         text        NOT NULL DEFAULT 'approved',
  reviewed_by           text,
  reviewed_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alias_normalized, language, country_code)
);

CREATE INDEX IF NOT EXISTS ingredient_aliases_ingredient_idx
  ON public.ingredient_aliases (ingredient_id);

CREATE INDEX IF NOT EXISTS ingredient_aliases_normalized_idx
  ON public.ingredient_aliases (alias_normalized);

-- GIN trigram index for fuzzy alias search (requires pg_trgm)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename   = 'ingredient_aliases'
        AND indexname   = 'ingredient_aliases_trgm_idx'
    ) THEN
      EXECUTE 'CREATE INDEX ingredient_aliases_trgm_idx
        ON public.ingredient_aliases USING gin (alias_normalized gin_trgm_ops)';
    END IF;
  END IF;
END $$;

ALTER TABLE public.ingredient_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ingredient_aliases" ON public.ingredient_aliases;
CREATE POLICY "Public read ingredient_aliases"
  ON public.ingredient_aliases
  FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3) Extend public.ingredient_substitutions with review / AI-safety fields
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.ingredient_substitutions
  ADD COLUMN IF NOT EXISTS substitution_type    text,
  ADD COLUMN IF NOT EXISTS ratio_unit           text,
  ADD COLUMN IF NOT EXISTS confidence           numeric,
  ADD COLUMN IF NOT EXISTS flavor_impact        text,
  ADD COLUMN IF NOT EXISTS texture_impact       text,
  ADD COLUMN IF NOT EXISTS cooking_adjustments  jsonb,
  ADD COLUMN IF NOT EXISTS dietary_tags         text[],
  ADD COLUMN IF NOT EXISTS allergens            text[],
  ADD COLUMN IF NOT EXISTS context_recipe_types text[],
  ADD COLUMN IF NOT EXISTS is_verified          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status        text    NOT NULL DEFAULT 'proposed',
  ADD COLUMN IF NOT EXISTS source               text,
  ADD COLUMN IF NOT EXISTS model_version        text,
  ADD COLUMN IF NOT EXISTS reviewed_by          text,
  ADD COLUMN IF NOT EXISTS reviewed_at          timestamptz,
  ADD COLUMN IF NOT EXISTS licence              text;

CREATE INDEX IF NOT EXISTS ingredient_substitutions_original_idx
  ON public.ingredient_substitutions (original_ingredient_id);

CREATE INDEX IF NOT EXISTS ingredient_substitutions_substitute_idx
  ON public.ingredient_substitutions (substitute_ingredient_id);

CREATE INDEX IF NOT EXISTS ingredient_substitutions_review_idx
  ON public.ingredient_substitutions (review_status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4) ingredient_availability
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ingredient_availability (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id      uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  country_code       text        NOT NULL,
  region             text        NOT NULL DEFAULT '',
  availability_score numeric,
  season             text,
  typical_price      numeric,
  currency           text,
  price_unit         text,
  price_updated_at   timestamptz,
  price_source       text,
  retailer_id        text,
  confidence         numeric,
  source             text,
  licence            text,
  review_status      text        NOT NULL DEFAULT 'proposed',
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ingredient_id, country_code, region)
);

CREATE INDEX IF NOT EXISTS ingredient_availability_ingredient_idx
  ON public.ingredient_availability (ingredient_id);

CREATE INDEX IF NOT EXISTS ingredient_availability_country_idx
  ON public.ingredient_availability (country_code);

ALTER TABLE public.ingredient_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ingredient_availability" ON public.ingredient_availability;
CREATE POLICY "Public read ingredient_availability"
  ON public.ingredient_availability
  FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5) Extend public.recipe_ingredients
--    PK (recipe_id, ingredient_id) is preserved; we only ADD columns.
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS id               uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS group_label      text,
  ADD COLUMN IF NOT EXISTS grams_estimate   numeric,
  ADD COLUMN IF NOT EXISTS display_text     text,
  ADD COLUMN IF NOT EXISTS preparation_note text,
  ADD COLUMN IF NOT EXISTS is_optional      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order       int,
  ADD COLUMN IF NOT EXISTS source           text,
  ADD COLUMN IF NOT EXISTS review_status    text NOT NULL DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_idx
  ON public.recipe_ingredients (ingredient_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6) ai_audit_log — service-role write only; no anon insert policy
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_audit_log (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task           text,
  model          text,
  prompt_version text,
  input_hash     text,
  output         jsonb,
  allowlist_ids  uuid[],
  validated      boolean,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_audit_log_task_idx    ON public.ai_audit_log (task);
CREATE INDEX IF NOT EXISTS ai_audit_log_created_idx ON public.ai_audit_log (created_at);

ALTER TABLE public.ai_audit_log ENABLE ROW LEVEL SECURITY;
-- No SELECT / INSERT / UPDATE / DELETE policies for anon.
-- Service role bypasses RLS automatically.
