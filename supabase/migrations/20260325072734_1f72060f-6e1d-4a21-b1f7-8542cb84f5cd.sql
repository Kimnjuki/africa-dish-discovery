
-- BATCH 2: 20 African dishes (Mauritania, Equatorial Guinea, Republic of Congo, Angola, São Tomé, Liberia, Guinea, Mali)

INSERT INTO public.recipes (name, slug, country, continent, is_african, difficulty, prep_time, cook_time, servings, category, cuisine_type, image_url, summary, history, ingredients, steps, tags) VALUES

-- Mauritania
('Thieboudienne Mauritanien', 'thieboudienne-mauritania', 'Mauritania', 'Africa', true, 'Hard', 30, 90, 8, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Mauritania''s elaborate fish and rice dish with stuffed vegetables, a feast-worthy adaptation of the Senegalese classic with distinct Moorish spicing.',
'While sharing roots with Senegal''s Thieboudienne, the Mauritanian version reflects the country''s unique position between Arab North Africa and sub-Saharan West Africa. Moorish spice blends and the use of dried fish alongside fresh fish distinguish this version.',
'["1 kg firm white fish", "3 cups broken rice", "4 tomatoes, blended", "1 eggplant, halved", "2 carrots", "1 cabbage wedge", "1 sweet potato", "3 tbsp tomato paste", "1/2 cup vegetable oil", "2 garlic cloves", "1 bunch parsley, chopped", "1 scotch bonnet pepper", "2 Maggi cubes", "Salt to taste"]',
'["Stuff fish with parsley-garlic paste.", "Fry fish until golden, set aside.", "In same oil, sauté onions and tomato paste.", "Add blended tomatoes, cook 20 minutes.", "Add vegetables one by one based on cooking time.", "Remove vegetables when tender.", "Add rice to remaining sauce and water, cook 25 minutes.", "Arrange fish and vegetables over rice to serve."]',
'{"Mauritania", "West Africa", "Fish", "Rice"}'),

('Méchoui', 'mechoui-mauritania', 'Mauritania', 'Africa', true, 'Hard', 60, 240, 12, 'Main Course', 'North African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
'Whole roasted lamb slow-cooked over embers until the meat falls from the bone — Mauritania''s most prestigious celebration dish.',
'Méchoui is the crown jewel of Mauritanian hospitality. In nomadic Moorish culture, slaughtering and roasting a whole lamb for guests is the highest honor. The technique of slow-roasting over a pit of embers was perfected by Saharan nomads and remains central to weddings and Eid celebrations.',
'["1 whole lamb (or leg of lamb)", "1/2 cup butter, melted", "4 garlic cloves, crushed", "2 tbsp ground cumin", "1 tbsp paprika", "1 tsp cayenne pepper", "Salt and pepper", "2 onions, quartered", "Fresh mint for serving"]',
'["Mix butter with garlic, cumin, paprika, cayenne, salt.", "Score lamb deeply all over.", "Rub spice butter into every cut and cavity.", "If using pit: build hardwood fire, let burn to embers.", "Place lamb on spit or rack over embers.", "Roast slowly 3-4 hours, basting with drippings.", "Meat is done when it falls from the bone. Serve with mint."]',
'{"Mauritania", "North Africa", "Lamb", "Celebration"}'),

('Zrig', 'zrig-mauritania', 'Mauritania', 'Africa', true, 'Easy', 10, 5, 4, 'Beverage', 'North African',
'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800',
'A traditional Mauritanian fermented milk drink, sweetened and spiced — the refreshing beverage of the Saharan nomads.',
'Zrig is deeply embedded in Mauritanian Moorish culture. In the desert, fermented camel or goat milk was the primary source of hydration and nutrition for nomadic communities. Offering Zrig to a guest is a fundamental gesture of Mauritanian hospitality.',
'["1 liter fermented milk (or buttermilk)", "3 tbsp sugar", "1/2 cup water", "1/4 tsp ground nutmeg", "Ice cubes"]',
'["Combine fermented milk and water in a pitcher.", "Add sugar, stir until dissolved.", "Add nutmeg and mix well.", "Chill thoroughly or add ice.", "Serve cold in tall glasses."]',
'{"Mauritania", "North Africa", "Beverage", "Fermented"}'),

