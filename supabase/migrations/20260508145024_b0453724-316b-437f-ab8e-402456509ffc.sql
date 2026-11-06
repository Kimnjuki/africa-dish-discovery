-- Enable RLS on tables and add appropriate policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

ALTER TABLE public.ingredient_substitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view substitutions" ON public.ingredient_substitutions FOR SELECT USING (true);

ALTER TABLE public.meal_plan_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view meal plan templates" ON public.meal_plan_templates FOR SELECT USING (true);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);

ALTER TABLE public.venue_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venue offerings" ON public.venue_offerings FOR SELECT USING (true);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.user_badges FOR SELECT TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.user_passport_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own stamps" ON public.user_passport_stamps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own stamps" ON public.user_passport_stamps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Internal/admin tables: enable RLS with no public policies (deny by default)
ALTER TABLE public.missing_items_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_recipes_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_recipes_staging ENABLE ROW LEVEL SECURITY;

-- Tighten overly permissive policies
DROP POLICY IF EXISTS "System can update challenges" ON public.user_challenges;
CREATE POLICY "Users update own challenges" ON public.user_challenges
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can manage recommendations" ON public.personalized_recommendations;
-- service_role bypasses RLS, so backend writes still work; remove public ALL policy.

DROP POLICY IF EXISTS "Users can update own subscription" ON public.newsletter_subscribers;
-- Newsletter unsubscribes should be handled via a signed link / edge function using service role.

-- Convert SECURITY DEFINER views to SECURITY INVOKER
ALTER VIEW public.recipe_ratings_summary SET (security_invoker = true);
ALTER VIEW public.view_leaderboard_global SET (security_invoker = true);
ALTER VIEW public.view_leaderboard_regional SET (security_invoker = true);