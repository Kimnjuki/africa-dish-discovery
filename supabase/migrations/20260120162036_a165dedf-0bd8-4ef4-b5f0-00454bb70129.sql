-- Fix misallocated and add authentic images for dishes across ALL continents

-- ===== AFRICAN DISHES - FIXING MISMATCHES =====
-- Sukuma Wiki - Authentic Kenyan collard greens (was showing wrong vegetable image)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%sukuma%' OR name ILIKE '%collard greens%';

-- Libyan Bazeen - Authentic flat bread/porridge dish
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%bazeen%';

-- Plasas - Sierra Leone leafy greens dish (fixing repeated jollof image)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%plasas%';

-- Kenyan Chapati - Indian-style flatbread
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%chapati%';

-- Nshima - Zambian maize porridge (similar to ugali)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%nshima%';

-- Matoke - Ugandan banana stew
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%matoke%';

-- Obe Ata - Nigerian red stew (authentic tomato stew)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%obe ata%';

-- ===== ASIAN DISHES =====
-- Pho - Vietnamese noodle soup
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%pho%' AND country ILIKE '%vietnam%';

-- Tom Yum Soup - Thai soup
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%tom yum%';

-- Laksa - Malaysian noodle soup
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%laksa%';

-- Chicken Adobo - Filipino stew
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%adobo%';

-- Kimchi - Korean fermented vegetables  
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1583224994076-bcda45e345ea?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%kimchi%' AND name NOT ILIKE '%taco%';

-- Dalgona/Whipped Coffee
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1592318951566-70f6f0ac3f62?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%dalgona%' OR name ILIKE '%whipped coffee%';

-- Ramen
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%ramen%' AND id = '0ff6e114-734b-47c2-903f-1f3e9788b278';

-- Gyoza - Japanese dumplings
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%gyoza%';

-- Miso Soup
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1607530666061-fa7f3ab8d74c?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%miso soup%';

-- Matcha Pancakes
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%matcha pancake%';

-- Satay - Indonesian skewers
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%satay%';

-- Beef Rendang
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%rendang%';

-- Nasi Goreng
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%nasi goreng%';

-- Tanghulu - Chinese candied fruit
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%tanghulu%';

-- ===== EUROPEAN DISHES =====
-- Ratatouille
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%ratatouille%';

-- Croissant
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%croissant%';

-- Baklava - Greek/Turkish pastry
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%baklava%';

-- Greek Salad
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%greek salad%';

-- Moussaka
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%moussaka%';

-- Spaghetti Carbonara
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%carbonara%';

-- Risotto
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1476124369491-c4076c45dd59?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%risotto%';

-- Bruschetta
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%bruschetta%';

-- Paella
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%paella%';

-- Goulash
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%goulash%';

-- Schnitzel
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%schnitzel%';

-- Pierogi
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%pierogi%';

-- Fish and Chips
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596662951482-0c4ba8a9c753?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%fish and chips%';

-- Shepherd's Pie
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%shepherd%pie%';

-- ===== MIDDLE EAST DISHES =====
-- Shakshuka
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%shakshuka%';

-- Hummus
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%hummus%';

-- Shawarma
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%shawarma%';

-- Falafel
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1593001872095-7d5b3868dd21?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%falafel%' AND continent = 'Europe';

-- Mansaf
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%mansaf%';

-- Maqluba
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%maqluba%';

-- Mutabal
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%mutabal%';

-- ===== NORTH AMERICA =====
-- Classic American Burger
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%burger%';

-- BBQ Ribs
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%bbq ribs%' OR name ILIKE '%ribs%';

-- Buffalo Wings
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%buffalo wings%';

-- Mac and Cheese
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%mac and cheese%';

-- Clam Chowder
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%clam chowder%';

-- New York Cheesecake
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%cheesecake%';

-- Cuban Sandwich
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%cuban sandwich%';

-- ===== LATIN AMERICA =====
-- Tacos al Pastor
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%tacos%';

-- Guacamole
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%guacamole%';

-- Empanadas
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1599974789497-a4d6b742ff2f?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%empanadas%';

-- Ceviche
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512838243191-e81e41d49602?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%ceviche%';

-- Feijoada
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%feijoada%';

-- Arepas
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%arepas%';

-- Chimichurri Steak
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%chimichurri%';

-- Pão de Queijo
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%pão de queijo%';

-- Pupusas
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%pupusas%';

-- Bandeja Paisa
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%bandeja paisa%';

-- ===== SOUTH AMERICA =====
-- Same as Latin America (already covered)

-- ===== OCEANIA =====
-- Avocado Toast
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%avocado toast%';

-- Poke Bowl
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%poke bowl%';

-- ===== GLOBAL/FUSION =====
-- Butter Chicken Pizza
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%butter chicken pizza%';

-- Tandoori Quesadilla
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%tandoori quesadilla%';

-- Ramen Burger
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%ramen burger%';

-- Sushi Burrito
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%sushi burrito%';

-- Churro Ice Cream Sandwich
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%churro ice cream%';

-- Kimchi Tacos
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%kimchi taco%';

-- Korean BBQ Tacos
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%korean bbq taco%';

-- ===== FIX REMAINING cdn.example.com PLACEHOLDERS =====
-- Chakhchoukha Biskra (Algeria)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%chakhchoukha%';

-- Trida (Algeria)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%trida%';

-- Poulet Moambe (Angola/DRC)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%poulet moambe%' OR name ILIKE '%muamba%';

-- Calulu de Peixe (Angola)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1600891963931-b4d1b4b1fbd6?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%calulu%';

-- Vegemite on Toast (Australia)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%vegemite%';

-- Sauce Gumbo (Benin/Togo)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%sauce gumbo%';

-- Kooso (Burkina Faso)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%kooso%';

-- Seswaa (Botswana)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%seswaa%';

-- Morogo (Botswana/SA)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%morogo%';

-- Achu (Cameroon)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%achu%';

-- Koki (Cameroon)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%koki%';

-- Mbongo Tchobi (Cameroon)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%mbongo%';

-- Ndolé (Cameroon)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%ndol%';

-- Cachupa Rica (Cape Verde)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%cachupa%';

-- Cassava Fries (DRC)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%cassava fries%';

-- Kanda Ti Nyma (Central African Republic)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%kanda ti nyma%';

-- Daraba (Chad)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%daraba%';

-- Attiéké (Ivory Coast)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%atti%k%';

-- Kedjenou de Poulet (Ivory Coast)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%kedjenou%';

-- Halloumi Fries (Cyprus)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%halloumi%';

-- Skoudehkaris (Djibouti)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%skoudehkaris%';

-- Smørrebrød (Denmark)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%sm%rr%br%d%';

-- Puff Puff (Cameroon)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%puff puff%';

-- Egg Rolls (China)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1601050690599-5b6b7dc3a9e2?w=1200&q=85&fm=jpg' 
WHERE name ILIKE '%egg rolls%';