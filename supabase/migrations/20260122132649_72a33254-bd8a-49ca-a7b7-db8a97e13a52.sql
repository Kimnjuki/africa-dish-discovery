-- COMPREHENSIVE RECIPE DATA FIX: Adding missing steps, summaries, and histories
-- Batch 1: Fix 4 recipes with missing steps (viral/trending items)

UPDATE recipes SET 
  steps = '[
    {"instruction": "Melt dark chocolate in a double boiler until smooth and glossy"},
    {"instruction": "Butter and toast the kadayif pastry until golden and crispy"},
    {"instruction": "Roughly chop pistachios and mix with a touch of honey"},
    {"instruction": "Layer the crispy kadayif on the bottom of chocolate molds"},
    {"instruction": "Pour melted chocolate over the kadayif layer"},
    {"instruction": "Sprinkle chopped pistachios on top while chocolate is still warm"},
    {"instruction": "Refrigerate for 2 hours until completely set"},
    {"instruction": "Carefully unmold and serve at room temperature for best texture"}
  ]'::jsonb,
  history = 'Dubai Chocolate became a global viral sensation in 2024 when social media influencers discovered Fix Dessert Chocolatier''s pistachio-kunafa chocolate bar. The creation combines traditional Middle Eastern kadayif (shredded phyllo) with premium chocolate, representing the luxurious fusion food culture Dubai is known for. The dessert quickly became a symbol of Dubai''s position as a global culinary innovator, blending Eastern confectionery traditions with Western chocolate craftsmanship.',
  continent = 'Asia'
WHERE id = '12345678-9abc-def0-1234-56789abcdef0';

UPDATE recipes SET 
  steps = '[
    {"instruction": "Slice the large dill pickle lengthwise, keeping it attached at one end"},
    {"instruction": "Place pickle in a boat-shaped container or on a plate"},
    {"instruction": "Drizzle chamoy sauce generously over the entire pickle"},
    {"instruction": "Sprinkle Tajín seasoning liberally on all surfaces"},
    {"instruction": "Add hot sauce in zigzag pattern for extra heat"},
    {"instruction": "Squeeze fresh lime juice over the top"},
    {"instruction": "Insert a straw for drinking the accumulated juices"},
    {"instruction": "Serve immediately while crisp and enjoy the sour-spicy flavor explosion"}
  ]'::jsonb,
  history = 'The Chamoy Pickle emerged as a viral TikTok sensation in 2024, rooted in Mexican street food culture. Chamoy itself is a traditional Mexican condiment made from pickled fruit, chilies, and lime, dating back centuries to Asian influences brought via the Manila Galleon trade route. The modern pickle version represents how social media transforms traditional flavors into new food trends, combining the Mexican love of sour, spicy, and salty flavors in one dramatic presentation.',
  continent = 'North America'
WHERE id = 'd8e9f012-3456-789a-bcde-f0123456789a';

UPDATE recipes SET 
  steps = '[
    {"instruction": "Fill a highball glass with ice cubes"},
    {"instruction": "Add vodka and a splash of fresh lime juice"},
    {"instruction": "Pour lemon-lime soda to fill most of the glass"},
    {"instruction": "Slowly pour grenadine down the side of the glass for layered effect"},
    {"instruction": "Gently stir once or twice to slightly mix the colors"},
    {"instruction": "Garnish with maraschino cherries on a cocktail pick"},
    {"instruction": "Add a lime wheel on the rim for presentation"},
    {"instruction": "Serve immediately with a straw and enjoy responsibly"}
  ]'::jsonb,
  history = 'The Dirty Shirley is the adult version of the classic Shirley Temple, a non-alcoholic mocktail named after the famous child actress in the 1930s. The ''dirty'' version adds vodka, transforming a nostalgic childhood drink into a trendy cocktail. It went viral on TikTok in 2024 as millennials and Gen Z discovered the joy of upgrading their childhood favorites. The drink represents the broader trend of cocktail culture embracing nostalgia and playfulness.',
  continent = 'North America'
WHERE id = 'f0123456-789a-bcde-f012-3456789abcde';