-- Equatorial Guinea
('Succotash de Pescado', 'succotash-pescado-eq-guinea', 'Equatorial Guinea', 'Africa', true, 'Medium', 20, 40, 6, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
'A hearty fish and plantain stew from Equatorial Guinea, blending Spanish colonial and Fang culinary traditions with fresh Atlantic seafood.',
'Equatorial Guinea''s cuisine uniquely blends indigenous Fang and Bubi traditions with Spanish colonial influence — it''s the only Spanish-speaking country in Africa. This fish stew reflects the islands'' abundant Atlantic seafood combined with mainland tropical ingredients.',
'["500g firm white fish, cubed", "2 ripe plantains, sliced", "4 tomatoes, diced", "2 onions, sliced", "3 garlic cloves", "1 cup palm oil", "2 cups coconut milk", "1 scotch bonnet pepper", "1 bunch cilantro", "Salt and pepper", "2 cups water"]',
'["Heat palm oil, fry plantain slices until golden, set aside.", "Sauté onions and garlic in remaining oil.", "Add tomatoes and pepper, cook 10 minutes.", "Pour in coconut milk and water.", "Add fish gently, simmer 15 minutes.", "Return plantains to pot.", "Cook 5 more minutes, garnish with cilantro."]',
'{"Equatorial Guinea", "Central Africa", "Fish", "Plantain"}'),

('Pepesoup de Carne', 'pepesoup-carne-eq-guinea', 'Equatorial Guinea', 'Africa', true, 'Medium', 15, 60, 6, 'Soup', 'Central African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
'A spicy, aromatic meat soup from Equatorial Guinea with a complex pepper and herb base, traditionally served as a restorative meal.',
'Pepesoup (pepper soup) is a beloved dish across Equatorial Guinea, particularly on Bioko Island. The Bubi people developed this intensely spiced broth as both a celebratory feast dish and a medicinal remedy for colds and exhaustion.',
'["500g goat meat, cubed", "2 onions, quartered", "4 garlic cloves", "2 inches ginger, sliced", "2 scotch bonnet peppers", "1 tbsp ground calabash nutmeg", "1 tsp ground alligator pepper", "2 limes", "Fresh basil leaves", "Salt to taste", "8 cups water"]',
'["Wash meat with lime juice, drain.", "Place meat in pot with water, bring to boil.", "Skim foam, add onions, garlic, and ginger.", "Simmer 30 minutes until meat is tender.", "Add peppers, nutmeg, and alligator pepper.", "Cook another 20 minutes for flavors to meld.", "Add basil, adjust salt, serve hot in bowls."]',
'{"Equatorial Guinea", "Central Africa", "Soup", "Spicy"}'),

-- Republic of Congo
('Poulet Moambé', 'poulet-moambe-congo', 'Republic of the Congo', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800',
'Congo''s national dish — chicken simmered in a rich, velvety palm butter sauce with okra and spinach, the pride of Congolese cooking.',
'Poulet Moambé (chicken in palm butter) is considered the national dish of both the Republic of Congo and the Democratic Republic of Congo. Palm nut sauce (moambé) has been the foundation of Central African cooking for millennia. It was historically a ceremonial dish reserved for chiefs and honored guests.',
'["1 whole chicken, cut into pieces", "2 cups palm butter (moambé)", "2 onions, diced", "4 tomatoes, blended", "200g fresh okra, sliced", "200g spinach", "3 garlic cloves", "2 scotch bonnet peppers", "Salt to taste", "3 cups water"]',
'["Season chicken with salt, brown in a little oil.", "Remove chicken, sauté onions and garlic.", "Add blended tomatoes, cook 15 minutes.", "Stir in palm butter, mixing until smooth.", "Return chicken, add water.", "Simmer 30 minutes until chicken is cooked through.", "Add okra and spinach, cook 10 more minutes. Serve with fufu or rice."]',
'{"Republic of the Congo", "Central Africa", "Chicken", "Palm Butter"}'),

('Saka Saka Congolais', 'saka-saka-congo', 'Republic of the Congo', 'Africa', true, 'Medium', 30, 90, 6, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Finely pounded cassava leaves slow-cooked with palm oil, smoked fish, and peanut butter — a beloved everyday Congolese staple.',
'Saka Saka (pondu) is the soul food of the Congo Basin. Cassava leaves are so central to Congolese identity that the dish appears at virtually every meal. The lengthy pounding and cooking process transforms tough leaves into a silky, deeply flavored green that pairs perfectly with fufu.',
'["1 kg cassava leaves (or spinach)", "1/2 cup palm oil", "200g smoked fish", "1/2 cup peanut butter", "2 onions, diced", "3 garlic cloves", "1 scotch bonnet pepper", "Salt to taste", "2 cups water"]',
'["If using cassava leaves, pound until very fine.", "Boil leaves in water for 45 minutes.", "In separate pot, heat palm oil and sauté onions.", "Add garlic and smoked fish, cook 5 minutes.", "Add peanut butter, stir until melted.", "Add drained leaves to sauce.", "Simmer on low heat 30 minutes, stirring occasionally. Serve with fufu."]',
'{"Republic of the Congo", "Central Africa", "Cassava Leaves", "Palm Oil"}'),

