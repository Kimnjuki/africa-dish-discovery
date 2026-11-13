-- F06: Bootstrap African ingredient substitution graph into DB tables.
-- Idempotent name-based seed for ingredients + ingredient_substitutions.
-- Client `src/lib/substitutionGraph.ts` remains the offline source of truth for UI.

-- 1) Ensure ingredient rows exist (unique on name)
INSERT INTO public.ingredients (name, category)
VALUES
  ('Ugwu', 'vegetable'),
  ('Spinach', 'vegetable'),
  ('Kale', 'vegetable'),
  ('Sukuma Wiki', 'vegetable'),
  ('Collard Greens', 'vegetable'),
  ('Bitterleaf', 'vegetable'),
  ('Morogo', 'vegetable'),
  ('Molokhia', 'vegetable'),
  ('Egusi', 'seed'),
  ('Pumpkin Seeds', 'seed'),
  ('Sunflower Seeds', 'seed'),
  ('Ogbono', 'seed'),
  ('Okra', 'vegetable'),
  ('Palm Oil', 'oil'),
  ('Vegetable Oil', 'oil'),
  ('Coconut Oil', 'oil'),
  ('Ghee', 'oil'),
  ('Scotch Bonnet', 'spice'),
  ('Habanero', 'spice'),
  ('Cayenne', 'spice'),
  ('Piri Piri', 'spice'),
  ('Cassava Flour', 'flour'),
  ('Tapioca Flour', 'flour'),
  ('Plantain', 'produce'),
  ('Banana', 'produce'),
  ('Sweet Potato', 'produce'),
  ('Yam', 'produce'),
  ('Fonio', 'grain'),
  ('Quinoa', 'grain'),
  ('Teff', 'grain'),
  ('Sorghum Flour', 'flour'),
  ('Crayfish', 'seafood'),
  ('Dried Shrimp', 'seafood'),
  ('Iru', 'condiment'),
  ('Miso', 'condiment'),
  ('Stockfish', 'seafood'),
  ('Salted Cod', 'seafood'),
  ('Groundnut', 'nut'),
  ('Peanut Butter', 'nut'),
  ('Tomato Paste', 'condiment'),
  ('Tomato Sauce', 'condiment'),
  ('Stock Cube', 'condiment'),
  ('Chicken Stock', 'condiment'),
  ('Cilantro', 'herb'),
  ('Parsley', 'herb'),
  ('Tahini', 'condiment'),
  ('Butter', 'oil')
ON CONFLICT (name) DO NOTHING;

