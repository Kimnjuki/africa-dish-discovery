-- Allow admins/moderators to curate ingredient aliases and ingredient graph fields.

DROP POLICY IF EXISTS "Admins manage ingredient_aliases" ON public.ingredient_aliases;
CREATE POLICY "Admins manage ingredient_aliases"
  ON public.ingredient_aliases
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "Admins update ingredients graph" ON public.ingredients;
CREATE POLICY "Admins update ingredients graph"
  ON public.ingredients
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "Admins manage ingredient_substitutions" ON public.ingredient_substitutions;
CREATE POLICY "Admins manage ingredient_substitutions"
  ON public.ingredient_substitutions
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );
