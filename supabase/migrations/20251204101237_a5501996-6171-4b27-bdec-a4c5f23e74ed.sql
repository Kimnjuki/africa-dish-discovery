-- Insert sample cultural stories for popular recipes

-- Jollof Rice origin story
INSERT INTO public.cultural_stories (recipe_id, story_type, title, content, author_name, author_role, language, is_verified, view_count)
VALUES 
('2def8dc6-c907-417e-a015-9e291e963cd3', 'origin', 'The Great Jollof Debate', 
'Jollof Rice is more than just a dish—it''s a source of national pride and friendly rivalry across West Africa. The name "Jollof" comes from the Wolof people of Senegal and The Gambia, where the dish is believed to have originated in the 14th century. As traders and travelers spread the recipe across the region, each country adapted it to their local tastes. Today, the "Jollof Wars" between Nigeria, Ghana, and Senegal represent a playful competition about whose version is the best. Nigerian Jollof is known for its smoky, tomato-rich flavor, while Ghanaian Jollof often includes more vegetables and a distinct fragrance from basmati rice.',
'Chef Folake Adeleke', 'Nigerian Culinary Historian', 'en', true, 1542),

('2def8dc6-c907-417e-a015-9e291e963cd3', 'tradition', 'Party Jollof: A Celebration Essential',
'No Nigerian celebration is complete without "Party Jollof"—the legendary version cooked in massive pots over firewood at weddings, naming ceremonies, and festive gatherings. The smoky flavor from cooking outdoors and the slight char at the bottom of the pot (called "party jollof bottom") is considered a delicacy. Guests often judge a party''s success by the quality of its Jollof. The dish brings communities together, with neighbors contributing ingredients and helping with preparation, embodying the African philosophy of Ubuntu—"I am because we are."',
'Mama Nkechi', 'Traditional Cook', 'en', true, 987),

-- Ethiopian Injera stories
('bb427d51-44ac-4fb2-a63e-9006fb865997', 'origin', 'Injera: Ethiopia''s Ancient Sourdough Tradition',
'Injera has been the cornerstone of Ethiopian cuisine for over 2,000 years. Made from teff, a tiny grain native to the Ethiopian highlands, injera is both a food and an eating utensil. The spongy, slightly sour flatbread serves as the communal plate from which all dishes are eaten. The fermentation process that gives injera its distinctive tangy flavor and bubbly texture was perfected over generations. Teff was domesticated in Ethiopia between 4000 and 1000 BCE, and injera''s recipe has remained remarkably consistent throughout millennia.',
'Dr. Yohannes Haile', 'Ethiopian Food Anthropologist', 'en', true, 2103),

('bb427d51-44ac-4fb2-a63e-9006fb865997', 'tradition', 'Gursha: The Act of Love Through Food',
'In Ethiopian culture, "gursha" is the tradition of hand-feeding others as a sign of love and respect. During meals, hosts will tear off a piece of injera, wrap it around flavorful stews, and place it directly into a guest''s mouth. The larger the gursha, the greater the love. This intimate act strengthens bonds between family members, friends, and even new acquaintances. Refusing a gursha is considered impolite, and offering one is a profound gesture of welcome and affection.',
'Tigist Mengistu', 'Cultural Educator', 'en', true, 1876),

-- Bobotie stories
('4c34ad99-5377-446c-998e-0b978844361e', 'origin', 'Bobotie: A Dish That Tells South Africa''s Story',
'Bobotie represents the rich cultural tapestry of South Africa. The dish has roots in the 17th century when Dutch settlers brought Indonesian slaves to the Cape, who introduced their spice-infused cooking techniques. The name "bobotie" is believed to derive from the Indonesian word "botok," a method of cooking spiced meat in containers. Over centuries, bobotie evolved to incorporate local ingredients and influences from the Cape Malay community, creating a uniquely South African dish that symbolizes the nation''s diverse heritage.',
'Chef Reuben Riffel', 'South African Culinary Icon', 'en', true, 1234),

('4c34ad99-5377-446c-998e-0b978844361e', 'historical', 'From Slave Kitchens to National Dish',
'Bobotie''s journey from the Cape Malay slave quarters to becoming South Africa''s national dish reflects the country''s complex history. The dish was first recorded in a Dutch cookbook from 1609, making it one of Africa''s oldest recorded recipes. Cape Malay cooks, despite their circumstances, created extraordinary flavors using spices from their homeland—turmeric, coriander, and cumin—mixed with local meat and topped with an egg custard that sets during baking. Today, bobotie is served in homes and restaurants across South Africa, a testament to culinary resilience.',
'Professor Sandra Gilliers', 'South African Food Historian', 'en', true, 892);

-- Insert pronunciation guides
INSERT INTO public.pronunciation_guides (recipe_id, phonetic_spelling, language, region_accent)
VALUES 
('2def8dc6-c907-417e-a015-9e291e963cd3', 'JOL-off rice', 'en', 'Nigerian'),
('2def8dc6-c907-417e-a015-9e291e963cd3', 'JO-lof rice', 'en', 'Ghanaian'),
('bb427d51-44ac-4fb2-a63e-9006fb865997', 'in-JER-ah', 'en', 'Ethiopian'),
('bb427d51-44ac-4fb2-a63e-9006fb865997', 'ənˈdʒɛrə', 'am', 'Amharic'),
('4c34ad99-5377-446c-998e-0b978844361e', 'buh-BOO-tee', 'en', 'South African'),
('4c34ad99-5377-446c-998e-0b978844361e', 'bo-BOT-tee', 'af', 'Afrikaans'),
('b820c866-0689-444f-9f7a-3a5cc03e5a0c', 'in-JER-ah with DOR-oh WAHT', 'en', 'Ethiopian');

-- Insert sample translations
INSERT INTO public.recipe_translations (recipe_id, language_code, name, summary, cultural_notes, verified)
VALUES
('2def8dc6-c907-417e-a015-9e291e963cd3', 'yo', 'Iresi Jollof', 'Ounjẹ olókìkí ti a ṣe pẹ̀lú irẹsì àti tòmátò', 'Oúnjẹ yìí jẹ́ pàtàkì ní gbogbo àjọyọ̀ Yorùbá', true),
('2def8dc6-c907-417e-a015-9e291e963cd3', 'ha', 'Shinkafar Jollof', 'Abincin da aka fi so a Yammacin Afrika', 'Ana dafa wannan abincin a bukukuwan aure da sauran bukukuwa', true),
('bb427d51-44ac-4fb2-a63e-9006fb865997', 'am', 'እንጀራ', 'ባህላዊ የኢትዮጵያ ዳቦ', 'እንጀራ የኢትዮጵያ ምግብ መሠረት ነው፣ ከጤፍ ዱቄት የሚዘጋጅ', true),
('4c34ad99-5377-446c-998e-0b978844361e', 'af', 'Bobotie', 'Suid-Afrikaanse speserye-vleis gereg met eier-topping', 'Tradisioneel bedien met geelrys en sambal', true);