-- High-frequency staples missing from the ingredient graph (unmatched in JSON backfill).
-- Safe upsert: skip when name OR slug already exists.

INSERT INTO public.ingredients (
  name, slug, canonical_name, category, food_group, dietary_tags, allergens,
  function_tags, default_unit, review_status, source, licence
)
SELECT v.name, v.slug, v.canonical_name, v.category, v.food_group, v.dietary_tags, v.allergens,
       v.function_tags, v.default_unit, v.review_status, v.source, v.licence
FROM (
  VALUES
    ('Black Pepper', 'black-pepper', 'Black Pepper', 'spice', 'Spices & Aromatics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['spice','seasoning']::text[], 'tsp', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Bay Leaves', 'bay-leaves', 'Bay Leaves', 'spice', 'Spices & Aromatics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['aromatic','herb']::text[], 'leaf', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Saffron', 'saffron', 'Saffron', 'spice', 'Spices & Aromatics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['spice','coloring','aromatic']::text[], 'pinch', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Maggi', 'maggi', 'Maggi', 'seasoning', 'Spices & Aromatics',
     ARRAY['halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['umami','seasoning','bouillon']::text[], 'cube', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Water', 'water', 'Water', 'liquid', 'Pantry Basics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['liquid','base']::text[], 'cup', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Ras El Hanout', 'ras-el-hanout', 'Ras El Hanout', 'spice', 'Spices & Aromatics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['spice-blend','aromatic']::text[], 'tsp', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Iru', 'iru', 'Iru', 'seasoning', 'Spices & Aromatics',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['umami','fermented','seasoning']::text[], 'tbsp', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Milk', 'milk', 'Milk', 'dairy', 'Dairy',
     ARRAY['vegetarian','halal','gluten_free','nut_free']::text[], ARRAY['dairy','milk']::text[],
     ARRAY['dairy','liquid']::text[], 'cup', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Butter', 'butter', 'Butter', 'dairy', 'Dairy',
     ARRAY['vegetarian','halal','gluten_free','nut_free']::text[], ARRAY['dairy','milk']::text[],
     ARRAY['fat','dairy']::text[], 'tbsp', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Ghee', 'ghee', 'Ghee', 'dairy', 'Fats & Oils',
     ARRAY['vegetarian','halal','gluten_free','nut_free']::text[], ARRAY['dairy','milk']::text[],
     ARRAY['fat','cooking-fat']::text[], 'tbsp', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Coconut Milk', 'coconut-milk', 'Coconut Milk', 'liquid', 'Fats & Oils',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['liquid','fat','stew']::text[], 'cup', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Evaporated Milk', 'evaporated-milk', 'Evaporated Milk', 'dairy', 'Dairy',
     ARRAY['vegetarian','halal','gluten_free','nut_free']::text[], ARRAY['dairy','milk']::text[],
     ARRAY['dairy','liquid']::text[], 'cup', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Lemon', 'lemon', 'Lemon', 'produce', 'Fruits',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['acid','citrus']::text[], 'piece', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Lime', 'lime', 'Lime', 'produce', 'Fruits',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['acid','citrus']::text[], 'piece', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Celery', 'celery', 'Celery', 'produce', 'Vegetables',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['aromatic','stew']::text[], 'stalk', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0'),
    ('Scallions', 'scallions', 'Scallions', 'produce', 'Vegetables',
     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free']::text[], ARRAY[]::text[],
     ARRAY['aromatic','garnish']::text[], 'bunch', 'approved', 'ladhaquest-staple-backfill-v1', 'CC0-1.0')
) AS v(name, slug, canonical_name, category, food_group, dietary_tags, allergens, function_tags, default_unit, review_status, source, licence)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredients i WHERE i.slug = v.slug OR lower(i.name) = lower(v.name)
);

-- Aliases for staples (skip conflicts)
INSERT INTO public.ingredient_aliases (
  ingredient_id, alias, alias_normalized, language, country_code,
  is_primary_local_name, match_confidence, source, review_status
)
SELECT i.id, a.alias, a.alias_normalized, a.language, a.country_code,
       a.is_primary, 1, 'ladhaquest-staple-backfill-v1', 'approved'
FROM public.ingredients i
JOIN (
  VALUES
    ('black-pepper', 'black pepper', 'black pepper', 'en', '', true),
    ('black-pepper', 'pepper', 'pepper', 'en', '', false),
    ('bay-leaves', 'bay leaf', 'bay leaf', 'en', '', true),
    ('bay-leaves', 'bay leaves', 'bay leaves', 'en', '', false),
    ('maggi', 'maggi cube', 'maggi cube', 'en', 'NG', true),
    ('maggi', 'stock cube', 'stock cube', 'en', '', false),
    ('maggi', 'bouillon cube', 'bouillon cube', 'en', '', false),
    ('ras-el-hanout', 'ras el hanout', 'ras el hanout', 'en', 'MA', true),
    ('water', 'warm water', 'warm water', 'en', '', false),
    ('water', 'hot water', 'hot water', 'en', '', false),
    ('iru', 'dawadawa', 'dawadawa', 'en', 'NG', true),
    ('iru', 'locust beans', 'locust beans', 'en', 'NG', false),
    ('scallions', 'green onion', 'green onion', 'en', '', false),
    ('scallions', 'spring onion', 'spring onion', 'en', '', false),
    ('celery', 'celery stalk', 'celery stalk', 'en', '', false)
) AS a(slug, alias, alias_normalized, language, country_code, is_primary)
  ON i.slug = a.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient_aliases x
  WHERE x.alias_normalized = a.alias_normalized
    AND x.language = a.language
    AND x.country_code = a.country_code
);