-- Angola
('Muamba de Galinha', 'muamba-galinha-angola', 'Angola', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800',
'Angola''s national dish — a rich chicken stew in palm oil sauce with okra, garlic, and chili, reflecting centuries of Bantu and Portuguese culinary fusion.',
'Muamba de Galinha is Angola''s most iconic dish and was voted one of the world''s best foods by CNN. It predates Portuguese colonization, originating from Kimbundu-speaking peoples. The Portuguese added garlic and refined the recipe, creating a unique Luso-African fusion.',
'["1 whole chicken, cut into pieces", "1 cup palm oil", "6 garlic cloves, minced", "2 large onions, sliced", "4 tomatoes, chopped", "500g okra, whole", "3 chili peppers", "Juice of 2 lemons", "Salt and pepper", "2 cups water"]',
'["Marinate chicken in lemon juice, garlic, salt for 30 minutes.", "Heat palm oil, brown chicken pieces on all sides.", "Remove chicken, sauté onions until caramelized.", "Add tomatoes and chilies, cook 10 minutes.", "Return chicken, add water.", "Simmer 30 minutes until chicken is tender.", "Add whole okra, cook 10 more minutes. Serve with funge."]',
'{"Angola", "Southern Africa", "Chicken", "Palm Oil"}'),

('Funge', 'funge-angola', 'Angola', 'Africa', true, 'Easy', 5, 20, 6, 'Staple', 'Southern African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
'Angola''s essential starchy staple — a smooth, dense porridge made from cassava flour, served as the base for every Angolan stew.',
'Funge (also called Funji) is to Angola what bread is to France. Made from cassava flour, it was the staple food of Bantu peoples long before Portuguese contact. Eating funge with one''s hands from a shared plate remains a core element of Angolan communal dining culture.',
'["2 cups cassava flour (fuba de mandioca)", "4 cups water", "Pinch of salt"]',
'["Bring water to a rolling boil.", "Reduce to medium heat.", "Add cassava flour gradually, stirring with wooden spoon.", "Stir vigorously and continuously to prevent lumps.", "Cook 15 minutes until very thick and smooth.", "Mixture should pull away from sides of pot.", "Wet hands and shape into dome. Serve immediately with stew."]',
'{"Angola", "Southern Africa", "Staple", "Cassava"}'),

('Calulu', 'calulu-angola', 'Angola', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'Southern African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
'A fragrant Angolan fish and vegetable stew combining dried and fresh fish with okra, tomatoes, and sweet potato in palm oil.',
'Calulu is one of Angola''s most traditional dishes, originating from the coastal Ambundu people. The combination of dried fish (for umami depth) with fresh fish is a distinctive technique. The dish travelled to São Tomé and Brazil through the slave trade, evolving into different versions.',
'["300g dried fish, soaked", "500g fresh fish", "500g okra, sliced", "2 sweet potatoes, cubed", "4 tomatoes, chopped", "2 onions, sliced", "1/2 cup palm oil", "3 garlic cloves", "1 bunch fresh basil", "Salt and pepper", "3 cups water"]',
'["Soak dried fish for 2 hours, drain and flake.", "Heat palm oil, sauté onions and garlic.", "Add tomatoes, cook until saucy.", "Layer sweet potatoes, okra, and dried fish in pot.", "Add fresh fish on top.", "Pour sauce over everything, add water.", "Cover tightly, simmer 40 minutes. Add basil before serving."]',
'{"Angola", "Southern Africa", "Fish", "Stew"}'),

