-- Add remaining African dishes with historical background (only new ones)
INSERT INTO recipes (name, slug, country, continent, summary, history, difficulty, prep_time, cook_time, servings, ingredients, steps, tags)
VALUES 
-- Additional West Africa
('Obe Ata (Nigerian Red Stew)', 'obe-ata-nigerian-red-stew', 'Nigeria', 'Africa',
'Rich tomato-pepper stew that forms the base of countless Nigerian dishes.',
'Obe Ata, meaning "pepper stew" in Yoruba, is the mother sauce of Nigerian cuisine. Every household has their own version, passed down through generations. It forms the base for rice dishes, pasta, and serves as a dipping sauce for bread.',
'Medium', 30, 60, 8,
'["6 large tomatoes", "6 red bell peppers", "4 scotch bonnets", "2 large onions", "1 cup palm oil", "2 lb chicken or beef", "Stock cubes", "Salt", "Thyme"]',
'["Blend tomatoes, peppers, and scotch bonnets", "Fry onions in palm oil until golden", "Add blended mixture and cook down", "Add meat and cook until tender", "Season and simmer until oil floats on top"]',
ARRAY['West Africa', 'stew', 'base sauce', 'traditional']),

('Plasas (Sierra Leone Greens)', 'plasas-sierra-leone-greens', 'Sierra Leone', 'Africa',
'Creamy cassava leaf stew with palm oil and smoked fish, a Sierra Leonean comfort food.',
'Plasas has been cooked in Sierra Leone for centuries, originally by the Mende and Temne peoples. The dish showcases the resourcefulness of using locally abundant cassava leaves.',
'Medium', 45, 90, 6,
'["2 lbs cassava leaves, pounded", "1 cup palm oil", "1 lb smoked fish", "1 onion", "Scotch bonnet", "Okra", "Salt"]',
'["Pound cassava leaves until smooth", "Cook in palm oil with onions", "Add smoked fish and seasonings", "Simmer until thick", "Serve with rice or fufu"]',
ARRAY['West Africa', 'greens', 'traditional', 'comfort food']),

-- Additional East Africa
('Matoke (Ugandan Banana Stew)', 'matoke-ugandan-banana-stew', 'Uganda', 'Africa',
'Savory stew made from green cooking bananas, a staple of the Baganda people.',
'Matoke is the national dish of Uganda, central to Baganda culture for over 500 years. The specific variety of banana used (East African Highland banana) was cultivated specifically for cooking.',
'Easy', 20, 60, 6,
'["8 green bananas", "1 lb beef or chicken", "2 tomatoes", "1 onion", "Curry powder", "Salt", "Vegetable oil"]',
'["Peel and soak bananas", "Cook meat with onions and tomatoes", "Add bananas and water", "Cover and steam until tender", "Mash slightly before serving"]',
ARRAY['East Africa', 'banana', 'staple', 'national dish']),

('Sukuma Wiki (Kenyan Collard Greens)', 'sukuma-wiki-kenyan-collards', 'Kenya', 'Africa',
'Sautéed collard greens with tomatoes and onions, Kenya''s most affordable nutritious meal.',
'Sukuma Wiki means "push the week" in Swahili, reflecting its role as an affordable, nutritious dish that stretches limited budgets. It became popular during economic hardships and remains beloved today.',
'Easy', 10, 15, 4,
'["1 bunch collard greens (sukuma)", "2 tomatoes", "1 onion", "2 cloves garlic", "Vegetable oil", "Salt"]',
'["Wash and chop greens finely", "Sauté onions until soft", "Add tomatoes and cook down", "Add greens and cook until tender", "Season and serve with ugali"]',
ARRAY['East Africa', 'vegetable', 'affordable', 'everyday']),

-- Additional North Africa
('Algerian Couscous Royale', 'algerian-couscous-royale', 'Algeria', 'Africa',
'Fluffy steamed couscous topped with seven vegetables and multiple meats.',
'Couscous is inscribed on UNESCO''s Intangible Cultural Heritage list. In Algeria, the Friday couscous tradition brings families together weekly, with this royal version reserved for special celebrations.',
'Hard', 60, 120, 10,
'["2 cups couscous", "Lamb shanks", "Chicken pieces", "Merguez sausages", "Carrots", "Turnips", "Zucchini", "Chickpeas", "Tomato paste", "Ras el hanout"]',
'["Steam couscous in traditional couscoussier", "Prepare rich broth with meats", "Cook vegetables in broth", "Layer couscous, meats, and vegetables", "Serve with spicy harissa on side"]',
ARRAY['North Africa', 'couscous', 'festive', 'UNESCO heritage']),

