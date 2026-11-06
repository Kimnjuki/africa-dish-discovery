-- Insert trending recipes into the recipes table
INSERT INTO public.recipes (name, country, region, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, slug, is_african) VALUES
(
  'Baked Feta Pasta',
  'Italy', 
  'Europe',
  'Born on TikTok in early 2022, Baked Feta Pasta became a global phenomenon almost overnight. A block of feta cheese is nestled in a sea of cherry tomatoes, garlic, and olive oil, then roasted until the tomatoes burst and the feta melts into a creamy, dreamy sauce.',
  '[
    {"name": "cherry tomatoes", "qty": 4, "unit": "cups", "substitute": "grape tomatoes or diced Roma"},
    {"name": "feta cheese", "qty": 1, "unit": "block (8 oz)", "substitute": "tofu feta (vegan)"},
    {"name": "olive oil", "qty": 0.5, "unit": "cup"},
    {"name": "garlic (minced)", "qty": 4, "unit": "cloves"},
    {"name": "red pepper flakes", "qty": 1, "unit": "tsp"},
    {"name": "spaghetti or penne", "qty": 12, "unit": "oz"},
    {"name": "fresh basil", "qty": 0.5, "unit": "cup (chopped)"},
    {"name": "salt", "qty": 1, "unit": "tsp"}
  ]'::jsonb,
  '[
    {"instruction": "Preheat oven to 400°F (200°C). In a large oven-safe dish, toss cherry tomatoes, feta, olive oil, minced garlic, red pepper flakes, and salt."},
    {"instruction": "Bake for 30 minutes until tomatoes burst and feta is soft and melty."},
    {"instruction": "While baking, cook pasta according to package. Reserve 1 cup of pasta water before draining."},
    {"instruction": "Mix the baked tomato-feta mixture with hot pasta, adding reserved pasta water to create a creamy emulsion."},
    {"instruction": "Stir in fresh basil. Serve immediately with extra cracked black pepper and a drizzle of olive oil."}
  ]'::jsonb,
  10, 30, 4, 'Easy',
  ARRAY['trending', 'vegetarian', 'pasta', 'tiktok', 'one-pot', 'comfort', 'easy-dinner'],
  'baked-feta-pasta',
  false
),
(
  'Whipped Coffee (Dalgona)',
  'South Korea',
  'Asia', 
  'Also known as Dalgona coffee, this frothy, cloud-like beverage took the world by storm during the 2020 lockdowns. Named after a Korean honeycomb candy due to its sweet, brittle texture, it''s made by whipping just three ingredients.',
  '[
    {"name": "instant coffee", "qty": 2, "unit": "tbsp", "substitute": "espresso powder"},
    {"name": "sugar", "qty": 2, "unit": "tbsp"},
    {"name": "hot water", "qty": 2, "unit": "tbsp"},
    {"name": "milk (cold or hot)", "qty": 1, "unit": "cup"},
    {"name": "ice cubes", "qty": 1, "unit": "cup (if serving iced)"}
  ]'::jsonb,
  '[
    {"instruction": "In a medium bowl, combine instant coffee, sugar, and hot water."},
    {"instruction": "Whip vigorously with a hand mixer or whisk for 3–5 minutes until thick, glossy, and light brown."},
    {"instruction": "Fill a tall glass with ice (if making iced version) and pour in cold milk."},
    {"instruction": "Spoon the whipped coffee on top of the milk."},
    {"instruction": "Stir gently to create a marbled effect or enjoy layered. Sip and savor!"}
  ]'::jsonb,
  5, 0, 1, 'Easy',
  ARRAY['beverage', 'korean', 'tiktok', 'coffee', 'vegan', 'quick', 'no-cook'],
  'whipped-coffee-dalgona',
  false
),
(
  'Crispy Pancakes (TikTok Style)',
  'Global',
  'Worldwide',
  'These ultra-thin, lacy-edged pancakes became a viral sensation on TikTok for their mesmerizing cooking process and irresistible crunch. Inspired by Korean-style street pancakes, they''re made from a simple batter.',
  '[
    {"name": "all-purpose flour", "qty": 1, "unit": "cup"},
    {"name": "milk", "qty": 1, "unit": "cup"},
    {"name": "egg", "qty": 1, "unit": "large"},
    {"name": "sugar", "qty": 1, "unit": "tbsp"},
    {"name": "baking powder", "qty": 1, "unit": "tsp"},
    {"name": "vegetable oil", "qty": 2, "unit": "tbsp"},
    {"name": "honey or condensed milk", "qty": 0.25, "unit": "cup (for serving)"}
  ]'::jsonb,
  '[
    {"instruction": "In a bowl, whisk together flour, milk, egg, sugar, baking powder, and oil until smooth."},
    {"instruction": "Heat oil in a non-stick pan over medium heat. Pour small circles of batter (about 2 inches wide)."},
    {"instruction": "Fry for 2–3 minutes per side until deeply golden and crispy at the edges."},
    {"instruction": "Drain on paper towels. Repeat with remaining batter."},
    {"instruction": "Drizzle with honey or condensed milk and serve warm."}
  ]'::jsonb,
  10, 15, 2, 'Medium',
  ARRAY['breakfast', 'tiktok', 'crispy', 'pancake', 'street-food', 'sweet', 'viral'],
  'crispy-pancakes-tiktok',
  false
),
(
  'Cloud Bread',
  'Global',
  'Worldwide',
  'Cloud bread is a whimsical, low-carb ''bread'' made from just three ingredients: egg whites, cream cheese, and cream of tartar. When baked, it puffs into a soft, airy mound that melts in your mouth.',
  '[
    {"name": "eggs", "qty": 3, "unit": "large"},
    {"name": "cream cheese", "qty": 3, "unit": "oz", "substitute": "goat cheese or dairy-free alternative"},
    {"name": "cream of tartar", "qty": 1.5, "unit": "tsp"},
    {"name": "sugar", "qty": 2, "unit": "tbsp (optional)"}
  ]'::jsonb,
  '[
    {"instruction": "Preheat oven to 300°F (150°C). Line a baking sheet with parchment."},
    {"instruction": "Separate egg whites and yolks. Beat whites with cream of tartar until stiff peaks form."},
    {"instruction": "Beat yolks with cream cheese and sugar (if using) until smooth."},
    {"instruction": "Gently fold yolk mixture into whites. Scoop into 8 mounds on baking sheet."},
    {"instruction": "Bake for 25 minutes until golden. Cool completely before serving."}
  ]'::jsonb,
  10, 25, 8, 'Medium',
  ARRAY['keto', 'gluten-free', 'low-carb', 'bread', 'baking', 'meringue', 'diet-friendly'],
  'cloud-bread',
  false
),
(
  'Ramen Carbonara',
  'Japan/Italy',
  'Fusion',
  'A bold fusion of Japanese ramen and Italian carbonara — this dish blends chewy ramen noodles with a creamy sauce made from egg yolks, Parmesan, and pancetta. No cream, no butter — just rich umami.',
  '[
    {"name": "ramen noodles", "qty": 2, "unit": "packets"},
    {"name": "eggs", "qty": 2, "unit": "large (yolks only)"},
    {"name": "grated parmesan", "qty": 0.5, "unit": "cup"},
    {"name": "bacon or pancetta", "qty": 4, "unit": "slices"},
    {"name": "green onions", "qty": 2, "unit": "green (sliced)"},
    {"name": "nori (seaweed)", "qty": 2, "unit": "sheets (torn)"},
    {"name": "sesame oil", "qty": 1, "unit": "tbsp"}
  ]'::jsonb,
  '[
    {"instruction": "Cook ramen according to package. Reserve 1/2 cup of broth, then drain."},
    {"instruction": "Fry bacon in a pan until crisp. Remove and set aside."},
    {"instruction": "In a bowl, whisk egg yolks and parmesan until smooth."},
    {"instruction": "Off heat, mix hot ramen with egg mixture, reserved broth, and sesame oil."},
    {"instruction": "Top with bacon, green onions, and nori. Serve immediately."}
  ]'::jsonb,
  10, 15, 2, 'Medium',
  ARRAY['fusion', 'ramen', 'pasta', 'creamy', 'japanese', 'italian', 'dinner'],
  'ramen-carbonara',
  false
);

