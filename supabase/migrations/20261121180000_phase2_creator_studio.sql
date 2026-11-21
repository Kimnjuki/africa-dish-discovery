-- Phase 2: Creator Studio + stronger community submission workflow
-- creator_profiles, richer uploads moderation, review moderation flags

-- ═══════════════════════════════════════════════════════════════════════════
-- 1) Creator profiles (public attribution pages)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  country_code text,
  country_name text,
  languages text[] NOT NULL DEFAULT '{}',
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified boolean NOT NULL DEFAULT false,
  attribution_preference text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_profiles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS creator_profiles_country_idx
  ON public.creator_profiles (country_code);
CREATE INDEX IF NOT EXISTS creator_profiles_verified_idx
  ON public.creator_profiles (verified) WHERE verified = true;

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view creator profiles" ON public.creator_profiles;
CREATE POLICY "Public can view creator profiles"
  ON public.creator_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own creator profile" ON public.creator_profiles;
CREATE POLICY "Users can insert own creator profile"
  ON public.creator_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own creator profile" ON public.creator_profiles;
CREATE POLICY "Users can update own creator profile"
  ON public.creator_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any creator profile" ON public.creator_profiles;
CREATE POLICY "Admins can update any creator profile"
  ON public.creator_profiles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 2) Uploads: revision workflow + editor notes + regional review
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.uploads
  ADD COLUMN IF NOT EXISTS editor_notes text,
  ADD COLUMN IF NOT EXISTS review_region text,
  ADD COLUMN IF NOT EXISTS regional_reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_upload_id uuid REFERENCES public.uploads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL;

-- Expand status check to support revision loop
ALTER TABLE public.uploads DROP CONSTRAINT IF EXISTS uploads_status_check;
ALTER TABLE public.uploads
  ADD CONSTRAINT uploads_status_check
  CHECK (status IN ('pending', 'in_review', 'needs_revision', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS uploads_review_region_idx
  ON public.uploads (review_region) WHERE status IN ('pending', 'in_review');

-- Allow submitters to update their own uploads only while pending / needs_revision
DROP POLICY IF EXISTS "Users can edit own pending uploads" ON public.uploads;
CREATE POLICY "Users can edit own pending uploads"
  ON public.uploads FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND status IN ('pending', 'needs_revision')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'needs_revision')
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 3) Recipe reviews: moderation gate (public only sees approved)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.recipe_reviews
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_note text;

-- Prefer showing approved reviews publicly; keep authors able to see own pending
DROP POLICY IF EXISTS "Public can view recipe reviews" ON public.recipe_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.recipe_reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.recipe_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.recipe_reviews FOR SELECT
  USING (
    moderation_status = 'approved'
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

-- New reviews start pending when photo attached or long text; default approved for simple ratings
-- (client sets status; this only ensures insert policy still works)

COMMENT ON TABLE public.creator_profiles IS
  'Public creator studio profiles with Person-schema-ready fields and sameAs social links.';
COMMENT ON COLUMN public.uploads.editor_notes IS
  'Editor feedback visible to the submitter for revision loops.';
COMMENT ON COLUMN public.recipe_reviews.moderation_status IS
  'UGC gate: pending/approved/rejected. Aggregates should use approved only.';
