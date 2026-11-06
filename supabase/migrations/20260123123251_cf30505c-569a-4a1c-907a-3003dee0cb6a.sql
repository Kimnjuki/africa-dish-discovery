-- BATCH 3: Add summaries and histories for remaining popular dishes

-- Latin American dishes
UPDATE recipes SET 
  summary = 'Flaky Argentine beef hand pies with seasoned meat, olives, and hard-boiled eggs, regional styles vary.',
  history = 'Argentine empanadas descended from Spanish empanadas brought by colonizers but evolved into distinctly criolla (creole) forms. Each province developed its own style: Salta''s are filled with potatoes and cumin, Tucumán''s are smaller with hand-crimped edges, Mendoza''s feature olives. The gaucho culture of the pampas made empanadas portable cowboy food. Today, empanada competitions showcase regional pride across Argentina.',
  continent = 'South America'
WHERE id = '0f8258e8-c139-4b7f-83b9-1aca7629b693' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Juicy grilled steak topped with Argentina''s iconic herbaceous green chimichurri sauce.',
  history = 'Chimichurri''s origins are debated - some claim it was named after Jimmy McCurry, an Irish soldier in 19th century Argentina who asked for condiments. Others say it comes from indigenous Mapuche words. Whatever its origin, this vibrant sauce of parsley, oregano, garlic, and vinegar became inseparable from Argentine asado culture. No steak in Argentina is complete without it.',
  continent = 'South America'
WHERE name = 'Chimichurri Steak' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Brazil''s hearty national dish of black beans slow-cooked with pork, sausages, and beef.',
  history = 'Feijoada has complex origins in Brazilian history. Legends claim enslaved Africans created it from leftover pig parts, but historians now believe it evolved from Portuguese bean stews. What''s certain is that feijoada became a celebration of Brazilian identity, traditionally served on Wednesdays and Saturdays. The complete feijoada feast includes rice, collard greens, orange slices, farofa, and cachaça.',
  continent = 'South America'
WHERE name = 'Feijoada' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Chewy Brazilian cheese bread made with tapioca flour, naturally gluten-free and addictively delicious.',
  history = 'Pão de Queijo originated in the 18th century in Minas Gerais, Brazil. During the colonial period, slaves working on farms created these cheese rolls using cassava flour (tapioca starch). The recipe became a beloved breakfast staple across Brazil. The characteristic chewiness comes from the tapioca, while queijo meia cura (aged cheese) provides the distinctive flavor.',
  continent = 'South America'
WHERE name = 'Pão de Queijo' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Venezuelan corn cakes with endless fillings, crispy outside and tender inside.',
  history = 'Arepas predate Columbus, made by indigenous peoples of Venezuela and Colombia for over 3,000 years. The word comes from the Cumanagota language. Traditionally ground on a stone pilón, today pre-cooked arepa flour makes them accessible. Venezuelans eat arepas at any meal, stuffed with reina pepiada (chicken avocado), pabellón criollo, or simply butter and cheese.',
  continent = 'South America'
WHERE name = 'Arepas' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Fresh Peruvian seafood cured in citrus with ají peppers, onions, and cilantro.',
  history = 'Ceviche has pre-Columbian origins on Peru''s coast, where fishermen "cooked" their catch in local citrus. Spanish conquest introduced limes, and Asian immigrants added onions, creating modern ceviche. In 2004, Peru declared ceviche part of its cultural heritage. The dish represents Peru''s identity and its position as one of the world''s great culinary nations.',
  continent = 'South America'
WHERE name = 'Ceviche' AND (summary IS NULL OR summary = '');

-- Middle Eastern dishes
UPDATE recipes SET 
  summary = 'Creamy Lebanese chickpea dip with tahini, lemon, and garlic, a universal crowd-pleaser.',
  history = 'Hummus has ancient origins in the Middle East, with the earliest recipes appearing in 13th century Cairo. The name means simply "chickpeas" in Arabic. Today, hummus is claimed by Lebanon, Israel, Palestine, and Syria alike. What was once a regional staple has become a global phenomenon, with countless variations from beet to avocado hummus appearing worldwide.',
  continent = 'Asia'
WHERE name = 'Hummus' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Eggs poached in spiced tomato sauce, a North African and Middle Eastern breakfast staple.',
  history = 'Shakshuka''s name comes from the Arabic for "mixture" or "shaken." The dish likely originated in North Africa, traveling through Tunisia and Libya to the Levant. Yemeni Jewish immigrants brought it to Israel, where it became a national breakfast dish. Each region adds its own twist - some use feta, others merguez sausage or preserved lemons.',
  continent = 'Africa'
