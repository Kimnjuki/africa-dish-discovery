
-- BATCH 1: 20 African dishes (Burkina Faso, Togo, Benin, Niger, Comoros, Rwanda, Burundi, South Sudan)

INSERT INTO public.recipes (name, slug, country, continent, is_african, difficulty, prep_time, cook_time, servings, category, cuisine_type, image_url, summary, history, ingredients, steps, tags) VALUES

-- Burkina Faso
('Riz Gras', 'riz-gras-burkina', 'Burkina Faso', 'Africa', true, 'Medium', 20, 45, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800',
'Burkina Faso''s beloved one-pot rice dish cooked in a rich tomato and vegetable sauce with meat, similar to Jollof but with its own distinct Burkinabè character.',
'Riz Gras (literally "fat rice") is the national comfort food of Burkina Faso. It evolved from traditional one-pot cooking methods used by Mossi and Dioula communities. The dish reflects the agricultural heritage of the Sahel region where rice became a staple crop.',
'["2 cups long-grain rice", "500g beef or chicken", "4 large tomatoes, blended", "2 onions, diced", "3 carrots, cubed", "1 cup green beans, chopped", "1 cup cabbage, shredded", "3 tbsp tomato paste", "2 Maggi cubes", "1/2 cup vegetable oil", "Salt and pepper to taste", "4 cups water or stock"]',
'["Season and brown the meat in oil, set aside.", "Sauté onions until golden, add tomato paste and blended tomatoes.", "Cook sauce for 15 minutes until oil separates.", "Add vegetables and cook 5 minutes.", "Add rice, stock, and seasoning cubes.", "Return meat to pot, cover and cook on low heat 25 minutes.", "Fluff with fork when rice is tender and liquid absorbed."]',
'{"Burkina Faso", "West Africa", "Rice", "One-Pot"}'),

('Tô', 'to-burkina-faso', 'Burkina Faso', 'Africa', true, 'Easy', 5, 20, 4, 'Staple', 'West African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
'A smooth, thick porridge made from millet or sorghum flour, Tô is the most fundamental staple food in Burkina Faso, served with various sauces.',
'Tô has been the cornerstone of Burkinabè cuisine for centuries, predating rice as the primary staple. Made from locally grown millet or sorghum, it sustained generations of Mossi, Gurunsi, and Bobo peoples through Sahel droughts and is deeply tied to communal eating traditions.',
'["2 cups millet flour (or sorghum flour)", "4 cups water", "Pinch of salt"]',
'["Bring 3 cups water to boil.", "Mix flour with 1 cup cold water to form paste.", "Pour paste into boiling water, stirring vigorously.", "Cook on medium heat, stirring constantly with wooden spoon for 15 minutes.", "Mixture should become very thick and pull from sides.", "Wet a bowl and shape Tô into dome.", "Serve with okra sauce or baobab leaf sauce."]',
'{"Burkina Faso", "West Africa", "Staple", "Millet"}'),

('Babenda', 'babenda-burkina', 'Burkina Faso', 'Africa', true, 'Medium', 15, 40, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'A hearty Burkinabè stew combining leafy greens with millet flour and fermented locust beans (soumbala), creating a nutritious one-pot meal.',
'Babenda originates from the Mossi people of central Burkina Faso. It was traditionally a rainy-season dish when fresh greens were abundant. The use of soumbala (fermented locust beans) as a seasoning is a hallmark of West African flavor profiles dating back centuries.',
'["500g mixed greens (spinach, sorrel, amaranth)", "1 cup millet flour", "100g soumbala (fermented locust beans)", "2 onions, chopped", "200g smoked fish", "3 tbsp palm oil or shea butter", "Salt to taste", "6 cups water"]',
'["Wash and chop greens finely.", "Boil water, add soumbala and smoked fish.", "Simmer 15 minutes to build broth.", "Add chopped greens and cook 10 minutes.", "Mix millet flour with cold water to form slurry.", "Stir slurry into pot gradually, stirring constantly.", "Cook 15 minutes until thickened, add palm oil and salt."]',
'{"Burkina Faso", "West Africa", "Stew", "Greens"}'),