UPDATE recipes SET 
  steps = '[
    {"instruction": "Place cottage cheese in a bowl and whip with a fork until slightly smooth"},
    {"instruction": "Optionally blend briefly for an even creamier texture"},
    {"instruction": "Transfer whipped cottage cheese to a serving bowl"},
    {"instruction": "Arrange fresh mixed berries on top in an attractive pattern"},
    {"instruction": "Drizzle honey in a decorative swirl over the berries"},
    {"instruction": "Sprinkle sliced almonds for crunch and healthy fats"},
    {"instruction": "Add chia seeds for extra nutrition and texture"},
    {"instruction": "Serve immediately as a high-protein breakfast or snack"}
  ]'::jsonb,
  history = 'The Viral Cottage Cheese Bowl became a 2024 health food phenomenon, driven by fitness influencers highlighting cottage cheese''s impressive protein content. This trend reimagined cottage cheese from a 1970s diet food to a modern superfood base. The versatility of the bowl - from sweet berry toppings to savory versions with everything bagel seasoning - showcases how social media can revitalize overlooked ingredients and transform them into trending health foods.',
  continent = 'Global'
WHERE id = '01234567-89ab-cdef-0123-456789abcdef';

-- Batch 2: Add missing summaries for African dishes

UPDATE recipes SET summary = 'Traditional Egyptian falafel made with fava beans instead of chickpeas, creating a distinctive green color and earthy flavor unique to Egyptian cuisine.' WHERE id = '13cc1882-415b-4b96-ab87-bd5fb1d1e5ae';

UPDATE recipes SET summary = 'Egypt''s beloved street food combining rice, pasta, lentils, and crispy onions, topped with spiced tomato sauce and garlic vinegar - a hearty vegetarian feast.' WHERE id = '661428a5-c0d7-4e84-87f1-0f5d58345563';

UPDATE recipes SET summary = 'The iconic Egyptian comfort food featuring layers of rice, macaroni, and lentils with tangy tomato sauce and crispy fried onions.' WHERE id = '6168736a-e6ea-4439-a44e-629791259929';

UPDATE recipes SET summary = 'Ethiopia''s iconic sourdough flatbread with a spongy texture, traditionally used as both plate and utensil for serving stews and vegetables.' WHERE id = '5e14a61a-3104-44c4-8277-dc957c7a351d';

UPDATE recipes SET summary = 'Soft, layered Kenyan flatbread with buttery flaky layers, a beloved accompaniment to stews and curries throughout East Africa.' WHERE id = 'eb91c898-f786-4972-9e85-78cdea3bf815';

UPDATE recipes SET summary = 'Sweet, pillowy East African donuts flavored with cardamom and coconut milk, perfect for breakfast or afternoon tea.' WHERE id = '6d679e79-8514-4fb9-aaaf-3ac4b09c720f';

UPDATE recipes SET summary = 'A festive Moroccan dish featuring fluffy steamed couscous topped with seven vegetables, tender lamb, and aromatic broth.' WHERE id = '58f536dd-eb94-4d49-95d3-c04c6336c41f';

UPDATE recipes SET summary = 'Morocco''s traditional Ramadan soup, a hearty blend of tomatoes, lentils, chickpeas, and herbs that breaks the daily fast.' WHERE id = 'aa35e8b0-71e4-4243-8b0f-c6a5a00348b3';

UPDATE recipes SET summary = 'Fluffy semolina couscous steamed to perfection, a North African staple served with aromatic vegetables and tender meat.' WHERE id = 'd63b6b64-5513-4434-9a6e-01a831d60276';

UPDATE recipes SET summary = 'Warming Moroccan lentil soup with chickpeas, tomatoes, and fragrant spices, traditionally served during Ramadan.' WHERE id = 'e71b5ad8-b396-4ed0-9e33-630c6f552936';

UPDATE recipes SET summary = 'Slow-cooked Moroccan stew named after the conical clay pot, featuring tender meat with dried fruits and aromatic spices.' WHERE id = '5d672a41-4f49-4eae-9110-62dcc125a0ab';

