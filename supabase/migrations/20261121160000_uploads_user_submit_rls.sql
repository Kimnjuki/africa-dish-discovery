-- Community recipe queue: ensure uploads exists and signed-in users can submit.
-- Admins/moderators already have SELECT/UPDATE/DELETE from earlier migrations.
-- Users must never INSERT directly into recipes/dishes (editorial publish only).

CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipe_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON public.uploads (user_id);
CREATE INDEX IF NOT EXISTS uploads_status_created_idx ON public.uploads (status, created_at DESC);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Submitters can insert their own pending uploads only.
DROP POLICY IF EXISTS "Users can insert own pending uploads" ON public.uploads;
CREATE POLICY "Users can insert own pending uploads"
  ON public.uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Submitters can read their own queue rows (status + rejection feedback).
DROP POLICY IF EXISTS "Users can view own uploads" ON public.uploads;
CREATE POLICY "Users can view own uploads"
  ON public.uploads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Keep admin/moderator policies (re-assert for idempotency if table was just created).
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.uploads;
CREATE POLICY "Admins can view all uploads"
  ON public.uploads
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "Admins can update uploads" ON public.uploads;
CREATE POLICY "Admins can update uploads"
  ON public.uploads
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "Admins can delete uploads" ON public.uploads;
CREATE POLICY "Admins can delete uploads"
  ON public.uploads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.uploads IS
  'Community recipe submissions awaiting editorial review. Users insert pending rows; only admin/moderator publish into recipes.';