-- Togo
('Fufu with Gboma Dessi', 'fufu-gboma-dessi-togo', 'Togo', 'Africa', true, 'Medium', 20, 50, 4, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
'Togo''s signature dish of pounded yam fufu served with Gboma Dessi, a rich spinach and tomato stew flavored with crab and smoked fish.',
'Gboma Dessi is the national dish of Togo, deeply rooted in Ewe and Kabye culinary traditions. The combination of fresh crab with smoked fish creates a layered umami depth unique to Togolese cooking. It''s traditionally prepared for Sunday family gatherings.',
'["2 lbs yams, peeled and cubed", "500g fresh spinach (gboma)", "200g fresh crab meat", "150g smoked fish", "4 tomatoes, blended", "2 onions, diced", "3 tbsp palm oil", "2 garlic cloves", "1 scotch bonnet pepper", "Salt to taste"]',
'["Boil yams until very soft, pound in mortar until smooth.", "Heat palm oil, sauté onions and garlic.", "Add blended tomatoes and cook until oil floats.", "Add smoked fish and crab, simmer 10 minutes.", "Add chopped spinach, cook until wilted.", "Season with salt and pepper.", "Serve fufu alongside the Gboma Dessi."]',
'{"Togo", "West Africa", "Fufu", "Seafood"}'),

('Koklo Meme', 'koklo-meme-togo', 'Togo', 'Africa', true, 'Medium', 30, 60, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1598103442097-8b74f0199e1b?w=800',
'Grilled chicken Togolese-style marinated in a bold paste of ginger, garlic, and local spices, served with spicy pepper sauce.',
'Koklo Meme (grilled chicken) is a beloved street food and celebration dish in Togo. Found at every roadside grill spot across Lomé, the marinade recipe varies by vendor but always features the signature combination of ginger, garlic, and hot peppers that defines Togolese grilling.',
'["1 whole chicken, cut into pieces", "4 tbsp ginger paste", "4 garlic cloves, crushed", "2 limes, juiced", "3 tbsp vegetable oil", "1 tsp ground white pepper", "2 Maggi cubes", "Salt to taste", "Spicy pepper sauce for serving"]',
'["Blend ginger, garlic, lime juice, oil, and seasonings into paste.", "Score chicken pieces deeply and coat with marinade.", "Refrigerate at least 2 hours, overnight preferred.", "Grill over medium charcoal, turning frequently.", "Baste with remaining marinade while grilling.", "Cook until charred and juices run clear, about 45 minutes.", "Serve with spicy tomato-pepper sauce and cold drinks."]',
'{"Togo", "West Africa", "Grilled", "Chicken"}'),

('Ablo', 'ablo-togo', 'Togo', 'Africa', true, 'Medium', 120, 30, 12, 'Side Dish', 'West African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
'Steamed rice and corn cakes from Togo, light and slightly tangy from fermentation, traditionally served alongside stews and grilled meats.',
'Ablo is a traditional Togolese and Beninese steamed bread that dates back to pre-colonial times. The fermentation process gives it a distinctive slight sourness, and its steaming method distinguishes it from baked breads introduced during colonization.',
'["2 cups rice flour", "1 cup corn flour", "1 cup warm water", "1 tbsp sugar", "1 tsp active dry yeast", "1/2 tsp salt"]',
'["Mix flours together in a large bowl.", "Dissolve yeast and sugar in warm water, let activate 10 minutes.", "Pour yeast mixture into flour, mix to smooth batter.", "Cover and let ferment in warm place for 2 hours.", "Grease small ramekins or molds.", "Fill molds halfway with batter.", "Steam in steamer for 25-30 minutes until firm and cooked through."]',
'{"Togo", "Benin", "West Africa", "Steamed", "Bread"}'),

-- Benin
('Amiwo', 'amiwo-benin', 'Benin', 'Africa', true, 'Medium', 15, 40, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800',
'A vibrant red cornmeal dish from Benin, cooked in a rich tomato and crab sauce, often called the "Beninese polenta" for its creamy texture.',
'Amiwo is one of Benin''s most iconic dishes, originating from the Fon people of southern Benin. The striking red color comes from cooking cornmeal directly in tomato sauce. It''s a fixture at celebrations, weddings, and naming ceremonies across the country.',
'["2 cups fine cornmeal", "6 large tomatoes, blended", "200g crab meat", "1 large onion, diced", "3 tbsp tomato paste", "1/4 cup palm oil", "2 garlic cloves", "1 scotch bonnet pepper", "Salt to taste", "3 cups water"]',
'["Heat palm oil, sauté onions and garlic until fragrant.", "Add blended tomatoes and tomato paste, cook 20 minutes.", "Add crab meat, simmer 10 minutes.", "Add water to sauce, bring to boil.", "Gradually stir in cornmeal, stirring vigorously.", "Cook on low heat 15 minutes, stirring to prevent lumps.", "Serve molded into dome shape with extra sauce."]',
'{"Benin", "West Africa", "Cornmeal", "Crab"}'),

