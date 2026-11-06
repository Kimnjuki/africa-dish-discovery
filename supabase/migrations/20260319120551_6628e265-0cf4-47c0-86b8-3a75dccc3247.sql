
-- FULL IMAGE AUDIT: Replace all example.com URLs with authentic Unsplash images
-- Organized by dish keyword matching

-- === AFRICAN DISHES ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%jollof%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%fufu%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%egusi%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%suya%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%doro wat%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1645696985256-1871606eb388?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%injera%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%bobotie%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%banku%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%abacha%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%ugali%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%mandazi%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%shiro%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%biltong%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%pap %' OR LOWER(name) LIKE '%sadza%' OR LOWER(name) LIKE '%nshima%' OR LOWER(name) LIKE '%nsima%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%chin chin%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%moin%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%plantain%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%kenkey%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%koose%' OR LOWER(name) LIKE '%akara%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%groundnut%' OR LOWER(name) LIKE '%peanut%' OR LOWER(name) LIKE '%nkatenkwan%' OR LOWER(name) LIKE '%maafe%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1539449438168-5d1f0b7a9aeb?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%tagine%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%couscous%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%koshari%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%ful medames%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%falafel%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%chapati%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%pilau%' OR LOWER(name) LIKE '%biriyani%' OR LOWER(name) LIKE '%biryani%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%sambusa%' OR LOWER(name) LIKE '%samosa%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%nyama choma%' OR LOWER(name) LIKE '%kapana%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1587631722698-e77bcadc4d53?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%shakshuka%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%waakye%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%bissap%' OR LOWER(name) LIKE '%hibiscus%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%banga%' OR LOWER(name) LIKE '%okra%' OR LOWER(name) LIKE '%ofe %' OR LOWER(name) LIKE '%pepper soup%' OR LOWER(name) LIKE '%pepe soup%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%ogbono%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%ofada%' OR LOWER(name) LIKE '%ayamase%' OR LOWER(name) LIKE '%dukkah%' OR LOWER(name) LIKE '%koki%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%puff puff%' OR LOWER(name) LIKE '%kaimati%' OR LOWER(name) LIKE '%mahamri%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%nyembwe%' OR LOWER(name) LIKE '%moambe%' OR LOWER(name) LIKE '%muamba%' OR LOWER(name) LIKE '%poulet%' OR LOWER(name) LIKE '%chicken%' OR LOWER(name) LIKE '%galinha%' OR LOWER(name) LIKE '%ingoho%' OR LOWER(name) LIKE '%tsebhi%' OR LOWER(name) LIKE '%kedjenou%' OR LOWER(name) LIKE '%chambo%' OR LOWER(name) LIKE '%liboké%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%pondu%' OR LOWER(name) LIKE '%saka%' OR LOWER(name) LIKE '%fumbwa%' OR LOWER(name) LIKE '%sukuma%' OR LOWER(name) LIKE '%matapa%' OR LOWER(name) LIKE '%morogo%' OR LOWER(name) LIKE '%palava%' OR LOWER(name) LIKE '%eru%' OR LOWER(name) LIKE '%afang%' OR LOWER(name) LIKE '%ifisashi%' OR LOWER(name) LIKE '%ravitoto%' OR LOWER(name) LIKE '%romazava%' OR LOWER(name) LIKE '%ndole%' OR LOWER(name) LIKE '%ndolé%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%kwanga%' OR LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%cake%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%motoho%' OR LOWER(name) LIKE '%porridge%' OR LOWER(name) LIKE '%cassava%' OR LOWER(name) LIKE '%cocoyam%' OR LOWER(name) LIKE '%mukimo%' OR LOWER(name) LIKE '%sidvudvu%' OR LOWER(name) LIKE '%emasi%' OR LOWER(name) LIKE '%fura%' OR LOWER(name) LIKE '%kokonte%' OR LOWER(name) LIKE '%achu%' OR LOWER(name) LIKE '%yam%' OR LOWER(name) LIKE '%dombolo%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%chakalaka%' OR LOWER(name) LIKE '%achara%' OR LOWER(name) LIKE '%salad%' OR LOWER(name) LIKE '%lasary%' OR LOWER(name) LIKE '%kachumbari%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%stew%' OR LOWER(name) LIKE '%soup%' OR LOWER(name) LIKE '%sauce%' OR LOWER(name) LIKE '%caldo%' OR LOWER(name) LIKE '%bissara%' OR LOWER(name) LIKE '%potjiekos%' OR LOWER(name) LIKE '%cachupa%' OR LOWER(name) LIKE '%daraba%' OR LOWER(name) LIKE '%mbongo%' OR LOWER(name) LIKE '%domoda%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%rice%' OR LOWER(name) LIKE '%bariis%' OR LOWER(name) LIKE '%skoudehkaris%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%bean%' OR LOWER(name) LIKE '%cambuulo%' OR LOWER(name) LIKE '%githeri%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%grilled%' OR LOWER(name) LIKE '%boerewors%' OR LOWER(name) LIKE '%sosaties%' OR LOWER(name) LIKE '%kebab%' OR LOWER(name) LIKE '%skewer%' OR LOWER(name) LIKE '%kanda%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%mbatata%' OR LOWER(name) LIKE '%sweet potato%' OR LOWER(name) LIKE '%pumpkin%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%dholl%' OR LOWER(name) LIKE '%flatbread%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%malva%' OR LOWER(name) LIKE '%pudding%' OR LOWER(name) LIKE '%dessert%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%cookie%' OR LOWER(name) LIKE '%biscuit%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%matoke%' OR LOWER(name) LIKE '%ofam%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1539449438168-5d1f0b7a9aeb?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%rfissa%' OR LOWER(name) LIKE '%rfalfouza%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%mkate%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%attiéké%' OR LOWER(name) LIKE '%attieke%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1645696985256-1871606eb388?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%firfir%' OR LOWER(name) LIKE '%chechebsa%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%kissar%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%bunny chow%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%seswaa%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%milk%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%pizza%';