-- São Tomé and Príncipe
('Calulu Santomense', 'calulu-sao-tome', 'São Tomé and Príncipe', 'Africa', true, 'Medium', 30, 90, 6, 'Main Course', 'Central African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
'São Tomé''s national dish — a complex layered stew of smoked fish, fresh fish, okra, and palm oil, simmered for hours until the flavors meld into one.',
'Calulu is the undisputed national dish of São Tomé and Príncipe, brought by enslaved Angolans and adapted with the islands'' abundant seafood. Every family has their recipe, and it''s served at every major celebration. The long cooking time is considered essential — no shortcuts allowed.',
'["500g smoked fish", "500g fresh grouper", "500g okra", "4 tomatoes", "2 onions", "1 cup palm oil", "200g dried shrimp", "4 garlic cloves", "3 bay leaves", "Fresh basil", "Salt and chili pepper", "Banana leaves for lining"]',
'["Line pot with banana leaves.", "Layer smoked fish, okra, tomatoes, and onions.", "Add palm oil, dried shrimp, and garlic.", "Place fresh fish on top.", "Add bay leaves, basil, and chili.", "Cover with more banana leaves.", "Simmer on very low heat for 2 hours without stirring. Serve with banana or breadfruit."]',
'{"São Tomé and Príncipe", "Central Africa", "Fish", "National Dish"}'),

-- Liberia
('Palava Sauce', 'palava-sauce-liberia', 'Liberia', 'Africa', true, 'Medium', 20, 45, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Liberia''s beloved "palaver sauce" made from plato leaves (or spinach), palm oil, smoked fish, and meats — a rich, deeply savory stew.',
'Palava Sauce (from "palaver," meaning discussion) earned its name because the complex combination of ingredients often sparked debate about the best recipe. It''s a dish of the Americo-Liberian and indigenous communities alike, representing Liberia''s unique cultural fusion.',
'["500g spinach or plato leaves", "200g smoked fish", "200g dried shrimp", "1 cup palm oil", "2 onions, diced", "2 scotch bonnet peppers", "200g egusi (melon seeds), ground", "Salt to taste", "2 cups water"]',
'["Wash and chop greens finely.", "Heat palm oil, sauté onions until soft.", "Add smoked fish and dried shrimp.", "Add water, simmer 15 minutes.", "Stir in ground egusi, cook 10 minutes until thickened.", "Add chopped greens and peppers.", "Cook 15 minutes until greens are tender. Serve with rice or fufu."]',
'{"Liberia", "West Africa", "Greens", "Palm Oil"}'),

('Jollof Rice Liberian', 'jollof-rice-liberian', 'Liberia', 'Africa', true, 'Medium', 15, 50, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800',
'Liberia''s take on Jollof rice — known locally as "check rice" — cooked with a heavier tomato base and served at every gathering.',
'Liberian Jollof (check rice) has its own distinct identity within the broader Jollof family. The heavier use of tomato paste and the tradition of serving it with fried plantains reflect Americo-Liberian culinary influence blended with indigenous Kpelle and Bassa traditions.',
'["3 cups long-grain rice", "6 tbsp tomato paste", "4 tomatoes, blended", "2 onions, diced", "500g chicken, cut up", "1/2 cup vegetable oil", "2 Maggi cubes", "1 scotch bonnet pepper", "1 tsp thyme", "Salt to taste", "4 cups chicken stock"]',
'["Season and fry chicken until golden, set aside.", "Sauté onions in oil until soft.", "Add tomato paste, fry until darkened.", "Add blended tomatoes, cook 15 minutes.", "Add stock, seasoning cubes, thyme, and pepper.", "Add rice, stir well.", "Cover tightly, cook on low heat 25 minutes until rice is done.", "Serve with fried plantains and chicken."]',
'{"Liberia", "West Africa", "Jollof", "Rice"}'),

-- Guinea
('Poulet Yassa Guinéen', 'poulet-yassa-guinea', 'Guinea', 'Africa', true, 'Medium', 60, 45, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800',
'Guinea''s version of the classic Yassa — lemon-marinated chicken smothered in caramelized onions, with a Guinean twist of added mustard and olives.',
'While Yassa originated with the Casamance Diola people, Guinean cooks adopted and adapted it with their own touches. The addition of Dijon mustard shows French colonial influence, while the generous use of citrus reflects Guinea''s tropical bounty.',
'["1 whole chicken, cut into pieces", "6 large onions, sliced thin", "6 lemons, juiced", "3 tbsp Dijon mustard", "1/2 cup vegetable oil", "4 garlic cloves", "1 scotch bonnet pepper", "1 cup green olives", "Salt and pepper", "1 cup chicken stock"]',
'["Marinate chicken in lemon juice, mustard, garlic, salt for 2 hours.", "Remove chicken, pat dry, reserve marinade.", "Grill or fry chicken until golden on all sides.", "In large pot, slowly caramelize onions in oil (20 minutes).", "Add reserved marinade and stock.", "Nestle chicken into onion sauce.", "Simmer 25 minutes. Add olives, cook 5 more minutes."]',
'{"Guinea", "West Africa", "Chicken", "Onion"}'),