('Wagasi', 'wagasi-benin', 'Benin', 'Africa', true, 'Medium', 30, 45, 6, 'Appetizer', 'West African',
'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
'West African fresh cheese made by Fulani herders, fried until golden and served with spicy pepper sauce — Benin''s beloved street food.',
'Wagasi (also called Waragashi) is a traditional Fulani cheese made across Benin and northern West Africa. Fulani pastoralists have produced this cheese for centuries using cow''s milk curdled with the juice of Calotropis procera leaves. It''s now Benin''s most popular street food.',
'["2 liters fresh whole milk", "Juice of 2 lemons (or Calotropis leaf juice)", "Vegetable oil for frying", "Salt to taste", "Spicy pepper sauce for serving", "Fresh tomatoes for serving"]',
'["Heat milk to just below boiling (85°C).", "Add lemon juice gradually while stirring gently.", "Milk will curdle — let sit 10 minutes.", "Strain through cheesecloth, pressing out whey.", "Shape into rounds, let set 30 minutes.", "Slice into thick pieces.", "Fry in hot oil until golden on both sides, serve with pepper sauce."]',
'{"Benin", "West Africa", "Cheese", "Street Food"}'),

-- Niger
('Dambou', 'dambou-niger', 'Niger', 'Africa', true, 'Medium', 15, 35, 6, 'Main Course', 'West African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Niger''s beloved steamed millet couscous mixed with moringa leaves, served with a spiced bean sauce — a nutritional powerhouse of the Sahel.',
'Dambou (or Dambu) is a staple dish of Niger''s Hausa communities. Moringa, known locally as "the miracle tree," has been used in Nigerien cooking for centuries. This combination of millet couscous with moringa delivers exceptional nutrition in a region where food security is a constant concern.',
'["2 cups millet couscous", "2 cups fresh moringa leaves", "1 cup black-eyed peas, cooked", "2 onions, sliced", "3 tbsp groundnut oil", "2 Maggi cubes", "1 tsp ground ginger", "Salt to taste", "Water for steaming"]',
'["Steam millet couscous in couscoussier for 20 minutes.", "Wash and chop moringa leaves finely.", "Break up couscous, mix in moringa leaves.", "Steam again for 10 minutes.", "Make sauce: sauté onions, add cooked beans and seasonings.", "Simmer sauce 10 minutes.", "Serve couscous topped with bean sauce and fried onions."]',
'{"Niger", "West Africa", "Millet", "Moringa"}'),

('Kilishi', 'kilishi-niger', 'Niger', 'Africa', true, 'Hard', 60, 120, 8, 'Snack', 'West African',
'https://images.unsplash.com/photo-1551028150-64b9f398f678?w=800',
'Niger''s famous dried spiced meat — paper-thin slices of beef coated in a groundnut and spice paste, then sun-dried to create an intensely flavored jerky.',
'Kilishi is a centuries-old Hausa delicacy originating from Niger and northern Nigeria. It was developed as a preservation method by nomadic Fulani and Hausa traders who needed protein that could survive long Saharan trade routes. Today it''s a prized luxury snack across West Africa.',
'["1 kg lean beef (topside), sliced paper-thin", "1 cup roasted groundnut paste", "4 tbsp ground cayenne pepper", "2 tbsp ground ginger", "1 tbsp garlic powder", "1 tbsp onion powder", "2 tsp ground cloves", "1 tsp ground black pepper", "1 Maggi cube, crushed", "Salt to taste", "1/4 cup water"]',
'["Slice beef against grain into paper-thin sheets.", "Spread on drying rack, sun-dry 4-6 hours until stiff.", "Mix groundnut paste with all spices and water to form coating.", "Dip each dried meat strip into spice paste, coating evenly.", "Return to drying rack, dry another 2-3 hours.", "Grill briefly over charcoal to toast the coating.", "Store in airtight container — keeps for months."]',
'{"Niger", "Nigeria", "West Africa", "Dried Meat", "Snack"}'),