WHERE name = 'Shakshuka' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Layered Lebanese meat and vegetable dish with aromatic spiced rice, flipped upside-down.',
  history = 'Maqluba means "upside-down" in Arabic, describing how this Palestinian and Jordanian dish is served. Layers of rice, meat, and fried vegetables (cauliflower, eggplant, potatoes) are cooked in a pot then dramatically inverted onto a platter. The dish represents the artistry of Levantine cuisine and is served at celebrations and family gatherings.',
  continent = 'Asia'
WHERE name = 'Maqluba' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Jordan''s national dish of lamb on rice with jameed yogurt sauce and pine nuts.',
  history = 'Mansaf is the national dish of Jordan, deeply tied to Bedouin hospitality traditions. The name means "large tray" in Arabic. Lamb cooked in jameed (dried fermented yogurt) is served over rice and flatbread, garnished with almonds and pine nuts. Mansaf is eaten communally with the right hand at weddings, funerals, and to honor guests.',
  continent = 'Asia'
WHERE name = 'Mansaf' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Spiced meat shaved from a rotating spit, the Middle East''s iconic street food.',
  history = 'Shawarma descended from the Ottoman doner kebab tradition. Turkish immigrants spread the technique throughout the Middle East, where each country adapted it. Lebanese shawarma uses chicken or lamb with garlic sauce, while Syrian versions feature different spices. The rotating vertical spit became an iconic sight in every Arab city''s streets.',
  continent = 'Asia'
WHERE name = 'Shawarma' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Smoky Lebanese roasted eggplant dip with tahini, similar to but distinct from baba ghanoush.',
  history = 'Mutabal is a Levantine eggplant dip where the vegetable is charred over open flame, mashed, and mixed with tahini, garlic, and lemon. While similar to baba ghanoush, mutabal has a creamier consistency from more tahini. The smoky flavor comes from charring the eggplant directly on the fire, a technique dating back centuries.',
  continent = 'Asia'
WHERE name = 'Mutabal' AND (summary IS NULL OR summary = '');

-- Mexican dishes
UPDATE recipes SET 
  summary = 'Mexico City''s iconic spit-roasted pork tacos with pineapple, cilantro, and onion.',
  history = 'Tacos al Pastor emerged in 1930s Puebla when Lebanese immigrants adapted their shawarma technique to Mexican tastes. They replaced lamb with pork marinated in dried chiles and spices, and added pineapple. The name means "shepherd-style," referencing the original Middle Eastern lamb. Today, al pastor is arguably Mexico''s most beloved taco.',
  continent = 'North America'
WHERE name = 'Tacos al Pastor' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Fresh avocado dip with lime, cilantro, onion, and tomato, Mexico''s gift to the world.',
  history = 'Guacamole comes from the Nahuatl "ahuacamolli" (avocado sauce). Aztecs created this preparation before the Spanish arrival, recognizing avocado''s nutritious properties. Spanish colonizers added onion and cilantro. Today, guacamole is synonymous with Mexican cuisine, with fierce debates about whether tomato, peas, or other additions belong in the authentic version.',
  continent = 'North America'
WHERE name = 'Guacamole' AND (summary IS NULL OR summary = '');

-- American dishes  
UPDATE recipes SET 
  summary = 'Juicy beef patty on a bun with classic American toppings, the ultimate comfort food.',
  history = 'The hamburger''s exact origins are disputed, with various American cities claiming invention in the late 1800s. The name likely comes from Hamburg, Germany, where minced beef became popular. White Castle (1921) and McDonald''s (1940) industrialized the burger, spreading it globally. Today, the hamburger represents American food culture and has endless gourmet variations.',
  continent = 'North America'
WHERE name = 'Classic American Burger' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Slow-smoked pork ribs with tangy-sweet barbecue sauce, American pitmaster perfection.',
  history = 'American BBQ ribs evolved from Southern cooking traditions, with roots in African and Caribbean techniques. Each region developed distinct styles - Memphis dry rubs, Kansas City sweet sauce, Texas beef focus. Pit smoking for hours breaks down tough meat into tender, flavorful ribs. Competition barbecue has elevated rib smoking to an art form.',
  continent = 'North America'
WHERE name = 'BBQ Ribs' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Crispy fried chicken wings tossed in tangy cayenne butter sauce, born in Buffalo, NY.',
  history = 'Buffalo wings were invented in 1964 at the Anchor Bar in Buffalo, New York. Teressa Bellissimo fried up chicken wings for late-night patrons and tossed them in hot sauce mixed with butter. The combination of crispy skin, spicy sauce, and cooling blue cheese dip became a sensation. Today, over 1.4 billion wings are consumed during Super Bowl weekend alone.',
  continent = 'North America'