-- Update trends table with new trending recipes
INSERT INTO public.trends (recipe_id, score, views_24h, shares, source)
SELECT 
  r.id,
  CASE 
    WHEN r.slug = 'baked-feta-pasta' THEN 95.5
    WHEN r.slug = 'whipped-coffee-dalgona' THEN 89.2
    WHEN r.slug = 'crispy-pancakes-tiktok' THEN 87.8
    WHEN r.slug = 'cloud-bread' THEN 82.1
    WHEN r.slug = 'ramen-carbonara' THEN 79.3
  END as score,
  CASE 
    WHEN r.slug = 'baked-feta-pasta' THEN 125000
    WHEN r.slug = 'whipped-coffee-dalgona' THEN 98000
    WHEN r.slug = 'crispy-pancakes-tiktok' THEN 89000
    WHEN r.slug = 'cloud-bread' THEN 76000
    WHEN r.slug = 'ramen-carbonara' THEN 65000
  END as views_24h,
  CASE 
    WHEN r.slug = 'baked-feta-pasta' THEN 8500
    WHEN r.slug = 'whipped-coffee-dalgona' THEN 7200
    WHEN r.slug = 'crispy-pancakes-tiktok' THEN 6800
    WHEN r.slug = 'cloud-bread' THEN 5900
    WHEN r.slug = 'ramen-carbonara' THEN 4800
  END as shares,
  'Global Food Trends API' as source
FROM public.recipes r
WHERE r.slug IN ('baked-feta-pasta', 'whipped-coffee-dalgona', 'crispy-pancakes-tiktok', 'cloud-bread', 'ramen-carbonara');