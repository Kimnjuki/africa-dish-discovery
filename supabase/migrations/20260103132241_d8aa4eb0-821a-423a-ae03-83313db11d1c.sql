-- Add share_token column to meal_plans for shareable links
ALTER TABLE public.meal_plans 
ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_plans_share_token ON public.meal_plans(share_token);

-- Create RLS policy for public viewing of shared meal plans
CREATE POLICY "Anyone can view shared meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (is_public = true AND share_token IS NOT NULL);

-- Also allow public access to planned meals for shared plans
CREATE POLICY "Anyone can view meals of shared plans" 
ON public.planned_meals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM meal_plans 
  WHERE meal_plans.id = planned_meals.meal_plan_id 
  AND meal_plans.is_public = true 
  AND meal_plans.share_token IS NOT NULL
));