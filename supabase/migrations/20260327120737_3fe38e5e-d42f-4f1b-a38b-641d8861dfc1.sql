
-- BATCH 5 FINAL: Remaining recipes with guaranteed unique slugs (excluding already-existing ones)

INSERT INTO public.recipes (name, slug, country, continent, is_african, difficulty, prep_time, cook_time, servings, category, cuisine_type, image_url, summary, history, ingredients, steps, tags) VALUES

('Mafé Sénégalais', 'mafe-senegalais-lamb-peanut', 'Senegal', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Senegalese peanut stew with lamb and sweet potatoes.', 'Originating from the Mandinka people, mafé is one of Senegal''s most iconic dishes.',
'["500g lamb", "1 cup peanut butter", "4 tomatoes", "2 sweet potatoes", "2 onions", "3 tbsp tomato paste", "Oil", "Salt", "4 cups stock"]',
'["Brown lamb.", "Sauté onions, add paste and tomatoes.", "Stir in peanut butter.", "Add stock, vegetables.", "Simmer 40 min. Serve over rice."]',
'{"Senegal", "West Africa", "Peanut", "Lamb"}'),

('Kitfo', 'kitfo-gurage-ethiopian', 'Ethiopia', 'Africa', true, 'Easy', 15, 5, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Ethiopian steak tartare — raw minced beef with mitmita and niter kibbeh.', 'The ultimate Gurage delicacy, eaten raw (lebleb) or lightly cooked.',
'["500g lean beef, minced", "3 tbsp niter kibbeh", "2 tbsp mitmita", "1 tsp cardamom", "Salt"]',
'["Warm butter gently.", "Mix beef with spices and butter.", "Serve immediately with ayib and gomen."]',
'{"Ethiopia", "East Africa", "Beef", "Raw"}'),

('Tibs Sizzling', 'tibs-sizzling-ethiopian', 'Ethiopia', 'Africa', true, 'Easy', 10, 15, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Ethiopian sautéed beef with peppers and rosemary — served sizzling.', 'Ethiopia''s go-to restaurant dish served in every eatery.',
'["500g beef, cubed", "2 onions", "2 peppers", "3 tomatoes", "Butter", "Rosemary", "Jalapeños", "Salt"]',
'["Sear meat on high.", "Add onions, peppers.", "Add tomatoes and rosemary.", "Serve sizzling with injera."]',
'{"Ethiopia", "East Africa", "Beef", "Sautéed"}'),

('Molokhia Egyptian', 'molokhia-egyptian-green-soup', 'Egypt', 'Africa', true, 'Medium', 15, 30, 6, 'Soup', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Egyptian jute leaf soup — viscous, garlicky, served with chicken and rice.', 'Dates to ancient Egypt. Egypt''s most popular home-cooked dish.',
'["500g molokhia leaves", "6 garlic cloves", "2 tbsp ghee", "1 tbsp coriander", "Chicken stock", "Chicken", "Rice"]',
'["Boil stock, add molokhia.", "Make taqleya: fry garlic in ghee with coriander.", "Pour into soup.", "Serve over rice with chicken."]',
'{"Egypt", "North Africa", "Soup", "Greens"}'),

('Hawawshi Cairo', 'hawawshi-cairo-meat-pita', 'Egypt', 'Africa', true, 'Medium', 20, 25, 6, 'Street Food', 'North African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Egyptian spiced meat stuffed in pita and baked crispy.', 'Originated in Alexandria, now Cairo''s favorite street food.',
'["500g ground beef", "2 onions", "2 peppers", "2 tomatoes", "Cumin, coriander", "6 pitas", "Oil"]',
'["Mix meat with vegetables and spices.", "Stuff pitas.", "Bake 20 min until crispy."]',
'{"Egypt", "North Africa", "Street Food"}'),

('Pastilla Fassia', 'pastilla-fassia-moroccan', 'Morocco', 'Africa', true, 'Hard', 60, 45, 8, 'Main Course', 'North African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Moroccan pigeon pie — warqa pastry with meat, almonds, and cinnamon sugar.', 'Morocco''s most refined dish, originally from Fez.',
'["500g chicken", "6 eggs", "1 cup almonds", "Warqa pastry", "Cinnamon, ginger, saffron", "Butter", "Sugar"]',
'["Cook meat with spices.", "Shred meat, scramble eggs in sauce.", "Layer pastry, filling, almonds.", "Bake golden. Dust with sugar."]',
'{"Morocco", "North Africa", "Pastry", "Celebration"}'),

