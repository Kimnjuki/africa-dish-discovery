-- Insert sample African recipes with proper JSONB format
INSERT INTO recipes (name, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, image_url) VALUES
('Jollof Rice', 'Nigeria', 'The crown jewel of West African cuisine - a one-pot rice dish with tomatoes, peppers, and aromatic spices that brings families together.', 
 '["rice", "tomatoes", "onions", "red bell peppers", "chicken stock", "thyme", "bay leaves", "scotch bonnet pepper", "garlic", "ginger", "curry powder", "salt", "vegetable oil"]'::jsonb,
 '["Blend tomatoes, peppers, and onions", "Fry the paste until oil separates", "Add spices and stock", "Add rice and stir", "Cover and simmer for 20 minutes"]'::jsonb,
 30, 45, 6, 'Medium', ARRAY['rice', 'spicy', 'one-pot', 'west-african', 'comfort-food'], 
 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800'),

('Moroccan Tagine', 'Morocco', 'A slow-cooked stew that captures the essence of North African flavors with tender meat, vegetables, and aromatic spices cooked in a cone-shaped pot.', 
 '["lamb", "onions", "carrots", "potatoes", "preserved lemons", "olives", "ginger", "cinnamon", "turmeric", "saffron", "cilantro", "olive oil"]'::jsonb,
 '["Brown the meat", "Add vegetables and spices", "Add liquid and cover", "Slow cook for 2 hours"]'::jsonb,
 20, 120, 4, 'Medium', ARRAY['stew', 'north-african', 'slow-cooked', 'aromatic', 'traditional'],
 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800'),

('Ethiopian Injera', 'Ethiopia', 'A spongy sourdough flatbread that serves as both plate and utensil, made from teff flour and fermented for days to achieve its distinctive tangy flavor.', 
 '["teff flour", "water", "starter culture"]'::jsonb,
 '["Mix teff flour with water", "Ferment for 3 days", "Cook starter mixture", "Add to fermented batter", "Cook on mitad (clay plate)"]'::jsonb,
 15, 20, 8, 'Hard', ARRAY['bread', 'fermented', 'gluten-free', 'east-african', 'traditional'],
 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800'),

('Bobotie', 'South Africa', 'South Africa''s national dish - a spiced mince curry topped with golden custard, bringing together Cape Malay and African culinary traditions.', 
 '["ground beef", "onions", "curry powder", "turmeric", "ginger", "garlic", "bread", "milk", "eggs", "almonds", "raisins", "bay leaves"]'::jsonb,
 '["Soak bread in milk", "Cook spiced mince with fruit", "Place in baking dish", "Top with custard mixture", "Bake until golden"]'::jsonb,
 25, 45, 6, 'Medium', ARRAY['curry', 'baked', 'south-african', 'cape-malay', 'comfort-food'],
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800')

ON CONFLICT (name) DO NOTHING;