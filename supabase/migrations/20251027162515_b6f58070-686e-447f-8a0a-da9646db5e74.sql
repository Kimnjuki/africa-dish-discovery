-- Insert correct Asian recipes with specific ingredients and steps

-- East Asia - Sushi
INSERT INTO recipes (name, country, region_id, summary, difficulty, prep_time, cook_time, servings, tags, ingredients, steps, slug, is_african)
VALUES (
  'Sushi',
  'Japan',
  NULL,
  'Traditional Japanese sushi with fresh fish and seasoned rice',
  'Hard',
  45,
  15,
  4,
  ARRAY['seafood', 'japanese', 'rice'],
  '[
    {"name": "Sushi rice", "amount": "2 cups", "notes": "short-grain"},
    {"name": "Rice vinegar", "amount": "3 tbsp", "notes": ""},
    {"name": "Sugar", "amount": "2 tbsp", "notes": ""},
    {"name": "Salt", "amount": "1 tsp", "notes": ""},
    {"name": "Fresh salmon", "amount": "200g", "notes": "sashimi-grade"},
    {"name": "Fresh tuna", "amount": "200g", "notes": "sashimi-grade"},
    {"name": "Nori sheets", "amount": "10 sheets", "notes": ""},
    {"name": "Cucumber", "amount": "1", "notes": "julienned"},
    {"name": "Avocado", "amount": "2", "notes": "sliced"},
    {"name": "Soy sauce", "amount": "for serving", "notes": ""},
    {"name": "Wasabi", "amount": "for serving", "notes": ""},
    {"name": "Pickled ginger", "amount": "for serving", "notes": ""}
  ]'::jsonb,
  '[
    {"instruction": "Rinse sushi rice until water runs clear, then cook according to package instructions"},
    {"instruction": "Mix rice vinegar, sugar, and salt. Heat until dissolved"},
    {"instruction": "Pour vinegar mixture over cooked rice and fold gently. Let cool to room temperature"},
    {"instruction": "Slice fish into thin pieces for nigiri or strips for rolls"},
    {"instruction": "Place nori on bamboo mat, spread rice evenly leaving 1 inch at top"},
    {"instruction": "Add fillings in a line across the center"},
    {"instruction": "Roll tightly using the bamboo mat, moistening the top edge to seal"},
    {"instruction": "Slice into 6-8 pieces with a sharp, wet knife"},
    {"instruction": "Serve with soy sauce, wasabi, and pickled ginger"}
  ]'::jsonb,
  'sushi-japanese',
  false
) ON CONFLICT (slug) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  steps = EXCLUDED.steps,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time;

-- Southeast Asia - Pad Thai
INSERT INTO recipes (name, country, region_id, summary, difficulty, prep_time, cook_time, servings, tags, ingredients, steps, slug, is_african)
VALUES (
  'Pad Thai',
  'Thailand',
  NULL,
  'Classic Thai stir-fried rice noodles with tamarind sauce',
  'Medium',
  20,
  15,
  4,
  ARRAY['noodles', 'thai', 'stir-fry'],
  '[
    {"name": "Rice noodles", "amount": "400g", "notes": "dried, flat"},
    {"name": "Shrimp", "amount": "300g", "notes": "peeled and deveined"},
    {"name": "Eggs", "amount": "3", "notes": "beaten"},
    {"name": "Firm tofu", "amount": "200g", "notes": "cubed"},
    {"name": "Garlic", "amount": "4 cloves", "notes": "minced"},
    {"name": "Tamarind paste", "amount": "3 tbsp", "notes": ""},
    {"name": "Fish sauce", "amount": "3 tbsp", "notes": ""},
    {"name": "Palm sugar", "amount": "2 tbsp", "notes": ""},
    {"name": "Bean sprouts", "amount": "2 cups", "notes": ""},
    {"name": "Peanuts", "amount": "1/2 cup", "notes": "crushed"},
    {"name": "Green onions", "amount": "4", "notes": "chopped"},
    {"name": "Lime", "amount": "2", "notes": "cut into wedges"},
    {"name": "Vegetable oil", "amount": "3 tbsp", "notes": ""}
  ]'::jsonb,
  '[
    {"instruction": "Soak rice noodles in warm water for 30 minutes until soft, then drain"},
    {"instruction": "Mix tamarind paste, fish sauce, and palm sugar in a bowl"},
    {"instruction": "Heat oil in a wok over high heat. Add garlic and stir-fry until fragrant"},
    {"instruction": "Add shrimp and tofu, cook until shrimp turns pink"},
    {"instruction": "Push ingredients to the side, scramble eggs in the center"},
    {"instruction": "Add drained noodles and sauce, toss everything together"},
    {"instruction": "Stir-fry for 2-3 minutes until noodles are coated and heated through"},
    {"instruction": "Add half the bean sprouts and green onions, toss briefly"},
    {"instruction": "Serve topped with remaining bean sprouts, peanuts, and lime wedges"}
  ]'::jsonb,
  'pad-thai-thailand',
  false
) ON CONFLICT (slug) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  steps = EXCLUDED.steps,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time;