-- 2) Insert directed edges when missing (lookup by case-insensitive name)
WITH pairs(original_name, substitute_name, reason, notes, quantity_ratio, compatibility_score) AS (
  VALUES
    ('Ugwu', 'Spinach', 'Similar soft leafy texture for soups and stews', 'Spinach wilts faster — add near the end; milder than ugwu. Regions: Nigeria, West Africa.', 1::numeric, 88::numeric),
    ('Spinach', 'Ugwu', 'Similar soft leafy texture for soups and stews', 'Use ugwu when available for more authentic West African greens.', 1::numeric, 88::numeric),
    ('Ugwu', 'Kale', 'Sturdier green with comparable body in egusi / vegetable soups', 'Strip stems and chop fine; cook a bit longer than ugwu.', 1::numeric, 82::numeric),
    ('Sukuma Wiki', 'Collard Greens', 'Same brassica family; classic East African sukuma swap abroad', 'Slice thin ribbons; longer simmer softens bitterness. Regions: Kenya, Tanzania, Uganda.', 1::numeric, 95::numeric),
    ('Collard Greens', 'Sukuma Wiki', 'Same brassica family; classic East African sukuma swap abroad', 'Preferred local name in Kenya/Tanzania markets.', 1::numeric, 95::numeric),
    ('Sukuma Wiki', 'Kale', 'Widely available brassica; works in ugali + greens plates', 'Slightly sweeter; reduce cook time vs mature sukuma.', 1::numeric, 86::numeric),
    ('Egusi', 'Pumpkin Seeds', 'Closest oilseed stand-in for ground egusi soups', 'Toast and grind; flavor is nuttier and less earthy than true egusi.', 1::numeric, 84::numeric),
    ('Pumpkin Seeds', 'Egusi', 'Closest oilseed stand-in for ground egusi soups', 'Prefer true egusi when cooking West African soups.', 1::numeric, 84::numeric),
    ('Egusi', 'Sunflower Seeds', 'Budget oilseed thickener for egusi-style soups', 'Grind fine; color will be paler — palm oil restores hue.', 1::numeric, 70::numeric),
    ('Ogbono', 'Okra', 'Draw / mucilage thickener when ogbono is unavailable', 'Chop or blend okra for stretch; flavor differs from bush mango.', 1::numeric, 72::numeric),
    ('Palm Oil', 'Vegetable Oil', 'Neutral cooking fat when red palm oil is unavailable', 'Loses color and palm aroma — paprika/annatto for hue only.', 1::numeric, 55::numeric),
    ('Palm Oil', 'Coconut Oil', 'Tropical fat alternative with some aroma', 'Coconut notes change the dish; use sparingly in stews.', 1::numeric, 60::numeric),
    ('Palm Oil', 'Ghee', 'Rich fat for North / East African adaptations', 'Better for suqaar/stews than classic Nigerian palm-oil soups.', 1::numeric, 48::numeric),
    ('Scotch Bonnet', 'Habanero', 'Near-identical heat and fruity aroma', 'Use 1:1; seed to dial heat. Closest diaspora swap.', 1::numeric, 96::numeric),
    ('Habanero', 'Scotch Bonnet', 'Near-identical heat and fruity aroma', 'Interchangeable in most West African / Caribbean recipes.', 1::numeric, 96::numeric),
    ('Scotch Bonnet', 'Cayenne', 'Heat without the fresh fruity top notes', 'Start with less if using dried powder.', 0.35::numeric, 74::numeric),
    ('Piri Piri', 'Cayenne', 'Sharp dried heat for peri-peri style sauces', 'Add lemon/garlic to mimic peri-peri brightness.', 1::numeric, 78::numeric),
    ('Cayenne', 'Piri Piri', 'Sharp dried heat for peri-peri style sauces', 'Prefer African bird''s eye when available.', 1::numeric, 78::numeric),
    ('Cassava Flour', 'Tapioca Flour', 'Same root family; similar gluten-free binding', 'Slightly more elastic; blend for fufu-like doughs.', 1::numeric, 90::numeric),
    ('Tapioca Flour', 'Cassava Flour', 'Same root family; similar gluten-free binding', 'Cassava flour is the more common African market name.', 1::numeric, 90::numeric),
    ('Plantain', 'Banana', 'Sweet/ripe plantain stand-in only', 'Use ripe bananas for sweets; green plantain needs potato/yam instead.', 1::numeric, 50::numeric),
    ('Plantain', 'Sweet Potato', 'Starchy roasted/fried side when green plantain is scarce', 'Sweeter and softer; season with salt and spice.', 1::numeric, 68::numeric),
    ('Yam', 'Sweet Potato', 'Accessible tuber for pounding / boiling contexts', 'Sweeter and wetter than true African yam — drain well.', 1::numeric, 65::numeric),
    ('Fonio', 'Quinoa', 'Tiny gluten-free grain with similar cook method', 'Quinoa is nuttier; rinse well.', 1::numeric, 75::numeric),
    ('Teff', 'Sorghum Flour', 'Gluten-free flour for injera-adjacent flatbreads', 'Won''t sour the same as fermented teff.', 1::numeric, 70::numeric),
    ('Crayfish', 'Dried Shrimp', 'Same dried seafood umami role in West African stews', 'Grind and bloom in oil; adjust salt.', 1::numeric, 92::numeric),
    ('Dried Shrimp', 'Crayfish', 'Same dried seafood umami role in West African stews', 'Prefer crayfish powder in Nigerian recipes when available.', 1::numeric, 92::numeric),
    ('Iru', 'Miso', 'Fermented savory depth when locust bean is unavailable', 'Use sparingly; soy profile differs from irú.', 1::numeric, 58::numeric),
    ('Stockfish', 'Salted Cod', 'Preserved white fish for soups and stews', 'Soak to desalinate; softer than dried stockfish.', 1::numeric, 80::numeric),
    ('Groundnut', 'Peanut Butter', 'Ready-ground peanut base for maafe / groundnut stews', 'Use unsweetened; thin with stock.', 1::numeric, 90::numeric),
    ('Tomato Paste', 'Tomato Sauce', 'Tomato body and color for stews', 'Reduce longer to concentrate; ~3:1 sauce to paste.', 3::numeric, 78::numeric),
    ('Stock Cube', 'Chicken Stock', 'Liquid stock instead of concentrated cube', 'Reduce other salt; ~250ml stock ≈ 1 cube.', 1::numeric, 85::numeric),
    ('Cilantro', 'Parsley', 'Fresh green garnish when cilantro is disliked or unavailable', 'Missing citrusy cilantro note.', 1::numeric, 70::numeric),
    ('Parsley', 'Cilantro', 'Fresh green garnish swap', 'Cilantro is brighter; use when the dish expects it.', 1::numeric, 70::numeric),
    ('Tahini', 'Peanut Butter', 'Nutty paste for North African / Levantine sauces', 'Stronger peanut flavor; thin with lemon and water.', 1::numeric, 55::numeric),
    ('Ghee', 'Butter', 'Dairy fat for finishing and frying', 'Butter browns faster — lower heat slightly.', 1::numeric, 88::numeric),
    ('Butter', 'Ghee', 'Dairy fat for finishing and frying', 'Ghee has higher smoke point and deeper aroma.', 1::numeric, 88::numeric),
    ('Bitterleaf', 'Kale', 'Bitter green body for soups when onugbu is scarce', 'Won''t match true bitterleaf bite.', 1::numeric, 62::numeric),
    ('Morogo', 'Spinach', 'Soft cooked green for Southern African relish dishes', 'Spinach is milder; season boldly with onion and tomato.', 1::numeric, 80::numeric),
    ('Spinach', 'Morogo', 'Soft cooked green for Southern African relish dishes', 'Prefer morogo/amaranth when available.', 1::numeric, 80::numeric),
    ('Molokhia', 'Spinach', 'Viscous green stew filler when jute leaf is unavailable', 'Texture won''t be as mucilaginous; okra can help thicken.', 1::numeric, 58::numeric)
)
INSERT INTO public.ingredient_substitutions (
  original_ingredient_id,
  substitute_ingredient_id,
  reason,
  notes,
  quantity_ratio,
  compatibility_score
)
SELECT
  o.id,
  s.id,
  p.reason,
  p.notes,
  p.quantity_ratio,
  p.compatibility_score
FROM pairs p
JOIN public.ingredients o ON lower(o.name) = lower(p.original_name)
JOIN public.ingredients s ON lower(s.name) = lower(p.substitute_name)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ingredient_substitutions x
  WHERE x.original_ingredient_id = o.id
    AND x.substitute_ingredient_id = s.id
);