('Rfissa Marocaine', 'rfissa-marocaine-lentil', 'Morocco', 'Africa', true, 'Hard', 30, 90, 6, 'Main Course', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Moroccan shredded msemmen with lentil-chicken sauce — postpartum celebration dish.', 'Traditionally served to new mothers. Fenugreek believed to boost milk production.',
'["500g chicken", "1 cup lentils", "4 msemmen", "Fenugreek", "Ras el hanout", "Saffron", "Butter", "Cilantro"]',
'["Cook chicken with spices.", "Cook lentils.", "Shred msemmen on platter.", "Pour sauce over, top with chicken."]',
'{"Morocco", "North Africa", "Lentils", "Celebration"}'),

('Chakchouka Alger', 'chakchouka-alger-poached-eggs', 'Algeria', 'Africa', true, 'Easy', 10, 25, 4, 'Breakfast', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Algerian eggs in spiced tomato-pepper sauce — a beloved breakfast.', 'Originated in Ottoman Algeria. Spread across North Africa.',
'["6 eggs", "4 tomatoes", "2 peppers", "2 onions", "Garlic", "Olive oil", "Cumin, paprika", "Cilantro"]',
'["Sauté onions, peppers.", "Add tomatoes, simmer 15 min.", "Crack eggs in wells.", "Cover until set. Serve with bread."]',
'{"Algeria", "North Africa", "Eggs", "Breakfast"}'),

('Rechta Algérienne', 'rechta-algerienne-handmade', 'Algeria', 'Africa', true, 'Hard', 60, 90, 8, 'Main Course', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Algerian handmade pasta in chicken-chickpea sauce — a wedding feast dish.', 'Algeria''s most prestigious dish requiring hours of hand-rolling.',
'["4 cups semolina", "Chicken", "Chickpeas", "Onions", "Turnip", "Cinnamon", "Butter"]',
'["Roll thin pasta.", "Cook chicken with spices.", "Steam pasta over broth.", "Serve layered."]',
'{"Algeria", "North Africa", "Pasta", "Wedding"}'),

('Brik Tunisien', 'brik-tunisien-fried-pastry', 'Tunisia', 'Africa', true, 'Easy', 15, 10, 4, 'Appetizer', 'North African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Tunisian fried pastry with egg, tuna, and capers — Ramadan classic.', 'Tunisia''s most famous appetizer. The skill is keeping the yolk runny.',
'["4 brik sheets", "4 eggs", "Tuna", "Capers", "Onion", "Parsley", "Oil"]',
'["Place filling on pastry, crack egg.", "Fold into triangle.", "Deep fry 2 min per side.", "Serve with lemon."]',
'{"Tunisia", "North Africa", "Pastry", "Appetizer"}'),

('Sharba Libiyya', 'sharba-libiyya-orzo-soup', 'Libya', 'Africa', true, 'Medium', 15, 60, 6, 'Soup', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Libyan lamb soup with orzo — a hearty Ramadan staple.', 'Libya''s quintessential soup served daily during Ramadan.',
'["500g lamb", "Orzo", "Tomatoes", "Chickpeas", "Onions", "Turmeric", "Mint", "Cinnamon"]',
'["Brown lamb.", "Add vegetables and spices.", "Simmer 40 min.", "Add orzo 15 min. Add mint."]',
'{"Libya", "North Africa", "Soup", "Ramadan"}'),

('Luwombo Royal', 'luwombo-royal-buganda', 'Uganda', 'Africa', true, 'Medium', 30, 120, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Ugandan stew steamed in banana leaves — a royal Buganda ceremonial dish.', 'Created by Kabaka Mwanga II''s personal chef in the 1880s.',
'["500g chicken", "Groundnut paste", "Tomatoes", "Onions", "Mushrooms", "Banana leaves"]',
'["Mix meat with groundnut paste and vegetables.", "Wrap in banana leaves.", "Steam 2 hours.", "Serve with matoke."]',
'{"Uganda", "East Africa", "Ceremonial", "Banana Leaf"}'),

('Rolex Roll', 'rolex-roll-kampala-street', 'Uganda', 'Africa', true, 'Easy', 5, 10, 1, 'Street Food', 'East African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Uganda''s iconic rolled egg chapati — Kampala''s favorite street food.', 'Invented in the 2000s by Kampala street vendors. Uganda''s most popular snack.',
'["1 chapati", "2 eggs", "Tomato, onion, cabbage", "Oil", "Salt"]',
'["Cook omelette with vegetables.", "Place chapati on top.", "Roll tightly. Serve."]',
'{"Uganda", "East Africa", "Street Food"}'),