-- Comoros
('Langouste à la Vanille', 'langouste-vanille-comoros', 'Comoros', 'Africa', true, 'Hard', 20, 30, 4, 'Main Course', 'Island African',
'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
'Comorian lobster bathed in a luscious vanilla sauce — a luxurious dish showcasing the islands'' world-famous vanilla and abundant seafood.',
'This dish represents the pinnacle of Comorian cuisine, combining the archipelago''s two most prized exports: vanilla and seafood. Comoros is one of the world''s largest vanilla producers, and this dish emerged from French colonial influence merging with indigenous Comorian seafood traditions.',
'["4 lobster tails", "2 vanilla beans, split and scraped", "1 cup coconut cream", "2 shallots, minced", "1/4 cup white wine or lime juice", "3 tbsp butter", "1 tbsp olive oil", "Salt and white pepper", "Fresh cilantro for garnish"]',
'["Split lobster tails, season with salt and pepper.", "Sear in butter and oil, shell-side down, 3 minutes.", "Flip, cook flesh-side 2 minutes, remove.", "Sauté shallots in same pan until soft.", "Deglaze with wine, add vanilla seeds and pod.", "Pour in coconut cream, simmer until thickened.", "Return lobster to sauce, cook 5 minutes. Garnish with cilantro."]',
'{"Comoros", "East Africa", "Seafood", "Vanilla"}'),

('Pilaou Comorien', 'pilaou-comorien', 'Comoros', 'Africa', true, 'Medium', 20, 50, 6, 'Main Course', 'Island African',
'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
'The Comorian version of pilau rice, infused with cardamom, cinnamon, and cloves, reflecting the islands'' position on the historic spice trade route.',
'Pilaou is the quintessential Comorian dish, eaten at every celebration and Friday gathering. Its aromatic spice profile reflects centuries of Arab, Indian, and Swahili trade influence on the Comoros Islands. Each island has its own variation.',
'["3 cups basmati rice", "500g beef or goat, cubed", "2 onions, sliced thin", "4 garlic cloves, minced", "6 cardamom pods", "3 cinnamon sticks", "6 whole cloves", "1 tsp cumin seeds", "3 tbsp ghee or butter", "Salt to taste", "4 cups beef stock", "Fresh cilantro"]',
'["Toast whole spices in dry pan until fragrant.", "Heat ghee, caramelize onions until deep brown.", "Add garlic and meat, brown on all sides.", "Add stock and toasted spices, simmer 30 minutes until meat tender.", "Wash rice, add to pot.", "Cover tightly, cook on lowest heat 20 minutes.", "Rest 10 minutes, fluff and garnish with cilantro."]',
'{"Comoros", "East Africa", "Rice", "Spiced"}'),

-- Rwanda
('Isombe', 'isombe-rwanda', 'Rwanda', 'Africa', true, 'Medium', 20, 60, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Rwanda''s signature dish of pounded cassava leaves slow-cooked with eggplant, spinach, and groundnut paste until silky smooth.',
'Isombe is considered Rwanda''s national dish, deeply embedded in the country''s agricultural tradition. Cassava was introduced to Africa from South America in the 16th century, and Rwandan cooks developed this unique preparation of the leaves. It''s a staple at every Rwandan family table.',
'["500g cassava leaves (or spinach as substitute)", "1 large eggplant, diced", "1/2 cup groundnut paste (peanut butter)", "1 onion, diced", "2 garlic cloves", "3 tbsp palm oil", "1 cup water", "Salt to taste"]',
'["Pound or finely chop cassava leaves.", "Boil leaves in water for 30 minutes to remove bitterness.", "Drain and set aside.", "Sauté onion and garlic in palm oil.", "Add eggplant, cook until softened.", "Add boiled leaves and groundnut paste.", "Simmer on low heat 20 minutes, stirring until creamy and thick."]',
'{"Rwanda", "East Africa", "Cassava", "Vegetarian"}'),

('Brochettes', 'brochettes-rwanda', 'Rwanda', 'Africa', true, 'Easy', 30, 20, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
'Rwanda''s most popular street food — marinated goat meat skewers grilled over charcoal, served with grilled bananas and chili sauce.',
'Brochettes are the undisputed king of Rwandan street food. Every town has its brochette vendors, and they''re the centerpiece of social gatherings. Traditionally made with goat meat, they reflect Rwanda''s pastoral heritage. The post-genocide revival of brochette culture symbolized community rebuilding.',
'["1 kg goat meat (or beef), cubed", "2 onions, quartered", "2 bell peppers, chunked", "3 tbsp vegetable oil", "2 tsp ground cumin", "1 tsp paprika", "Salt and pepper", "Wooden skewers, soaked", "Plantains for grilling", "Hot chili sauce"]',
'["Cut meat into 1-inch cubes.", "Mix oil, cumin, paprika, salt, and pepper.", "Toss meat in marinade, rest 30 minutes.", "Thread meat onto skewers alternating with onion and pepper.", "Grill over hot charcoal, turning every 3 minutes.", "Grill plantain halves alongside.", "Serve skewers with grilled plantains and chili sauce."]',
'{"Rwanda", "East Africa", "Grilled", "Street Food"}'),