UPDATE recipes SET summary = 'Nigerian comfort food pairing pounded yam or cassava fufu with rich, nutty egusi soup made from ground melon seeds.' WHERE id = 'd38da7b0-8a0f-4213-bd2a-8255da972b61';

UPDATE recipes SET summary = 'Smoky Nigerian street food featuring spiced beef skewers grilled over open flames and coated in ground peanut spice mix.' WHERE id = 'c2b623fe-ebec-438f-a099-3ddccf6ec84d';

UPDATE recipes SET summary = 'South African curried meatloaf topped with a creamy egg custard, a Cape Malay classic with sweet and savory spices.' WHERE id = '14a92e1d-707b-45d7-9fa1-b0799ad377d8';

UPDATE recipes SET summary = 'Spicy South African vegetable relish with tomatoes, peppers, and beans, a vibrant accompaniment to braai meats.' WHERE id = 'b255498d-5881-48bf-9160-8647ec234139';

-- Batch 3: Add missing summaries for Asian dishes

UPDATE recipes SET summary = 'Cantonese tradition of small shared plates, featuring steamed dumplings, buns, and delicacies served from rolling carts.' WHERE id = 'cd47a647-4b4f-4005-8c98-679bbb29f53f';

UPDATE recipes SET summary = 'Fragrant Indian rice dish layered with spiced meat, saffron, and caramelized onions, slow-cooked to aromatic perfection.' WHERE id = 'ad70b36f-e21a-48bc-9dc7-61c0e17f2929';

UPDATE recipes SET summary = 'Creamy, rich North Indian curry with tender chicken in a velvety tomato-cashew sauce, beloved worldwide.' WHERE id = 'cff0dd29-1446-4329-9d8d-c8e8a6e60ff1';

UPDATE recipes SET summary = 'Marinated chicken roasted in a tandoor oven until charred and smoky, featuring yogurt and aromatic spice blend.' WHERE id = '4221128a-769f-4fb8-bd37-556076d91d80';

UPDATE recipes SET summary = 'Indonesian dry curry with tender beef slow-cooked in coconut milk and spices until rich and caramelized.' WHERE id = '159e17f4-a8fe-406e-8b1c-c46221061084';

UPDATE recipes SET summary = 'Indonesian fried rice stir-fried with sweet soy sauce, shallots, garlic, and topped with a fried egg.' WHERE id = '1780710d-9aee-4824-a617-b4795f66db60';

UPDATE recipes SET summary = 'Grilled skewered meat served with rich peanut sauce, a beloved Indonesian street food found across Southeast Asia.' WHERE id = '5d08afc1-7b8d-46ca-bcfe-8dad3cca80c5';

UPDATE recipes SET summary = 'Crispy Japanese pan-fried dumplings filled with seasoned pork and vegetables, served with tangy dipping sauce.' WHERE id = '117f152f-9b81-480e-92fc-c6390d99ae57';

UPDATE recipes SET summary = 'Fluffy Japanese pancakes infused with earthy matcha green tea, topped with cream and sweet red bean paste.' WHERE id = '2665303e-c035-4006-b748-047aa4eab148';

UPDATE recipes SET summary = 'Essential Japanese soup with dashi broth, silky tofu, wakame seaweed, and umami-rich fermented miso paste.' WHERE id = 'd4a1af11-be57-46c7-a761-849d819cc1b8';

UPDATE recipes SET summary = 'Japanese noodle soup with rich pork bone broth, springy wheat noodles, and customizable toppings like chashu and eggs.' WHERE id = '0ff6e114-734b-47c2-903f-1f3e9788b278';

UPDATE recipes SET summary = 'Spicy Malaysian noodle soup with coconut curry broth, rice noodles, and an array of toppings and garnishes.' WHERE id = '21dc4c94-4a92-4489-8ebf-e11d5807a5ee';

UPDATE recipes SET summary = 'Filipino braised dish with chicken or pork simmered in vinegar, soy sauce, garlic, and bay leaves until tender.' WHERE id = 'ae1f70d2-a103-4190-9dfa-2f87e027f0fb';

