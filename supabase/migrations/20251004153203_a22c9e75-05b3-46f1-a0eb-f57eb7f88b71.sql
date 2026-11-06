-- Enable RLS on all public tables that need it
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Shopping lists policies (CRITICAL - user data protection)
CREATE POLICY "Users can view own shopping lists"
ON public.shopping_lists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping lists"
ON public.shopping_lists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
ON public.shopping_lists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
ON public.shopping_lists
FOR DELETE
USING (auth.uid() = user_id);

-- Affiliate suppliers policies (public read-only data)
CREATE POLICY "Anyone can view affiliate suppliers"
ON public.affiliate_suppliers
FOR SELECT
USING (true);

-- Ingredients policies (public read-only data)
CREATE POLICY "Anyone can view ingredients"
ON public.ingredients
FOR SELECT
USING (true);

-- Media assets policies (public read-only data)
CREATE POLICY "Anyone can view media assets"
ON public.media_assets
FOR SELECT
USING (true);

-- Fix search_path for handle_new_user function to prevent security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$function$;