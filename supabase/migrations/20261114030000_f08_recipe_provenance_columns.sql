-- F08 / trust pillar: nullable provenance fields on recipes for local names + ethnic group.
-- Prefer existing dishes.original_name_native / primary_tribe_ethnicity when dish_id is set;
-- these columns let recipe rows carry provenance without a dish link.

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS local_names text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ethnic_group text DEFAULT NULL;

COMMENT ON COLUMN public.recipes.local_names IS 'Also-known-as / local language names for the dish (nullable)';
COMMENT ON COLUMN public.recipes.ethnic_group IS 'Primary people / ethnic group associated with the dish (nullable)';

-- Soft backfill from linked dishes when recipe columns are empty
UPDATE public.recipes r
SET
  local_names = CASE
    WHEN d.original_name_native IS NOT NULL AND btrim(d.original_name_native) <> ''
      THEN ARRAY[d.original_name_native]
    ELSE r.local_names
  END,
  ethnic_group = COALESCE(NULLIF(btrim(r.ethnic_group), ''), d.primary_tribe_ethnicity)
FROM public.dishes d
WHERE r.dish_id = d.id
  AND (
    (r.local_names IS NULL AND d.original_name_native IS NOT NULL AND btrim(d.original_name_native) <> '')
    OR (r.ethnic_group IS NULL AND d.primary_tribe_ethnicity IS NOT NULL AND btrim(d.primary_tribe_ethnicity) <> '')
  );