('Eru Wild Spinach', 'eru-wild-spinach-southwest-cm', 'Cameroon', 'Africa', true, 'Medium', 30, 60, 6, 'Soup', 'Central African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Cameroonian wild spinach with waterleaf, palm oil, and crayfish.', 'A prized dish from Cameroon''s Southwest region.',
'["500g eru", "300g waterleaf", "Palm oil", "Smoked fish", "Cow skin", "Crayfish"]',
'["Boil cow skin.", "Heat oil, add crayfish and fish.", "Add waterleaf, then eru.", "Cook 20 min. Serve with garri."]',
'{"Cameroon", "Central Africa", "Wild Spinach"}'),

('Ndolé National', 'ndole-national-douala', 'Cameroon', 'Africa', true, 'Hard', 60, 90, 8, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Cameroon''s national dish — bitter leaf stew with prawns and beef.', 'From the Douala people. Bitter leaves washed multiple times.',
'["Bitter leaves", "Groundnut paste", "Prawns", "Beef", "Onions", "Garlic", "Crayfish"]',
'["Wash and boil leaves.", "Cook beef.", "Make groundnut sauce.", "Combine all, simmer 30 min."]',
'{"Cameroon", "Central Africa", "National Dish"}'),

('Suqaar Quick', 'suqaar-quick-somali-beef', 'Somalia', 'Africa', true, 'Easy', 10, 20, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Quick Somali diced beef with peppers and cumin.', 'Everyday Somali home cooking — quick and delicious.',
'["500g beef, diced", "Peppers", "Onions", "Garlic", "Cumin, coriander", "Tomatoes", "Oil"]',
'["Sauté meat high heat.", "Add vegetables and spices.", "Cook 10 min. Serve with canjeero."]',
'{"Somalia", "East Africa", "Quick", "Beef"}'),

('Attiéké Braisé', 'attieke-braise-abidjan', 'Ivory Coast', 'Africa', true, 'Medium', 30, 30, 4, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800', 'Ivorian cassava couscous with charcoal-grilled fish.', 'Ivory Coast''s most beloved meal found at every street corner in Abidjan.',
'["Attiéké", "Tilapia", "Tomatoes", "Onions", "Scotch bonnet", "Oil", "Lime"]',
'["Grill fish.", "Make tomato sauce.", "Steam attiéké.", "Serve together."]',
'{"Ivory Coast", "West Africa", "Cassava", "Fish"}'),

('Garba Tuna', 'garba-tuna-ivorian-street', 'Ivory Coast', 'Africa', true, 'Easy', 10, 5, 2, 'Street Food', 'West African',
'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800', 'Abidjan''s fried tuna over attiéké — the ultimate quick lunch.', 'Named after Hausa vendors who popularized it.',
'["Attiéké", "Tuna", "Onion", "Tomatoes", "Pepper", "Maggi"]',
'["Fry tuna.", "Mix with vegetables.", "Serve over attiéké."]',
'{"Ivory Coast", "West Africa", "Street Food"}'),

('Cachupa Cape Verdean', 'cachupa-cape-verdean-national', 'Cape Verde', 'Africa', true, 'Hard', 480, 120, 8, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Cape Verde''s soul — rich hominy, beans, and meat stew.', 'The rica version for celebrations, pobre for everyday.',
'["Hominy corn", "Kidney beans", "Pork", "Linguiça", "Sweet potatoes", "Bananas", "Cabbage", "Onions", "Garlic"]',
'["Soak grains overnight.", "Cook 1 hour.", "Add meats.", "Add vegetables.", "Simmer until merged."]',
'{"Cape Verde", "West Africa", "National Dish"}'),

('Liboke Congolais', 'liboke-congolais-fish-leaf', 'DRC', 'Africa', true, 'Medium', 20, 40, 4, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800', 'DRC fish steamed in banana leaves with tomatoes and basil.', 'One of the Congo''s most elegant preparations.',
'["4 tilapia", "Tomatoes", "Onions", "Peppers", "Basil", "Banana leaves", "Palm oil"]',
'["Season fish.", "Layer with vegetables in leaf.", "Steam 30-40 min."]',
'{"DRC", "Central Africa", "Fish", "Banana Leaf"}'),

