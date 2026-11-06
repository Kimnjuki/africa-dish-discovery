-- Update Arepas with proper ingredients
UPDATE recipes 
SET ingredients = jsonb_build_array(
  jsonb_build_object('name', 'Masarepa (pre-cooked cornmeal)', 'amount', '2', 'unit', 'cups'),
  jsonb_build_object('name', 'Warm water', 'amount', '2.5', 'unit', 'cups'),
  jsonb_build_object('name', 'Salt', 'amount', '1', 'unit', 'tsp'),
  jsonb_build_object('name', 'Queso fresco or mozzarella cheese', 'amount', '1', 'unit', 'cup'),
  jsonb_build_object('name', 'Butter', 'amount', '2', 'unit', 'tbsp')
),
steps = jsonb_build_array(
  jsonb_build_object('step', 1, 'instruction', 'Mix masarepa, salt, and warm water in a bowl until smooth dough forms'),
  jsonb_build_object('step', 2, 'instruction', 'Let dough rest for 5 minutes, then divide into 8 equal portions'),
  jsonb_build_object('step', 3, 'instruction', 'Form each portion into a ball and flatten into 1/2-inch thick patties'),
  jsonb_build_object('step', 4, 'instruction', 'Heat a skillet or griddle over medium heat and brush with butter'),
  jsonb_build_object('step', 5, 'instruction', 'Cook arepas for 5-7 minutes per side until golden brown with crispy crust'),
  jsonb_build_object('step', 6, 'instruction', 'Split open and fill with cheese, or your favorite filling')
)
WHERE name = 'Arepas';