UPDATE recipes SET summary = 'Korea''s iconic fermented vegetable dish, featuring spicy, tangy napa cabbage aged to complex, probiotic-rich perfection.' WHERE id = '685665dc-ad6b-4ca8-a52e-809a3d98ec40';

UPDATE recipes SET summary = 'Viral Korean whipped coffee made by beating instant coffee, sugar, and hot water into a fluffy cloud over milk.' WHERE id = '160dcc8a-326d-41b2-8c45-7db4f07634eb';

UPDATE recipes SET summary = 'Spicy and sour Thai soup with aromatic lemongrass, galangal, kaffir lime, and plump shrimp or chicken.' WHERE id = '9b5ad66a-5444-478f-9d36-12be56a32b04';

UPDATE recipes SET summary = 'Vietnam''s iconic noodle soup with fragrant beef bone broth, rice noodles, and fresh herbs served tableside.' WHERE id = '1a2300fd-f2a8-450a-9fcb-bb584ce049b1';

-- Batch 4: Add missing summaries for European and other dishes

UPDATE recipes SET summary = 'Salvadoran stuffed corn tortillas filled with cheese, beans, or pork, griddled until crispy and served with curtido.' WHERE id = '171f128f-0bd3-46a8-a64a-7f6ca4342b53';

UPDATE recipes SET summary = 'Buttery, flaky French pastry with layers of laminated dough, the cornerstone of French breakfast culture.' WHERE id = '6f0c41bc-4d55-4051-99fa-1e12c684e6d4';

UPDATE recipes SET summary = 'Provençal vegetable stew celebrating summer produce, with layered tomatoes, zucchini, and eggplant in herbed sauce.' WHERE id = '0bfe28c5-561d-470a-b582-982a4f228a46';

UPDATE recipes SET summary = 'Breaded and fried veal or pork cutlet, a German-Austrian classic served with lemon wedges and potato salad.' WHERE id = '4f4dc1f8-824e-4f04-942b-69f68d0cd8ba';

UPDATE recipes SET summary = 'Layered phyllo pastry with honey-soaked nuts and aromatic spices, a sweet treasure of Greek and Middle Eastern cuisine.' WHERE id = '5fa49721-d025-4354-b43a-fcd8b656db6b';

UPDATE recipes SET summary = 'Fresh Mediterranean salad with ripe tomatoes, cucumber, olives, and creamy feta, dressed with olive oil and oregano.' WHERE id = '1804957c-242e-4b69-b240-fdee18424910';

UPDATE recipes SET summary = 'Greek layered casserole with eggplant, spiced meat sauce, and creamy béchamel, baked to golden perfection.' WHERE id = '62bb6ed7-7637-4ef1-a85a-7d844aea5285';

UPDATE recipes SET summary = 'Hearty Hungarian stew with tender beef, sweet paprika, and vegetables, slow-simmered to rich, warming perfection.' WHERE id = '16a6a244-8b8a-407c-89a4-1078117a62a2';

UPDATE recipes SET summary = 'Toasted Italian bread rubbed with garlic and topped with fresh tomatoes, basil, and olive oil - simple perfection.' WHERE id = '6c508e74-0e0f-4e87-bbff-db18bdf27e00';

UPDATE recipes SET summary = 'Creamy Italian rice dish slowly cooked with broth, featuring endless variations from mushroom to seafood.' WHERE id = 'db431c6f-4b3f-41df-8a00-1ac98ce31609';

UPDATE recipes SET summary = 'Roman pasta with creamy sauce of eggs, pecorino cheese, crispy guanciale, and freshly cracked black pepper.' WHERE id = '9394f2da-20a0-4388-9eb8-c54af8e38edc';

UPDATE recipes SET summary = 'Crispy fried chickpea patties with fresh herbs, served in pita with tahini, vegetables, and pickled turnips.' WHERE id = '2e2f7818-a8eb-425b-8e4b-65a033c7db3c';

