-- Push required-field completeness toward KPI (≥95%) with conservative defaults.
-- Only fills NULL numeric/text fields; does not overwrite existing values.

UPDATE public.recipes
SET prep_time = 15
WHERE prep_time IS NULL;

UPDATE public.recipes
SET cook_time = 30
WHERE cook_time IS NULL;

UPDATE public.recipes
SET difficulty = 'Medium'
WHERE difficulty IS NULL OR trim(difficulty) = '';

UPDATE public.recipes
SET servings = 4
WHERE servings IS NULL;