-- Insert Pabellón Criollo (Venezuelan national dish)
INSERT INTO recipes (name, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, slug, is_african)
VALUES (
  'Pabellón Criollo',
  'Venezuela',
  'Venezuelan national dish with shredded beef, black beans, rice, and fried plantains',
  jsonb_build_array(
    jsonb_build_object('name', 'Flank steak', 'amount', '2', 'unit', 'lbs'),
    jsonb_build_object('name', 'Onion', 'amount', '1', 'unit', 'large'),
    jsonb_build_object('name', 'Tomatoes', 'amount', '2', 'unit', 'large'),
    jsonb_build_object('name', 'Black beans', 'amount', '2', 'unit', 'cups'),
    jsonb_build_object('name', 'White rice', 'amount', '2', 'unit', 'cups'),
    jsonb_build_object('name', 'Ripe plantains', 'amount', '2', 'unit', 'large'),
    jsonb_build_object('name', 'Garlic cloves', 'amount', '4', 'unit', 'cloves'),
    jsonb_build_object('name', 'Cumin', 'amount', '1', 'unit', 'tsp'),
    jsonb_build_object('name', 'Vegetable oil', 'amount', '1/4', 'unit', 'cup')
  ),
  jsonb_build_array(
    jsonb_build_object('step', 1, 'instruction', 'Boil flank steak with onion and garlic for 90 minutes until tender'),
    jsonb_build_object('step', 2, 'instruction', 'Shred the beef and sauté with diced tomatoes, cumin, and seasonings'),
    jsonb_build_object('step', 3, 'instruction', 'Cook black beans with garlic until soft and creamy'),
    jsonb_build_object('step', 4, 'instruction', 'Prepare white rice according to package directions'),
    jsonb_build_object('step', 5, 'instruction', 'Slice plantains diagonally and fry until golden'),
    jsonb_build_object('step', 6, 'instruction', 'Plate rice, top with beans, shredded beef, and plantains')
  ),
  30,
  120,
  6,
  'Medium',
  ARRAY['main course', 'beef', 'traditional'],
  'pabellon-criollo',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Insert Bandeja Paisa (Colombian platter)
INSERT INTO recipes (name, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, slug, is_african)
VALUES (
  'Bandeja Paisa',
  'Colombia',
  'Hearty Colombian platter with beans, rice, chicharrón, chorizo, egg, and arepa',
  jsonb_build_array(
    jsonb_build_object('name', 'Red beans', 'amount', '2', 'unit', 'cups'),
    jsonb_build_object('name', 'Pork belly (for chicharrón)', 'amount', '1', 'unit', 'lb'),
    jsonb_build_object('name', 'Colombian chorizo', 'amount', '4', 'unit', 'links'),
    jsonb_build_object('name', 'White rice', 'amount', '2', 'unit', 'cups'),
    jsonb_build_object('name', 'Eggs', 'amount', '4', 'unit', 'large'),
    jsonb_build_object('name', 'Ripe plantain', 'amount', '2', 'unit', 'large'),
    jsonb_build_object('name', 'Avocado', 'amount', '1', 'unit', 'large'),
    jsonb_build_object('name', 'Arepas', 'amount', '4', 'unit', 'pieces'),
    jsonb_build_object('name', 'Tomato', 'amount', '2', 'unit', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('step', 1, 'instruction', 'Soak and cook red beans with pork and spices for 2 hours'),
    jsonb_build_object('step', 2, 'instruction', 'Fry pork belly pieces until crispy chicharrón forms'),
    jsonb_build_object('step', 3, 'instruction', 'Grill or pan-fry chorizo links until cooked through'),
    jsonb_build_object('step', 4, 'instruction', 'Cook white rice and fry eggs sunny-side up'),
    jsonb_build_object('step', 5, 'instruction', 'Fry plantain slices and warm arepas'),
    jsonb_build_object('step', 6, 'instruction', 'Plate all components together with sliced avocado and tomato')
  ),
  20,
  150,
  4,
  'Hard',
  ARRAY['main course', 'traditional', 'platter'],
  'bandeja-paisa',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Insert Pepperpot (Guyanese stew)
INSERT INTO recipes (name, country, summary, ingredients, steps, prep_time, cook_time, servings, difficulty, tags, slug, is_african)
VALUES (
  'Pepperpot',
  'Guyana',
  'Rich, dark Guyanese stew made with cassareep, beef, and warm spices',
  jsonb_build_array(
    jsonb_build_object('name', 'Beef chuck', 'amount', '2', 'unit', 'lbs'),
    jsonb_build_object('name', 'Pork shoulder', 'amount', '1', 'unit', 'lb'),
    jsonb_build_object('name', 'Cassareep', 'amount', '1/2', 'unit', 'cup'),
    jsonb_build_object('name', 'Cinnamon stick', 'amount', '2', 'unit', 'sticks'),
    jsonb_build_object('name', 'Whole cloves', 'amount', '6', 'unit', 'pieces'),
    jsonb_build_object('name', 'Hot peppers', 'amount', '2', 'unit', 'whole'),
    jsonb_build_object('name', 'Brown sugar', 'amount', '2', 'unit', 'tbsp'),
    jsonb_build_object('name', 'Fresh thyme', 'amount', '4', 'unit', 'sprigs')
  ),
  jsonb_build_array(
    jsonb_build_object('step', 1, 'instruction', 'Cut beef and pork into large chunks'),
    jsonb_build_object('step', 2, 'instruction', 'Combine meat with cassareep, spices, and brown sugar in large pot'),
    jsonb_build_object('step', 3, 'instruction', 'Add hot peppers and thyme, cover with water'),
    jsonb_build_object('step', 4, 'instruction', 'Simmer on low heat for 3-4 hours until meat is very tender'),
    jsonb_build_object('step', 5, 'instruction', 'Stir occasionally and add water as needed'),
    jsonb_build_object('step', 6, 'instruction', 'Serve hot with bread or rice')
  ),
  15,
  240,
  8,
  'Medium',
  ARRAY['stew', 'main course', 'traditional'],
  'pepperpot',
  false
) ON CONFLICT (slug) DO NOTHING;