('Libyan Bazeen', 'libyan-bazeen', 'Libya', 'Africa',
'Dome of unleavened barley dough served with spicy lamb stew.',
'Bazeen is Libya''s national dish, with preparation methods unchanged for centuries. The communal eating style, where diners gather around a shared plate, reflects Bedouin hospitality traditions.',
'Hard', 45, 120, 8,
'["2 cups barley flour", "Water", "2 lbs lamb on bone", "4 tomatoes", "2 onions", "Hot peppers", "Turmeric", "Salt"]',
'["Cook lamb with tomatoes and spices until tender", "Mix barley flour with hot water", "Knead into smooth dome shape", "Place dome in center of stew", "Create well in center with thumb", "Serve communally"]',
ARRAY['North Africa', 'national dish', 'communal', 'traditional']),

-- Additional Central Africa
('Gabonese Nyembwe Chicken', 'gabonese-nyembwe-chicken', 'Gabon', 'Africa',
'Chicken slow-cooked in rich palm nut sauce, Gabon''s national treasure.',
'Nyembwe is central to Gabonese identity, served at all important occasions from weddings to political gatherings. The palm nut sauce represents the wealth of Gabon''s rainforest.',
'Medium', 30, 90, 6,
'["1 whole chicken", "2 cups palm nut cream", "2 onions", "4 tomatoes", "Garlic", "Hot pepper", "Salt"]',
'["Cut chicken into pieces", "Brown in oil with onions", "Add tomatoes and cook down", "Add palm nut cream", "Simmer for 1 hour until thick", "Serve with plantains or rice"]',
ARRAY['Central Africa', 'chicken', 'palm nut', 'national dish']),

('Chadian Kissar', 'chadian-kissar', 'Chad', 'Africa',
'Thin, sour millet crepes served with stews and soups, Chad''s daily bread.',
'Kissar has been made by the Sara and Arab peoples of Chad for centuries. The fermentation process provides probiotics, and the thin crepes serve as edible utensils, similar to Ethiopian injera.',
'Medium', 720, 30, 8,
'["2 cups millet flour", "Water", "Salt", "Yeast or leftover batter"]',
'["Mix flour with water to thin batter", "Let ferment for 12-24 hours", "Pour thin layer on hot griddle", "Cook until bubbly and set", "Stack and serve with stews"]',
ARRAY['Central Africa', 'bread', 'fermented', 'staple']),

-- Additional Southern Africa
('Zambian Nshima with Ifisashi', 'zambian-nshima-ifisashi', 'Zambia', 'Africa',
'Cornmeal porridge with peanut-spinach stew, Zambia''s comfort food combination.',
'Nshima is eaten at almost every meal in Zambia. The accompanying Ifisashi, meaning "squeeze" in Bemba, refers to the technique of squeezing cooked greens into the peanut sauce.',
'Easy', 20, 40, 6,
'["2 cups maize meal", "4 cups water", "1 bunch spinach or pumpkin leaves", "1/2 cup peanut butter", "1 tomato", "1 onion", "Salt"]',
'["Cook greens until tender", "Sauté onions and tomatoes", "Add peanut butter and cooked greens", "Prepare nshima by cooking maize meal in water", "Serve together"]',
ARRAY['Southern Africa', 'vegetarian', 'peanut', 'comfort food']),

('Botswana Seswaa', 'botswana-seswaa', 'Botswana', 'Africa',
'Slow-pounded shredded beef, Botswana''s national dish and wedding essential.',
'Seswaa is inseparable from Botswana''s culture, served at every important celebration. The meat is traditionally cooked in a three-legged pot and pounded with wooden sticks until shredded.',
'Medium', 30, 180, 8,
'["3 lbs beef with bones", "Water", "Salt"]',
'["Boil beef with bones until very tender", "Remove bones", "Pound meat with wooden sticks", "Add salt", "Serve with pap and morogo greens"]',
ARRAY['Southern Africa', 'beef', 'national dish', 'wedding food']),

('Swazi Emasi Etinkhobe (Soured Milk with Pumpkin)', 'swazi-emasi-etinkhobe', 'Eswatini', 'Africa',
'Traditional fermented milk served with cooked pumpkin, a Swazi breakfast staple.',
'Emasi (soured milk) is sacred in Swazi culture, historically consumed only by royalty. The combination with pumpkin represents the agricultural heritage of the Swazi people.',
'Easy', 5, 30, 4,
'["2 cups soured milk or thick yogurt", "1 lb pumpkin, cubed", "Pinch of salt"]',
'["Cook pumpkin until soft", "Drain and mash slightly", "Serve warm with cold emasi", "Mix at table before eating"]',
ARRAY['Southern Africa', 'breakfast', 'dairy', 'traditional']);
