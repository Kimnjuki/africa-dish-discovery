-- Update African dishes with authentic high-quality Unsplash images
-- Starting with easiest to find and most popular dishes

-- Kelewele - Spicy Fried Plantains (Ghana)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%kelewele%' AND (image_url IS NULL OR image_url = '');

-- Alloco - Fried Plantains (Ivory Coast)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%alloco%' AND (image_url IS NULL OR image_url = '');

-- Bofrot / Puff-Puff (Ghana/Nigeria)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' 
WHERE (LOWER(name) LIKE '%bofrot%' OR LOWER(name) LIKE '%puff puff%' OR LOWER(name) LIKE '%puff-puff%') AND (image_url IS NULL OR image_url = '');

-- Bissap Juice (Senegal) - Hibiscus drink
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%bissap%' AND (image_url IS NULL OR image_url = '');

-- Chapati (Kenya)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%chapati%' AND (image_url IS NULL OR image_url = '');

-- Sukuma Wiki - Kenyan Collard Greens
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%sukuma%' AND (image_url IS NULL OR image_url = '');

-- Nyama Choma (Kenya) - Grilled Meat
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%nyama choma%' AND (image_url IS NULL OR image_url = '');

-- Pilau (Tanzania/Kenya)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%pilau%' AND (image_url IS NULL OR image_url = '');

-- Kachumbari (Kenya) - Fresh salad
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%kachumbari%' AND (image_url IS NULL OR image_url = '');

-- Matoke - Ugandan Banana Stew
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%matoke%' AND (image_url IS NULL OR image_url = '');

-- Red Red - Ghana Bean Stew
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%red red%' AND (image_url IS NULL OR image_url = '');

-- Ewa Agoyin (Nigeria)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%ewa agoyin%' AND (image_url IS NULL OR image_url = '');

-- Kilishi - Nigerian Spiced Jerky
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%kilishi%' AND (image_url IS NULL OR image_url = '');

-- Konkonte with Groundnut Soup (Ghana)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%konkonte%' AND (image_url IS NULL OR image_url = '');

-- Sambusa (Somalia)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%sambusa%' AND (image_url IS NULL OR image_url = '');

-- Mkate Mayai (Tanzania) - Egg bread
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%mkate mayai%' AND (image_url IS NULL OR image_url = '');

-- Algerian Couscous Royale
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%couscous royale%' AND (image_url IS NULL OR image_url = '');

-- Seswaa (Botswana) - Shredded meat
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%seswaa%' AND (image_url IS NULL OR image_url = '');

-- Soupou Kandja (Senegal) - Okra soup
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%soupou kandja%' AND (image_url IS NULL OR image_url = '');

-- Superkanja (Gambia)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%superkanja%' AND (image_url IS NULL OR image_url = '');

-- Plasas - Sierra Leone Greens
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%plasas%' AND (image_url IS NULL OR image_url = '');

-- Obe Ata - Nigerian Red Stew
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%obe ata%' AND (image_url IS NULL OR image_url = '');

-- Attieke with Grilled Chicken (Ivory Coast)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%attieke%' OR LOWER(name) LIKE '%attiéké%' AND (image_url IS NULL OR image_url = '');

-- Fonio Porridge (Guinea/Mali)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%fonio%' AND (image_url IS NULL OR image_url = '');

-- Bambara Groundnut Soup (Mali)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%bambara%' AND (image_url IS NULL OR image_url = '');

-- Cachupa (Cape Verde)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%cachupa%' AND (image_url IS NULL OR image_url = '');

-- Gabonese Nyembwe Chicken
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%nyembwe%' AND (image_url IS NULL OR image_url = '');

-- Libyan Bazeen
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%bazeen%' AND (image_url IS NULL OR image_url = '');

-- Chadian Kissar
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%kissar%' AND (image_url IS NULL OR image_url = '');

-- Swazi Emasi Etinkhobe (Soured Milk with Pumpkin)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%emasi%' AND (image_url IS NULL OR image_url = '');

-- Akotonshi - Stuffed Crabs (Ghana)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%akotonshi%' OR LOWER(name) LIKE '%stuffed crab%' AND (image_url IS NULL OR image_url = '');

-- Non-African dishes that need images (for completeness)
-- Pad Thai
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%pad thai%' AND (image_url IS NULL OR image_url = '');

-- Sushi  
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) = 'sushi' AND (image_url IS NULL OR image_url = '');

-- Chicken Tikka Masala
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%tikka masala%' AND (image_url IS NULL OR image_url = '');

-- Plov (Uzbekistan)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%plov%' AND (image_url IS NULL OR image_url = '');

-- Bandeja Paisa (Colombia)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%bandeja paisa%' AND (image_url IS NULL OR image_url = '');

-- Pabellón Criollo (Venezuela)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%pabellón%' AND (image_url IS NULL OR image_url = '');

-- Pepperpot (Guyana)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%pepperpot%' AND (image_url IS NULL OR image_url = '');

-- Baked Feta Pasta
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%baked feta pasta%' AND (image_url IS NULL OR image_url = '');

-- Ramen Carbonara
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%ramen carbonara%' AND (image_url IS NULL OR image_url = '');

-- Cloud Bread
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%cloud bread%' AND (image_url IS NULL OR image_url = '');

-- Crispy Pancakes
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%crispy pancakes%' AND (image_url IS NULL OR image_url = '');

-- Dubai Chocolate
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%dubai chocolate%' AND (image_url IS NULL OR image_url = '');

-- Dirty Shirley
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%dirty shirley%' AND (image_url IS NULL OR image_url = '');

-- Chamoy Pickle
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%chamoy%' AND (image_url IS NULL OR image_url = '');

-- Tanghulu
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&fm=jpg' 
WHERE LOWER(name) LIKE '%tanghulu%' AND (image_url IS NULL OR image_url = '');