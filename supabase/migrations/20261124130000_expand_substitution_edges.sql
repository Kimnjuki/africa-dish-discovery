-- Expand verified ingredient_substitutions for high-frequency African staples.
-- Ensures ingredient rows exist, then inserts directed edges idempotently.

INSERT INTO public.ingredients (name, slug, canonical_name, category, review_status, source)
SELECT v.name, v.slug, v.name, v.category, 'approved', 'ladhaquest-sub-expand-v1'
FROM (
  VALUES
    ('Water Leaves', 'water-leaves-expand', 'vegetable'),
    ('Utazi', 'utazi-expand', 'herb'),
    ('Uziza', 'uziza-expand', 'spice'),
    ('Alligator Pepper', 'alligator-pepper-expand', 'spice'),
    ('Grains of Paradise', 'grains-of-paradise-expand', 'spice'),
    ('Suya Spice', 'suya-spice-expand', 'spice'),
    ('Berbere', 'berbere', 'spice'),
    ('Niter Kibbeh', 'niter-kibbeh', 'oil'),
    ('Fufu', 'fufu', 'starch'),
    ('Pounded Yam', 'pounded-yam', 'starch'),
    ('Garri', 'garri', 'starch'),
    ('Ogiri', 'ogiri', 'condiment'),
    ('Smoked Fish', 'smoked-fish-expand', 'seafood'),
    ('Tilapia', 'tilapia-expand', 'seafood'),
    ('Catfish', 'catfish-expand', 'seafood'),
    ('Goat', 'goat-expand', 'protein'),
    ('Lamb', 'lamb-expand', 'protein'),
    ('Maize Meal', 'maize-meal', 'grain'),
    ('Polenta', 'polenta', 'grain'),
    ('Millet', 'millet-expand', 'grain'),
    ('Sorghum', 'sorghum-expand', 'grain'),
    ('Hibiscus', 'hibiscus', 'produce'),
    ('Baobab', 'baobab', 'produce'),
    ('Tamarind', 'tamarind', 'produce'),
    ('Garden Egg', 'garden-egg', 'produce'),
    ('Cocoyam', 'cocoyam-expand', 'produce'),
    ('Periwinkle', 'periwinkle-expand', 'seafood'),
    ('Prawns', 'prawns-expand', 'seafood'),
    ('Palm Wine', 'palm-wine', 'liquid'),
    ('White Wine', 'white-wine', 'liquid'),
    ('Shea Butter', 'shea-butter', 'oil'),
    ('Eggplant', 'eggplant-expand', 'produce'),
    ('Basil', 'basil-expand', 'herb'),
    ('African Basil', 'african-basil-expand', 'herb'),
    ('Dawadawa', 'dawadawa', 'condiment'),
    ('Cassava Flour', 'cassava-flour-expand', 'flour')
) AS v(name, slug, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredients i WHERE lower(i.name) = lower(v.name) OR i.slug = v.slug
);

