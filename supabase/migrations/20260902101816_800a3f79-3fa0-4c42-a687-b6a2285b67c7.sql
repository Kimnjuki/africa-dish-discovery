ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS item_type text,
  ADD COLUMN IF NOT EXISTS safety_notes text,
  ADD COLUMN IF NOT EXISTS verification_status text;

CREATE INDEX IF NOT EXISTS recipes_item_type_idx ON public.recipes (item_type);