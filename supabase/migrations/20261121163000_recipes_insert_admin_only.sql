-- Community cooks must submit via public.uploads + editorial review.
-- Direct INSERT into public.recipes must be admin/moderator only.
-- Previously authenticated users could INSERT if they set created_by = auth.uid().

DROP POLICY IF EXISTS "Users can create recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;

-- Re-assert admin/moderator insert (idempotent).
DROP POLICY IF EXISTS "Admins can insert recipes" ON public.recipes;
CREATE POLICY "Admins can insert recipes"
  ON public.recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

COMMENT ON POLICY "Admins can insert recipes" ON public.recipes IS
  'Publish path: editors approve uploads, then insert into recipes. No direct community insert.';
