-- Batch 4: Americas Dishes History Entries
UPDATE recipes SET 
  history = 'Tacos al Pastor originated in 1930s Mexico City when Lebanese immigrants adapted their shawarma technique to local tastes. The vertical spit roasting of marinated pork with pineapple created a unique Mexican-Lebanese fusion. Today, tacos al pastor stands are iconic to Mexican street food culture.',
  continent = 'North America'
WHERE slug = 'tacos-al-pastor' AND history IS NULL;

UPDATE recipes SET 
  history = 'Guacamole has Aztec origins dating back to at least the 16th century. The name comes from Nahuatl "ahuacamolli" meaning avocado sauce. Spanish conquistadors documented this creamy dip, which has remained essentially unchanged for 500 years, now beloved worldwide.',
  continent = 'North America'
WHERE slug = 'guacamole' AND history IS NULL;

UPDATE recipes SET 
  history = 'The American hamburger emerged in the late 19th century, with competing origin stories from Texas to Connecticut. By the 1920s, White Castle standardized the burger, and McDonald''s later globalized it. The hamburger became the quintessential American fast food icon.',
  continent = 'North America'
WHERE slug LIKE '%burger%' AND history IS NULL;

UPDATE recipes SET 
  history = 'BBQ Ribs trace their roots to African American pit masters in the American South. Slow-smoked pork ribs became a cornerstone of Southern barbecue culture after the Civil War. Regional styles - Memphis, Kansas City, Texas - each developed distinctive sauce traditions.',
  continent = 'North America'
WHERE slug = 'bbq-ribs' AND history IS NULL;

UPDATE recipes SET 
  history = 'Buffalo Wings were invented in 1964 at the Anchor Bar in Buffalo, New York. Teressa Bellissimo improvised with leftover chicken wings, deep-frying them and coating in hot sauce. This happy accident became a Super Bowl staple and global pub food phenomenon.',
  continent = 'North America'
WHERE slug = 'buffalo-wings' AND history IS NULL;

UPDATE recipes SET 
  history = 'Macaroni and Cheese came to America with Thomas Jefferson, who served it at a White House dinner in 1802. The dish evolved from European pasta traditions but became distinctly American. Kraft''s boxed version (1937) democratized this comfort food nationwide.',
  continent = 'North America'
WHERE slug = 'mac-and-cheese' AND history IS NULL;

UPDATE recipes SET 
  history = 'Feijoada is Brazil''s national dish, a black bean stew with pork that emerged from the colonial period. Legend credits enslaved Africans with creating it from discarded meat cuts. Whether myth or history, feijoada represents Brazilian cultural identity and Saturday tradition.',
  continent = 'South America'
WHERE slug = 'feijoada' AND history IS NULL;

UPDATE recipes SET 
  history = 'Arepas are an ancient corn flatbread staple of Venezuela and Colombia, predating European contact by thousands of years. Indigenous peoples ground corn on stone metates. Modern arepas remain central to daily life, with countless regional fillings and preparations.',
  continent = 'South America'
WHERE slug = 'arepas' AND history IS NULL;

UPDATE recipes SET 
  history = 'Ceviche originated along the Pacific coast of South America, with Peru and Ecuador both claiming invention. The technique of "cooking" raw fish in citrus juice dates back 2,000 years to Moche civilization. Peruvian ceviche became UNESCO Intangible Cultural Heritage.',
  continent = 'South America'
WHERE slug = 'ceviche' AND history IS NULL;

UPDATE recipes SET 
  history = 'Empanadas arrived in South America with Spanish colonizers but evolved into distinctly regional variations. Argentine empanadas differ from Chilean or Colombian versions. The hand-held turnover became essential to Latin American cuisine, from street food to celebration tables.',
  continent = 'South America'
WHERE slug = 'empanadas' AND history IS NULL;

UPDATE recipes SET 
  history = 'Poutine originated in rural Quebec in the late 1950s, combining French fries, cheese curds, and gravy. Initially dismissed as "peasant food," it became a symbol of Québécois identity. Poutine is now Canada''s most famous comfort food, with gourmet variations worldwide.',
  continent = 'North America'
WHERE slug = 'poutine' AND history IS NULL;

UPDATE recipes SET 
  history = 'Jerk Chicken is Jamaica''s signature dish, developed by the Maroons - escaped enslaved Africans who fled to the mountains. They combined African cooking techniques with local Scotch bonnet peppers and pimento wood smoking. Jerk seasoning represents resistance and cultural survival.',
  continent = 'North America'
WHERE slug = 'jerk-chicken' AND history IS NULL;

UPDATE recipes SET 
  history = 'Mole Poblano is Mexico''s most celebrated sauce, with origins in 17th-century Puebla. Legend attributes it to nuns at the Santa Rosa convent who combined chiles with chocolate and dozens of spices. The complex sauce takes days to prepare and represents Mexican haute cuisine.',
  continent = 'North America'
WHERE slug = 'mole-poblano' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pupusas are the national dish of El Salvador, thick corn tortillas stuffed with cheese, beans, or meat. Archaeological evidence suggests pupusas were made by Pipil tribes 2,000 years ago. Every Salvadoran family has their recipe, and November 13 is National Pupusa Day.',
  continent = 'North America'
WHERE slug = 'pupusas' AND history IS NULL;

UPDATE recipes SET 
  history = 'Chimichurri sauce originated in Argentina with gauchos (cowboys) who needed a flavorful accompaniment for grilled beef. The name may derive from an Anglicization of "Jimmy''s curry." This parsley-based sauce is essential to Argentine and Uruguayan asado culture.',
  continent = 'South America'
WHERE slug = 'chimichurri' AND history IS NULL;