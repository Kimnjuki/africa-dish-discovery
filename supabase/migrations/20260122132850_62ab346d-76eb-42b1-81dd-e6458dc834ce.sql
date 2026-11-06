-- BATCH 2: Add missing histories and summaries for remaining dishes

-- African dishes missing history
UPDATE recipes SET 
  history = 'Cachupa is the national dish of Cape Verde, a hearty stew that sustained islanders through centuries of hardship. Made with hominy corn, beans, and whatever protein was available, it represents the resilience and creativity of Cape Verdean cuisine. The "rica" (rich) version includes multiple meats for celebrations, while simpler versions were everyday fare. Cachupa embodies the African, Portuguese, and Brazilian influences that shape Cape Verdean culture.',
  continent = 'Africa'
WHERE name LIKE 'Cachupa%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Ndolé is Cameroon''s most celebrated dish, featuring bitter leaves (ndolé plant) cooked with groundnuts, meat, and crayfish. The dish has Bantu origins and was traditionally prepared for special occasions and to honor guests. The bitter leaves require extensive washing to remove their natural bitterness - a labor of love. Ndolé represents Cameroon''s rich biodiversity and the importance of forest foods in Central African cuisine.',
  continent = 'Africa'
WHERE name = 'Ndolé' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Mbongo Tchobi (black stew) is a Cameroonian delicacy featuring beef or fish in a dramatic black sauce made from burnt spices and forest seeds. The dish originates from the Bassa and Douala peoples of Cameroon''s coastal region. The unique blackening technique, using charred makandja seeds and various spices, creates an unforgettable flavor. It''s served at celebrations and represents the sophisticated spice traditions of Central African cuisine.',
  continent = 'Africa'
WHERE name = 'Mbongo Tchobi' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Pondu (also called Saka-Saka) is a beloved cassava leaf dish eaten across Central Africa, particularly in DRC and Congo-Brazzaville. Cassava leaves must be pounded and slow-cooked for hours to become tender and release their nutrients. The dish is rich in protein from dried fish or meat and served over fufu. Pondu represents the ingenuity of making nutritious meals from garden leaves.',
  continent = 'Africa'
WHERE name LIKE '%Pondu%' OR name LIKE '%Saka%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Doro Wat is Ethiopia''s most famous dish, a rich and spicy chicken stew served on injera for holidays and special occasions. The dish requires hours of slow-cooking onions until deeply caramelized, then adding berbere spice and chicken. Hard-boiled eggs are nestled in the stew. Traditionally prepared for Ethiopian New Year and Easter, Doro Wat represents Ethiopian hospitality and the country''s ancient spice traditions.',
  continent = 'Africa'
WHERE name LIKE '%Doro Wat%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Attiéké is Ivory Coast''s answer to couscous, made from fermented cassava. The preparation involves grating, fermenting, and steam-cooking cassava to create light, slightly tangy granules. Introduced by the Adjoukrou people, attiéké spread throughout West Africa. It''s typically served with grilled fish and a spicy sauce. Attiéké production is predominantly done by women and represents an important economic activity in Côte d''Ivoire.',
  continent = 'Africa'
WHERE name LIKE '%Attiéké%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Kedjenou is a traditional Ivorian one-pot chicken dish from the Bété people. The name means "stirred up" in the local language. Chicken and vegetables are sealed in a canari (clay pot) and slow-cooked without water, relying on natural juices. The pot is shaken periodically rather than stirred. This ancient technique preserves nutrients and creates intensely flavorful meat. Kedjenou is served at family gatherings and celebrations.',
  continent = 'Africa'
WHERE name LIKE '%Kedjenou%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Fattah is an ancient Egyptian ceremonial dish with roots in the Pharaonic era. Layers of crispy bread, rice, meat, and garlic-vinegar sauce create a celebratory feast. The dish was traditionally prepared for Eid al-Adha using sacrificial meat. The name comes from the Arabic word meaning "to break bread." Fattah represents the Egyptian love of layered dishes and the hospitality of sharing food from a communal plate.',
  continent = 'Africa'
WHERE name = 'Fattah' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Seswaa is Botswana''s national dish, consisting of slow-boiled meat (traditionally beef or goat) that''s shredded and pounded. This dish was born from the cattle-herding traditions of the Tswana people and was prepared for important gatherings. The simple seasoning of salt allows the meat''s natural flavor to shine. Seswaa is typically served at weddings, funerals, and national celebrations, symbolizing communal sharing and respect.',
  continent = 'Africa'
WHERE name LIKE '%Seswaa%' AND (history IS NULL OR history = '');

-- Asian dishes missing history
UPDATE recipes SET 
  history = 'Tanghulu originated in the Song Dynasty (960-1279) when street vendors discovered that coating hawthorn berries in hot sugar created a delicious preserved snack. Originally made only with hawthorn, modern tanghulu features strawberries, grapes, and other fruits. The dish became viral on social media in 2024, introducing the satisfying crunch of candied fruit to global audiences. Tanghulu remains a beloved Beijing street food, especially in winter.',
  continent = 'Asia'
WHERE name = 'Tanghulu' AND (history IS NULL OR history = '');

