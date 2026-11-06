-- Batch 1: African Dishes History Entries
UPDATE recipes SET 
  history = 'Chakhchoukha is an Algerian traditional dish dating back centuries, originating from the Berber communities of the Aurès Mountains. The name comes from the Arabic word meaning "torn into pieces," referring to how the flatbread is prepared. This dish was historically a celebration food, served during weddings, religious holidays, and family gatherings, symbolizing community and sharing.',
  continent = 'Africa'
WHERE slug = 'chakhchoukha' AND history IS NULL;

UPDATE recipes SET 
  history = 'Trida, also known as Rechta, is a traditional Algerian pasta dish with roots in Ottoman and Andalusian culinary traditions. The hand-rolled pasta technique was passed down through generations of Algerian women. It became a staple celebration dish, particularly for the Prophet''s birthday (Mawlid) and wedding feasts, representing hospitality and family bonds.',
  continent = 'Africa'
WHERE slug = 'trida' AND history IS NULL;

UPDATE recipes SET 
  history = 'Poulet Moambe is the national dish of the Democratic Republic of Congo, with origins tracing back to pre-colonial times when palm nuts were a dietary staple. The dish represents the rich culinary heritage of the Congo Basin. Moambe sauce, made from palm fruit, has been a cornerstone of Central African cuisine for centuries.',
  continent = 'Africa'
WHERE slug = 'poulet-moambe' AND history IS NULL;

UPDATE recipes SET 
  history = 'Calulu de Peixe is a traditional Angolan fish stew that reflects the country''s coastal heritage and Portuguese colonial influence. The dish combines indigenous African cooking methods with imported ingredients, creating a unique fusion that became central to Angolan identity. It''s traditionally prepared for family gatherings and special occasions.',
  continent = 'Africa'
WHERE slug = 'calulu-de-peixe' AND history IS NULL;

UPDATE recipes SET 
  history = 'Sauce Gumbo from Central African Republic is not to be confused with Louisiana gumbo, though they share African roots. This okra-based sauce has been a dietary staple in Central Africa for millennia. Okra, native to Africa, was cultivated along the Nile and spread throughout the continent, becoming essential to countless traditional dishes.',
  continent = 'Africa'
WHERE slug = 'sauce-gumbo' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kooso is a traditional Chadian millet porridge that has sustained nomadic and agricultural communities for thousands of years. Millet was one of the earliest domesticated crops in Africa, cultivated in the Sahel region since 5000 BCE. This simple yet nutritious dish represents the resilience and resourcefulness of Chad''s people.',
  continent = 'Africa'
WHERE slug = 'kooso' AND history IS NULL;

UPDATE recipes SET 
  history = 'Morogo, meaning "wild vegetables" in several South African languages, represents the indigenous food traditions of Southern Africa. These nutrient-rich leafy greens have been harvested and prepared by African communities for thousands of years. During apartheid, morogo remained an important source of nutrition for marginalized communities.',
  continent = 'Africa'
WHERE slug = 'morogo' AND history IS NULL;

UPDATE recipes SET 
  history = 'Achu and Yellow Soup is a traditional Cameroonian dish from the Grassfields region, particularly associated with the Bamileke and Bamenda people. The pounded cocoyam (achu) and palm oil-based yellow soup are prepared for important ceremonies, including funerals, weddings, and traditional festivals, symbolizing cultural identity.',
  continent = 'Africa'
WHERE slug = 'achu-and-yellow-soup' AND history IS NULL;

UPDATE recipes SET 
  history = 'Koki is a traditional Cameroonian dish made from black-eyed peas, wrapped and steamed in banana leaves. This protein-rich dish has been a cornerstone of Cameroonian cuisine for generations, particularly among the Bamileke and coastal communities. The banana leaf wrapping technique preserves nutrients and imparts a subtle earthy flavor.',
  continent = 'Africa'
WHERE slug = 'koki' AND history IS NULL;

