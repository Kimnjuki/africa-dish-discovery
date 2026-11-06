-- Batch 3: European Dishes History Entries
UPDATE recipes SET 
  history = 'Pasta Carbonara originated in Rome, likely after World War II when American GIs brought bacon and eggs to Italy. The dish evolved from the guanciale and pecorino of Roman tradition. Authentic carbonara never includes cream - the silky sauce comes from egg yolks and starchy pasta water.',
  continent = 'Europe'
WHERE slug = 'pasta-carbonara' AND history IS NULL;

UPDATE recipes SET 
  history = 'Risotto emerged in northern Italy in the 14th century after rice was introduced from Asia. Milan became famous for risotto alla Milanese, golden with saffron. The dish requires constant attention, with broth added gradually to create the signature creamy texture called all''onda.',
  continent = 'Europe'
WHERE slug = 'risotto' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pizza as we know it originated in Naples in the 18th century as food for the poor. The Margherita pizza was created in 1889 to honor Queen Margherita, with tomato, mozzarella, and basil representing the Italian flag. Neapolitan pizza is now UNESCO protected.',
  continent = 'Europe'
WHERE slug = 'pizza' AND history IS NULL;

UPDATE recipes SET 
  history = 'Moussaka has ancient roots in the Levant but was refined into its modern Greek form by chef Nikolaos Tselementes in the 1920s. He added the béchamel topping, influenced by French cuisine. The layered casserole of eggplant, meat, and creamy sauce became Greece''s national comfort food.',
  continent = 'Europe'
WHERE slug = 'moussaka' AND history IS NULL;

UPDATE recipes SET 
  history = 'Croissants originated in Vienna (as kipferl) and were perfected in Paris in the 19th century. The laminated dough technique creates hundreds of flaky layers. French breakfast culture made the croissant an icon of Parisian life, now enjoyed worldwide as a symbol of refined pastry.',
  continent = 'Europe'
WHERE slug = 'croissant' AND history IS NULL;

UPDATE recipes SET 
  history = 'Coq au Vin is a rustic French dish that transforms tough rooster meat through slow braising in wine. The recipe appears in 19th-century cookbooks but has peasant origins going back centuries. Julia Child popularized it in America, making it synonymous with French home cooking.',
  continent = 'Europe'
WHERE slug = 'coq-au-vin' AND history IS NULL;

UPDATE recipes SET 
  history = 'Beef Bourguignon originated in Burgundy, where the world''s finest Pinot Noir wines are produced. This peasant stew of beef braised in red wine was elevated to haute cuisine by Auguste Escoffier. It represents the French art of transforming humble ingredients into extraordinary meals.',
  continent = 'Europe'
WHERE slug = 'beef-bourguignon' AND history IS NULL;

UPDATE recipes SET 
  history = 'Fish and Chips became Britain''s national dish in the late 19th century, combining Jewish fried fish traditions with Belgian-style chips. The first chip shops opened in the 1860s. During WWII, fish and chips was one of few foods not rationed, making it essential to British morale.',
  continent = 'Europe'
WHERE slug = 'fish-and-chips' AND history IS NULL;

UPDATE recipes SET 
  history = 'Schnitzel has Austrian roots, though similar breaded cutlets appear across Europe. Wiener Schnitzel, made with veal, became Vienna''s signature dish in the 19th century. The German and Austrian tradition of hammering meat thin and coating in crispy breadcrumbs spread throughout Central Europe.',
  continent = 'Europe'
WHERE slug = 'schnitzel' AND history IS NULL;

UPDATE recipes SET 
  history = 'Pierogi are Polish dumplings with origins dating back to the 13th century, possibly brought from China via the Mongol invasions. Each region has signature fillings - potato and cheese, sauerkraut and mushroom, or sweet fruit. Pierogi remain central to Polish celebrations and home cooking.',
  continent = 'Europe'
WHERE slug = 'pierogi' AND history IS NULL;

UPDATE recipes SET 
  history = 'Borscht originated in Ukraine, where beets have been cultivated for centuries. The vibrant crimson soup spread across Eastern Europe, with each country developing variations. Ukrainian borscht, served with sour cream and dill, was inscribed on UNESCO''s Intangible Cultural Heritage list in 2022.',
  continent = 'Europe'
WHERE slug = 'borscht' AND history IS NULL;

UPDATE recipes SET 
  history = 'Goulash originated with Hungarian cattle herders (gulyás) who prepared simple stews on the plains. The addition of paprika in the 16th century, after its arrival from the Americas, transformed it into Hungary''s national dish. Goulash represents the heart of Magyar culinary identity.',
  continent = 'Europe'
WHERE slug = 'goulash' AND history IS NULL;

UPDATE recipes SET 
  history = 'Souvlaki dates back to ancient Greece, where skewered meat was grilled over open flames. Archaeological evidence shows similar cooking methods 3,000 years ago. Modern souvlaki, wrapped in pita with tzatziki, became Greek street food perfection, enjoyed from Athens to the islands.',
  continent = 'Europe'
WHERE slug = 'souvlaki' AND history IS NULL;

UPDATE recipes SET 
  history = 'Paella originated in Valencia, Spain, where farmworkers cooked rice over wood fires with whatever ingredients were available - snails, rabbit, beans. The seafood version came later from coastal areas. The socarrat (crispy bottom layer) is considered the most prized part.',
  continent = 'Europe'
WHERE slug = 'paella' AND history IS NULL;

UPDATE recipes SET 
  history = 'Gazpacho has Roman origins as a bread and garlic soup, transformed after tomatoes arrived from the Americas. The cold soup became essential in Andalusia''s hot summers. Modern gazpacho, vibrant with tomatoes, peppers, and cucumber, represents Mediterranean refreshment.',
  continent = 'Europe'
WHERE slug = 'gazpacho' AND history IS NULL;