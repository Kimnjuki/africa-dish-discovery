-- Fix trends table constraint and add viral recipes with proper array syntax
-- First, create unique constraint on trends table
ALTER TABLE trends ADD CONSTRAINT trends_recipe_id_unique UNIQUE (recipe_id);

-- Add new viral recipes from 2024 trends with proper PostgreSQL array syntax
INSERT INTO recipes (id, name, slug, country, summary, ingredients, prep_time, cook_time, servings, difficulty, tags, is_african) VALUES
-- Chamoy Pickle (2024 viral trend)
('d8e9f012-3456-789a-bcde-f0123456789a', 'Chamoy Pickle', 'chamoy-pickle', 'Mexico', 'The controversial TikTok sensation that divided the internet in 2024. A massive pickle covered in chamoy, Tajín, and various spicy condiments that creates an intensely sour and spicy flavor explosion.', 
'[{"qty": 1, "name": "large dill pickle", "unit": "whole"}, {"qty": 0.25, "name": "chamoy sauce", "unit": "cup"}, {"qty": 2, "name": "Tajín seasoning", "unit": "tbsp"}, {"qty": 1, "name": "hot sauce", "unit": "tbsp"}, {"qty": 1, "name": "lime juice", "unit": "tbsp"}]', 
5, 0, 1, 'Easy', ARRAY['viral', 'tiktok', 'spicy', 'mexican', 'controversial', '2024-trend'], false),

-- Tanghulu (2024 viral fruit trend)
('e9f01234-5678-9abc-def0-123456789bcd', 'Tanghulu', 'tanghulu', 'China', 'Chinese candied fruit that became a massive TikTok trend in 2024. Fresh fruits coated in a crispy sugar shell that creates the most satisfying crunch sound on social media.', 
'[{"qty": 2, "name": "strawberries", "unit": "cups"}, {"qty": 1, "name": "granulated sugar", "unit": "cup"}, {"qty": 0.33, "name": "water", "unit": "cup"}, {"qty": 10, "name": "wooden skewers", "unit": "pieces"}]', 
15, 10, 4, 'Medium', ARRAY['viral', 'tiktok', 'chinese', 'candy', 'fruit', 'asmr', '2024-trend'], false),

-- Dirty Shirley (2024 cocktail trend)
('f0123456-789a-bcde-f012-3456789abcde', 'Dirty Shirley', 'dirty-shirley', 'USA', 'The grown-up version of the childhood favorite Shirley Temple that took TikTok by storm in 2024. A vodka-based cocktail with cherry and citrus flavors that nostalgia meets sophistication.', 
'[{"qty": 2, "name": "vodka", "unit": "oz"}, {"qty": 4, "name": "lemon-lime soda", "unit": "oz"}, {"qty": 1, "name": "grenadine", "unit": "oz"}, {"qty": 2, "name": "maraschino cherries", "unit": "pieces"}, {"qty": 1, "name": "lime juice", "unit": "tbsp"}]', 
3, 0, 1, 'Easy', ARRAY['viral', 'tiktok', 'cocktail', 'nostalgic', 'adult-drink', '2024-trend'], false),

-- Cottage Cheese Bowl (2024 health trend)
('0123456-789a-bcde-f012-3456789abcdef', 'Viral Cottage Cheese Bowl', 'cottage-cheese-bowl', 'Global', 'The protein-packed breakfast bowl that health influencers made viral in 2024. Cottage cheese topped with everything from fruit to savory ingredients for the ultimate high-protein meal.', 
'[{"qty": 1, "name": "cottage cheese", "unit": "cup"}, {"qty": 0.5, "name": "mixed berries", "unit": "cup"}, {"qty": 1, "name": "honey", "unit": "tbsp"}, {"qty": 2, "name": "almonds", "unit": "tbsp"}, {"qty": 1, "name": "chia seeds", "unit": "tsp"}]', 
5, 0, 1, 'Easy', ARRAY['viral', 'tiktok', 'healthy', 'protein', 'breakfast', 'wellness', '2024-trend'], false),

-- Dubai Chocolate (2024 luxury trend)
('123456-789a-bcde-f012-3456789abcdef0', 'Dubai Chocolate', 'dubai-chocolate', 'UAE', 'The luxurious viral chocolate trend from Dubai that took social media by storm in 2024. Premium chocolate filled with crispy kadayif and pistachios for an indulgent Middle Eastern treat.', 
'[{"qty": 200, "name": "dark chocolate", "unit": "g"}, {"qty": 0.5, "name": "kadayif pastry", "unit": "cup"}, {"qty": 0.25, "name": "pistachios", "unit": "cup"}, {"qty": 2, "name": "butter", "unit": "tbsp"}, {"qty": 1, "name": "honey", "unit": "tbsp"}]', 
20, 15, 8, 'Medium', ARRAY['viral', 'tiktok', 'luxury', 'middle-eastern', 'chocolate', 'premium', '2024-trend'], false);

-- Add trending data for new recipes
INSERT INTO trends (recipe_id, score, views_24h, shares, source) VALUES
('d8e9f012-3456-789a-bcde-f0123456789a', 89.3, 3200000, 145000, 'TikTok Controversial 2024'),
('e9f01234-5678-9abc-def0-123456789bcd', 87.9, 2100000, 98000, 'TikTok ASMR Trend 2024'),
('f0123456-789a-bcde-f012-3456789abcde', 85.6, 1500000, 72000, 'TikTok Cocktail Trend 2024'),
('0123456-789a-bcde-f012-3456789abcdef', 88.4, 1800000, 85000, 'Health TikTok 2024'),
('123456-789a-bcde-f012-3456789abcdef0', 92.1, 2800000, 134000, 'Luxury Food TikTok 2024');