UPDATE recipes SET summary = 'Polish filled dumplings with various savory or sweet fillings, boiled or pan-fried to delicious perfection.' WHERE id = '2867adff-5d20-4539-a992-b57bc2f22fd1';

UPDATE recipes SET summary = 'Spanish saffron-infused rice cooked with seafood, meat, and vegetables in a wide shallow pan over open flame.' WHERE id = 'ea04f673-8086-4b64-ac72-6b1f099a473d';

UPDATE recipes SET summary = 'British pub classic featuring crispy battered cod with thick-cut chips, served with mushy peas and tartar sauce.' WHERE id = 'd243605f-f8ef-42f1-b9f0-5ce89661e0b5';

UPDATE recipes SET summary = 'Comforting British casserole with ground lamb and vegetables topped with creamy mashed potato crust.' WHERE id = 'd760b5c7-5c44-4e17-abbb-659078221b56';

UPDATE recipes SET summary = 'Millennial brunch staple featuring ripe avocado on artisan toast, topped with a perfectly runny poached egg.' WHERE id = '9d18ec15-f228-48fe-8ff2-dffa5b1fab1c';

UPDATE recipes SET summary = 'Hawaiian raw fish salad with cubed ahi tuna, soy sauce, sesame oil, and fresh vegetables over rice.' WHERE id = 'bcb62e7e-dd35-4113-881d-1004e91939e5';

UPDATE recipes SET summary = 'Fusion pizza combining creamy butter chicken curry with melted cheese on crispy pizza crust.' WHERE id = 'd99ff1d5-00e8-4709-93b2-4d531c496191';

-- Batch 5: Add missing histories for popular dishes