-- Latin American dishes missing history
UPDATE recipes SET 
  history = 'Empanadas have Spanish origins but evolved uniquely across Latin America. The name comes from "empanar" (to bread). Argentine empanadas developed distinctive regional styles - Salta uses potatoes and cumin, Tucumán features hand-crimped edges. The hand pies became a symbol of gaucho culture on the pampas. Today, each Argentine province proudly claims its empanada style as authentic, making them a source of friendly regional rivalry.',
  continent = 'South America'
WHERE name = 'Empanadas' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Bandeja Paisa is Colombia''s most iconic dish, a massive platter representing the hearty appetite of Antioquia''s working class. The dish evolved from the large meals needed to fuel farmers and miners. A traditional bandeja includes beans, rice, ground beef, chicharrón, chorizo, arepa, fried egg, plantain, and avocado. It''s a celebration of Colombian ingredients and the generous spirit of paisa hospitality.',
  continent = 'South America'
WHERE name = 'Bandeja Paisa' AND (history IS NULL OR history = '');

-- European dishes missing history  
UPDATE recipes SET 
  history = 'Patatas Bravas originated in Madrid''s bars in the mid-20th century as a simple tapa to accompany drinks. Crispy fried potatoes are topped with "salsa brava," a spicy tomato sauce that gave the dish its name (brava means "fierce"). Each bar developed its signature sauce, sparking friendly competition. Today, patatas bravas are a quintessential Spanish tapas experience found in bars across Spain.',
  continent = 'Europe'
WHERE name = 'Patatas Bravas' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Smørrebrød (literally "butter bread") emerged in 19th century Denmark when laborers packed open-faced sandwiches for lunch. What started as simple topped bread evolved into an art form. Copenhagen''s smørrebrød restaurants elevated the concept with elaborate toppings and strict presentation rules. The tradition of eating smørrebrød for lunch, followed by snaps (aquavit), remains central to Danish business culture.',
  continent = 'Europe'
WHERE name LIKE '%Smørrebrød%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Halloumi originated in Cyprus, with evidence of production dating back to medieval Byzantium. This semi-hard, unripened cheese has the unique property of maintaining its shape when grilled or fried due to its high melting point. Made traditionally from a mixture of goat and sheep milk, halloumi represents Cyprus''s pastoral heritage. The cheese gained Protected Designation of Origin status in 2021.',
  continent = 'Europe'
WHERE name LIKE '%Halloumi%' AND (history IS NULL OR history = '');

UPDATE recipes SET 
  history = 'Basque Burnt Cheesecake was created in 1990 at La Viña restaurant in San Sebastian, Spain. Chef Santiago Rivera accidentally overbaked a cheesecake, creating a caramelized exterior with a creamy, almost molten center. The "mistake" became legendary. Unlike American cheesecakes, it has no crust and embraces the burnt top. The recipe went viral globally in the 2020s, becoming one of the most-searched desserts worldwide.',
  continent = 'Europe'
WHERE name LIKE '%Burnt Cheesecake%' AND (history IS NULL OR history = '');

-- Add remaining summaries
UPDATE recipes SET summary = 'Cameroon''s iconic bitter leaf stew with groundnuts, prawns, and beef, slow-cooked to creamy perfection.' WHERE name = 'Ndolé' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Dramatic Cameroonian black stew made with charred spices and tender beef, a feast for special occasions.' WHERE name = 'Mbongo Tchobi' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Hearty Cape Verdean stew with corn, beans, and mixed meats, the islands'' beloved national dish.' WHERE name LIKE 'Cachupa%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Ethiopian celebration stew with tender chicken, hard-boiled eggs, and aromatic berbere spice blend.' WHERE name LIKE '%Doro Wat%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Light, tangy Ivorian cassava couscous, perfectly paired with grilled fish and spicy sauce.' WHERE name LIKE '%Attiéké%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Classic Ivorian clay-pot chicken slowly simmered in its own juices with vegetables and herbs.' WHERE name LIKE '%Kedjenou%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Ancient Egyptian layered feast with crispy bread, rice, tender meat, and tangy garlic sauce.' WHERE name = 'Fattah' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Botswana''s tender pounded beef, slow-cooked with salt and served at celebrations nationwide.' WHERE name LIKE '%Seswaa%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Chinese candied fruit on sticks with satisfying sugar shell crunch, viral street food sensation.' WHERE name = 'Tanghulu' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Crispy Spanish fried potatoes with spicy tomato brava sauce, the ultimate Madrid tapas.' WHERE name = 'Patatas Bravas' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Colombian mega-platter with beans, rice, meats, plantain, and egg - a feast of Antioquia.' WHERE name = 'Bandeja Paisa' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Danish open-faced sandwiches elevated to art form with carefully arranged gourmet toppings.' WHERE name LIKE '%Smørrebrød%' AND (summary IS NULL OR summary = '');

UPDATE recipes SET summary = 'Intentionally caramelized Basque cheesecake with creamy center and dramatic burnt top.' WHERE name LIKE '%Burnt Cheesecake%' AND (summary IS NULL OR summary = '');