UPDATE recipes SET 
  history = 'Cassava fries represent the adaptation of a staple crop that transformed African agriculture after its introduction from South America in the 16th century. Cassava became crucial to food security across Africa due to its drought resistance. These fries are a modern street food that honors this agricultural heritage.',
  continent = 'Africa'
WHERE slug = 'cassava-fries' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kanda Ti Nyma is a traditional Central African Republic meatball dish, often prepared with peanut sauce. The dish reflects the importance of groundnuts (peanuts) in Central African cuisine, introduced from South America via Portuguese traders. It became integrated into local cooking traditions and celebration feasts.',
  continent = 'Africa'
WHERE slug = 'kanda-ti-nyma' AND history IS NULL;

UPDATE recipes SET 
  history = 'Daraba is a traditional Chadian vegetable stew made with okra, leafy greens, and often dried fish. This dish represents the agricultural heritage of the Lake Chad region, where fishing and farming communities developed rich culinary traditions. Daraba is a daily staple that nourishes families across Chad.',
  continent = 'Africa'
WHERE slug = 'daraba' AND history IS NULL;

UPDATE recipes SET 
  history = 'Puff Puff is a beloved West African fried dough that originated in Nigeria but spread throughout the region. Similar to beignets, these sweet treats are believed to have developed from Portuguese influence during colonial trade. Today, puff puff is essential at celebrations, from weddings to Christmas parties across West Africa.',
  continent = 'Africa'
WHERE slug = 'puff-puff' AND history IS NULL;

UPDATE recipes SET 
  history = 'Fumbwa, also known as wild spinach stew, is a traditional dish from the Democratic Republic of Congo. The wild greens are foraged from forests and have been part of Congolese diet for generations. This dish represents the deep connection between Congolese communities and their natural environment.',
  continent = 'Africa'
WHERE slug = 'fumbwa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Liboké de Poisson is a traditional Congolese dish where fish is steamed in banana or plantain leaves. This ancient cooking technique predates colonialism and represents the sustainable food practices of Congo River communities. The method preserves nutrients and creates a unique smoky, earthy flavor.',
  continent = 'Africa'
WHERE slug = 'liboke-de-poisson' AND history IS NULL;

-- Additional African dishes
UPDATE recipes SET 
  history = 'Ugali is the cornerstone of East African cuisine, a staple food consumed daily by millions in Kenya, Tanzania, and Uganda. Made from maize flour and water, this simple dish traces its origins to the introduction of maize from the Americas in the 16th century, quickly becoming the region''s primary carbohydrate source.',
  continent = 'Africa'
WHERE slug = 'ugali' AND history IS NULL;

UPDATE recipes SET 
  history = 'Suya is a spiced meat skewer that originated with the Hausa people of Northern Nigeria and has spread across West Africa. Street vendors called "Mai Suya" have been a fixture of Nigerian urban life since the early 20th century. The unique spice blend, called yaji, is each vendor''s closely guarded secret.',
  continent = 'Africa'
WHERE slug = 'suya' AND history IS NULL;

UPDATE recipes SET 
  history = 'Egusi soup is a cornerstone of Nigerian cuisine, made from ground melon seeds that have been cultivated in West Africa for thousands of years. Archaeological evidence suggests melon seeds were being processed in Nigeria over 4,000 years ago. The soup is essential at celebrations and family gatherings.',
  continent = 'Africa'
WHERE slug = 'egusi-soup' AND history IS NULL;

UPDATE recipes SET 
  history = 'Fufu is one of Africa''s most widespread staple foods, with variations across West and Central Africa. The pounding technique, traditionally done with a large wooden mortar and pestle, is a communal activity that brings families together. Fufu''s origins date back thousands of years in the tropical forest regions.',
  continent = 'Africa'
WHERE slug = 'fufu' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kenkey is a fermented corn dough staple of the Ga and Fante peoples of Ghana, with origins predating European contact. The fermentation process, which gives kenkey its distinctive sour taste, was an ancient preservation technique. It remains a beloved everyday food, often served with fried fish and pepper sauce.',
  continent = 'Africa'
WHERE slug = 'kenkey' AND history IS NULL;