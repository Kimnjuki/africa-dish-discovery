-- S1-04: African Ingredient Graph — seed migration
-- Sprint 1, LadhaQuest. Idempotent via ON CONFLICT DO NOTHING / DO UPDATE.
-- Companion to 20261120100000_ingredient_graph_schema.sql
-- Apply schema migration first, then this seed.
--
-- Covers: 100 priority ingredients, aliases, 42 substitution edges, 600 availability rows.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1) Seed ingredients (100 rows, ON CONFLICT (name) update slug + meta)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.ingredients (name, slug, canonical_name, category, food_group, dietary_tags, allergens, function_tags, default_unit, review_status, source, licence)
VALUES
  ('Ugwu',              'ugwu',              'Ugwu',              'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','soup-green','stew-green'],          'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sukuma Wiki',       'sukuma-wiki',       'Sukuma Wiki',       'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','braised-green','stir-fry'],           'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Kale',              'kale',              'Kale',              'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','braised-green'],                       'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Spinach',           'spinach',           'Spinach',           'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','soup-green'],                          'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Bitterleaf',        'bitterleaf',        'Bitterleaf',        'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','bitter-green','soup-green'],            'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Morogo',            'morogo',            'Morogo',            'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','wild-green'],                           'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Molokhia',          'molokhia',          'Molokhia',          'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','mucilaginous','soup-green'],             'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Water Leaves',      'water-leaves',      'Water Leaves',      'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','soup-green'],                           'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Collard Greens',    'collard-greens',    'Collard Greens',    'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','braised-green'],                        'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('African Basil',     'african-basil',     'African Basil',     'herb',       'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic-herb','garnish','flavoring'],                'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cilantro',          'cilantro',          'Cilantro',          'herb',       'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic-herb','garnish'],                            'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Parsley',           'parsley',           'Parsley',           'herb',       'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic-herb','garnish'],                            'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Utazi',             'utazi',             'Utazi',             'herb',       'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['bitter-herb','flavoring'],                            'leaf',  'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Garden Egg Leaves', 'garden-egg-leaves', 'Garden Egg Leaves', 'vegetable',  'Leafy Greens & Herbs', ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['leafy-green','soup-green'],                           'bunch', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cassava',           'cassava',           'Cassava',           'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['starch','tuber','base'],                              'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Yam',               'yam',               'Yam',               'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['starch','tuber','base'],                              'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sweet Potato',      'sweet-potato',      'Sweet Potato',      'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['starch','tuber','base'],                              'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Plantain',          'plantain',          'Plantain',          'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['starch','side-dish','frying'],                        'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cocoyam',           'cocoyam',           'Cocoyam',           'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['starch','tuber'],                                     'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Fonio',             'fonio',             'Fonio',             'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','porridge','base'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Teff',              'teff',              'Teff',              'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','flour','injera'],                             'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sorghum',           'sorghum',           'Sorghum',           'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','flour','porridge'],                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Millet',            'millet',            'Millet',            'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','porridge','flour'],                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Maize',             'maize',             'Maize',             'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','flour','porridge'],                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Rice',              'rice',              'Rice',              'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','base','side-dish'],                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Banana',            'banana',            'Banana',            'produce',    'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['fruit','sweet'],                                      'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Quinoa',            'quinoa',            'Quinoa',            'grain',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['grain','superfood','salad'],                          'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sorghum Flour',     'sorghum-flour',     'Sorghum Flour',     'flour',      'Starches & Roots',     ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['flour','flatbread','porridge'],                        'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Black-Eyed Peas',   'black-eyed-peas',   'Black-Eyed Peas',   'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Groundnut',         'groundnut',         'Groundnut',         'nut',        'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY['peanut'], ARRAY['nut','protein','fat','paste'],                                  'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Lentils',           'lentils',           'Lentils',           'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Chickpeas',         'chickpeas',         'Chickpeas',         'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew','hummus'],                   'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Kidney Beans',      'kidney-beans',      'Kidney Beans',      'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Soybeans',          'soybeans',          'Soybeans',          'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','oil'],                             'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Pigeon Peas',       'pigeon-peas',       'Pigeon Peas',       'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Fava Beans',        'fava-beans',        'Fava Beans',        'legume',     'Legumes',              ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['legume','protein','stew','dip'],                      'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Chicken',           'chicken',           'Chicken',           'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','meat','stew','grill'],                                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Beef',              'beef',              'Beef',              'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','meat','stew'],                                                   'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Goat',              'goat',              'Goat',              'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','meat','stew','roast'],                                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Lamb',              'lamb',              'Lamb',              'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','meat','stew','roast'],                                           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tilapia',           'tilapia',           'Tilapia',           'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','fish','stew','fry'],                                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Catfish',           'catfish',           'Catfish',           'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','fish','stew','smoke'],                                          'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Mackerel',          'mackerel',          'Mackerel',          'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','fish','smoke','grill'],                                         'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Stockfish',         'stockfish',         'Stockfish',         'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','dried-fish','umami','stew'],                                   'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Crayfish',          'crayfish',          'Crayfish',          'seafood',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY['shellfish'], ARRAY['umami','dried-seafood','flavoring','ground'],                           'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Dried Shrimp',      'dried-shrimp',      'Dried Shrimp',      'seafood',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY['shellfish'], ARRAY['umami','dried-seafood','flavoring'],                                   'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Salted Cod',        'salted-cod',        'Salted Cod',        'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','dried-fish','stew'],                                            'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Periwinkle',        'periwinkle',        'Periwinkle',        'seafood',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY['shellfish'], ARRAY['seafood','stew','delicacy'],                                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Snail',             'snail',             'Snail',             'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','delicacy','stew'],                                              'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Smoked Fish',       'smoked-fish',       'Smoked Fish',       'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','dried-fish','umami','flavoring'],                               'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sardines',          'sardines',          'Sardines',          'protein',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['protein','fish','canned'],                                                'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Prawns',            'prawns',            'Prawns',            'seafood',    'Proteins',             ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY['shellfish'], ARRAY['seafood','stew','grill'],                                               'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Scotch Bonnet',     'scotch-bonnet',     'Scotch Bonnet',     'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['heat','fruity-chili','flavoring'],                   'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Habanero',          'habanero',          'Habanero',          'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['heat','fruity-chili','flavoring'],                   'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Piri Piri',         'piri-piri',         'Piri Piri',         'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['heat','chili','sauce'],                              'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cayenne Pepper',    'cayenne-pepper',    'Cayenne Pepper',    'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['heat','dried-chili','spice'],                        'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Ginger',            'ginger',            'Ginger',            'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','anti-inflammatory','flavoring'],          'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Garlic',            'garlic',            'Garlic',            'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','antibacterial','flavoring'],              'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Turmeric',          'turmeric',          'Turmeric',          'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['spice','coloring','anti-inflammatory'],              'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cumin',             'cumin',             'Cumin',             'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['spice','aromatic','flavoring'],                      'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Coriander Seed',    'coriander-seed',    'Coriander Seed',    'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['spice','aromatic','flavoring'],                      'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Suya Spice',        'suya-spice',        'Suya Spice',        'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY['peanut'], ARRAY['spice-blend','marinade','grilling'],                            'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Uziza',             'uziza',             'Uziza',             'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','bitter-spice','soup-spice'],              'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Alligator Pepper',  'alligator-pepper',  'Alligator Pepper',  'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','ritual-spice','flavoring'],              'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cloves',            'cloves',            'Cloves',            'spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','warm-spice','flavoring'],                 'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Grains of Paradise','grains-of-paradise','Grains of Paradise','spice',      'Spices & Aromatics',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','warm-spice','ritual-spice'],              'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Palm Oil',          'palm-oil',          'Palm Oil',          'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['cooking-fat','coloring','flavoring'],                 'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Coconut Oil',       'coconut-oil',       'Coconut Oil',       'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['cooking-fat','baking-fat'],                          'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Vegetable Oil',     'vegetable-oil',     'Vegetable Oil',     'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['cooking-fat','neutral-fat','frying'],                'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Ghee',              'ghee',              'Ghee',              'oil',        'Fats & Oils',          ARRAY['vegetarian','halal','gluten_free','nut_free'], ARRAY['dairy'], ARRAY['cooking-fat','clarified-fat','finishing'],                                  'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Shea Butter',       'shea-butter',       'Shea Butter',       'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['cooking-fat','specialty-fat'],                       'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Groundnut Oil',     'groundnut-oil',     'Groundnut Oil',     'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY['peanut'], ARRAY['cooking-fat','frying','neutral-fat'],                           'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sesame Oil',        'sesame-oil',        'Sesame Oil',        'oil',        'Fats & Oils',          ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['cooking-fat','flavoring','toasted'],                 'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Butter',            'butter',            'Butter',            'oil',        'Fats & Oils',          ARRAY['vegetarian','halal','gluten_free','nut_free'], ARRAY['dairy'], ARRAY['cooking-fat','baking-fat','finishing'],                                     'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Egusi',             'egusi',             'Egusi',             'seed',       'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['oilseed','thickener','soup-base','ground'],           'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Ogbono',            'ogbono',            'Ogbono',            'seed',       'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['draw-thickener','soup-base','oilseed'],               'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Okra',              'okra',              'Okra',              'vegetable',  'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['mucilaginous','vegetable','draw-thickener','stew'],   'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Pumpkin Seeds',     'pumpkin-seeds',     'Pumpkin Seeds',     'seed',       'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY[]::text[], ARRAY['oilseed','snack','thickener'],                                   'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Sunflower Seeds',   'sunflower-seeds',   'Sunflower Seeds',   'seed',       'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['oilseed','snack','thickener'],                        'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Moringa Powder',    'moringa-powder',    'Moringa Powder',    'supplement', 'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['superfood','supplement','leafy'],                     'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Baobab Powder',     'baobab-powder',     'Baobab Powder',     'supplement', 'Seeds & Thickeners',   ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['superfood','souring-agent','supplement'],             'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Iru',               'iru',               'Iru',               'condiment',  'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['fermented-umami','flavoring','soup-base'],            'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Garri',             'garri',             'Garri',             'flour',      'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['fermented-starch','flour','snack'],                   'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Ogi',               'ogi',               'Ogi',               'condiment',  'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['fermented-starch','porridge','weaning-food'],          'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tamarind',          'tamarind',          'Tamarind',          'condiment',  'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['souring-agent','flavoring','paste'],                  'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Dried Hibiscus',    'dried-hibiscus',    'Dried Hibiscus',    'condiment',  'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['souring-agent','beverage','coloring'],                'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Miso',              'miso',              'Miso',              'condiment',  'Fermented & Specialty',ARRAY['vegetarian','vegan','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['fermented-umami','paste','diaspora-sub'],                      'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Cassava Flour',     'cassava-flour',     'Cassava Flour',     'flour',      'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['flour','binder','starch'],                            'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tapioca Flour',     'tapioca-flour',     'Tapioca Flour',     'flour',      'Fermented & Specialty',ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['flour','starch','binder','elastic'],                  'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tomato Paste',      'tomato-paste',      'Tomato Paste',      'condiment',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['tomato','concentrate','base'],                        'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tomatoes',          'tomatoes',          'Tomatoes',          'produce',    'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['tomato','base','stew'],                               'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Onion',             'onion',             'Onion',             'produce',    'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['aromatic','base','stew'],                             'kg',    'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Coconut Milk',      'coconut-milk',      'Coconut Milk',      'condiment',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['liquid-fat','base','flavoring'],                      'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Stock Cube',        'stock-cube',        'Stock Cube',        'condiment',  'Pantry & Condiments',  ARRAY['gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['umami','seasoning','base'],                                                       'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tomato Sauce',      'tomato-sauce',      'Tomato Sauce',      'condiment',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['tomato','base','stew'],                               'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Peanut Butter',     'peanut-butter',     'Peanut Butter',     'condiment',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY['peanut'], ARRAY['paste','fat','flavoring'],                                       'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Tahini',            'tahini',            'Tahini',            'condiment',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free'], ARRAY['sesame'], ARRAY['paste','fat','dip'],                                             'g',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Zucchini',          'zucchini',          'Zucchini',          'vegetable',  'Pantry & Condiments',  ARRAY['vegetarian','vegan','halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['vegetable','mild','bulk'],                            'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Chicken Stock',     'chicken-stock',     'Chicken Stock',     'condiment',  'Pantry & Condiments',  ARRAY['halal','gluten_free','dairy_free','nut_free'], ARRAY[]::text[], ARRAY['liquid-base','umami','flavoring'],                                        'l',     'approved', 'ladhaquest-seed-v1', 'CC0-1.0'),
  ('Eggs',              'eggs',              'Eggs',              'protein',    'Pantry & Condiments',  ARRAY['vegetarian','halal','gluten_free','dairy_free','nut_free'], ARRAY['egg'], ARRAY['protein','binder','emulsifier'],                                   'piece', 'approved', 'ladhaquest-seed-v1', 'CC0-1.0')
ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  canonical_name = EXCLUDED.canonical_name,
  category       = EXCLUDED.category,
  food_group     = EXCLUDED.food_group,
  dietary_tags   = EXCLUDED.dietary_tags,
  allergens      = EXCLUDED.allergens,
  function_tags  = EXCLUDED.function_tags,
  default_unit   = EXCLUDED.default_unit,
  review_status  = EXCLUDED.review_status,
  source         = EXCLUDED.source,
  licence        = EXCLUDED.licence;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2) Seed ingredient_aliases (selected key aliases; ON CONFLICT DO NOTHING)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.ingredient_aliases (ingredient_id, alias, alias_normalized, language, country_code, is_primary_local_name, match_confidence, is_ambiguous, review_status)
