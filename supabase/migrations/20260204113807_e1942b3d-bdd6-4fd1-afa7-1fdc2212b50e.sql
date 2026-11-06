-- Batch 2: Asian Dishes History Entries
UPDATE recipes SET 
  history = 'Pho is Vietnam''s national dish, originating in the early 20th century in northern Vietnam near Hanoi. The dish reflects French colonial influence (beef consumption) merged with Chinese cooking techniques (rice noodles, spices). After the Vietnam War, diaspora communities brought pho worldwide, making it an icon of Vietnamese cuisine.',
  continent = 'Asia'
WHERE slug = 'pho' AND history IS NULL;

UPDATE recipes SET 
  history = 'Banh Mi sandwiches emerged during French colonial Vietnam, blending the French baguette with Vietnamese ingredients like pâté, pickled vegetables, and cilantro. After 1975, Vietnamese refugees brought banh mi to the world. It represents the creative fusion born from colonialism, now celebrated as street food perfection.',
  continent = 'Asia'
WHERE slug = 'banh-mi' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pad Thai was created in the 1930s during a national campaign by Prime Minister Plaek Phibunsongkhram to promote Thai nationalism and reduce rice consumption. The dish quickly became a symbol of Thai identity and is now the country''s most famous culinary export, beloved worldwide.',
  continent = 'Asia'
WHERE slug = 'pad-thai' AND history IS NULL;

UPDATE recipes SET 
  history = 'Tom Yum soup is a cornerstone of Thai cuisine with roots in central Thailand. The name means "boiled salad," reflecting its origins as a simple broth. The balance of sour, spicy, and aromatic flavors represents the Thai culinary philosophy. It was inscribed on UNESCO''s Intangible Cultural Heritage list in 2024.',
  continent = 'Asia'
WHERE slug = 'tom-yum' AND history IS NULL;

UPDATE recipes SET 
  history = 'Green curry originated in the royal courts of Thailand during the Ayutthaya period (1351-1767). The distinctive green color comes from fresh green chilies, introduced to Thailand by Portuguese traders. The dish exemplifies the Thai balance of spicy, sweet, and savory flavors.',
  continent = 'Asia'
WHERE slug = 'green-curry' AND history IS NULL;

UPDATE recipes SET 
  history = 'Sushi has a 1,200-year history in Japan, evolving from a preservation method called narezushi. Modern nigiri sushi was invented in Tokyo in the 1820s by Hanaya Yohei. Today, sushi represents Japanese culinary precision and has become one of the world''s most sophisticated cuisines.',
  continent = 'Asia'
WHERE slug = 'sushi' AND history IS NULL;

UPDATE recipes SET 
  history = 'Ramen evolved from Chinese wheat noodles brought to Japan in the late 19th century. After World War II, cheap American wheat flour and returning soldiers popularized the dish. Each region developed distinct styles - Hakata tonkotsu, Sapporo miso, Tokyo shoyu - making ramen a cultural phenomenon.',
  continent = 'Asia'
WHERE slug = 'ramen' AND history IS NULL;

UPDATE recipes SET 
  history = 'Dim Sum, meaning "touch the heart," originated in teahouses along the ancient Silk Road. Travelers needed small snacks with their tea, leading to the development of dumplings and buns. Cantonese dim sum culture, with its bamboo steamers and rolling carts, became a cherished family tradition.',
  continent = 'Asia'
WHERE slug = 'dim-sum' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kung Pao Chicken originated in Sichuan province, named after Ding Baozhen, a Qing Dynasty official with the title "Kung Pao." The dish combines the numbing spice of Sichuan peppercorns with dried chilies. It was banned during the Cultural Revolution but has since become globally famous.',
  continent = 'Asia'
WHERE slug = 'kung-pao-chicken' AND history IS NULL;

UPDATE recipes SET 
  history = 'Peking Duck dates back to the Yuan Dynasty (1271-1368) and became a court dish during the Ming Dynasty. The elaborate preparation - air-drying, maltose glazing, and roasting - was perfected over centuries. It remains China''s most prestigious celebratory dish, symbolizing prosperity.',
  continent = 'Asia'
