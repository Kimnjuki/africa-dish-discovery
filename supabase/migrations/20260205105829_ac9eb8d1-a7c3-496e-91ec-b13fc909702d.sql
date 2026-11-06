-- Batch 5: More African Dishes History Entries
UPDATE recipes SET 
  history = 'Waakye is a beloved Ghanaian street food of rice and beans cooked with sorghum leaves, giving it a distinctive burgundy color. The dish likely evolved from similar West African rice-and-bean combinations. Waakye sellers are a fixture of Ghanaian morning markets.',
  continent = 'Africa'
WHERE slug = 'waakye' AND history IS NULL;

UPDATE recipes SET 
  history = 'Red Red is a Ghanaian black-eyed pea stew named for its deep red palm oil color. The dish represents the importance of legumes in West African protein intake. Served with fried plantains and rice, red red is comfort food for Ghanaians worldwide.',
  continent = 'Africa'
WHERE slug = 'red-red' AND history IS NULL;

UPDATE recipes SET 
  history = 'Groundnut Soup is a creamy peanut-based stew found across West Africa, particularly popular in Ghana and Nigeria. Groundnuts (peanuts) arrived from South America via Portuguese traders and became integral to African cuisine. Each country has its signature version.',
  continent = 'Africa'
WHERE slug = 'groundnut-soup' AND history IS NULL;

UPDATE recipes SET 
  history = 'Banku is a fermented corn and cassava dough staple of Ghana, typically served with okra soup or pepper sauce. The fermentation process developed as a preservation method in the tropical climate. Banku represents Ghanaian culinary heritage and daily sustenance.',
  continent = 'Africa'
WHERE slug = 'banku' AND history IS NULL;

UPDATE recipes SET 
  history = 'Nyama Choma, meaning "roasted meat" in Swahili, is the quintessential East African barbecue. Goat or beef is slowly grilled over open flames, a tradition dating back to pastoral communities. Nyama choma gatherings are central to Kenyan and Tanzanian social life.',
  continent = 'Africa'
WHERE slug = 'nyama-choma' AND history IS NULL;

UPDATE recipes SET 
  history = 'Moin Moin is a Nigerian steamed bean pudding made from peeled black-eyed peas, traditionally wrapped in banana leaves. The dish predates colonialism and represents the sophisticated cooking techniques of Yoruba and other Nigerian cultures. It''s essential at celebrations.',
  continent = 'Africa'
WHERE slug = 'moin-moin' AND history IS NULL;

UPDATE recipes SET 
  history = 'Akara is a Nigerian black-eyed pea fritter, closely related to Brazilian acarajé through the Atlantic slave trade. Both dishes trace to Yoruba cuisine. Akara is a beloved breakfast food, sold by street vendors across Nigeria and beyond.',
  continent = 'Africa'
WHERE slug = 'akara' AND history IS NULL;

UPDATE recipes SET 
  history = 'Ndolé is the national dish of Cameroon, a bitter leaf stew with peanuts and meat or fish. The dish reflects the country''s forest cuisine traditions, utilizing indigenous bitter greens. Ndolé is essential at Cameroonian celebrations and family gatherings.',
  continent = 'Africa'
WHERE slug = 'ndole' AND history IS NULL;

UPDATE recipes SET 
  history = 'Tibs is a popular Ethiopian sautéed meat dish, quick-fried with onions, peppers, and rosemary. Unlike slow-cooked stews, tibs offers a different texture and is often served sizzling in a clay pot. It represents Ethiopian home cooking at its finest.',
  continent = 'Africa'
WHERE slug = 'tibs' AND history IS NULL;

UPDATE recipes SET 
  history = 'Shiro is a humble Ethiopian chickpea or broad bean flour stew, essential during Orthodox fasting periods. The dish represents the influence of religious practices on Ethiopian cuisine, where up to 200 fasting days per year require meatless dishes.',
  continent = 'Africa'
WHERE slug = 'shiro' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kitfo is the Ethiopian version of steak tartare, raw minced beef seasoned with mitmita spice and niter kibbeh (spiced butter). The dish was traditionally reserved for warriors and special occasions. Today, it''s considered a delicacy and celebration food.',
  continent = 'Africa'
WHERE slug = 'kitfo' AND history IS NULL;

UPDATE recipes SET 
  history = 'Maafe, also known as groundnut stew, is a West African peanut soup with roots in Mali and Senegal. The dish spread throughout the region as groundnuts became a dietary staple. Maafe represents the creamy, rich tradition of Sahelian cuisine.',
  continent = 'Africa'
WHERE slug = 'maafe' AND history IS NULL;

UPDATE recipes SET 
  history = 'Yassa is a Senegalese marinated onion sauce, typically served with chicken or fish. The dish originated with the Casamance region and became popular nationwide. Yassa''s tangy, caramelized onion flavor is quintessentially Senegalese.',
  continent = 'Africa'
WHERE slug = 'yassa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Thieboudienne (Ceebu Jën) is Senegal''s national dish, a one-pot rice and fish preparation considered the ancestor of jollof rice. The dish originated in Saint-Louis in the 19th century. UNESCO recognized it as Intangible Cultural Heritage in 2021.',
  continent = 'Africa'
WHERE slug LIKE '%thieboudienne%' OR slug LIKE '%ceebu%' AND history IS NULL;

UPDATE recipes SET 
  history = 'Chapati arrived in East Africa with Indian railway workers in the late 19th century and became a staple in Kenya, Tanzania, and Uganda. The unleavened flatbread adapted to local tastes, becoming essential to East African cuisine.',
  continent = 'Africa'
WHERE slug = 'chapati' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pilau is an aromatic spiced rice dish popular in East Africa, reflecting Swahili coast trading connections with Arabia, Persia, and India. The dish represents the cosmopolitan history of Mombasa, Zanzibar, and other coastal cities.',
  continent = 'Africa'
WHERE slug = 'pilau' AND history IS NULL;

UPDATE recipes SET 
  history = 'Bunny Chow is a South African street food of hollowed bread filled with curry, created by Durban''s Indian community in the 1940s. During apartheid, it provided a clever way to serve food without dishes. Bunny chow is now beloved across South Africa.',
  continent = 'Africa'
WHERE slug = 'bunny-chow' AND history IS NULL;

UPDATE recipes SET 
  history = 'Biltong is a South African dried meat snack with origins in Dutch colonial preservation techniques. The word combines Dutch "bil" (buttock) and "tong" (strip). Biltong was essential for Voortrekker pioneers and remains a national obsession.',
  continent = 'Africa'
WHERE slug = 'biltong' AND history IS NULL;

UPDATE recipes SET 
  history = 'Boerewors is a traditional South African sausage, "farmer''s sausage" in Afrikaans. The recipe traces to Dutch and German settlers who adapted European sausage-making to local game and beef. Boerewors is essential to any braai (barbecue).',
  continent = 'Africa'
WHERE slug = 'boerewors' AND history IS NULL;

UPDATE recipes SET 
  history = 'Potjiekos is a South African slow-cooked stew prepared in a three-legged cast iron pot over open fire. The tradition comes from Dutch voortrekkers who needed portable cooking vessels. Potjiekos gatherings are a cornerstone of South African social culture.',
  continent = 'Africa'
WHERE slug = 'potjiekos' AND history IS NULL;