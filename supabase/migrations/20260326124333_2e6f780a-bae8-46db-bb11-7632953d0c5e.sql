
-- BATCH 4: 30 new African recipes with unique slugs

INSERT INTO public.recipes (name, slug, country, continent, is_african, difficulty, prep_time, cook_time, servings, category, cuisine_type, image_url, summary, history, ingredients, steps, tags) VALUES

-- Tanzania (new)
('Chipsi Mayai', 'chipsi-mayai-tanzanian-omelette', 'Tanzania', 'Africa', true, 'Easy', 10, 15, 2, 'Street Food', 'East African',
'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', 'Tanzania''s iconic fry omelette — the ultimate Dar es Salaam street food.', 'Emerged in the 1990s as the affordable meal of choice for students and workers.',
'["4 potatoes, cut into fries", "4 eggs", "1 onion", "1 tomato", "Salt, pepper", "Oil"]',
'["Fry potatoes golden.", "Beat eggs with vegetables.", "Pour over fries in pan.", "Cook both sides.", "Serve with chili sauce."]',
'{"Tanzania", "East Africa", "Street Food"}'),

('Coconut Bean Soup', 'coconut-bean-soup-tanzania', 'Tanzania', 'Africa', true, 'Easy', 15, 40, 6, 'Soup', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Coastal Tanzanian soup of kidney beans simmered in coconut milk with turmeric and lime.', 'A Swahili coast staple reflecting centuries of Indian Ocean spice trade.',
'["2 cups kidney beans, cooked", "2 cups coconut milk", "2 onions", "3 garlic cloves", "1 tsp turmeric", "1 lime", "Cilantro", "Salt"]',
'["Sauté onions and garlic.", "Add turmeric, cook 1 min.", "Add beans and coconut milk.", "Simmer 30 min.", "Squeeze lime, add cilantro."]',
'{"Tanzania", "East Africa", "Soup", "Coconut"}'),

-- Madagascar (new)
('Henakisoa sy Anamamy', 'henakisoa-anamamy-madagascar', 'Madagascar', 'Africa', true, 'Medium', 20, 45, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Malagasy pork with water spinach — a homey stew showcasing Madagascar''s Austronesian and African fusion.', 'This dish combines pork (reflecting Southeast Asian heritage) with local greens, a daily staple in Malagasy homes.',
'["500g pork, cubed", "500g water spinach or kangkung", "3 tomatoes", "2 onions", "3 garlic cloves", "2 tbsp oil", "Salt, pepper"]',
'["Brown pork.", "Add onions, garlic, tomatoes.", "Cook 10 min.", "Add 2 cups water, simmer 25 min.", "Add greens, cook 5 min.", "Serve with rice."]',
'{"Madagascar", "East Africa", "Pork", "Greens"}'),

-- Seychelles (new)
('Ladob Savoury', 'ladob-savoury-seychelles', 'Seychelles', 'Africa', true, 'Easy', 10, 30, 4, 'Main Course', 'Island African',
'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'Savoury Seychellois ladob — breadfruit and salted fish simmered in coconut milk.', 'Ladob exists in sweet and savoury versions across the Seychelles, reflecting Creole adaptability.',
'["2 breadfruit, cubed", "300g salted fish, soaked", "2 cups coconut milk", "1 onion", "2 garlic cloves", "Thyme", "Salt, pepper"]',
'["Soak fish 2 hours, flake.", "Sauté onion and garlic.", "Add breadfruit and coconut milk.", "Simmer 20 min.", "Add fish and thyme, cook 10 min."]',
'{"Seychelles", "East Africa", "Breadfruit", "Coconut"}'),

-- Zanzibar (new)
('Urojo Mix', 'urojo-mix-zanzibar-stonetown', 'Zanzibar', 'Africa', true, 'Medium', 20, 40, 6, 'Soup', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Zanzibar''s famous "mix" — tangy tamarind broth with bhajias, eggs, and mango.', 'Stone Town''s most famous street food combining Indian bhajias with Swahili spices.',
'["4 potatoes", "Chickpea fritters", "4 eggs", "Tamarind water", "Coconut milk", "Curry powder", "Mango", "Chili sauce"]',
'["Make tamarind-coconut broth.", "Boil eggs, cube potatoes.", "Arrange in bowls.", "Pour broth over.", "Top with mango and chili."]',
'{"Zanzibar", "East Africa", "Soup", "Street Food"}'),