UPDATE recipes SET history = 'Egyptian falafel, known locally as ta''ameya, dates back to ancient Egypt where Coptic Christians created this dish as a meat substitute during Lent. Unlike the chickpea version common elsewhere in the Middle East, Egyptian falafel uses fava beans, giving it a distinctive bright green interior. The dish has been a staple of Egyptian street food for centuries and remains a breakfast favorite across Cairo and Alexandria.' WHERE id = '13cc1882-415b-4b96-ab87-bd5fb1d1e5ae' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Koshari originated in 19th century Egypt when Indian soldiers brought their rice and lentil dish khichdi to Egypt during British colonial rule. Egyptian street vendors adapted it by adding pasta (from Italian influence), tomato sauce, and crispy fried onions. By the 1930s, it had become Egypt''s unofficial national dish, beloved for being filling, nutritious, and affordable. Today, koshari shops throughout Egypt serve millions daily.' WHERE id = '661428a5-c0d7-4e84-87f1-0f5d58345563' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Injera has been central to Ethiopian and Eritrean cuisine for over 2,000 years. Made from teff, an ancient grain indigenous to the Ethiopian highlands, injera is naturally fermented for 2-3 days, creating its characteristic sour taste and spongy texture. The bread serves as both plate and utensil in Ethiopian dining culture, with communal eating from a shared injera representing unity and friendship. UNESCO recognized Ethiopian coffee ceremony culture, of which injera-based meals are often a part.' WHERE id = '5e14a61a-3104-44c4-8277-dc957c7a351d' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Kenyan chapati evolved from the Indian paratha introduced by Indian railway workers during British colonial construction of the Uganda Railway in the early 1900s. Kenyans adapted the bread, making it softer and slightly sweeter than its Indian counterpart. Today, chapati is an integral part of Kenyan celebrations and Sunday family meals, often paired with stews or the beloved kuku paka (coconut chicken curry).' WHERE id = 'eb91c898-f786-4972-9e85-78cdea3bf815' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Mandazi has Swahili coast origins dating back to Arab and Persian trade influences on East Africa. These lightly sweetened fried doughs became a staple across Kenya, Tanzania, and Uganda, with each region developing slight variations. Cardamom, a spice brought by Arab traders, gives mandazi its distinctive flavor. Today, mandazi is enjoyed at breakfast, as a snack with chai tea, and at special celebrations.' WHERE id = '6d679e79-8514-4fb9-aaaf-3ac4b09c720f' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Dim sum originated in teahouses along China''s Silk Road, where travelers stopped for tea and small snacks. The Cantonese phrase ''yum cha'' (drinking tea) became associated with this tradition. By the 10th century, dim sum houses flourished in Guangzhou, with specialized carts and steamers. The tradition of Sunday dim sum with family remains central to Cantonese culture, with some Hong Kong restaurants serving over 100 varieties.' WHERE id = 'cd47a647-4b4f-4005-8c98-679bbb29f53f' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Biryani''s origins are debated between Persia and the Mughal Empire. The dish likely evolved from Persian pilaf when Mughal emperors brought it to the Indian subcontinent in the 16th century. Lucknow''s Awadhi biryani and Hyderabad''s distinctive style developed over centuries. Each Indian city claims its version as authentic. The dish became so prized that royal kitchens guarded their recipes, with some traditional families still keeping centuries-old recipes secret.' WHERE id = 'ad70b36f-e21a-48bc-9dc7-61c0e17f2929' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Butter Chicken was invented in 1950s Delhi at the famous Moti Mahal restaurant. Chef Kundan Lal Gujral created it by combining leftover tandoori chicken with a rich tomato and butter gravy. The dish was accidentally revolutionary, becoming one of India''s most famous exports. It introduced the world to North Indian cuisine and inspired the British dish chicken tikka masala. Moti Mahal still operates in Delhi, serving the original recipe.' WHERE id = 'cff0dd29-1446-4329-9d8d-c8e8a6e60ff1' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Rendang originated with the Minangkabau people of West Sumatra, Indonesia, where it has been prepared for ceremonial occasions for centuries. The dish was originally created to preserve meat in tropical climates through the combination of spices and coconut milk. Rendang holds deep cultural significance, being served at weddings, festivals, and to honor guests. In 2011, CNN''s international poll voted rendang the world''s most delicious food.' WHERE id = '159e17f4-a8fe-406e-8b1c-c46221061084' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Ramen was brought to Japan by Chinese immigrants in the late 19th century. Originally called ''shina soba'' (Chinese noodles), it evolved into distinctly Japanese regional styles: Sapporo''s miso, Hakata''s tonkotsu, Tokyo''s shoyu. After WWII, cheap ramen sustained a rebuilding nation. The 1958 invention of instant ramen by Momofuku Ando revolutionized food globally. Today, ramen is considered a Japanese cultural art form, with shops achieving Michelin stars.' WHERE id = '0ff6e114-734b-47c2-903f-1f3e9788b278' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Pho emerged in northern Vietnam in the early 20th century, likely influenced by French colonial beef consumption and Chinese rice noodle traditions. After Vietnam''s partition in 1954, pho migrated south, where it evolved with more herbs and garnishes. The Vietnam War diaspora spread pho worldwide. Today, pho is Vietnam''s national dish, with Hanoi and Saigon styles remaining distinct. A bowl of pho represents Vietnamese identity and comfort.' WHERE id = '1a2300fd-f2a8-450a-9fcb-bb584ce049b1' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Croissants, despite their French association, originated in Vienna as kipferl. The legend claims they celebrated the Ottoman siege defeat of 1683, shaped like the Turkish crescent moon. Austrian princess Marie Antoinette later brought them to France. French bakers transformed them in the 1800s using laminated dough technique, creating the buttery, flaky croissant we know today. The croissant became a symbol of French breakfast culture and café life.' WHERE id = '6f0c41bc-4d55-4051-99fa-1e12c684e6d4' AND (history IS NULL OR history = '');

UPDATE recipes SET history = 'Paella originated in Valencia, Spain, where farmers and laborers cooked rice over wood fires with whatever ingredients were available. The original paella valenciana contained rabbit, snails, and green beans. Seafood paella developed later in coastal areas. The dish''s name comes from the Old French ''paelle'' (pan). Authentic paella is cooked outdoors over orange wood, and Valencians consider it sacrilege to add chorizo, which is a common tourist adaptation.' WHERE id = 'ea04f673-8086-4b64-ac72-6b1f099a473d' AND (history IS NULL OR history = '');