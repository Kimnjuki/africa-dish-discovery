-- Batch 7: Additional African Dishes History
UPDATE recipes SET 
  history = 'Couscous is a Berber staple from the Maghreb region, made from semolina wheat granules. Evidence suggests couscous has been prepared for over 1,000 years. UNESCO recognized the knowledge and practices of couscous production as Intangible Cultural Heritage in 2020.',
  continent = 'Africa'
WHERE slug = 'couscous' AND history IS NULL;

UPDATE recipes SET 
  history = 'Tagine takes its name from the conical clay pot used for cooking. The vessel design originated with Berber nomads, trapping steam to tenderize tough cuts of meat. Moroccan tagines, with their sweet-savory combinations, represent centuries of culinary refinement.',
  continent = 'Africa'
WHERE slug LIKE '%tagine%' AND history IS NULL;

UPDATE recipes SET 
  history = 'Harissa is a North African chili paste with Tunisian origins, made from roasted peppers, spices, and olive oil. The fiery condiment became central to Maghrebi cuisine and has recently gained global popularity. Each region has distinctive spice blends.',
  continent = 'Africa'
WHERE slug = 'harissa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Ful Medames is one of the world''s oldest dishes, eaten in Egypt for at least 4,000 years. The slow-cooked fava bean dish is Egyptian street food at its finest, typically eaten for breakfast with bread, vegetables, and olive oil.',
  continent = 'Africa'
WHERE slug = 'ful-medames' AND history IS NULL;

UPDATE recipes SET 
  history = 'Koshari is Egypt''s national dish, a street food combining rice, pasta, lentils, and chickpeas with spiced tomato sauce. The dish emerged in late 19th-century Egypt, blending Indian, Italian, and Middle Eastern influences into something uniquely Egyptian.',
  continent = 'Africa'
WHERE slug = 'koshari' AND history IS NULL;

UPDATE recipes SET 
  history = 'Sambusa (Samosa) arrived in East Africa through Arab and Indian Ocean trade networks. The crispy triangular pastries became essential to Somali, Ethiopian, and Kenyan cuisine, filled with spiced meat or vegetables. They''re especially popular during Ramadan.',
  continent = 'Africa'
WHERE slug = 'sambusa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Jolof Rice is West Africa''s most famous and debated dish, with Nigeria, Ghana, and Senegal all claiming the original recipe. The one-pot rice dish originated from the Wolof people and spread throughout the region. The "Jollof Wars" continue on social media.',
  continent = 'Africa'
WHERE slug LIKE '%jollof%' AND history IS NULL;

UPDATE recipes SET 
  history = 'Muamba de Galinha (Angolan Chicken Stew) is Angola''s national dish, featuring chicken in palm oil-based sauce. The dish represents the central role of palm in Central African cuisine and Angola''s culinary identity post-independence.',
  continent = 'Africa'
WHERE slug = 'muamba-de-galinha' AND history IS NULL;

UPDATE recipes SET 
  history = 'Matoke is an East African plantain dish, particularly associated with Uganda where it''s a staple. Green bananas are steamed in banana leaves, a cooking technique predating colonialism. Matoke represents the importance of bananas in Great Lakes agriculture.',
  continent = 'Africa'
WHERE slug = 'matoke' AND history IS NULL;

UPDATE recipes SET 
  history = 'Cachupa is the national dish of Cape Verde, a slow-cooked stew of corn, beans, and meat or fish. The dish reflects the islands'' African and Portuguese heritage and the resourcefulness born from island isolation. Each family has their recipe.',
  continent = 'Africa'
WHERE slug = 'cachupa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Sosaties are South African skewered meat with Cape Malay origins, introduced by Indonesian slaves in the 17th century. The distinctive apricot and curry marinade sets sosaties apart from other kebabs. They''re essential to Cape Town braai culture.',
  continent = 'Africa'
WHERE slug = 'sosaties' AND history IS NULL;

UPDATE recipes SET 
  history = 'Cape Malay Curry represents the unique fusion cuisine of Cape Town''s Bo-Kaap neighborhood. Descendants of Southeast Asian slaves developed this distinctive curry style, blending Indonesian and Malay spices with local ingredients.',
  continent = 'Africa'
WHERE slug = 'cape-malay-curry' AND history IS NULL;

-- Oceania dishes
UPDATE recipes SET 
  history = 'Meat Pie is Australia''s unofficial national dish, adapted from British pasty traditions. The handheld savory pies became ubiquitous at football matches and roadside bakeries. The meat pie represents Australian working-class food culture at its finest.',
  continent = 'Oceania'
WHERE slug = 'meat-pie' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pavlova''s origins are hotly contested between Australia and New Zealand, both claiming invention in the 1920s to honor ballerina Anna Pavlova. The meringue dessert with cream and fruit represents Trans-Tasman rivalry and culinary creativity.',
  continent = 'Oceania'
WHERE slug = 'pavlova' AND history IS NULL;

UPDATE recipes SET 
  history = 'Hangi is the traditional Māori earth oven cooking method of New Zealand, dating back to the first Polynesian settlers. Meat and vegetables are cooked over heated stones in a pit. Hangi represents Māori cultural traditions and communal feasting.',
  continent = 'Oceania'
WHERE slug = 'hangi' AND history IS NULL;

UPDATE recipes SET 
  history = 'Lamingtons are an iconic Australian sponge cake coated in chocolate and desiccated coconut, invented in Queensland around 1900. Despite humble origins (possibly as a way to use stale cake), lamingtons became a symbol of Australian baking.',
  continent = 'Oceania'
WHERE slug = 'lamingtons' AND history IS NULL;

UPDATE recipes SET 
  history = 'Vegemite on Toast is quintessentially Australian, featuring the yeast extract spread invented in 1922. The intensely savory spread, applied sparingly, became an Australian breakfast staple and cultural icon, even earning mentions in popular songs.',
  continent = 'Oceania'
WHERE slug = 'vegemite-on-toast' AND history IS NULL;