-- === ASIAN DISHES ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%sushi%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%ramen%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%bibimbap%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%pad thai%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%pho%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%curry%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%rendang%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%laksa%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%nasi goreng%' OR LOWER(name) LIKE '%hainanese%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%dim sum%' OR LOWER(name) LIKE '%xiaolongbao%' OR LOWER(name) LIKE '%dumpling%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%tikka%' OR LOWER(name) LIKE '%masala%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%butter chicken%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%dosa%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%dal%' OR LOWER(name) LIKE '%chole%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%pulao%' OR LOWER(name) LIKE '%plov%' OR LOWER(name) LIKE '%qabuli%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%tandoori%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%tom yum%' OR LOWER(name) LIKE '%amok%' OR LOWER(name) LIKE '%hot pot%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%satay%' OR LOWER(name) LIKE '%lumpia%' OR LOWER(name) LIKE '%larb%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555165171-1e396a52e5a0?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%kimchi%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%manti%' OR LOWER(name) LIKE '%lagman%' OR LOWER(name) LIKE '%beshbarmak%' OR LOWER(name) LIKE '%dolma%' OR LOWER(name) LIKE '%goulash%' OR LOWER(name) LIKE '%pierogi%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%khachapuri%' OR LOWER(name) LIKE '%naan%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%kheer%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%mongolian%';

-- === EUROPEAN DISHES ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%coq au vin%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%sauerbraten%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%shashlik%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%paella%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%pasta%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%lasagna%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%schnitzel%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%moussaka%';

-- === AMERICAS ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%burger%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%tacos%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%burrito%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1512838243191-e81e41d49602?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%ceviche%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1599974789497-a4d6b742ff2f?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%empanada%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%arepa%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND (LOWER(name) LIKE '%feijoada%' OR LOWER(name) LIKE '%mole%');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%tamale%';

-- === OCEANIA ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%pavlova%';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1596662951482-0c4ba8a9c753?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND LOWER(name) LIKE '%fish and chips%';

-- === CATCH-ALL: Remaining by continent ===
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND continent = 'Africa';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND continent = 'Asia';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND continent = 'Europe';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%' AND continent IN ('North America', 'South America', 'Central America');
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85&fm=jpg' WHERE image_url LIKE '%example.com%';
