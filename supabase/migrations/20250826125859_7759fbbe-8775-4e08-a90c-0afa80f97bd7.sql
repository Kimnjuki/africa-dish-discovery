-- Create pantry intelligence tables following the blueprint
-- Users' pantry items
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  expires_at DATE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients normalized master table
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,         -- e.g., "grain", "meat", "spice"
  shelf_life_days INT,   -- for freshness tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link recipes to ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  is_optional BOOLEAN DEFAULT FALSE,
  substitutes TEXT[], -- array of possible substitutes
  PRIMARY KEY (recipe_id, ingredient_id)
);

-- Enable RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Pantry items policies
CREATE POLICY "Users can view own pantry" 
ON pantry_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to pantry" 
ON pantry_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry" 
ON pantry_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from pantry" 
ON pantry_items FOR DELETE 
USING (auth.uid() = user_id);

-- Ingredients policies (public read)
CREATE POLICY "Ingredients are publicly viewable" 
ON ingredients FOR SELECT 
USING (true);

-- Recipe ingredients policies (public read)
CREATE POLICY "Recipe ingredients are publicly viewable" 
ON recipe_ingredients FOR SELECT 
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_pantry_items_updated_at
BEFORE UPDATE ON pantry_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample ingredients
INSERT INTO ingredients (name, category, shelf_life_days) VALUES
('Rice', 'grain', 365),
('Chicken', 'meat', 3),
('Tomatoes', 'vegetable', 7),
('Onions', 'vegetable', 30),
('Garlic', 'vegetable', 60),
('Ginger', 'spice', 30),
('Salt', 'spice', 1095),
('Pepper', 'spice', 365),
('Oil', 'fat', 365),
('Eggs', 'protein', 21)
ON CONFLICT (name) DO NOTHING;