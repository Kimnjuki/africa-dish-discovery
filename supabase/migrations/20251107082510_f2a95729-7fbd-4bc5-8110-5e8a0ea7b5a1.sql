-- Add nutritional information columns to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS calories integer,
ADD COLUMN IF NOT EXISTS protein numeric(10,2),
ADD COLUMN IF NOT EXISTS carbs numeric(10,2),
ADD COLUMN IF NOT EXISTS fats numeric(10,2);

-- Add index for better performance when filtering by nutritional values
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes(calories);

-- Add comments for documentation
COMMENT ON COLUMN recipes.calories IS 'Calories per serving';
COMMENT ON COLUMN recipes.protein IS 'Protein in grams per serving';
COMMENT ON COLUMN recipes.carbs IS 'Carbohydrates in grams per serving';
COMMENT ON COLUMN recipes.fats IS 'Fats in grams per serving';