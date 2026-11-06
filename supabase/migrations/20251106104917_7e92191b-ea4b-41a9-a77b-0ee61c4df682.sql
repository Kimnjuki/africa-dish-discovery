-- Create meal_plans table for weekly meal planning
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Meal Plan',
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create planned_meals table to store individual meals in a plan
CREATE TABLE public.planned_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for planned_meals
CREATE POLICY "Users can view meals in their plans"
  ON public.planned_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = planned_meals.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add meals to their plans"
  ON public.planned_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = planned_meals.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meals in their plans"
  ON public.planned_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = planned_meals.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meals from their plans"
  ON public.planned_meals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = planned_meals.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at on meal_plans
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX idx_meal_plans_week_start ON public.meal_plans(week_start_date);
CREATE INDEX idx_planned_meals_plan_id ON public.planned_meals(meal_plan_id);
CREATE INDEX idx_planned_meals_recipe_id ON public.planned_meals(recipe_id);