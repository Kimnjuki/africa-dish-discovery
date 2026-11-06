-- Upsert 5 trending recipes by slug and insert trends if missing

-- 1) Baked Feta Pasta
WITH r AS (
  INSERT INTO recipes (name, slug, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, is_african)
  VALUES (
    'Baked Feta Pasta', 'baked-feta-pasta', 'Italy',
    'Born on TikTok in early 2022, Baked Feta Pasta became a global phenomenon almost overnight. A block of feta cheese is nestled in a sea of cherry tomatoes, garlic, and olive oil, then roasted until the tomatoes burst and the feta melts into a creamy, dreamy sauce. Tossed with al dente pasta and fresh basil, it''s comfort food at its simplest and most satisfying. No cream needed — the magic is in the slow roast. Loved by home cooks for its one-pan ease and photogenic flair, it''s now a staple in kitchens from Oslo to Los Angeles.',
    '[{"name": "cherry tomatoes", "qty": 4, "unit": "cups", "substitute": "grape tomatoes or diced Roma"}, {"name": "feta cheese", "qty": 1, "unit": "block (8 oz)", "substitute": "tofu feta (vegan)"}, {"name": "olive oil", "qty": 0.5, "unit": "cup"}, {"name": "garlic (minced)", "qty": 4, "unit": "cloves"}, {"name": "red pepper flakes", "qty": 1, "unit": "tsp"}, {"name": "spaghetti or penne", "qty": 12, "unit": "oz"}, {"name": "fresh basil", "qty": 0.5, "unit": "cup (chopped)"}, {"name": "salt", "qty": 1, "unit": "tsp"}]',
    '[{"instruction": "Preheat oven to 400°F (200°C). In a large oven-safe dish, toss cherry tomatoes, feta, olive oil, minced garlic, red pepper flakes, and salt.", "imagePrompt": "Overhead shot: cherry tomatoes and a white block of feta in a rustic ceramic dish, drizzled with olive oil, garlic cloves scattered around — soft natural light, food blog style."}, {"instruction": "Bake for 30 minutes until tomatoes burst and feta is soft and melty.", "imagePrompt": "Close-up: roasted tomatoes bursting with juice, oil shimmering, feta slightly collapsed — golden hour lighting, steam rising."}, {"instruction": "While baking, cook pasta according to package. Reserve 1 cup of pasta water before draining.", "imagePrompt": "Tall vertical shot: spaghetti swirling in boiling water, bubbles rising — kitchen background softly blurred."}, {"instruction": "Mix the baked tomato-feta mixture with hot pasta, adding reserved pasta water to create a creamy emulsion.", "imagePrompt": "Action shot: wooden spoon mixing pasta and sauce in a large bowl, creamy red sauce coating noodles — dynamic motion, glossy texture."}, {"instruction": "Stir in fresh basil. Serve immediately with extra cracked black pepper and a drizzle of olive oil.", "imagePrompt": "Final tall image: Baked Feta Pasta in a white bowl, garnished with basil leaves and cracked pepper — soft shadows, editorial food photography."}]',
    10, 30, 4, 'Easy', ARRAY['trending','vegetarian','pasta','tiktok','one-pot','comfort','easy-dinner'], false
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
), rx AS (
  SELECT id FROM r
  UNION ALL
  SELECT id FROM recipes WHERE slug = 'baked-feta-pasta'
)
INSERT INTO trends (recipe_id, score, views_24h, shares, source)
SELECT id, 94.5, 5200000, 248000, 'TikTok Viral 2022' FROM rx
ON CONFLICT (recipe_id) DO NOTHING;

-- 2) Whipped Coffee (Dalgona)
WITH r AS (
  INSERT INTO recipes (name, slug, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, is_african)
  VALUES (
    'Whipped Coffee (Dalgona)', 'whipped-coffee-dalgona', 'South Korea',
    'Also known as Dalgona coffee, this frothy, cloud-like beverage took the world by storm during the 2020 lockdowns. Named after a Korean honeycomb candy due to its sweet, brittle texture, it''s made by whipping just three ingredients — instant coffee, sugar, and hot water — into a thick, mousse-like foam. Spooned over cold or hot milk, it creates a mesmerizing layered drink that''s as fun to make as it is to drink. From Seoul cafés to living rooms in São Paulo, it became a global ritual — a moment of joy in uncertain times. Now a permanent fixture in the modern coffee canon.',
    '[{"name": "instant coffee", "qty": 2, "unit": "tbsp", "substitute": "espresso powder"}, {"name": "sugar", "qty": 2, "unit": "tbsp"}, {"name": "hot water", "qty": 2, "unit": "tbsp"}, {"name": "milk (cold or hot)", "qty": 1, "unit": "cup"}, {"name": "ice cubes", "qty": 1, "unit": "cup (if serving iced)"}]',
    '[{"instruction": "In a medium bowl, combine instant coffee, sugar, and hot water.", "imagePrompt": "Close-up: white ceramic bowl with coffee, sugar, and water — spoon mid-pour, morning light streaming in."}, {"instruction": "Whip vigorously with a hand mixer or whisk for 3–5 minutes until thick, glossy, and light brown.", "imagePrompt": "Action shot: electric mixer whipping coffee into soft peaks — foam turning golden, dynamic motion blur."}, {"instruction": "Fill a tall glass with ice (if making iced version) and pour in cold milk.", "imagePrompt": "Tall clear glass: ice cubes in milk, condensation on sides — minimalist background, soft focus."}, {"instruction": "Spoon the whipped coffee on top of the milk.", "imagePrompt": "Overhead: fluffy coffee dollop being spooned onto milk — layers clearly visible, inviting texture."}, {"instruction": "Stir gently to create a marbled effect or enjoy layered. Sip and savor!", "imagePrompt": "Final tall image: layered Dalgona coffee in a clear glass, straw beside it — soft lighting, Instagram-ready."}]',
    5, 0, 1, 'Easy', ARRAY['beverage','korean','tiktok','coffee','vegan','quick','no-cook'], false
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
), rx AS (
  SELECT id FROM r
  UNION ALL
  SELECT id FROM recipes WHERE slug = 'whipped-coffee-dalgona'
)
INSERT INTO trends (recipe_id, score, views_24h, shares, source)
SELECT id, 91.8, 4100000, 195000, 'TikTok Coffee Trend 2020' FROM rx
ON CONFLICT (recipe_id) DO NOTHING;

-- 3) Crispy Pancakes (TikTok Style)
WITH r AS (
  INSERT INTO recipes (name, slug, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, is_african)
  VALUES (
    'Crispy Pancakes (TikTok Style)', 'crispy-pancakes-tiktok', 'Global',
    'These ultra-thin, lacy-edged pancakes became a viral sensation on TikTok for their mesmerizing cooking process and irresistible crunch. Inspired by Korean-style street pancakes, they''re made from a simple batter of flour, egg, and milk, then fried in hot oil until golden and shatteringly crisp. Often drizzled with honey or condensed milk, they''re a sensory delight — crackling with every bite. More than just a breakfast, they''re a performance, a snack, and a social media moment rolled into one. From dorm rooms to food trucks, this trend shows how simplicity, texture, and visual appeal can create a global craving.',
    '[{"name": "all-purpose flour", "qty": 1, "unit": "cup"}, {"name": "milk", "qty": 1, "unit": "cup"}, {"name": "egg", "qty": 1, "unit": "large"}, {"name": "sugar", "qty": 1, "unit": "tbsp"}, {"name": "baking powder", "qty": 1, "unit": "tsp"}, {"name": "vegetable oil", "qty": 2, "unit": "tbsp"}, {"name": "honey or condensed milk", "qty": 0.25, "unit": "cup (for serving)"}]',
    '[{"instruction": "In a bowl, whisk together flour, milk, egg, sugar, baking powder, and oil until smooth.", "imagePrompt": "Hand whisking batter in a glass bowl — smooth, pourable texture, daylight kitchen."}, {"instruction": "Heat oil in a non-stick pan over medium heat. Pour small circles of batter (about 2 inches wide).", "imagePrompt": "Pan with shimmering oil, batter being poured in perfect circles — sizzle visible, golden reflection."}, {"instruction": "Fry for 2–3 minutes per side until deeply golden and crispy at the edges.", "imagePrompt": "Close-up: pancake edge crisping, golden lace forming — heat waves, golden color."}, {"instruction": "Drain on paper towels. Repeat with remaining batter.", "imagePrompt": "Stack of crispy pancakes on paper towel — steam rising, golden color, rustic plate."}, {"instruction": "Drizzle with honey or condensed milk and serve warm.", "imagePrompt": "Final tall image: crispy pancake on plate, honey drizzling from spoon — glossy, appetizing, food magazine style."}]',
    10, 15, 2, 'Medium', ARRAY['breakfast','tiktok','crispy','pancake','street-food','sweet','viral'], false
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
), rx AS (
  SELECT id FROM r
  UNION ALL
  SELECT id FROM recipes WHERE slug = 'crispy-pancakes-tiktok'
)
INSERT INTO trends (recipe_id, score, views_24h, shares, source)
SELECT id, 88.7, 2900000, 127000, 'TikTok Pancake Trend 2023' FROM rx
ON CONFLICT (recipe_id) DO NOTHING;

-- 4) Cloud Bread
WITH r AS (
  INSERT INTO recipes (name, slug, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, is_african)
  VALUES (
    'Cloud Bread', 'cloud-bread', 'Global',
    'Cloud bread is a whimsical, low-carb ''bread'' made from just three ingredients: egg whites, cream cheese, and cream of tartar. When baked, it puffs into a soft, airy mound that melts in your mouth like sweetened meringue. Born in keto communities, it gained viral fame for its dramatic rise and ethereal texture. While not a true bread replacement, it''s a delightful treat for sandwich lovers on gluten-free or low-carb diets. Now embraced beyond diet circles, it''s a symbol of culinary creativity — where science meets dessert, and expectations are literally blown away.',
    '[{"name": "eggs", "qty": 3, "unit": "large"}, {"name": "cream cheese", "qty": 3, "unit": "oz", "substitute": "goat cheese or dairy-free alternative"}, {"name": "cream of tartar", "qty": 1.5, "unit": "tsp"}, {"name": "sugar", "qty": 2, "unit": "tbsp (optional)"}]',
    '[{"instruction": "Preheat oven to 300°F (150°C). Line a baking sheet with parchment.", "imagePrompt": "Hands placing parchment on baking sheet — clean kitchen, soft lighting."}, {"instruction": "Separate egg whites and yolks. Beat whites with cream of tartar until stiff peaks form.", "imagePrompt": "Stand mixer: egg whites whipping into glossy peaks — light background, professional kitchen."}, {"instruction": "Beat yolks with cream cheese and sugar (if using) until smooth.", "imagePrompt": "Hand mixer blending yolks and cream cheese — creamy texture close-up."}, {"instruction": "Gently fold yolk mixture into whites. Scoop into 8 mounds on baking sheet.", "imagePrompt": "Spatula folding mixture — airy, cloud-like texture visible, soft shadows."}, {"instruction": "Bake for 25 minutes until golden. Cool completely before serving.", "imagePrompt": "Final tall image: golden cloud bread on cooling rack — soft shadows, dreamy, editorial style."}]',
    10, 25, 8, 'Medium', ARRAY['keto','gluten-free','low-carb','bread','baking','meringue','diet-friendly'], false
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
), rx AS (
  SELECT id FROM r
  UNION ALL
  SELECT id FROM recipes WHERE slug = 'cloud-bread'
)
INSERT INTO trends (recipe_id, score, views_24h, shares, source)
SELECT id, 86.3, 2400000, 98000, 'Keto TikTok 2021' FROM rx
ON CONFLICT (recipe_id) DO NOTHING;

-- 5) Ramen Carbonara
WITH r AS (
  INSERT INTO recipes (name, slug, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, is_african)
  VALUES (
    'Ramen Carbonara', 'ramen-carbonara', 'Japan/Italy',
    'A bold fusion of Japanese ramen and Italian carbonara — this dish blends chewy ramen noodles with a creamy sauce made from egg yolks, Parmesan, and pancetta. No cream, no butter — just rich umami from the egg and cheese emulsion. Topped with nori and sesame seeds, it bridges two culinary worlds in perfect harmony. Born in fusion kitchens and popularized by food bloggers, it''s a testament to how global palates are evolving. It''s comfort food with a passport — satisfying, creamy, and deeply flavorful.',
    '[{"name": "ramen noodles", "qty": 2, "unit": "packets"}, {"name": "eggs", "qty": 2, "unit": "large (yolks only)"}, {"name": "grated parmesan", "qty": 0.5, "unit": "cup"}, {"name": "bacon or pancetta", "qty": 4, "unit": "slices"}, {"name": "green onions", "qty": 2, "unit": "green (sliced)"}, {"name": "nori (seaweed)", "qty": 2, "unit": "sheets (torn)"}, {"name": "sesame oil", "qty": 1, "unit": "tbsp"}]',
    '[{"instruction": "Cook ramen according to package. Reserve 1/2 cup of broth, then drain.", "imagePrompt": "Ramen boiling in pot — steam, chopsticks stirring, vibrant broth."}, {"instruction": "Fry bacon in a pan until crisp. Remove and set aside.", "imagePrompt": "Pan with sizzling bacon — golden edges, oil shimmering, rustic handle."}, {"instruction": "In a bowl, whisk egg yolks and parmesan until smooth.", "imagePrompt": "Bowl: egg yolks and cheese mixed — creamy, yellow tone, soft light."}, {"instruction": "Off heat, mix hot ramen with egg mixture, reserved broth, and sesame oil.", "imagePrompt": "Tall shot: tongs mixing ramen with creamy sauce — glossy noodles, steam rising."}, {"instruction": "Top with bacon, green onions, and nori. Serve immediately.", "imagePrompt": "Final tall image: Ramen Carbonara in deep bowl, nori strip, sesame seeds — Japanese diner style, warm lighting."}]',
    10, 15, 2, 'Medium', ARRAY['fusion','ramen','pasta','creamy','japanese','italian','dinner'], false
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
), rx AS (
  SELECT id FROM r
  UNION ALL
  SELECT id FROM recipes WHERE slug = 'ramen-carbonara'
)
INSERT INTO trends (recipe_id, score, views_24h, shares, source)
SELECT id, 89.9, 3200000, 156000, 'Fusion Food TikTok 2023' FROM rx
ON CONFLICT (recipe_id) DO NOTHING;