('Fouti', 'fouti-guinea', 'Guinea', 'Africa', true, 'Easy', 10, 25, 4, 'Staple', 'West African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
'A smooth, stretchy fonio porridge from Guinea''s Fouta Djallon highlands — made from Africa''s oldest cultivated grain.',
'Fouti is made from fonio, a tiny grain native to West Africa that has been cultivated for over 5,000 years. The Fulani people of Guinea''s Fouta Djallon highlands consider fonio sacred — it''s called "the seed of the universe" in their creation mythology.',
'["2 cups fonio grain", "3 cups water", "2 tbsp butter", "Salt to taste"]',
'["Wash fonio thoroughly in several changes of water.", "Bring 3 cups water to boil with salt.", "Add fonio, stir once.", "Cover, reduce heat to lowest setting.", "Cook 5 minutes until water is absorbed.", "Fluff with fork, add butter.", "Let steam covered for 5 more minutes. Serve with sauce."]',
'{"Guinea", "West Africa", "Fonio", "Staple"}'),

-- Mali
('Tiguadege Na', 'tiguadege-na-mali', 'Mali', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
'Mali''s famous groundnut (peanut) stew — chicken or lamb slow-simmered in a thick, creamy peanut sauce with tomatoes and root vegetables.',
'Tiguadege Na (groundnut sauce) is Mali''s most famous dish, served at virtually every celebration and family gathering. Groundnuts have been cultivated in the Sahel for centuries, and this stew represents the culinary genius of Bambara and Mandinka peoples in transforming simple ingredients into extraordinary flavors.',
'["500g chicken or lamb, cubed", "1 cup smooth peanut butter", "4 tomatoes, blended", "2 onions, diced", "3 garlic cloves", "2 sweet potatoes, cubed", "2 carrots, cubed", "1 cup okra, sliced", "3 tbsp vegetable oil", "2 Maggi cubes", "Salt and pepper", "4 cups stock"]',
'["Brown meat in oil, set aside.", "Sauté onions and garlic until golden.", "Add blended tomatoes, cook 15 minutes.", "Stir in peanut butter until smooth.", "Add stock and return meat.", "Simmer 30 minutes.", "Add root vegetables, cook 20 minutes until tender.", "Add okra last 5 minutes. Serve over rice."]',
'{"Mali", "West Africa", "Peanut", "Stew"}'),

('Fakoye', 'fakoye-mali', 'Mali', 'Africa', true, 'Medium', 15, 40, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'A traditional Malian sauce of dried baobab leaves and smoked fish, with a unique sour-savory flavor profile, served over rice or tô.',
'Fakoye showcases the Malian genius for using dried ingredients to create complex flavors. Baobab leaves are dried during the abundant rainy season and stored for year-round use. The baobab tree is sacred in Malian culture — it''s called the "tree of life" and appears in countless folk tales.',
'["2 cups dried baobab leaf powder", "200g smoked catfish", "2 onions, diced", "3 tbsp shea butter", "2 Maggi cubes", "1 scotch bonnet pepper", "4 cups water", "Salt to taste"]',
'["Soak baobab powder in 2 cups water for 10 minutes.", "Heat shea butter, sauté onions.", "Add soaked baobab and remaining water.", "Add smoked fish, breaking into chunks.", "Add pepper and seasoning cubes.", "Simmer 30 minutes until sauce thickens.", "Stir occasionally — sauce should be smooth and slightly slimy. Serve over rice or tô."]',
'{"Mali", "West Africa", "Baobab", "Smoked Fish"}');

-- Create dishes and link
INSERT INTO public.dishes (name, country, continent, cultural_significance)
SELECT DISTINCT r.name, r.country, 'Africa',
  'A traditional dish from ' || r.country || ' reflecting the country''s unique culinary heritage and cultural traditions passed down through generations.'
FROM public.recipes r
WHERE r.slug IN ('thieboudienne-mauritania','mechoui-mauritania','zrig-mauritania','succotash-pescado-eq-guinea','pepesoup-carne-eq-guinea','poulet-moambe-congo','saka-saka-congo','muamba-galinha-angola','funge-angola','calulu-angola','calulu-sao-tome','palava-sauce-liberia','jollof-rice-liberian','poulet-yassa-guinea','fouti-guinea','tiguadege-na-mali','fakoye-mali')
AND NOT EXISTS (SELECT 1 FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country);

UPDATE public.recipes r SET dish_id = d.id FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country AND r.dish_id IS NULL;