-- South Asia - Chicken Tikka Masala
INSERT INTO recipes (name, country, region_id, summary, difficulty, prep_time, cook_time, servings, tags, ingredients, steps, slug, is_african)
VALUES (
  'Chicken Tikka Masala',
  'India',
  NULL,
  'Creamy tomato-based curry with marinated grilled chicken',
  'Medium',
  30,
  40,
  6,
  ARRAY['curry', 'indian', 'chicken'],
  '[
    {"name": "Chicken breast", "amount": "800g", "notes": "cut into chunks"},
    {"name": "Yogurt", "amount": "1 cup", "notes": "plain"},
    {"name": "Lemon juice", "amount": "2 tbsp", "notes": ""},
    {"name": "Garam masala", "amount": "2 tsp", "notes": ""},
    {"name": "Ground cumin", "amount": "2 tsp", "notes": ""},
    {"name": "Paprika", "amount": "1 tsp", "notes": ""},
    {"name": "Onion", "amount": "2 large", "notes": "diced"},
    {"name": "Garlic", "amount": "6 cloves", "notes": "minced"},
    {"name": "Ginger", "amount": "2 tbsp", "notes": "grated"},
    {"name": "Tomato puree", "amount": "400g", "notes": ""},
    {"name": "Heavy cream", "amount": "1 cup", "notes": ""},
    {"name": "Butter", "amount": "3 tbsp", "notes": ""},
    {"name": "Cilantro", "amount": "1/4 cup", "notes": "chopped"},
    {"name": "Salt", "amount": "to taste", "notes": ""}
  ]'::jsonb,
  '[
    {"instruction": "Mix yogurt, lemon juice, garam masala, cumin, and paprika. Marinate chicken for at least 2 hours"},
    {"instruction": "Grill or broil marinated chicken until charred and cooked through. Set aside"},
    {"instruction": "Heat butter in a large pan. Sauté onions until golden brown"},
    {"instruction": "Add garlic and ginger, cook for 1 minute until fragrant"},
    {"instruction": "Stir in tomato puree and remaining spices, simmer for 10 minutes"},
    {"instruction": "Add grilled chicken pieces to the sauce"},
    {"instruction": "Pour in heavy cream, stir well and simmer for 10 minutes"},
    {"instruction": "Adjust seasoning with salt"},
    {"instruction": "Garnish with cilantro and serve with rice or naan"}
  ]'::jsonb,
  'chicken-tikka-masala-india',
  false
) ON CONFLICT (slug) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  steps = EXCLUDED.steps,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time;

-- Central Asia - Plov
INSERT INTO recipes (name, country, region_id, summary, difficulty, prep_time, cook_time, servings, tags, ingredients, steps, slug, is_african)
VALUES (
  'Plov',
  'Uzbekistan',
  NULL,
  'Traditional Central Asian rice pilaf with lamb and vegetables',
  'Medium',
  20,
  60,
  8,
  ARRAY['rice', 'lamb', 'pilaf'],
  '[
    {"name": "Lamb shoulder", "amount": "800g", "notes": "cut into chunks"},
    {"name": "Basmati rice", "amount": "3 cups", "notes": ""},
    {"name": "Onions", "amount": "3 large", "notes": "sliced"},
    {"name": "Carrots", "amount": "4 large", "notes": "julienned"},
    {"name": "Garlic", "amount": "2 bulbs", "notes": "whole cloves"},
    {"name": "Cumin seeds", "amount": "2 tbsp", "notes": ""},
    {"name": "Coriander seeds", "amount": "1 tbsp", "notes": ""},
    {"name": "Vegetable oil", "amount": "1 cup", "notes": ""},
    {"name": "Salt", "amount": "to taste", "notes": ""},
    {"name": "Black pepper", "amount": "1 tsp", "notes": ""},
    {"name": "Chicken stock", "amount": "4 cups", "notes": ""}
  ]'::jsonb,
  '[
    {"instruction": "Heat oil in a large heavy-bottomed pot or Dutch oven"},
    {"instruction": "Brown lamb pieces on all sides, then remove and set aside"},
    {"instruction": "In the same pot, sauté onions until golden brown"},
    {"instruction": "Add carrots and cook for 5 minutes, stirring occasionally"},
    {"instruction": "Return lamb to the pot, add cumin and coriander"},
    {"instruction": "Pour in chicken stock and bring to a boil"},
    {"instruction": "Rinse rice and add to the pot, do not stir"},
    {"instruction": "Push whole garlic cloves into the rice"},
    {"instruction": "Cover and simmer on low heat for 30-40 minutes until rice is tender"},
    {"instruction": "Let rest for 10 minutes, then fluff and serve"}
  ]'::jsonb,
  'plov-uzbekistan',
  false
) ON CONFLICT (slug) DO UPDATE SET
  ingredients = EXCLUDED.ingredients,
  steps = EXCLUDED.steps,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time;