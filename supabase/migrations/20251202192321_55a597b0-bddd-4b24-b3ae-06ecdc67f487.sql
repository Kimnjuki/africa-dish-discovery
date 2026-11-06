-- Create user_recipe_interactions table for tracking behavior
CREATE TABLE public.user_recipe_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'cook', 'save', 'share', 'rate', 'abandon')),
  duration_seconds integer,
  completion_percentage numeric(5,2),
  device_type text,
  session_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create user_taste_profiles table for learned preferences
CREATE TABLE public.user_taste_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_cuisines jsonb DEFAULT '[]'::jsonb,
  preferred_ingredients jsonb DEFAULT '[]'::jsonb,
  avoided_ingredients jsonb DEFAULT '[]'::jsonb,
  cooking_skill_level numeric(3,2) DEFAULT 0.5,
  spice_tolerance text CHECK (spice_tolerance IN ('mild', 'medium', 'hot', 'very_hot')) DEFAULT 'medium',
  time_availability_weekday integer DEFAULT 45,
  time_availability_weekend integer DEFAULT 90,
  confidence_score numeric(5,4) DEFAULT 0.0,
  last_updated timestamp with time zone DEFAULT now(),
  training_data_points integer DEFAULT 0
);

-- Create personalized_recommendations cache table
CREATE TABLE public.personalized_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  recommendation_score numeric(5,4) NOT NULL,
  recommendation_reason text,
  category text CHECK (category IN ('for_you', 'trending', 'based_on_history', 'new_discover', 'seasonal')) DEFAULT 'for_you',
  position integer,
  generated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  shown_to_user boolean DEFAULT false,
  clicked boolean DEFAULT false
);

-- Create recipe_similarity_scores table
CREATE TABLE public.recipe_similarity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_a_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  recipe_b_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  similarity_score numeric(5,4) NOT NULL,
  similarity_factors jsonb DEFAULT '{}'::jsonb,
  calculated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_interactions_user_recipe ON public.user_recipe_interactions(user_id, recipe_id);
CREATE INDEX idx_interactions_type_created ON public.user_recipe_interactions(interaction_type, created_at);
CREATE INDEX idx_interactions_session ON public.user_recipe_interactions(session_id);

CREATE INDEX idx_recommendations_user_score ON public.personalized_recommendations(user_id, recommendation_score DESC);
CREATE INDEX idx_recommendations_expires ON public.personalized_recommendations(expires_at);
CREATE INDEX idx_recommendations_category ON public.personalized_recommendations(user_id, category, position);

CREATE INDEX idx_similarity_recipe_a ON public.recipe_similarity_scores(recipe_a_id, similarity_score DESC);
CREATE UNIQUE INDEX idx_unique_recipe_pair ON public.recipe_similarity_scores(LEAST(recipe_a_id, recipe_b_id), GREATEST(recipe_a_id, recipe_b_id));

-- Enable RLS
ALTER TABLE public.user_recipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_similarity_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_recipe_interactions
CREATE POLICY "Users can view own interactions" ON public.user_recipe_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions" ON public.user_recipe_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_taste_profiles
CREATE POLICY "Users can view own taste profile" ON public.user_taste_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own taste profile" ON public.user_taste_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for personalized_recommendations
CREATE POLICY "Users can view own recommendations" ON public.personalized_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations" ON public.personalized_recommendations
  FOR ALL USING (true);

-- RLS Policies for recipe_similarity_scores (public read)
CREATE POLICY "Anyone can view similarity scores" ON public.recipe_similarity_scores
  FOR SELECT USING (true);