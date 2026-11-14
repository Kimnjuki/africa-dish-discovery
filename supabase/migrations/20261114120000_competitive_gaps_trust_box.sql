-- Competitive gaps: cooked-photo trust + recipe box folders (F03 / F08)

-- Cooked photo proof on reviews
ALTER TABLE public.recipe_reviews
  ADD COLUMN IF NOT EXISTS cooked_photo_url text,
  ADD COLUMN IF NOT EXISTS made_it boolean DEFAULT true;

COMMENT ON COLUMN public.recipe_reviews.cooked_photo_url IS 'Optional photo of the finished dish uploaded by the cook';
COMMENT ON COLUMN public.recipe_reviews.made_it IS 'True when the user marked I made this';

-- Recipe Box folders (server-side companion to client recipeBox)
CREATE TABLE IF NOT EXISTS public.recipe_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_folder_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.recipe_folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  recipe_slug text NOT NULL,
  label text,
  cooked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (folder_id, recipe_slug)
);

CREATE INDEX IF NOT EXISTS recipe_folders_user_idx ON public.recipe_folders(user_id);
CREATE INDEX IF NOT EXISTS recipe_folder_items_user_idx ON public.recipe_folder_items(user_id);
CREATE INDEX IF NOT EXISTS recipe_folder_items_folder_idx ON public.recipe_folder_items(folder_id);

ALTER TABLE public.recipe_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_folder_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own folders" ON public.recipe_folders;
CREATE POLICY "Users manage own folders"
  ON public.recipe_folders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own folder items" ON public.recipe_folder_items;
CREATE POLICY "Users manage own folder items"
  ON public.recipe_folder_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for cooked photos (public read, auth write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cooked-photos', 'cooked-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Cooked photos are publicly readable" ON storage.objects;
CREATE POLICY "Cooked photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cooked-photos');

DROP POLICY IF EXISTS "Users upload own cooked photos" ON storage.objects;
CREATE POLICY "Users upload own cooked photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cooked-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own cooked photos" ON storage.objects;
CREATE POLICY "Users update own cooked photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cooked-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users delete own cooked photos" ON storage.objects;
CREATE POLICY "Users delete own cooked photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cooked-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