SELECT i.id, a.alias, lower(a.alias) AS alias_normalized, a.lang, a.cc, a.primary_local, 1, a.ambig, 'approved'
FROM (VALUES
  ('ugwu',           'ugu',                      'en', 'NG',  true,  false),
  ('ugwu',           'fluted pumpkin',            'en', '',    false, false),
  ('ugwu',           'pumpkin leaves',            'en', '',    false, false),
  ('sukuma-wiki',    'sukuma',                    'en', 'KE',  true,  false),
  ('sukuma-wiki',    'sukumawiki',                'sw', 'KE',  true,  false),
  ('sukuma-wiki',    'collard greens kenya',      'en', 'KE',  false, false),
  ('kale',           'curly kale',                'en', '',    false, false),
  ('spinach',        'baby spinach',              'en', '',    false, false),
  ('spinach',        'mchicha',                   'sw', 'TZ',  true,  false),
  ('bitterleaf',     'bitter leaf',               'en', 'NG',  false, false),
  ('bitterleaf',     'onugbu',                    'ig', 'NG',  true,  false),
  ('bitterleaf',     'ewuro',                     'yo', 'NG',  true,  false),
  ('morogo',         'amaranth leaves',           'en', 'ZA',  false, false),
  ('morogo',         'imifino',                   'zu', 'ZA',  true,  false),
  ('morogo',         'african spinach',           'en', '',    false, true),
  ('molokhia',       'mulukhiyah',                'ar', 'EG',  true,  false),
  ('molokhia',       'jute leaf',                 'en', '',    false, false),
  ('molokhia',       'egyptian spinach',          'en', '',    false, true),
  ('collard-greens', 'collards',                  'en', '',    false, false),
  ('african-basil',  'scent leaf',                'en', 'NG',  true,  false),
  ('african-basil',  'nchuanwu',                  'ig', 'NG',  true,  false),
  ('african-basil',  'efirin',                    'yo', 'NG',  true,  false),
  ('cilantro',       'coriander leaves',          'en', '',    false, false),
  ('cilantro',       'fresh coriander',           'en', '',    false, false),
  ('cilantro',       'dhania',                    'sw', 'KE',  true,  false),
  ('parsley',        'fresh parsley',             'en', '',    false, false),
  ('cassava',        'manioc',                    'fr', '',    false, false),
  ('cassava',        'yuca',                      'es', '',    false, false),
  ('cassava',        'mhogo',                     'sw', 'KE',  true,  false),
  ('yam',            'puna yam',                  'en', 'NG',  false, false),
  ('yam',            'white yam',                 'en', '',    false, false),
  ('yam',            'ji',                        'ig', 'NG',  true,  false),
  ('plantain',       'matoke',                    'sw', 'KE',  true,  false),
  ('plantain',       'gonja',                     'en', 'GH',  true,  false),
  ('plantain',       'green plantain',            'en', '',    false, false),
  ('fonio',          'acha',                      'en', 'NG',  true,  false),
  ('teff',           'tef',                       'en', '',    false, false),
  ('sorghum',        'guinea corn',               'en', 'NG',  true,  false),
  ('sorghum',        'mtama',                     'sw', 'KE',  true,  false),
  ('maize',          'corn',                      'en', '',    false, false),
  ('maize',          'mealie meal',               'en', 'ZA',  true,  false),
  ('maize',          'ugali flour',               'en', 'KE',  true,  false),
  ('black-eyed-peas','cowpeas',                   'en', '',    false, false),
  ('black-eyed-peas','kunde',                     'sw', 'KE',  true,  false),
  ('groundnut',      'peanuts',                   'en', '',    false, false),
  ('groundnut',      'peanut',                    'en', '',    false, false),
  ('groundnut',      'karanga',                   'sw', 'KE',  true,  false),
  ('groundnut',      'arachide',                  'fr', '',    false, false),
  ('lentils',        'addes',                     'ar', 'EG',  true,  false),
  ('chickpeas',      'garbanzo beans',            'en', '',    false, false),
  ('fava-beans',     'broad beans',               'en', '',    false, false),
  ('fava-beans',     'ful medames',               'ar', 'EG',  true,  false),
  ('scotch-bonnet',  'ata rodo',                  'yo', 'NG',  true,  false),
  ('scotch-bonnet',  'bonnet pepper',             'en', '',    false, false),
  ('habanero',       'habanero pepper',           'en', '',    false, false),
  ('piri-piri',      'peri peri',                 'en', '',    false, false),
  ('piri-piri',      'pili pili',                 'en', '',    false, false),
  ('piri-piri',      'pilipili',                  'sw', 'TZ',  true,  false),
  ('cayenne-pepper', 'cayenne',                   'en', '',    false, false),
  ('cayenne-pepper', 'ground cayenne',            'en', '',    false, false),
  ('ginger',         'tangawizi',                 'sw', 'KE',  true,  false),
  ('garlic',         'kitunguu saumu',            'sw', 'KE',  true,  false),
  ('egusi',          'melon seeds',               'en', '',    false, false),
  ('egusi',          'egusi seeds',               'en', 'NG',  false, false),
  ('egusi',          'egushi',                    'en', 'NG',  false, false),
  ('ogbono',         'bush mango seed',           'en', '',    false, false),
  ('ogbono',         'dika nut',                  'en', '',    false, false),
  ('okra',           'okro',                      'en', 'NG',  true,  false),
  ('okra',           'lady finger',               'en', '',    false, false),
  ('okra',           'bamia',                     'ar', 'EG',  true,  false),
  ('pumpkin-seeds',  'pepitas',                   'en', '',    false, false),
  ('iru',            'locust beans',              'en', '',    false, false),
  ('iru',            'dawadawa',                  'en', 'GH',  true,  false),
  ('iru',            'ogiri',                     'ig', 'NG',  true,  false),
  ('iru',            'soumbala',                  'en', 'SN',  true,  false),
  ('garri',          'gari',                      'en', '',    false, false),
  ('garri',          'fermented cassava flakes',  'en', '',    false, false),
  ('ogi',            'akamu',                     'ig', 'NG',  true,  false),
  ('ogi',            'pap',                       'en', 'NG',  true,  false),
  ('ogi',            'uji',                       'sw', 'KE',  true,  false),
  ('tamarind',       'tamarind paste',            'en', '',    false, false),
  ('dried-hibiscus', 'zobo',                      'en', 'NG',  true,  false),
  ('dried-hibiscus', 'bissap',                    'en', 'SN',  true,  false),
  ('dried-hibiscus', 'karkade',                   'ar', 'EG',  true,  false),
  ('miso',           'white miso',                'en', '',    false, false),
  ('cassava-flour',  'manioc flour',              'en', '',    false, false),
  ('cassava-flour',  'mhogo flour',               'sw', 'KE',  true,  false),
  ('tapioca-flour',  'tapioca starch',            'en', '',    false, false),
  ('stockfish',      'panla',                     'en', 'NG',  true,  false),
  ('stockfish',      'okporoko',                  'ig', 'NG',  true,  false),
  ('crayfish',       'dried crayfish',            'en', 'NG',  false, false),
  ('crayfish',       'ground crayfish',           'en', 'NG',  false, false),
  ('dried-shrimp',   'shrimp powder',             'en', '',    false, false),
  ('salted-cod',     'bacalao',                   'es', '',    false, false),
  ('salted-cod',     'saltfish',                  'en', '',    false, false),
  ('palm-oil',       'red palm oil',              'en', '',    false, false),
  ('palm-oil',       'zomi',                      'en', 'GH',  true,  false),
  ('ghee',           'clarified butter',          'en', '',    false, false),
  ('ghee',           'samn',                      'ar', 'EG',  true,  false),
  ('tahini',         'sesame paste',              'en', '',    false, false),
  ('tahini',         'tahina',                    'ar', 'EG',  true,  false),
  ('peanut-butter',  'natural peanut butter',     'en', '',    false, false),
  ('peanut-butter',  'groundnut paste',           'en', '',    false, false),
  ('stock-cube',     'bouillon',                  'en', '',    false, false),
  ('stock-cube',     'maggi cube',                'en', '',    false, false),
  ('zucchini',       'courgette',                 'en', '',    false, false),
  ('zucchini',       'baby marrow',               'en', 'ZA',  true,  false),
  ('onion',          'kitunguu',                  'sw', 'KE',  true,  false),
  ('onion',          'alubosa',                   'yo', 'NG',  true,  false),
  ('tomatoes',       'nyanya',                    'sw', 'KE',  true,  false)
) AS a(slug, alias, lang, cc, primary_local, ambig)
JOIN public.ingredients i ON i.slug = a.slug
ON CONFLICT (alias_normalized, language, country_code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3) Seed ingredient_substitutions (42 directed edges)
-- ═══════════════════════════════════════════════════════════════════════════════
WITH pairs(from_slug, to_slug, ratio, sub_type, conf, reason, notes) AS (VALUES
  ('ugwu',           'spinach',        1::numeric, 'direct',     0.88::numeric, 'Similar soft leafy texture for soups and stews',                        'Spinach wilts faster — add near the end; milder than ugwu.'),
  ('spinach',        'ugwu',           1::numeric, 'direct',     0.88::numeric, 'Similar soft leafy texture for soups and stews',                        'Use ugwu when available for more authentic West African greens.'),
  ('ugwu',           'kale',           1::numeric, 'functional', 0.82::numeric, 'Sturdier green with comparable body in egusi and vegetable soups',      'Strip stems and chop fine; cook a bit longer than ugwu.'),
  ('sukuma-wiki',    'collard-greens', 1::numeric, 'direct',     0.95::numeric, 'Same brassica family; classic East African sukuma swap abroad',          'Slice thin ribbons; longer simmer softens bitterness.'),
  ('collard-greens', 'sukuma-wiki',    1::numeric, 'direct',     0.95::numeric, 'Same brassica family; classic East African sukuma swap abroad',          'Preferred local name in Kenya and Tanzania markets.'),
  ('sukuma-wiki',    'kale',           1::numeric, 'functional', 0.86::numeric, 'Widely available brassica; works in ugali and greens plates',           'Slightly sweeter; reduce cook time vs mature sukuma.'),
  ('bitterleaf',     'kale',           1::numeric, 'functional', 0.62::numeric, 'Bitter green body for soups when onugbu is scarce',                     'Won''t match true bitterleaf bite.'),
  ('morogo',         'spinach',        1::numeric, 'direct',     0.80::numeric, 'Soft cooked green for Southern African relish dishes',                  'Spinach is milder; season boldly with onion and tomato.'),
  ('spinach',        'morogo',         1::numeric, 'direct',     0.80::numeric, 'Soft cooked green for Southern African relish dishes',                  'Prefer morogo or amaranth when available.'),
  ('molokhia',       'spinach',        1::numeric, 'functional', 0.58::numeric, 'Viscous green stew filler when jute leaf is unavailable',               'Texture won''t be as mucilaginous; okra can help thicken.'),
  ('egusi',          'pumpkin-seeds',  1::numeric, 'direct',     0.84::numeric, 'Closest oilseed stand-in for ground egusi soups',                       'Toast and grind; flavor is nuttier and less earthy than true egusi.'),
  ('pumpkin-seeds',  'egusi',          1::numeric, 'direct',     0.84::numeric, 'Closest oilseed stand-in for ground egusi soups',                       'Prefer true egusi when cooking West African soups.'),
  ('egusi',          'sunflower-seeds',1::numeric, 'emergency',  0.70::numeric, 'Budget oilseed thickener for egusi-style soups',                        'Grind fine; color will be paler — palm oil restores hue.'),
  ('ogbono',         'okra',           1::numeric, 'functional', 0.72::numeric, 'Draw and mucilage thickener when ogbono is unavailable',                'Chop or blend okra for stretch; flavor differs from bush mango.'),
  ('palm-oil',       'vegetable-oil',  1::numeric, 'emergency',  0.55::numeric, 'Neutral cooking fat when red palm oil is unavailable',                  'Loses color and palm aroma — add paprika for hue.'),
  ('palm-oil',       'coconut-oil',    1::numeric, 'functional', 0.60::numeric, 'Tropical fat alternative with some aroma',                              'Coconut notes change the dish; use sparingly in stews.'),
  ('palm-oil',       'ghee',           1::numeric, 'emergency',  0.48::numeric, 'Rich fat for North and East African adaptations',                       'Better for suqaar and stews than classic Nigerian palm-oil soups.'),
  ('scotch-bonnet',  'habanero',       1::numeric, 'direct',     0.96::numeric, 'Near-identical heat and fruity aroma',                                  'Use 1:1; seed to dial heat. Closest diaspora swap.'),
  ('habanero',       'scotch-bonnet',  1::numeric, 'direct',     0.96::numeric, 'Near-identical heat and fruity aroma',                                  'Interchangeable in most West African and Caribbean recipes.'),
  ('scotch-bonnet',  'cayenne-pepper', 0.35::numeric,'functional',0.74::numeric,'Heat without the fresh fruity top notes',                               'Start with 1/4 to 1/2 the amount by volume if using dried powder.'),
  ('piri-piri',      'cayenne-pepper', 1::numeric, 'direct',     0.78::numeric, 'Sharp dried heat for peri-peri style sauces',                           'Add lemon and garlic to mimic peri-peri brightness.'),
  ('cayenne-pepper', 'piri-piri',      1::numeric, 'direct',     0.78::numeric, 'Sharp dried heat for peri-peri style sauces',                           'Prefer African bird''s eye when available.'),
  ('cassava-flour',  'tapioca-flour',  1::numeric, 'direct',     0.90::numeric, 'Same root family; similar gluten-free binding',                         'Slightly more elastic; blend for fufu-like doughs.'),
  ('tapioca-flour',  'cassava-flour',  1::numeric, 'direct',     0.90::numeric, 'Same root family; similar gluten-free binding',                         'Cassava flour is the more common African market name.'),
  ('plantain',       'banana',         1::numeric, 'emergency',  0.50::numeric, 'Sweet and ripe plantain stand-in only',                                 'Use ripe bananas for sweets; green plantain needs potato or yam instead.'),
  ('plantain',       'sweet-potato',   1::numeric, 'functional', 0.68::numeric, 'Starchy roasted and fried side when green plantain is scarce',          'Sweeter and softer; season with salt and spice.'),
  ('yam',            'sweet-potato',   1::numeric, 'functional', 0.65::numeric, 'Accessible tuber for pounding and boiling contexts',                    'Sweeter and wetter than true African yam — drain well.'),
  ('fonio',          'quinoa',         1::numeric, 'functional', 0.75::numeric, 'Tiny gluten-free grain with similar cook method',                       'Quinoa is nuttier; rinse well.'),
  ('teff',           'sorghum-flour',  1::numeric, 'functional', 0.70::numeric, 'Gluten-free flour for injera-adjacent flatbreads',                      'Won''t sour the same as fermented teff; mix with wheat if needed.'),
  ('crayfish',       'dried-shrimp',   1::numeric, 'direct',     0.92::numeric, 'Same dried seafood umami role in West African stews',                   'Grind and bloom in oil; adjust salt (both are salty).'),
  ('dried-shrimp',   'crayfish',       1::numeric, 'direct',     0.92::numeric, 'Same dried seafood umami role in West African stews',                   'Prefer crayfish powder in Nigerian recipes when available.'),
  ('iru',            'miso',           1::numeric, 'emergency',  0.58::numeric, 'Fermented savory depth when locust bean is unavailable',                'Use sparingly; soy profile differs from iru — still adds funk.'),
  ('stockfish',      'salted-cod',     1::numeric, 'direct',     0.80::numeric, 'Preserved white fish for soups and stews',                              'Soak to desalinate; texture is softer than dried stockfish.'),
  ('groundnut',      'peanut-butter',  1::numeric, 'direct',     0.90::numeric, 'Ready-ground peanut base for maafe and groundnut stews',                'Use unsweetened; thin with stock. Skip added sugar brands.'),
  ('okra',           'zucchini',       1::numeric, 'emergency',  0.45::numeric, 'Vegetable bulk when okra mucilage is not required',                     'No draw — add a spoon of cornstarch if you need thickness.'),
  ('tomato-paste',   'tomato-sauce',   3::numeric, 'direct',     0.78::numeric, 'Tomato body and color for stews',                                       'Reduce longer to concentrate; ~3:1 sauce to paste.'),
  ('stock-cube',     'chicken-stock',  1::numeric, 'direct',     0.85::numeric, 'Liquid stock instead of concentrated cube',                             'Reduce other salt; ~250ml stock equals 1 cube.'),
  ('cilantro',       'parsley',        1::numeric, 'direct',     0.70::numeric, 'Fresh green garnish when cilantro is disliked or unavailable',          'Missing citrusy cilantro note.'),
  ('parsley',        'cilantro',       1::numeric, 'direct',     0.70::numeric, 'Fresh green garnish swap',                                               'Cilantro is brighter; use when the dish expects it.'),
  ('tahini',         'peanut-butter',  1::numeric, 'emergency',  0.55::numeric, 'Nutty paste for North African and Levantine sauces',                    'Stronger peanut flavor; thin with lemon and water.'),
  ('ghee',           'butter',         1::numeric, 'direct',     0.88::numeric, 'Dairy fat for finishing and frying',                                    'Butter browns faster and has more water — lower heat slightly.'),
  ('butter',         'ghee',           1::numeric, 'direct',     0.88::numeric, 'Dairy fat for finishing and frying',                                    'Ghee has higher smoke point and deeper aroma.')
)
INSERT INTO public.ingredient_substitutions (
  original_ingredient_id,
  substitute_ingredient_id,
  quantity_ratio,
  compatibility_score,
  substitution_type,
  confidence,
  reason,
  notes,
  is_verified,
  review_status,
  source,
  licence
)
SELECT
  o.id,
  s.id,
  p.ratio,
  ROUND(p.conf * 100)::int,
  p.sub_type,
  p.conf,
  p.reason,
  p.notes,
  true,
  'approved',
  'ladhaquest-graph-v1',
  'CC0-1.0'
