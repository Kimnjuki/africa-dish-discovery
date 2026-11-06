-- Cultural Storytelling Tables (F1.3)

-- Cultural stories for recipes and dishes
CREATE TABLE public.cultural_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id) ON DELETE CASCADE,
  story_type text CHECK (story_type IN ('origin', 'tradition', 'personal', 'historical', 'chef_insight')) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  author_name text,
  author_role text,
  audio_url text,
  video_url text,
  images text[],
  language text DEFAULT 'en',
  is_verified boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Recipe translations for multi-language support
CREATE TABLE public.recipe_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  language_code text NOT NULL,
  name text NOT NULL,
  summary text,
  ingredients jsonb,
  steps jsonb,
  cultural_notes text,
  translated_by uuid REFERENCES public.profiles(id),
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_recipe_language UNIQUE(recipe_id, language_code)
);

-- Pronunciation guides
CREATE TABLE public.pronunciation_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id) ON DELETE CASCADE,
  phonetic_spelling text NOT NULL,
  audio_url text,
  language text DEFAULT 'en',
  region_accent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cultural_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronunciation_guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cultural_stories
CREATE POLICY "Anyone can view cultural stories" ON public.cultural_stories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create stories" ON public.cultural_stories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for recipe_translations
CREATE POLICY "Anyone can view translations" ON public.recipe_translations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create translations" ON public.recipe_translations
  FOR INSERT WITH CHECK (auth.uid() = translated_by);

-- RLS Policies for pronunciation_guides
CREATE POLICY "Anyone can view pronunciation guides" ON public.pronunciation_guides
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_cultural_stories_recipe ON public.cultural_stories(recipe_id);
CREATE INDEX idx_cultural_stories_dish ON public.cultural_stories(dish_id);
CREATE INDEX idx_translations_recipe_lang ON public.recipe_translations(recipe_id, language_code);
CREATE INDEX idx_pronunciation_recipe ON public.pronunciation_guides(recipe_id);
CREATE INDEX idx_pronunciation_dish ON public.pronunciation_guides(dish_id);