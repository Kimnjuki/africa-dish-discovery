
-- Create dishes for new recipes and link them
INSERT INTO public.dishes (name, country, continent)
SELECT DISTINCT r.name, r.country, r.continent
FROM public.recipes r
WHERE r.dish_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM public.dishes d 
  WHERE d.name = r.name AND COALESCE(d.country, '') = COALESCE(r.country, '')
);

UPDATE public.recipes r
SET dish_id = d.id
FROM public.dishes d
WHERE d.name = r.name
AND COALESCE(d.country, '') = COALESCE(r.country, '')
AND r.dish_id IS NULL;