WHERE slug = 'peking-duck' AND history IS NULL;

UPDATE recipes SET 
  history = 'Nasi Goreng, Indonesia''s national dish, evolved from Chinese fried rice techniques adapted with local ingredients like kecap manis (sweet soy sauce) and sambal. The dish reflects Indonesia''s multicultural heritage and was declared an intangible cultural heritage. Street vendors serve it 24/7 across the archipelago.',
  continent = 'Asia'
WHERE slug = 'nasi-goreng' AND history IS NULL;

UPDATE recipes SET 
  history = 'Satay originated among street vendors in Java, Indonesia, with possible influences from Arab kebab traditions brought by Muslim traders. The dish spread throughout Southeast Asia, with each country developing distinctive versions. Malaysian and Thai satay feature unique peanut sauces and marinades.',
  continent = 'Asia'
WHERE slug = 'satay' AND history IS NULL;

UPDATE recipes SET 
  history = 'Rendang is a Minangkabau dish from West Sumatra, traditionally prepared for ceremonial occasions and to honor guests. The slow-cooking technique that concentrates spices into the meat can take up to eight hours. In 2011, CNN readers voted rendang the world''s most delicious food.',
  continent = 'Asia'
WHERE slug = 'rendang' AND history IS NULL;

UPDATE recipes SET 
  history = 'Biryani has origins in Mughal India, where Persian rice dishes merged with Indian spices. Each region developed signature versions - Hyderabadi, Lucknowi, Kolkata. The dish represents the culinary fusion of Islamic and Hindu cultures, served at celebrations and festivals across South Asia.',
  continent = 'Asia'
WHERE slug = 'biryani' AND history IS NULL;

UPDATE recipes SET 
  history = 'Butter Chicken was created in 1950s Delhi at Moti Mahal restaurant, when leftover tandoori chicken was simmered in a tomato-cream sauce. The dish became an instant classic and spread globally with Indian restaurants. It represents post-independence Indian culinary innovation.',
  continent = 'Asia'
WHERE slug = 'butter-chicken' AND history IS NULL;

UPDATE recipes SET 
  history = 'Tandoori Chicken was invented at Moti Mahal restaurant in Peshawar (now Pakistan) in the 1920s, then perfected in Delhi after Partition. The distinctive red color comes from traditional spices and modern food coloring. The tandoor oven technique dates back 5,000 years.',
  continent = 'Asia'
WHERE slug = 'tandoori-chicken' AND history IS NULL;

UPDATE recipes SET 
  history = 'Samosas originated in the Middle East as sanbusaj, brought to India by Central Asian traders in the 13th century. The triangular shape and potato-pea filling became distinctly Indian. Today, samosas are the subcontinent''s most popular snack, found at every railway station and street corner.',
  continent = 'Asia'
WHERE slug = 'samosa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Laksa represents the Peranakan culture of Malaysia and Singapore - the fusion of Chinese and Malay traditions. Curry laksa with coconut milk reflects southern influences, while asam laksa with tamarind shows northern preferences. The dish embodies Southeast Asian cultural harmony.',
  continent = 'Asia'
WHERE slug = 'laksa' AND history IS NULL;

UPDATE recipes SET 
  history = 'Bibimbap, meaning "mixed rice," has roots in Korean royal court cuisine but became a peasant dish using leftover vegetables. Each region has variants - Jeonju is most famous. The dish represents Korean philosophy of balance (yin and yang) through its colorful arrangement.',
  continent = 'Asia'
WHERE slug = 'bibimbap' AND history IS NULL;

UPDATE recipes SET 
  history = 'Korean Fried Chicken emerged in the 1970s and 1980s as Western fast food entered Korea. Korean cooks perfected a double-frying technique and created distinctive sweet-spicy sauces. The "chimaek" (chicken and beer) culture became a phenomenon, now exported worldwide.',
  continent = 'Asia'
WHERE slug = 'korean-fried-chicken' AND history IS NULL;