-- Burundi
('Boko Boko', 'boko-boko-burundi', 'Burundi', 'Africa', true, 'Medium', 15, 90, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
'A comforting Burundian porridge of cracked wheat slow-cooked with shredded chicken until the grains become creamy — Burundi''s ultimate comfort food.',
'Boko Boko is a beloved dish in Burundi, showing the influence of Arab traders who brought wheat to the East African Great Lakes region. It''s traditionally served during Ramadan by Burundi''s Muslim community and has become popular across all demographics as a hearty, restorative meal.',
'["2 cups cracked wheat (bulgur)", "500g chicken breast", "1 large onion, diced", "3 tbsp butter", "1 tsp ground cardamom", "1/2 tsp cinnamon", "Salt and pepper to taste", "6 cups chicken stock", "Fresh parsley"]',
'["Boil chicken in stock until very tender, about 40 minutes.", "Remove chicken, shred finely.", "In same stock, add cracked wheat.", "Cook on low heat 30 minutes, stirring frequently.", "In separate pan, sauté onion in butter with spices.", "Add shredded chicken and onion mixture to wheat.", "Cook until porridge consistency, garnish with parsley."]',
'{"Burundi", "East Africa", "Wheat", "Chicken"}'),

('Mukeke', 'mukeke-burundi', 'Burundi', 'Africa', true, 'Medium', 15, 30, 4, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
'Freshwater fish from Lake Tanganyika, grilled simply with lemon and served with beans and plantains — a Burundian lakeside specialty.',
'Mukeke is a prized fish species endemic to Lake Tanganyika, the world''s second-deepest lake which borders Burundi. Fishing communities along the lake have prepared mukeke for generations, and it''s considered a delicacy in Bujumbura''s restaurants. The simple preparation lets the fish''s delicate flavor shine.',
'["4 whole mukeke or tilapia, cleaned", "3 lemons, juiced", "4 garlic cloves, minced", "2 tbsp vegetable oil", "Salt and pepper", "Fresh parsley", "Plantains for serving", "Cooked red beans for serving"]',
'["Score fish on both sides with diagonal cuts.", "Mix lemon juice, garlic, oil, salt, and pepper.", "Rub marinade inside and outside fish.", "Let marinate 15 minutes.", "Grill over charcoal 6-7 minutes per side.", "Fish is done when flesh flakes easily.", "Serve with boiled plantains and seasoned red beans."]',
'{"Burundi", "East Africa", "Fish", "Grilled"}'),

-- South Sudan
('Kisra', 'kisra-south-sudan', 'South Sudan', 'Africa', true, 'Easy', 120, 20, 8, 'Staple', 'East African',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
'South Sudan''s thin, fermented sorghum flatbread — tangy and flexible, used as both plate and utensil to scoop stews.',
'Kisra is the daily bread of South Sudan, shared across Dinka, Nuer, and Shilluk communities. The fermentation process is ancient, producing a slightly sour crepe-like bread. In South Sudanese culture, tearing kisra to share a communal bowl symbolizes unity and family bonds.',
'["2 cups sorghum flour", "3 cups warm water", "1/4 tsp active dry yeast", "Pinch of salt", "Vegetable oil for cooking"]',
'["Mix sorghum flour with warm water to thin batter consistency.", "Add yeast, stir well.", "Cover and ferment in warm place 8-12 hours or overnight.", "Stir batter — it should be bubbly and slightly sour.", "Heat flat pan or griddle, lightly oil.", "Pour thin layer of batter, swirl to spread.", "Cook until set and edges lift, about 2 minutes per side."]',
'{"South Sudan", "Sudan", "East Africa", "Flatbread", "Fermented"}'),

