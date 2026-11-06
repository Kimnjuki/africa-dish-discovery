
-- Drop the overly strict unique constraint on name alone
ALTER TABLE public.dishes DROP CONSTRAINT dishes_name_key;

-- Add a unique constraint on (name, country) to allow same dish name from different countries
ALTER TABLE public.dishes ADD CONSTRAINT dishes_name_country_unique UNIQUE (name, country);

-- Insert dish entries from all existing recipes (unique name+country combos)
INSERT INTO public.dishes (name, country, continent)
SELECT DISTINCT ON (LOWER(r.name), LOWER(r.country)) r.name, r.country, r.continent
FROM public.recipes r
ON CONFLICT (name, country) DO NOTHING;

-- Link recipes to their matching dishes
UPDATE public.recipes r
SET dish_id = d.id
FROM public.dishes d
WHERE LOWER(d.name) = LOWER(r.name)
AND COALESCE(LOWER(d.country), '') = COALESCE(LOWER(r.country), '')
AND r.dish_id IS NULL;