WITH pairs(original_name, substitute_name, reason, notes, quantity_ratio, compatibility_score, substitution_type) AS (
  VALUES
    ('Water Leaves', 'Spinach', 'Soft mucilaginous green for Afang-style soups', 'Spinach is less mucilaginous; add okra for stretch.', 1::numeric, 78::numeric, 'functional'),
    ('Utazi', 'Bitterleaf', 'Bitter aromatic leaf for pepper soups', 'Use sparingly; rinse bitterleaf well.', 1::numeric, 70::numeric, 'functional'),
    ('Uziza', 'Basil', 'Peppery aromatic leaf when uziza is unavailable', 'Add late; crack black pepper on top.', 1::numeric, 55::numeric, 'emergency'),
    ('Alligator Pepper', 'Grains of Paradise', 'Related West African warm spice', 'Crush lightly; grains of paradise are hotter.', 1::numeric, 88::numeric, 'direct'),
    ('Grains of Paradise', 'Alligator Pepper', 'Related West African warm spice', 'Prefer alligator pepper for ritual uses.', 1::numeric, 88::numeric, 'direct'),
    ('Suya Spice', 'Cayenne Pepper', 'Heat base for suya when yaji is unavailable', 'Mix with ginger, garlic, and groundnut.', 1::numeric, 60::numeric, 'emergency'),
    ('Berbere', 'Cayenne Pepper', 'Heat core of berbere', 'Add paprika, fenugreek, garlic for closer profile.', 1::numeric, 58::numeric, 'emergency'),
    ('Niter Kibbeh', 'Ghee', 'Rich cooking fat when spiced butter is unavailable', 'Infuse with garlic, ginger, cardamom.', 1::numeric, 75::numeric, 'functional'),
    ('Fufu', 'Pounded Yam', 'Swallow staple with similar stretch', 'Yam is denser; adjust liquid.', 1::numeric, 80::numeric, 'functional'),
    ('Pounded Yam', 'Fufu', 'Swallow staple with similar stretch', 'Cassava fufu is lighter.', 1::numeric, 80::numeric, 'functional'),
    ('Garri', 'Cassava Flour', 'Same root for eba-style swallow', 'Stir into hot water gradually.', 1::numeric, 78::numeric, 'functional'),
    ('Ogiri', 'Iru', 'Fermented umami for soups', 'Both pungent — start with half.', 1::numeric, 85::numeric, 'direct'),
    ('Iru', 'Ogiri', 'Fermented umami for soups', 'Regional fermented seed pastes.', 1::numeric, 85::numeric, 'direct'),
    ('Smoked Fish', 'Stockfish', 'Preserved fish umami for stews', 'Soak stockfish; adjust salt.', 1::numeric, 76::numeric, 'functional'),
    ('Tilapia', 'Catfish', 'Firm freshwater fish for stews', 'Catfish is oilier.', 1::numeric, 88::numeric, 'direct'),
    ('Catfish', 'Tilapia', 'Firm freshwater fish for stews', 'Tilapia is leaner.', 1::numeric, 88::numeric, 'direct'),
    ('Goat', 'Lamb', 'Closest red meat for pepper soup and stews', 'Lamb is fattier; trim and skim.', 1::numeric, 90::numeric, 'direct'),
    ('Lamb', 'Goat', 'Closest red meat for pepper soup and stews', 'Goat is leaner and more mineral.', 1::numeric, 90::numeric, 'direct'),
    ('Maize Meal', 'Polenta', 'Same maize porridge staple', 'Cook to preferred firmness for ugali/nshima.', 1::numeric, 92::numeric, 'direct'),
    ('Polenta', 'Maize Meal', 'Same maize porridge staple', 'Use white maize meal for East/Southern African plates.', 1::numeric, 92::numeric, 'direct'),
    ('Millet', 'Sorghum', 'Sahel grain swap for porridge', 'Cooking times similar.', 1::numeric, 86::numeric, 'direct'),
    ('Sorghum', 'Millet', 'Sahel grain swap for porridge', 'Millet cooks slightly faster.', 1::numeric, 86::numeric, 'direct'),
    ('Hibiscus', 'Tamarind', 'Tart drink/sauce base when zobo is unavailable', 'Tamarind is darker; start with less.', 1::numeric, 52::numeric, 'emergency'),
    ('Baobab', 'Tamarind', 'Tangy fruit acid for drinks and sauces', 'Tamarind is more caramel; start with less.', 1::numeric, 68::numeric, 'functional'),
    ('Garden Egg', 'Eggplant', 'Same nightshade family for stews', 'Large aubergine is milder; salt and drain if needed.', 1::numeric, 80::numeric, 'functional'),
    ('Eggplant', 'Garden Egg', 'Same nightshade family for stews', 'Prefer garden egg for West African sauces.', 1::numeric, 80::numeric, 'functional'),
    ('Cocoyam', 'Yam', 'Starchy tuber for soups and pounding', 'Yam is less mucilaginous.', 1::numeric, 72::numeric, 'functional'),
    ('Periwinkle', 'Prawns', 'Briny seafood garnish for soups', 'Prawns cook faster; shellfish allergy still applies.', 1::numeric, 55::numeric, 'emergency'),
    ('Palm Wine', 'White Wine', 'Light fermented liquid for marinades', 'Misses yeasty palm character.', 1::numeric, 48::numeric, 'emergency'),
    ('Shea Butter', 'Butter', 'Cooking fat when shea is unavailable', 'Dairy — skip for vegan.', 1::numeric, 50::numeric, 'emergency'),
    ('Dawadawa', 'Iru', 'Same fermented locust bean under regional names', 'Grind into stew bases.', 1::numeric, 95::numeric, 'direct'),
    ('Iru', 'Dawadawa', 'Same fermented locust bean under regional names', 'Regional name for soumbala/netetou.', 1::numeric, 95::numeric, 'direct')
)
INSERT INTO public.ingredient_substitutions (
  original_ingredient_id,
  substitute_ingredient_id,
  quantity_ratio,
  compatibility_score,
  reason,
  notes,
  substitution_type,
  confidence,
  is_verified,
  review_status,
  source
)
SELECT o.id, s.id, p.quantity_ratio, p.compatibility_score, p.reason, p.notes,
       p.substitution_type, p.compatibility_score / 100.0, true, 'approved', 'ladhaquest-sub-expand-v1'
FROM pairs p
JOIN public.ingredients o ON lower(o.name) = lower(p.original_name)
JOIN public.ingredients s ON lower(s.name) = lower(p.substitute_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient_substitutions x
  WHERE x.original_ingredient_id = o.id AND x.substitute_ingredient_id = s.id
);

-- Cayenne may be stored as "Cayenne" or "Cayenne Pepper"
WITH cayenne_pairs AS (
  SELECT o.id AS oid, c.id AS cid
  FROM public.ingredients o
  JOIN public.ingredients c ON lower(c.name) IN ('cayenne', 'cayenne pepper')
  WHERE lower(o.name) IN ('suya spice', 'berbere')
)
INSERT INTO public.ingredient_substitutions (
  original_ingredient_id, substitute_ingredient_id, quantity_ratio, compatibility_score,
  reason, notes, substitution_type, confidence, is_verified, review_status, source
)
SELECT oid, cid, 1, 58, 'Heat base when blend is unavailable', 'Adjust quantity to taste.',
       'emergency', 0.58, true, 'approved', 'ladhaquest-sub-expand-v1'
FROM cayenne_pairs cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient_substitutions x
  WHERE x.original_ingredient_id = cp.oid AND x.substitute_ingredient_id = cp.cid
);
