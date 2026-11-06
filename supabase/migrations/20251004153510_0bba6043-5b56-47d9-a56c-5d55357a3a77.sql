-- Enable RLS on discover_filters table (it has policies but RLS is disabled)
ALTER TABLE public.discover_filters ENABLE ROW LEVEL SECURITY;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$function$;