WHERE name = 'Buffalo Wings' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Creamy, cheesy American pasta comfort food that hugs the soul.',
  history = 'Mac and cheese has European origins - a medieval pasta with cheese appears in Italian cookbooks. Thomas Jefferson popularized it in America after encountering the dish in France. Kraft introduced boxed mac and cheese in 1937 for Depression-era families. Today, it''s the ultimate American comfort food, with versions from simple to lobster-topped.',
  continent = 'North America'
WHERE name = 'Mac and Cheese' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Creamy New England soup with tender clams, potatoes, and salt pork in rich broth.',
  history = 'Clam chowder originated in New England in the 18th century, likely with French or British roots. The creamy New England style uses milk or cream, while Manhattan chowder controversially uses tomatoes. The dish became so important to Boston identity that Maine reportedly tried to outlaw tomato-based versions in 1939.',
  continent = 'North America'
WHERE name = 'Clam Chowder' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Iconic creamy American dessert with graham cracker crust and smooth filling.',
  history = 'New York cheesecake was created by German Jewish immigrants who adapted their käsekuchen. Arnold Reuben claimed to create the New York style in 1929, using cream cheese instead of ricotta. Junior''s in Brooklyn, open since 1950, is legendary for its cheesecake. The dense, creamy style differs dramatically from Italian or Japanese versions.',
  continent = 'North America'
WHERE name = 'New York Cheesecake' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Cuban-American sandwich with roasted pork, ham, Swiss cheese, pickles, and mustard.',
  history = 'The Cuban sandwich evolved in Tampa, Florida, and Key West among Cuban immigrant communities in the late 1800s. The sandwich reflects Tampa''s multicultural history - Cubans, Italians, and Spanish all contributed. Tampa''s version includes salami, while Miami''s purist version omits it. Pressed on a plancha, the sandwich becomes crispy perfection.',
  continent = 'North America'
WHERE name = 'Cuban Sandwich' AND (summary IS NULL OR summary = '');

-- Fusion dishes
UPDATE recipes SET 
  summary = 'Korean BBQ beef with kimchi, salsa, and cilantro in a soft corn tortilla.',
  history = 'Korean BBQ tacos were pioneered by Roy Choi''s Kogi truck in Los Angeles in 2008. Choi, a Korean-American chef, married his heritage with LA taco culture, creating a food truck phenomenon. The dish represents the cultural fusion of LA''s diverse neighborhoods and launched the modern food truck revolution.',
  continent = 'North America'
WHERE name IN ('Korean BBQ Tacos', 'Kimchi Tacos') AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Massive sushi roll ingredients wrapped in a tortilla-sized seaweed for handheld eating.',
  history = 'The sushi burrito emerged in the 2010s as chefs reimagined both sushi and burritos. Sushirrito in San Francisco (2011) popularized the concept, combining the precision of Japanese sushi with the portability of Mexican burritos. The fusion reflects the creative, anything-goes spirit of modern American food culture.',
  continent = 'North America'
WHERE name = 'Sushi Burrito' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Ramen patty between two grilled noodle buns with umami-rich toppings.',
  history = 'The ramen burger was invented by Keizo Shimamoto at Smorgasburg food market in Brooklyn in 2013. Using fried ramen noodles as buns holding a beef patty, the creation went instantly viral. Lines stretched for hours. The ramen burger epitomizes the innovative Brooklyn food scene and Instagram-era food trends.',
  continent = 'North America'
WHERE name = 'Ramen Burger' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Warm churro meets cold ice cream in an indulgent Mexican-American dessert fusion.',
  history = 'The churro ice cream sandwich combines Spanish churros (brought to Latin America by colonizers) with American ice cream culture. Food trucks and dessert shops in Southern California popularized the combination in the 2010s. The warm, cinnamon-sugar crunch of churros contrasts perfectly with cold, creamy ice cream.',
  continent = 'North America'
WHERE name = 'Churro Ice Cream Sandwich' AND (summary IS NULL OR summary = '');

UPDATE recipes SET 
  summary = 'Indian spiced chicken in a Mexican quesadilla with cheese and chutney.',
  history = 'Tandoori quesadilla represents the creative fusion happening in multicultural cities. The combination of Indian tandoori spices with Mexican cheese-filled tortillas creates a dish that honors both traditions while creating something new. These fusion dishes often emerge in cities where immigrant communities live side by side.',
  continent = 'North America'
WHERE name = 'Tandoori Quesadilla' AND (summary IS NULL OR summary = '');