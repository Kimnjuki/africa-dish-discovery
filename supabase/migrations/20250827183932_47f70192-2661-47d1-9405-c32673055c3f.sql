-- Insert sample African recipes to populate the database
INSERT INTO recipes (name, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, image_url) VALUES
('Jollof Rice', 'Nigeria', 'The crown jewel of West African cuisine - a one-pot rice dish with tomatoes, peppers, and aromatic spices that brings families together.', 
 '["rice", "tomatoes", "onions", "red bell peppers", "chicken stock", "thyme", "bay leaves", "scotch bonnet pepper", "garlic", "ginger", "curry powder", "salt", "vegetable oil"]',
 '["Blend tomatoes, peppers, and onions", "Fry the paste until oil separates", "Add spices and stock", "Add rice and stir", "Cover and simmer for 20 minutes"]',
 30, 45, 6, 'Medium', '["rice", "spicy", "one-pot", "west-african", "comfort-food"]', 
 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800'),

('Moroccan Tagine', 'Morocco', 'A slow-cooked stew that captures the essence of North African flavors with tender meat, vegetables, and aromatic spices cooked in a cone-shaped pot.', 
 '["lamb", "onions", "carrots", "potatoes", "preserved lemons", "olives", "ginger", "cinnamon", "turmeric", "saffron", "cilantro", "olive oil"]',
 '["Brown the meat", "Add vegetables and spices", "Add liquid and cover", "Slow cook for 2 hours"]',
 20, 120, 4, 'Medium', '["stew", "north-african", "slow-cooked", "aromatic", "traditional"]',
 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800'),

('Ethiopian Injera', 'Ethiopia', 'A spongy sourdough flatbread that serves as both plate and utensil, made from teff flour and fermented for days to achieve its distinctive tangy flavor.', 
 '["teff flour", "water", "starter culture"]',
 '["Mix teff flour with water", "Ferment for 3 days", "Cook starter mixture", "Add to fermented batter", "Cook on mitad (clay plate)"]',
 15, 20, 8, 'Hard', '["bread", "fermented", "gluten-free", "east-african", "traditional"]',
 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800'),

('Bobotie', 'South Africa', 'South Africa''s national dish - a spiced mince curry topped with golden custard, bringing together Cape Malay and African culinary traditions.', 
 '["ground beef", "onions", "curry powder", "turmeric", "ginger", "garlic", "bread", "milk", "eggs", "almonds", "raisins", "bay leaves"]',
 '["Soak bread in milk", "Cook spiced mince with fruit", "Place in baking dish", "Top with custard mixture", "Bake until golden"]',
 25, 45, 6, 'Medium', '["curry", "baked", "south-african", "cape-malay", "comfort-food"]',
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'),

('Thieboudienne', 'Senegal', 'Senegal''s national dish of fish and rice, featuring a rich tomato-based sauce with vegetables and traditionally served from a communal bowl.', 
 '["fish", "rice", "tomato paste", "onions", "carrots", "cabbage", "eggplant", "cassava", "scotch bonnet", "garlic", "ginger", "thyme"]',
 '["Stuff fish with herbs", "Brown fish and set aside", "Cook vegetables in fish oil", "Add rice and stock", "Layer fish on top", "Steam until tender"]',
 40, 60, 8, 'Hard', '["fish", "rice", "one-pot", "west-african", "celebration"]',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'),

('Bunny Chow', 'South Africa', 'A Durban street food legend - curry served in a hollowed-out loaf of bread, created by the Indian community and beloved across South Africa.', 
 '["bread loaf", "chicken", "potatoes", "onions", "tomatoes", "curry powder", "garam masala", "garlic", "ginger", "chilies", "coconut milk"]',
 '["Hollow out bread loaf", "Cook curry with spices", "Simmer until thick", "Fill bread with curry", "Serve immediately"]',
 20, 40, 4, 'Easy', '["curry", "street-food", "south-african", "indian-fusion", "quick"]',
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'),

('Couscous Royale', 'Algeria', 'The king of North African dishes - fluffy steamed semolina served with a rich stew of meat and vegetables, perfect for special occasions.', 
 '["couscous", "lamb", "chicken", "carrots", "turnips", "zucchini", "chickpeas", "onions", "ras el hanout", "saffron", "butter"]',
 '["Steam couscous", "Prepare meat stew", "Cook vegetables separately", "Combine and season", "Serve on large platter"]',
 30, 90, 8, 'Hard', '["grain", "stew", "north-african", "celebration", "traditional"]',
 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'),

('Suya', 'Nigeria', 'Nigeria''s beloved street food - spiced grilled meat skewers coated in a fiery peanut spice blend, perfect for evening gatherings.', 
 '["beef strips", "peanuts", "ginger", "garlic", "cayenne pepper", "paprika", "onion powder", "salt", "cube seasoning"]',
 '["Marinate meat in spices", "Thread onto skewers", "Grill over charcoal", "Coat with suya spice", "Serve with onions and tomatoes"]',
 45, 20, 4, 'Medium', '["grilled", "spicy", "street-food", "west-african", "protein"]',
 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800')

ON CONFLICT (name) DO NOTHING;

-- Insert sample events/challenges
INSERT INTO events (name, description, start_date, end_date, active) VALUES
('Taste of West Africa Challenge', 'Explore the rich flavors of West African cuisine by cooking dishes from 5 different countries in the region.', '2024-02-01', '2024-02-29', true),
('North African Spice Journey', 'Master the art of North African spice blending and cooking techniques through traditional recipes.', '2024-03-01', '2024-03-31', true),
('East African Coffee & Cuisine', 'Discover the connection between coffee culture and traditional foods in East African countries.', '2024-04-01', '2024-04-30', false),
('Southern African Heritage Cook-off', 'Celebrate the diverse culinary heritage of Southern Africa with family recipes and modern twists.', '2024-01-15', '2024-02-15', false)
ON CONFLICT (name) DO NOTHING;