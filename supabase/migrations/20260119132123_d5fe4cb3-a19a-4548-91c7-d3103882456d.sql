-- Populate global comparison data for popular African dishes

-- Jollof Rice (Nigeria) - Often ranked in world's best rice dishes
UPDATE recipes SET 
  world_equivalent_dish = 'Spanish Paella',
  global_rank_taste_atlas = 45,
  cultural_heritage_status = 'National Dish',
  umami_level = 7,
  carbon_footprint_score = 25
WHERE id IN ('2def8dc6-c907-417e-a015-9e291e963cd3', '21f076c7-a5de-495b-9ba8-b0980be13aa0');

-- Doro Wat (Ethiopia) - Ethiopia's national dish
UPDATE recipes SET 
  world_equivalent_dish = 'Indian Chicken Curry',
  global_rank_taste_atlas = 62,
  cultural_heritage_status = 'UNESCO Intangible Heritage',
  umami_level = 8,
  carbon_footprint_score = 30
WHERE id IN ('79fde72c-f7e4-4df6-84be-ac9b061d20a4', 'fbaa0527-ad1d-457e-8915-49aee116c44c');

-- Injera (Ethiopia) - Unique fermented flatbread
UPDATE recipes SET 
  world_equivalent_dish = 'Indian Dosa',
  global_rank_taste_atlas = 78,
  cultural_heritage_status = 'UNESCO Intangible Heritage',
  umami_level = 6,
  carbon_footprint_score = 15
WHERE id IN ('bb427d51-44ac-4fb2-a63e-9006fb865997', '5e14a61a-3104-44c4-8277-dc957c7a351d', 'e953d61b-11d9-4592-b3cd-ce63c0c8d5b4');

-- Injera with Doro Wat combinations
UPDATE recipes SET 
  world_equivalent_dish = 'Indian Thali',
  global_rank_taste_atlas = 55,
  cultural_heritage_status = 'UNESCO Intangible Heritage',
  umami_level = 8,
  carbon_footprint_score = 28
WHERE id IN ('b820c866-0689-444f-9f7a-3a5cc03e5a0c', '4fc357ff-dfb0-4d9a-8557-45a9edcb3c7a');

-- Moroccan Tagine - Famous slow-cooked stew
UPDATE recipes SET 
  world_equivalent_dish = 'French Cassoulet',
  global_rank_taste_atlas = 38,
  cultural_heritage_status = 'UNESCO Intangible Heritage',
  umami_level = 9,
  carbon_footprint_score = 35
WHERE id = '8b7bed7a-f435-48e0-9182-344fc2535875';

-- Bobotie (South Africa) - National dish
UPDATE recipes SET 
  world_equivalent_dish = 'Greek Moussaka',
  global_rank_taste_atlas = 72,
  cultural_heritage_status = 'National Dish',
  umami_level = 7,
  carbon_footprint_score = 40
WHERE id = '4c34ad99-5377-446c-998e-0b978844361e';

-- Suya (Nigeria) - Famous street food
UPDATE recipes SET 
  world_equivalent_dish = 'Turkish Kebab',
  global_rank_taste_atlas = 58,
  cultural_heritage_status = 'Regional Heritage',
  umami_level = 8,
  carbon_footprint_score = 45
WHERE id IN ('f64579ed-c2e6-4806-b15e-1afccfaf8ff8', '4f337db0-6707-4aac-81a4-71d374706b07');

-- Koshari (Egypt) - Egypt's national dish
UPDATE recipes SET 
  world_equivalent_dish = 'Italian Pasta e Fagioli',
  global_rank_taste_atlas = 65,
  cultural_heritage_status = 'National Dish',
  umami_level = 6,
  carbon_footprint_score = 18
WHERE id = '3010c920-b8cb-4fbb-b25e-37e2feda3f1b';

-- Fufu (Ghana) - Staple West African dish
UPDATE recipes SET 
  world_equivalent_dish = 'Italian Polenta',
  global_rank_taste_atlas = 85,
  cultural_heritage_status = 'Regional Heritage',
  umami_level = 4,
  carbon_footprint_score = 12
WHERE id = 'b3a35a7d-7e89-404e-a583-69f54d3ab5fd';

-- Attiéké (Ivory Coast) - Ivorian couscous
UPDATE recipes SET 
  world_equivalent_dish = 'Moroccan Couscous',
  global_rank_taste_atlas = 88,
  cultural_heritage_status = 'Regional Heritage',
  umami_level = 5,
  carbon_footprint_score = 14
WHERE id = 'b431d478-0114-4159-aed3-86077ecea9e7';