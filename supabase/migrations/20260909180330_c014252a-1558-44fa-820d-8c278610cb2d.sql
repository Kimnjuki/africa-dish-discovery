CREATE TABLE public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('recipe','dish','country')),
  item_id uuid,
  item_slug text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_items TO authenticated;
GRANT ALL ON public.saved_items TO service_role;

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved items" ON public.saved_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own saved items" ON public.saved_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved items" ON public.saved_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved items" ON public.saved_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX saved_items_unique_per_user ON public.saved_items (user_id, item_type, item_slug);
CREATE INDEX saved_items_user_idx ON public.saved_items (user_id, item_type);

CREATE TRIGGER update_saved_items_updated_at
  BEFORE UPDATE ON public.saved_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();