('Ful Sudani', 'ful-sudani-south-sudan', 'South Sudan', 'Africa', true, 'Easy', 480, 45, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
'Slow-cooked fava bean stew, South Sudan style, enriched with sesame oil and topped with fresh cheese, boiled eggs, and pickled vegetables.',
'Ful (fava beans) has been cultivated in the Nile Valley for over 5,000 years. In South Sudan, the dish reflects both the country''s Nilotic heritage and influences from northern Sudan and Egypt. It''s the quintessential breakfast dish, eaten daily by millions.',
'["2 cups dried fava beans, soaked overnight", "3 tbsp sesame oil (simsim)", "2 onions, diced", "4 garlic cloves, minced", "2 tomatoes, diced", "1 tsp cumin", "Juice of 2 limes", "Salt and pepper", "Boiled eggs for serving", "Fresh cheese (gibna) for serving"]',
'["Drain soaked beans, add to pot with fresh water.", "Boil until very soft, about 40 minutes.", "Mash some beans, leave others whole for texture.", "Heat sesame oil, sauté onions and garlic.", "Add tomatoes and cumin, cook 5 minutes.", "Stir into mashed beans.", "Serve topped with boiled eggs, cheese, lime, and sesame oil drizzle."]',
'{"South Sudan", "East Africa", "Beans", "Breakfast"}'),

('Bamia', 'bamia-south-sudan', 'South Sudan', 'Africa', true, 'Medium', 15, 45, 6, 'Main Course', 'East African',
'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
'A rich okra and lamb stew from South Sudan, slow-simmered with tomatoes and aromatic spices, served over kisra flatbread.',
'Bamia (okra stew) is one of South Sudan''s most important dishes, served at weddings, funerals, and family gatherings. Okra''s mucilaginous texture is embraced in South Sudanese cooking as a sign of a well-made stew. The dish connects South Sudan to the broader Nilotic culinary tradition.',
'["500g lamb, cubed", "500g fresh okra, sliced", "4 tomatoes, blended", "2 onions, diced", "4 garlic cloves", "2 tbsp tomato paste", "3 tbsp vegetable oil", "1 tsp ground coriander", "1 tsp cumin", "Salt and pepper", "2 cups water"]',
'["Brown lamb in oil on all sides.", "Add onions and garlic, sauté until soft.", "Add tomato paste and blended tomatoes.", "Cook sauce 15 minutes until reduced.", "Add spices and water, simmer 20 minutes.", "Add sliced okra.", "Cook 15 more minutes until okra is tender and stew is thick. Serve over kisra."]',
'{"South Sudan", "East Africa", "Okra", "Lamb"}');

-- Create corresponding dishes
INSERT INTO public.dishes (name, country, continent, cultural_significance)
SELECT DISTINCT r.name, r.country, 'Africa',
  CASE
    WHEN r.country = 'Burkina Faso' THEN 'A cherished dish of Burkina Faso reflecting the culinary heritage of the Sahel region and Mossi, Dioula, and Gurunsi communities.'
    WHEN r.country = 'Togo' THEN 'A signature dish of Togolese cuisine rooted in Ewe and Kabye traditions, central to family gatherings and celebrations.'
    WHEN r.country = 'Benin' THEN 'An iconic Beninese dish from the Fon culinary tradition, served at weddings, naming ceremonies, and communal feasts.'
    WHEN r.country = 'Niger' THEN 'A traditional Nigerien dish from Hausa and Fulani communities, reflecting centuries of Saharan trade and pastoral heritage.'
    WHEN r.country = 'Comoros' THEN 'A treasured Comorian dish showcasing the archipelago''s unique blend of Arab, Swahili, and French culinary influences.'
    WHEN r.country = 'Rwanda' THEN 'A beloved Rwandan dish central to the country''s communal dining culture and agricultural heritage.'
    WHEN r.country = 'Burundi' THEN 'A traditional Burundian dish reflecting the Great Lakes region''s culinary traditions and Lake Tanganyika''s bounty.'
    WHEN r.country = 'South Sudan' THEN 'A staple of South Sudanese cuisine rooted in Nilotic traditions, symbolizing communal bonds and family unity.'
    ELSE 'A traditional African dish with deep cultural roots.'
  END
FROM public.recipes r
WHERE r.name IN ('Riz Gras','Tô','Babenda','Fufu with Gboma Dessi','Koklo Meme','Ablo','Amiwo','Wagasi','Dambou','Kilishi','Langouste à la Vanille','Pilaou Comorien','Isombe','Brochettes','Boko Boko','Mukeke','Kisra','Ful Sudani','Bamia')
AND NOT EXISTS (SELECT 1 FROM public.dishes d WHERE d.name = r.name AND COALESCE(d.country,'') = r.country);

-- Link recipes to dishes
UPDATE public.recipes r
SET dish_id = d.id
FROM public.dishes d
WHERE d.name = r.name AND COALESCE(d.country,'') = r.country AND r.dish_id IS NULL;
