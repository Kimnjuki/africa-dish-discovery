-- 1. Profiles: restrict to self
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2. Newsletter subscribers: admin-only SELECT
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 3. Contact submissions: admin-only SELECT + UPDATE (for status changes)
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 4. user_challenges: enforce ownership on INSERT
CREATE POLICY "Users can insert own challenges" ON public.user_challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Internal report tables: admin-only access
CREATE POLICY "Admins can view missing items report" ON public.missing_items_report
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage missing items report" ON public.missing_items_report
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view missing recipes report" ON public.missing_recipes_report
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage missing recipes report" ON public.missing_recipes_report
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view missing recipes staging" ON public.missing_recipes_staging
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage missing recipes staging" ON public.missing_recipes_staging
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Storage: drop broad listing policy (bucket is public so direct URLs still work)
DROP POLICY IF EXISTS "Public can view recipe uploads" ON storage.objects;