('Nyembwe Gabonais', 'nyembwe-gabonais-palm-chicken', 'Gabon', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800', 'Gabon''s national chicken in palm nut sauce.', 'The foundation of Fang and Myene cooking for centuries.',
'["Chicken", "Palm nut cream", "Onions", "Garlic", "Scotch bonnets"]',
'["Brown chicken.", "Make palm nut sauce.", "Simmer 40 min."]',
'{"Gabon", "Central Africa", "Chicken", "National Dish"}'),

('Plasas', 'plasas-sierra-leone-cassava-leaf', 'Sierra Leone', 'Africa', true, 'Medium', 30, 90, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Sierra Leone''s national cassava leaf stew with palm oil and fish.', 'The heart of Sierra Leonean cuisine served at every major occasion.',
'["Cassava leaves", "Palm oil", "Beef", "Smoked fish", "Ground peanuts", "Onions", "Pepper"]',
'["Boil leaves.", "Brown beef.", "Make palm-peanut sauce.", "Combine, simmer 45 min."]',
'{"Sierra Leone", "West Africa", "National Dish"}'),

('Accra Plantain', 'accra-plantain-cameroon-snack', 'Cameroon', 'Africa', true, 'Easy', 15, 15, 8, 'Snack', 'Central African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Cameroonian sweet plantain fritters — crispy street snack.', 'One of Central Africa''s most popular snacks.',
'["4 ripe plantains", "Flour", "Sugar", "Vanilla", "Nutmeg", "Oil"]',
'["Mash plantains, mix with dry ingredients.", "Fry spoonfuls until golden."]',
'{"Cameroon", "Central Africa", "Snack"}'),

('Thiakry Dessert', 'thiakry-dessert-senegalais', 'Senegal', 'Africa', true, 'Easy', 15, 10, 6, 'Dessert', 'West African',
'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800', 'Senegalese millet-yogurt dessert with vanilla and raisins.', 'Senegal''s favorite celebration dessert served cold.',
'["Millet couscous", "Sweetened yogurt", "Condensed milk", "Vanilla", "Raisins", "Nutmeg"]',
'["Steam couscous, cool.", "Mix with yogurt and milk.", "Add raisins. Chill and serve."]',
'{"Senegal", "West Africa", "Dessert"}'),

('Samosa Kenyan', 'samosa-kenyan-spiced-meat', 'Kenya', 'Africa', true, 'Medium', 30, 20, 12, 'Appetizer', 'East African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Kenyan meat samosas — crispy, spiced, fried.', 'Brought by Indian traders and adopted with Kenyan spicing.',
'["Minced beef", "Flour", "Onion", "Garlic", "Cumin", "Cilantro", "Chili", "Oil"]',
'["Make dough.", "Cook spiced mince.", "Fill, fold, seal.", "Deep fry golden."]',
'{"Kenya", "East Africa", "Samosa"}'),

('Mandazi Kenyan', 'mandazi-kenyan-coconut-cardamom', 'Kenya', 'Africa', true, 'Easy', 60, 20, 12, 'Snack', 'East African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'East African coconut doughnuts with cardamom — the tea-time staple.', 'Eaten across East Africa as the perfect chai companion.',
'["Flour", "Sugar", "Coconut milk", "Egg", "Baking powder", "Cardamom", "Oil"]',
'["Mix dough, rest 1 hour.", "Cut into triangles.", "Deep fry until puffy and golden."]',
'{"Kenya", "East Africa", "Snack", "Doughnuts"}'),

('Bunny Chow Durban', 'bunny-chow-durban-curry-bread', 'South Africa', 'Africa', true, 'Medium', 20, 60, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Durban''s iconic bread bowl filled with spicy curry.', 'Created by Durban''s Indian community during apartheid-era restrictions.',
'["Bread loaf", "Lamb", "Potatoes", "Onions", "Curry powder", "Tomatoes", "Garlic", "Ginger"]',
'["Make curry: brown lamb, add spices and vegetables.", "Simmer 40 min.", "Hollow bread, fill with curry."]',
'{"South Africa", "Southern Africa", "Curry", "Street Food"}');

INSERT INTO public.dishes (name, country, continent, cultural_significance)
SELECT DISTINCT r.name, r.country, 'Africa',
  'A traditional dish from ' || r.country || ' reflecting its unique culinary heritage.'
FROM public.recipes r
WHERE r.created_at > NOW() - INTERVAL '5 minutes' AND r.continent = 'Africa'
AND NOT EXISTS (SELECT 1 FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country);

UPDATE public.recipes r SET dish_id = d.id FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country AND r.dish_id IS NULL;