-- Eritrea (new)
('Shiro Eritrean', 'shiro-eritrean-chickpea', 'Eritrea', 'Africa', true, 'Easy', 10, 25, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Eritrean chickpea flour stew — smooth, spiced with berbere, a beloved vegetarian staple.', 'Shiro is eaten daily during Orthodox Christian fasting periods in Eritrea.',
'["1 cup shiro (chickpea flour)", "2 onions, diced", "3 tbsp olive oil", "2 tomatoes", "2 tbsp berbere", "2 garlic cloves", "2 cups water", "Salt"]',
'["Sauté onions in oil 15 min.", "Add garlic, berbere, tomatoes.", "Cook 5 min.", "Add water gradually.", "Stir in shiro flour.", "Simmer 10 min until thick. Serve on injera."]',
'{"Eritrea", "East Africa", "Chickpea", "Vegetarian"}'),

-- Djibouti (new)
('Skoudehkaris Djiboutien', 'skoudehkaris-djiboutien-spiced', 'Djibouti', 'Africa', true, 'Medium', 15, 50, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'Djibouti''s signature spiced rice with lamb — fragrant with cardamom, cumin, and cinnamon.', 'Reflects the Somali and Yemeni influences that shaped Djiboutian cuisine.',
'["3 cups rice", "500g lamb, cubed", "2 onions", "4 cardamom pods", "2 cinnamon sticks", "1 tsp cumin", "4 garlic cloves", "3 tbsp ghee", "Salt", "4 cups stock"]',
'["Brown lamb in ghee.", "Add onions, spices, garlic.", "Add stock, simmer 30 min.", "Add washed rice.", "Cook covered on low 20 min."]',
'{"Djibouti", "East Africa", "Rice", "Lamb"}'),

-- Lesotho (new)
('Lekhotloane', 'lekhotloane-lesotho-dumplings', 'Lesotho', 'Africa', true, 'Easy', 15, 25, 6, 'Side Dish', 'Southern African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Basotho steamed dumplings — soft wheat dough balls cooked in stew broth.', 'A comfort food of the mountain kingdom, often added to bean or meat stews.',
'["2 cups flour", "1 tsp baking powder", "1/2 tsp salt", "1 tbsp butter", "3/4 cup milk"]',
'["Mix dry ingredients.", "Rub in butter.", "Add milk to form soft dough.", "Drop spoonfuls into simmering stew.", "Cover and steam 15 min."]',
'{"Lesotho", "Southern Africa", "Dumplings", "Steamed"}'),

-- Eswatini (new)
('Incwancwa', 'incwancwa-eswatini-fermented', 'Eswatini', 'Africa', true, 'Easy', 10, 20, 4, 'Side Dish', 'Southern African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800', 'Swazi fermented maize porridge — tangy and thin, served as a refreshing accompaniment.', 'A traditional Swazi fermented food reflecting ancient preservation techniques.',
'["2 cups maize meal", "4 cups water", "Pinch of salt"]',
'["Mix maize meal with warm water.", "Cover and ferment 2-3 days.", "Cook fermented mixture 15 min.", "Should be thin and tangy.", "Serve alongside rich stews."]',
'{"Eswatini", "Southern Africa", "Fermented", "Maize"}'),

-- Namibia (new)
('Oshifima', 'oshifima-namibia-pearl-millet', 'Namibia', 'Africa', true, 'Easy', 5, 20, 4, 'Staple', 'Southern African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800', 'Namibia''s pearl millet porridge — the staple food of the Ovambo people in northern Namibia.', 'Oshifima (or pap) made from mahangu (pearl millet) is central to Ovambo identity and sustains communities in the semi-arid north.',
'["2 cups pearl millet flour (mahangu)", "4 cups water", "Salt"]',
'["Boil water.", "Stir in millet flour gradually.", "Cook 15 min, stirring constantly.", "Should be very thick.", "Shape and serve with stew."]',
'{"Namibia", "Southern Africa", "Millet", "Staple"}'),