FROM pairs p
JOIN public.ingredients o ON o.slug = p.from_slug
JOIN public.ingredients s ON s.slug = p.to_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ingredient_substitutions x
  WHERE x.original_ingredient_id  = o.id
    AND x.substitute_ingredient_id = s.id
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4) Seed ingredient_availability — NG, KE, GH, ZA, EG, TZ (100 ingredients × up to 6)
--    Uses a VALUES CTE for a compact representation; ON CONFLICT DO NOTHING.
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.ingredient_availability (ingredient_id, country_code, region, availability_score, typical_price, currency, price_unit, confidence, review_status, source, licence)
SELECT i.id, a.cc, '', a.avail, a.price, a.cur, a.unit, a.conf, 'approved', 'ladhaquest-market-v1', 'CC0-1.0'
FROM (VALUES
  -- ugwu
  ('ugwu','NG',0.92,500,'NGN','bunch',0.9),('ugwu','KE',0.25,80,'KES','bunch',0.7),('ugwu','GH',0.55,10,'GHS','bunch',0.7),('ugwu','ZA',0.20,35,'ZAR','bunch',0.6),('ugwu','EG',0.15,45,'EGP','bunch',0.5),('ugwu','TZ',0.20,2000,'TZS','bunch',0.5),
  -- sukuma-wiki
  ('sukuma-wiki','NG',0.40,700,'NGN','bunch',0.7),('sukuma-wiki','KE',0.98,30,'KES','bunch',0.95),('sukuma-wiki','GH',0.50,12,'GHS','bunch',0.8),('sukuma-wiki','ZA',0.85,15,'ZAR','bunch',0.9),('sukuma-wiki','EG',0.40,25,'EGP','bunch',0.6),('sukuma-wiki','TZ',0.95,800,'TZS','bunch',0.9),
  -- kale
  ('kale','NG',0.55,800,'NGN','bunch',0.8),('kale','KE',0.80,40,'KES','bunch',0.9),('kale','GH',0.60,12,'GHS','bunch',0.8),('kale','ZA',0.90,18,'ZAR','bunch',0.9),('kale','EG',0.50,28,'EGP','bunch',0.7),('kale','TZ',0.70,1000,'TZS','bunch',0.8),
  -- spinach
  ('spinach','NG',0.90,600,'NGN','bunch',0.9),('spinach','KE',0.95,50,'KES','bunch',0.95),('spinach','GH',0.90,8,'GHS','bunch',0.9),('spinach','ZA',0.95,18,'ZAR','bunch',0.95),('spinach','EG',0.90,20,'EGP','bunch',0.9),('spinach','TZ',0.90,1500,'TZS','bunch',0.9),
  -- bitterleaf
  ('bitterleaf','NG',0.80,400,'NGN','bunch',0.85),('bitterleaf','KE',0.10,80,'KES','bunch',0.4),('bitterleaf','GH',0.60,8,'GHS','bunch',0.75),('bitterleaf','ZA',0.10,40,'ZAR','bunch',0.4),('bitterleaf','EG',0.05,50,'EGP','bunch',0.3),('bitterleaf','TZ',0.15,1500,'TZS','bunch',0.4),
  -- palm-oil
  ('palm-oil','NG',0.98,2200,'NGN','l',0.98),('palm-oil','KE',0.55,280,'KES','l',0.75),('palm-oil','GH',0.95,28,'GHS','l',0.95),('palm-oil','ZA',0.50,70,'ZAR','l',0.65),('palm-oil','EG',0.35,90,'EGP','l',0.5),('palm-oil','TZ',0.50,6500,'TZS','l',0.6),
  -- vegetable-oil
  ('vegetable-oil','NG',0.98,1800,'NGN','l',0.98),('vegetable-oil','KE',0.98,220,'KES','l',0.98),('vegetable-oil','GH',0.98,22,'GHS','l',0.98),('vegetable-oil','ZA',0.98,35,'ZAR','l',0.98),('vegetable-oil','EG',0.98,50,'EGP','l',0.98),('vegetable-oil','TZ',0.95,5000,'TZS','l',0.95),
  -- egusi
  ('egusi','NG',0.95,3500,'NGN','kg',0.95),('egusi','KE',0.30,600,'KES','kg',0.55),('egusi','GH',0.70,45,'GHS','kg',0.75),('egusi','ZA',0.25,120,'ZAR','kg',0.45),('egusi','EG',0.20,150,'EGP','kg',0.35),('egusi','TZ',0.25,14000,'TZS','kg',0.4),
  -- ogbono
  ('ogbono','NG',0.90,5000,'NGN','kg',0.9),('ogbono','KE',0.20,800,'KES','kg',0.4),('ogbono','GH',0.55,55,'GHS','kg',0.6),('ogbono','ZA',0.15,140,'ZAR','kg',0.3),('ogbono','EG',0.10,160,'EGP','kg',0.2),('ogbono','TZ',0.15,16000,'TZS','kg',0.25),
  -- okra
  ('okra','NG',0.90,1200,'NGN','kg',0.9),('okra','KE',0.75,120,'KES','kg',0.8),('okra','GH',0.90,12,'GHS','kg',0.9),('okra','ZA',0.65,25,'ZAR','kg',0.7),('okra','EG',0.80,30,'EGP','kg',0.8),('okra','TZ',0.80,3000,'TZS','kg',0.8),
  -- scotch-bonnet
  ('scotch-bonnet','NG',0.95,2500,'NGN','kg',0.95),('scotch-bonnet','KE',0.70,200,'KES','kg',0.75),('scotch-bonnet','GH',0.90,25,'GHS','kg',0.9),('scotch-bonnet','ZA',0.60,80,'ZAR','kg',0.65),('scotch-bonnet','EG',0.50,60,'EGP','kg',0.55),('scotch-bonnet','TZ',0.65,5000,'TZS','kg',0.7),
  -- tomatoes
  ('tomatoes','NG',0.95,1800,'NGN','kg',0.95),('tomatoes','KE',0.95,120,'KES','kg',0.95),('tomatoes','GH',0.95,18,'GHS','kg',0.95),('tomatoes','ZA',0.95,25,'ZAR','kg',0.95),('tomatoes','EG',0.95,30,'EGP','kg',0.95),('tomatoes','TZ',0.90,3500,'TZS','kg',0.9),
  -- onion
  ('onion','NG',0.98,1200,'NGN','kg',0.98),('onion','KE',0.98,100,'KES','kg',0.98),('onion','GH',0.98,14,'GHS','kg',0.98),('onion','ZA',0.98,20,'ZAR','kg',0.98),('onion','EG',0.98,22,'EGP','kg',0.98),('onion','TZ',0.95,2800,'TZS','kg',0.95),
  -- cassava
  ('cassava','NG',0.90,600,'NGN','kg',0.9),('cassava','KE',0.75,70,'KES','kg',0.85),('cassava','GH',0.90,6,'GHS','kg',0.9),('cassava','ZA',0.55,20,'ZAR','kg',0.7),('cassava','EG',0.30,30,'EGP','kg',0.5),('cassava','TZ',0.85,1500,'TZS','kg',0.85),
  -- yam
  ('yam','NG',0.95,1000,'NGN','kg',0.95),('yam','KE',0.40,150,'KES','kg',0.7),('yam','GH',0.90,12,'GHS','kg',0.9),('yam','ZA',0.35,40,'ZAR','kg',0.6),('yam','EG',0.25,50,'EGP','kg',0.5),('yam','TZ',0.40,3500,'TZS','kg',0.6),
  -- sweet-potato
  ('sweet-potato','NG',0.80,700,'NGN','kg',0.85),('sweet-potato','KE',0.85,70,'KES','kg',0.9),('sweet-potato','GH',0.85,8,'GHS','kg',0.9),('sweet-potato','ZA',0.90,20,'ZAR','kg',0.9),('sweet-potato','EG',0.70,35,'EGP','kg',0.8),('sweet-potato','TZ',0.85,2000,'TZS','kg',0.85),
  -- plantain
  ('plantain','NG',0.95,800,'NGN','kg',0.95),('plantain','KE',0.70,80,'KES','kg',0.8),('plantain','GH',0.95,8,'GHS','kg',0.95),('plantain','ZA',0.60,30,'ZAR','kg',0.7),('plantain','EG',0.40,40,'EGP','kg',0.6),('plantain','TZ',0.75,2000,'TZS','kg',0.8),
  -- teff
  ('teff','NG',0.25,6000,'NGN','kg',0.6),('teff','KE',0.40,500,'KES','kg',0.7),('teff','GH',0.20,70,'GHS','kg',0.5),('teff','ZA',0.45,110,'ZAR','kg',0.65),('teff','EG',0.35,90,'EGP','kg',0.6),('teff','TZ',0.30,14000,'TZS','kg',0.5),
  -- fonio
  ('fonio','NG',0.60,2000,'NGN','kg',0.75),('fonio','KE',0.20,200,'KES','kg',0.5),('fonio','GH',0.50,25,'GHS','kg',0.65),('fonio','ZA',0.15,80,'ZAR','kg',0.4),('fonio','EG',0.10,100,'EGP','kg',0.3),('fonio','TZ',0.20,5000,'TZS','kg',0.4),
  -- ghee
  ('ghee','NG',0.80,6000,'NGN','kg',0.8),('ghee','KE',0.85,700,'KES','kg',0.85),('ghee','GH',0.80,70,'GHS','kg',0.8),('ghee','ZA',0.95,90,'ZAR','kg',0.95),('ghee','EG',0.90,120,'EGP','kg',0.9),('ghee','TZ',0.75,15000,'TZS','kg',0.75),
  -- iru
  ('iru','NG',0.92,4000,'NGN','kg',0.92),('iru','KE',0.15,700,'KES','kg',0.4),('iru','GH',0.80,50,'GHS','kg',0.85),('iru','ZA',0.10,130,'ZAR','kg',0.3),('iru','EG',0.10,150,'EGP','kg',0.2),('iru','TZ',0.15,15000,'TZS','kg',0.3),
  -- crayfish
  ('crayfish','NG',0.90,8000,'NGN','kg',0.9),('crayfish','KE',0.25,900,'KES','kg',0.6),('crayfish','GH',0.70,90,'GHS','kg',0.75),('crayfish','ZA',0.20,150,'ZAR','kg',0.5),('crayfish','EG',0.15,200,'EGP','kg',0.4),('crayfish','TZ',0.20,20000,'TZS','kg',0.4),
  -- stockfish
  ('stockfish','NG',0.90,8000,'NGN','kg',0.9),('stockfish','KE',0.20,900,'KES','kg',0.5),('stockfish','GH',0.65,80,'GHS','kg',0.7),('stockfish','ZA',0.15,150,'ZAR','kg',0.4),('stockfish','EG',0.10,200,'EGP','kg',0.3),('stockfish','TZ',0.15,20000,'TZS','kg',0.3),
  -- groundnut
  ('groundnut','NG',0.95,2500,'NGN','kg',0.95),('groundnut','KE',0.90,300,'KES','kg',0.9),('groundnut','GH',0.95,30,'GHS','kg',0.95),('groundnut','ZA',0.85,50,'ZAR','kg',0.85),('groundnut','EG',0.70,70,'EGP','kg',0.75),('groundnut','TZ',0.85,7000,'TZS','kg',0.85),
  -- peanut-butter
  ('peanut-butter','NG',0.90,2500,'NGN','kg',0.9),('peanut-butter','KE',0.85,300,'KES','kg',0.85),('peanut-butter','GH',0.90,30,'GHS','kg',0.9),('peanut-butter','ZA',0.90,50,'ZAR','kg',0.9),('peanut-butter','EG',0.70,70,'EGP','kg',0.7),('peanut-butter','TZ',0.80,7000,'TZS','kg',0.8),
  -- cassava-flour
  ('cassava-flour','NG',0.85,1500,'NGN','kg',0.85),('cassava-flour','KE',0.70,160,'KES','kg',0.75),('cassava-flour','GH',0.85,16,'GHS','kg',0.85),('cassava-flour','ZA',0.55,30,'ZAR','kg',0.6),('cassava-flour','EG',0.30,40,'EGP','kg',0.45),('cassava-flour','TZ',0.80,3500,'TZS','kg',0.8),
  -- tapioca-flour
  ('tapioca-flour','NG',0.60,2500,'NGN','kg',0.65),('tapioca-flour','KE',0.55,250,'KES','kg',0.6),('tapioca-flour','GH',0.55,28,'GHS','kg',0.6),('tapioca-flour','ZA',0.70,55,'ZAR','kg',0.7),('tapioca-flour','EG',0.55,70,'EGP','kg',0.6),('tapioca-flour','TZ',0.50,6000,'TZS','kg',0.55),
  -- stock-cube
  ('stock-cube','NG',0.99,50,'NGN','piece',0.99),('stock-cube','KE',0.95,10,'KES','piece',0.95),('stock-cube','GH',0.99,1,'GHS','piece',0.99),('stock-cube','ZA',0.90,3,'ZAR','piece',0.9),('stock-cube','EG',0.85,3,'EGP','piece',0.85),('stock-cube','TZ',0.95,200,'TZS','piece',0.95),
  -- tomato-paste
  ('tomato-paste','NG',0.95,1200,'NGN','g',0.95),('tomato-paste','KE',0.95,120,'KES','g',0.95),('tomato-paste','GH',0.95,12,'GHS','g',0.95),('tomato-paste','ZA',0.95,22,'ZAR','g',0.95),('tomato-paste','EG',0.95,28,'EGP','g',0.95),('tomato-paste','TZ',0.90,3000,'TZS','g',0.9),
  -- rice
  ('rice','NG',0.98,1600,'NGN','kg',0.98),('rice','KE',0.98,180,'KES','kg',0.98),('rice','GH',0.98,16,'GHS','kg',0.98),('rice','ZA',0.98,28,'ZAR','kg',0.98),('rice','EG',0.98,35,'EGP','kg',0.98),('rice','TZ',0.98,4000,'TZS','kg',0.98),
  -- eggs
  ('eggs','NG',0.98,200,'NGN','piece',0.98),('eggs','KE',0.98,20,'KES','piece',0.98),('eggs','GH',0.98,2.5,'GHS','piece',0.98),('eggs','ZA',0.98,3.5,'ZAR','piece',0.98),('eggs','EG',0.98,4,'EGP','piece',0.98),('eggs','TZ',0.95,500,'TZS','piece',0.95),
  -- molokhia
  ('molokhia','NG',0.10,400,'NGN','bunch',0.3),('molokhia','KE',0.15,50,'KES','bunch',0.4),('molokhia','GH',0.10,10,'GHS','bunch',0.3),('molokhia','ZA',0.10,30,'ZAR','bunch',0.3),('molokhia','EG',0.95,20,'EGP','bunch',0.95),('molokhia','TZ',0.10,1500,'TZS','bunch',0.3),
  -- morogo
  ('morogo','NG',0.15,500,'NGN','bunch',0.4),('morogo','KE',0.30,40,'KES','bunch',0.6),('morogo','GH',0.20,8,'GHS','bunch',0.5),('morogo','ZA',0.80,15,'ZAR','bunch',0.9),('morogo','EG',0.10,30,'EGP','bunch',0.3),('morogo','TZ',0.40,1000,'TZS','bunch',0.6),
  -- ginger
  ('ginger','NG',0.90,2000,'NGN','kg',0.9),('ginger','KE',0.90,180,'KES','kg',0.9),('ginger','GH',0.90,20,'GHS','kg',0.9),('ginger','ZA',0.90,40,'ZAR','kg',0.9),('ginger','EG',0.90,45,'EGP','kg',0.9),('ginger','TZ',0.85,4500,'TZS','kg',0.85),
  -- garlic
  ('garlic','NG',0.90,3500,'NGN','kg',0.9),('garlic','KE',0.90,250,'KES','kg',0.9),('garlic','GH',0.90,40,'GHS','kg',0.9),('garlic','ZA',0.95,60,'ZAR','kg',0.95),('garlic','EG',0.95,55,'EGP','kg',0.95),('garlic','TZ',0.85,7000,'TZS','kg',0.85),
  -- tahini
  ('tahini','NG',0.40,5000,'NGN','kg',0.5),('tahini','KE',0.40,500,'KES','kg',0.5),('tahini','GH',0.35,55,'GHS','kg',0.45),('tahini','ZA',0.60,100,'ZAR','kg',0.6),('tahini','EG',0.85,120,'EGP','kg',0.85),('tahini','TZ',0.30,13000,'TZS','kg',0.4),
  -- dried-shrimp
  ('dried-shrimp','NG',0.80,7000,'NGN','kg',0.85),('dried-shrimp','KE',0.40,800,'KES','kg',0.65),('dried-shrimp','GH',0.65,80,'GHS','kg',0.7),('dried-shrimp','ZA',0.50,130,'ZAR','kg',0.65),('dried-shrimp','EG',0.40,160,'EGP','kg',0.6),('dried-shrimp','TZ',0.45,18000,'TZS','kg',0.6),
  -- butter
  ('butter','NG',0.80,6000,'NGN','kg',0.8),('butter','KE',0.85,700,'KES','kg',0.85),('butter','GH',0.80,70,'GHS','kg',0.8),('butter','ZA',0.95,90,'ZAR','kg',0.95),('butter','EG',0.90,120,'EGP','kg',0.9),('butter','TZ',0.75,15000,'TZS','kg',0.75)
) AS a(slug, cc, avail, price, cur, unit, conf)
JOIN public.ingredients i ON i.slug = a.slug
ON CONFLICT (ingredient_id, country_code, region) DO NOTHING;
