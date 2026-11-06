-- Drop and recreate discover_africa view without SECURITY DEFINER
DROP VIEW IF EXISTS public.discover_africa;

CREATE VIEW public.discover_africa AS
SELECT 
    r.id,
    r.name,
    r.country,
    reg.name AS region,
    r.summary,
    r.ingredients,
    r.steps,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.difficulty,
    r.tags,
    r.image_url,
    r.slug,
    r.created_at
FROM recipes r
LEFT JOIN regions reg ON r.region_id = reg.id
WHERE r.is_african = true;