-- Botswana (new)
('Dikgobe', 'dikgobe-botswana-bean-corn', 'Botswana', 'Africa', true, 'Easy', 480, 60, 6, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Botswana''s hearty bean and samp stew — a protein-rich traditional Tswana dish.', 'Dikgobe combines beans with samp (dried corn kernels), a pre-colonial Tswana staple that remains one of Botswana''s most nutritious everyday dishes.',
'["2 cups dried beans", "2 cups samp (hominy)", "1 onion", "2 tbsp butter", "Salt, pepper"]',
'["Soak beans and samp overnight.", "Boil together until both soft (1 hour).", "Add onion and butter.", "Season with salt and pepper.", "Serve as main or side dish."]',
'{"Botswana", "Southern Africa", "Beans", "Corn"}'),

-- Mozambique (new)
('Piri Piri Chicken Maputo', 'piri-piri-chicken-maputo', 'Mozambique', 'Africa', true, 'Medium', 120, 40, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800', 'Mozambique''s legendary piri piri chicken — marinated in bird''s eye chili, garlic, and lime.', 'Mozambican piri piri chicken is considered the original — Portuguese traders brought the chili from Brazil, and Mozambican cooks perfected the fiery marinade.',
'["1 whole chicken, butterflied", "10 bird''s eye chilies", "6 garlic cloves", "1/2 cup lime juice", "1/4 cup olive oil", "1 tsp paprika", "1 tsp oregano", "Salt"]',
'["Blend chilies, garlic, lime, oil, spices.", "Coat chicken, marinate 2+ hours.", "Grill over charcoal 20 min per side.", "Baste with marinade while grilling.", "Serve with fries and salad."]',
'{"Mozambique", "Southern Africa", "Chicken", "Piri Piri"}'),

('Xima', 'xima-mozambique-staple', 'Mozambique', 'Africa', true, 'Easy', 5, 15, 4, 'Staple', 'Southern African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800', 'Mozambique''s maize porridge staple — the foundation of every Mozambican meal.', 'Xima is to Mozambique what rice is to Asia. Made from white maize flour, it''s shaped by hand and used to scoop stews.',
'["2 cups white maize flour", "4 cups water", "Salt"]',
'["Boil water with salt.", "Add maize flour gradually.", "Stir vigorously 10 min.", "Shape into dome.", "Serve with matapa or caril."]',
'{"Mozambique", "Southern Africa", "Staple", "Maize"}'),

-- Sudan (new)
('Mullah Bamia', 'mullah-bamia-sudan', 'Sudan', 'Africa', true, 'Medium', 15, 45, 6, 'Main Course', 'North African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Sudanese okra stew with lamb — rich, thick, and served over asida or rice.', 'Mullah (stew) is the heart of Sudanese cuisine. Bamia (okra) mullah is the most beloved variety, cooked at every major gathering.',
'["500g lamb, cubed", "500g okra, sliced", "4 tomatoes", "2 onions", "4 garlic cloves", "2 tbsp tomato paste", "Oil", "1 dried lime", "Salt, pepper"]',
'["Brown lamb.", "Add onions, garlic, tomatoes, paste.", "Cook 15 min.", "Add water, dried lime.", "Simmer 20 min.", "Add okra, cook 15 min. Serve over asida."]',
'{"Sudan", "North Africa", "Okra", "Lamb"}'),

-- Chad (new)
('Boule et Sauce Gombo', 'boule-sauce-gombo-chad', 'Chad', 'Africa', true, 'Medium', 10, 35, 4, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Chad''s staple millet ball with slimy okra sauce — the everyday meal across the Sahel.', 'Boule (millet ball) with gombo (okra) sauce is Chad''s most common daily meal, eaten by communities across all ethnic groups.',
'["2 cups millet flour", "300g fresh okra, chopped", "200g dried fish", "2 onions", "2 tbsp groundnut oil", "Maggi cubes", "Salt", "4 cups water"]',
'["Make boule: stir millet flour into boiling water, cook 15 min.", "Sauté onions, add okra and fish.", "Add water, simmer 20 min.", "Okra sauce should be thick and slimy.", "Serve boule with sauce poured over."]',
'{"Chad", "Central Africa", "Millet", "Okra"}'),

