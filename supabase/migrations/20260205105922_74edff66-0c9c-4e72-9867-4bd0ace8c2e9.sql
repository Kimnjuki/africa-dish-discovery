-- Batch 6: Middle Eastern and Fusion Dishes History Entries
UPDATE recipes SET 
  history = 'Hummus has ancient origins in the Levant, with recipes dating back to 13th-century Egypt. The chickpea dip is claimed by Lebanon, Israel, and Palestine as national heritage. Modern hummus has become a global health food phenomenon while remaining essential to Middle Eastern mezze.',
  continent = 'Middle East'
WHERE slug = 'hummus' AND history IS NULL;

UPDATE recipes SET 
  history = 'Falafel originated in Egypt as ta''amia made with fava beans, then evolved in the Levant using chickpeas. The crispy fritters became symbolic of Israeli cuisine but remain beloved across the Arab world. Falafel represents one of the world''s oldest vegetarian street foods.',
  continent = 'Middle East'
WHERE slug = 'falafel' AND history IS NULL;

UPDATE recipes SET 
  history = 'Shawarma descended from Turkish döner kebab and spread throughout the Middle East in the 20th century. Each country developed distinctive variations - Lebanese garlic sauce, Israeli laffa bread, Egyptian tahini. Shawarma shops are now ubiquitous worldwide.',
  continent = 'Middle East'
WHERE slug = 'shawarma' AND history IS NULL;

UPDATE recipes SET 
  history = 'Fattoush is a Levantine bread salad that emerged from the practical need to use stale flatbread. The tangy sumac dressing and fresh vegetables represent the resourcefulness of Middle Eastern home cooking. Fattoush is essential to mezze spreads.',
  continent = 'Middle East'
WHERE slug = 'fattoush' AND history IS NULL;

UPDATE recipes SET 
  history = 'Tabbouleh is a Lebanese parsley salad with ancient roots in the Levantine mountains. The ratio of parsley to bulgur varies by region - Lebanese versions emphasize herbs while Syrian versions use more grain. Tabbouleh represents Mediterranean freshness.',
  continent = 'Middle East'
WHERE slug = 'tabbouleh' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kebab variations span from the Balkans to Central Asia, but the Middle Eastern tradition of skewered grilled meat is particularly ancient. Persian and Turkish influences shaped modern kebab culture, with each country developing signature marinades and techniques.',
  continent = 'Middle East'
WHERE slug LIKE '%kebab%' AND history IS NULL;

UPDATE recipes SET 
  history = 'Baklava has origins in the Ottoman Empire, though Greeks, Turks, and Arabs all claim invention. The layered phyllo pastry with nuts and honey syrup represents the pinnacle of Middle Eastern and Mediterranean confectionery, perfected in imperial palace kitchens.',
  continent = 'Middle East'
WHERE slug = 'baklava' AND history IS NULL;

UPDATE recipes SET 
  history = 'Dolma (stuffed vegetables) traces to Ottoman palace cuisine and spread throughout the empire. Grape leaf dolmas are particularly associated with Greek and Turkish traditions. The technique of stuffing vegetables represents sophisticated Mediterranean cooking.',
  continent = 'Middle East'
WHERE slug = 'dolma' AND history IS NULL;

UPDATE recipes SET 
  history = 'Kibbeh is the national dish of Lebanon and Syria, made from bulgur and minced meat shaped into various forms. Archaeological evidence suggests similar dishes existed 4,000 years ago. Raw kibbeh nayyeh is considered a delicacy and test of quality.',
  continent = 'Middle East'
WHERE slug = 'kibbeh' AND history IS NULL;

UPDATE recipes SET 
  history = 'Korean BBQ Tacos emerged from Los Angeles food truck culture in 2008 when chef Roy Choi created Kogi BBQ. The fusion of Korean bulgogi with Mexican tacos represents the multicultural innovation of California cuisine and sparked a food truck revolution.',
  continent = 'North America'
WHERE slug = 'korean-bbq-tacos' AND history IS NULL;

UPDATE recipes SET 
  history = 'Sushi Burritos were invented in San Francisco in 2008, combining Japanese sushi with Mexican burrito format. The oversized hand rolls represent California''s fusion food culture and immigrant creativity. They''ve since spread to major cities worldwide.',
  continent = 'North America'
WHERE slug = 'sushi-burrito' AND history IS NULL;

UPDATE recipes SET 
  history = 'Ramen Burger was created by Keizo Shimamoto in Brooklyn in 2013, replacing buns with crispy ramen noodle patties. The invention went viral and represented the peak of 2010s fusion food culture, blending Japanese and American comfort foods.',
  continent = 'North America'
WHERE slug = 'ramen-burger' AND history IS NULL;

UPDATE recipes SET 
  history = 'Dubai Chocolate went viral in late 2024 when a Dubai-based chocolatier created a pistachio-filled chocolate bar. Social media transformed it into a global phenomenon, with people worldwide attempting to recreate the distinctive crunch and flavor.',
  continent = 'Middle East'
WHERE slug = 'dubai-chocolate' AND history IS NULL;

UPDATE recipes SET 
  history = 'Baba Ganoush is a Levantine eggplant dip with origins in the Ottoman period. The smoky flavor from charred eggplant defines this mezze essential. Lebanese, Syrian, and Turkish versions vary in tahini content and texture.',
  continent = 'Middle East'
WHERE slug = 'baba-ganoush' AND history IS NULL;

UPDATE recipes SET 
  history = 'Mansaf is Jordan''s national dish, lamb cooked in fermented dried yogurt (jameed) served over rice. The dish has Bedouin origins and is essential at weddings and celebrations. Eating mansaf with the right hand from a communal platter is traditional.',
  continent = 'Middle East'
WHERE slug = 'mansaf' AND history IS NULL;