-- Malawi (new)
('Nsima with Ndiwo', 'nsima-ndiwo-malawi', 'Malawi', 'Africa', true, 'Easy', 10, 25, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800', 'Malawi''s daily meal of maize porridge with vegetable relish — the essence of Malawian home cooking.', 'Nsima (thick maize porridge) with ndiwo (relish) is eaten at virtually every meal in Malawi. The quality of one''s nsima is a source of pride.',
'["2 cups maize flour", "4 cups water", "500g pumpkin leaves or spinach", "2 tomatoes", "1 onion", "Oil", "Salt"]',
'["Make nsima: stir flour into boiling water until thick.", "Cook 15 min.", "Sauté onion, tomatoes, add greens.", "Cook greens 10 min.", "Shape nsima, serve with ndiwo."]',
'{"Malawi", "Southern Africa", "Maize", "Greens"}'),

('Chambo Fish', 'chambo-grilled-lake-malawi', 'Malawi', 'Africa', true, 'Easy', 15, 20, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800', 'Grilled chambo — Lake Malawi''s prized tilapia, simply prepared with lemon and served with nsima.', 'Chambo is Malawi''s national fish, endemic to Lake Malawi. It''s the centerpiece of lakeside culture and the country''s most celebrated food.',
'["4 whole chambo or tilapia", "3 lemons", "4 garlic cloves", "2 tbsp oil", "Salt, pepper", "Fresh herbs"]',
'["Score fish, rub with lemon, garlic, salt.", "Grill over charcoal 7 min per side.", "Serve with nsima and vegetable relish."]',
'{"Malawi", "Southern Africa", "Fish", "Grilled"}'),

-- Zimbabwe (new)
('Madora', 'madora-zimbabwe-mopane-worms', 'Zimbabwe', 'Africa', true, 'Easy', 10, 15, 4, 'Snack', 'Southern African',
'https://images.unsplash.com/photo-1551028150-64b9f398f678?w=800', 'Fried mopane worms — Zimbabwe''s protein-rich indigenous snack, crunchy and savory.', 'Madora (mopane worms) have been a vital protein source for Shona and Ndebele peoples for centuries. They''re now a celebrated delicacy.',
'["2 cups dried mopane worms", "2 onions, sliced", "2 tomatoes", "1 green pepper", "2 tbsp oil", "Salt, chili"]',
'["Soak worms 30 min if dried.", "Fry in oil until crispy.", "Add onions, tomatoes, pepper.", "Season with salt and chili.", "Serve as snack or with sadza."]',
'{"Zimbabwe", "Southern Africa", "Insects", "Protein"}'),

('Dovi', 'dovi-zimbabwe-peanut-stew', 'Zimbabwe', 'Africa', true, 'Medium', 15, 40, 6, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Zimbabwean peanut butter stew with chicken and greens — hearty, creamy, and deeply satisfying.', 'Dovi reflects the Shona people''s genius for groundnut cookery. Peanuts have been central to Zimbabwean cuisine for centuries.',
'["500g chicken pieces", "1 cup peanut butter", "4 tomatoes", "2 onions", "500g greens", "2 garlic cloves", "Oil", "Salt", "2 cups water"]',
'["Brown chicken in oil.", "Add onions, garlic, tomatoes.", "Cook 10 min.", "Stir in peanut butter and water.", "Simmer 25 min.", "Add greens, cook 5 min. Serve with sadza."]',
'{"Zimbabwe", "Southern Africa", "Peanut", "Chicken"}'),

-- Zambia (new)
('Ifisashi Zambian', 'ifisashi-zambian-greens-peanut', 'Zambia', 'Africa', true, 'Easy', 10, 25, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Zambian greens in peanut sauce — a creamy, protein-rich vegetarian staple.', 'Ifisashi is Zambia''s everyday vegetable dish, making greens irresistible with the addition of pounded groundnuts.',
'["500g greens (rape, pumpkin leaves)", "1/2 cup peanut butter", "2 tomatoes", "1 onion", "Salt"]',
'["Sauté onion and tomatoes.", "Add peanut butter and 1 cup water.", "Stir until smooth.", "Add chopped greens.", "Cook 15 min until tender. Serve with nshima."]',
'{"Zambia", "Southern Africa", "Peanut", "Greens"}'),

('Chikanda', 'chikanda-zambia-african-polony', 'Zambia', 'Africa', true, 'Hard', 30, 60, 8, 'Snack', 'Southern African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Zambian "African polony" — a firm, savory cake made from wild orchid tubers and groundnuts.', 'Chikanda is one of Africa''s most unique foods, made from the tubers of wild orchids. It''s a traditional Bemba delicacy now popular across Zambia.',
'["2 cups chikanda powder (orchid tuber)", "1 cup groundnut powder", "1 tsp chili flakes", "1 tsp baking soda", "Water", "Salt"]',
'["Mix chikanda and groundnut powders.", "Add baking soda, chili, salt.", "Add water gradually to form thick paste.", "Pour into greased pan.", "Bake or steam 45 min until firm.", "Slice when cool. Serve cold."]',
'{"Zambia", "Southern Africa", "Orchid", "Snack"}'),

-- Nigeria (additional)
('Pepper Soup Catfish', 'pepper-soup-catfish-nigerian', 'Nigeria', 'Africa', true, 'Medium', 15, 30, 4, 'Soup', 'West African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Nigerian catfish pepper soup — a fiery, aromatic broth perfect for cold evenings or celebrations.', 'Pepper soup is Nigeria''s most beloved light dish, served at parties, during illness, and on rainy nights. Each region has its own spice blend.',
'["1 kg catfish, cleaned and cut", "2 onions", "4 garlic cloves", "2 tbsp pepper soup spice", "2 scotch bonnets", "1 bunch scent leaves", "Salt", "6 cups water"]',
'["Boil catfish in seasoned water 10 min.", "Add pepper soup spice, onions, garlic.", "Add scotch bonnets.", "Simmer 15 min.", "Add scent leaves last 2 min.", "Serve hot in bowls."]',
'{"Nigeria", "West Africa", "Soup", "Catfish"}'),

('Ofada Stew', 'ofada-stew-ayamase-green', 'Nigeria', 'Africa', true, 'Medium', 20, 45, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Nigerian green pepper stew served with local ofada rice — a beloved Yoruba celebration dish.', 'Ofada stew (Ayamase) is a distinctly Yoruba creation from Ogun State, made with green bell peppers and assorted meats.',
'["500g assorted meats (tripe, cow skin, beef)", "10 green bell peppers", "6 scotch bonnets", "1 cup palm oil", "3 onions", "2 locust beans (iru)", "Crayfish", "Salt"]',
'["Boil meats until tender.", "Blend green peppers and scotch bonnets.", "Heat palm oil until clear.", "Add onions and locust beans.", "Add pepper blend, cook 20 min.", "Add meats, simmer 15 min. Serve with ofada rice."]',
'{"Nigeria", "West Africa", "Stew", "Yoruba"}'),

-- Ghana (additional)
('Red Red', 'red-red-ghanaian-bean-stew', 'Ghana', 'Africa', true, 'Easy', 10, 35, 4, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Ghanaian black-eyed pea stew in palm oil with fried plantains — the beloved "Red Red."', 'Red Red gets its name from the red palm oil and tomato sauce. It''s Ghana''s favorite quick meal, loved by students and workers.',
'["2 cups black-eyed peas, cooked", "1/2 cup palm oil", "4 tomatoes, blended", "2 onions", "2 scotch bonnets", "Ripe plantains for frying", "Salt"]',
'["Heat palm oil, sauté onions.", "Add tomatoes and peppers, cook 15 min.", "Add beans, simmer 15 min.", "Fry plantain slices until golden.", "Serve beans topped with fried plantains."]',
'{"Ghana", "West Africa", "Beans", "Plantain"}'),

('Waakye', 'waakye-ghanaian-rice-beans', 'Ghana', 'Africa', true, 'Easy', 10, 45, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800', 'Ghanaian rice and beans cooked with millet stalks for a distinctive red color — a Hausa-influenced street food.', 'Waakye is Ghana''s most popular street breakfast, introduced by Hausa traders from northern Ghana.',
'["2 cups rice", "1 cup black-eyed peas", "Dried millet stalks or baking soda", "Salt", "Water"]',
'["Cook beans until half done.", "Add rice and millet stalks.", "Cook until both are tender.", "Rice should be reddish-brown.", "Serve with shito, spaghetti, egg, and gari."]',
'{"Ghana", "West Africa", "Rice", "Beans"}'),

-- Kenya (additional)
('Nyama Choma Kenyan', 'nyama-choma-kenyan-bbq', 'Kenya', 'Africa', true, 'Easy', 30, 40, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Kenya''s iconic barbecued meat — goat or beef grilled over charcoal, the centerpiece of every gathering.', 'Nyama Choma is Kenya''s national social food. Every town has its "choma zone" and sharing nyama choma is central to Kenyan bonding.',
'["2 kg goat ribs or beef", "Salt", "Lime juice", "Kachumbari for serving", "Ugali for serving"]',
'["Season meat with salt and lime.", "Grill over hot charcoal, turning frequently.", "Cook 30-40 min until charred outside, juicy inside.", "Serve with ugali and kachumbari."]',
'{"Kenya", "East Africa", "BBQ", "Goat"}'),

('Sukuma Wiki Kenyan', 'sukuma-wiki-kenyan-greens', 'Kenya', 'Africa', true, 'Easy', 10, 15, 4, 'Side Dish', 'East African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 'Kenyan sautéed collard greens — the everyday vegetable dish that "pushes the week" budget-wise.', 'Sukuma Wiki literally means "push the week" in Swahili — an affordable green that stretches any budget.',
'["1 bunch collard greens (sukuma), chopped", "2 tomatoes", "1 onion", "2 tbsp oil", "Salt"]',
'["Sauté onion until soft.", "Add tomatoes, cook 5 min.", "Add greens, stir.", "Cook 5-8 min until just wilted.", "Season and serve with ugali."]',
'{"Kenya", "East Africa", "Greens", "Budget"}'),

-- South Africa (additional)
('Bunny Chow Durban', 'bunny-chow-durban-original', 'South Africa', 'Africa', true, 'Medium', 20, 60, 4, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 'Durban''s iconic bunny chow — a hollowed-out bread loaf filled with spicy lamb or bean curry.', 'Created by Durban''s Indian community who needed a portable curry lunch. The bread bowl solved the need for dishes during apartheid-era restrictions.',
'["1 loaf white bread, unsliced", "500g lamb, cubed", "3 potatoes, cubed", "2 onions", "3 tbsp curry powder", "4 tomatoes", "2 garlic cloves", "Ginger", "Oil", "Salt"]',
'["Brown lamb in oil.", "Add onions, garlic, ginger.", "Add curry powder, cook 2 min.", "Add tomatoes and potatoes.", "Add water, simmer 40 min.", "Hollow out bread loaf.", "Fill with curry. Serve."]',
'{"South Africa", "Southern Africa", "Curry", "Street Food"}');

-- Create dishes and link
INSERT INTO public.dishes (name, country, continent, cultural_significance)
SELECT DISTINCT r.name, r.country, 'Africa',
  'A traditional dish from ' || r.country || ' reflecting its unique culinary heritage and cultural traditions.'
FROM public.recipes r
WHERE r.created_at > NOW() - INTERVAL '5 minutes'
AND r.continent = 'Africa'
AND NOT EXISTS (SELECT 1 FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country);

UPDATE public.recipes r SET dish_id = d.id FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country AND r.dish_id IS NULL;
