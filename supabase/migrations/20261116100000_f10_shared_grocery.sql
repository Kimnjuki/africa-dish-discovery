-- F10: Shared household grocery write-sync

ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS share_grocery boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.household_grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  client_key text NOT NULL,
  ingredient_name text NOT NULL,
  quantity_display text,
  stall text,
  estimated_cost numeric,
  market_id text,
  substituted_from text,
  checked boolean NOT NULL DEFAULT false,
  notes text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, client_key)
);

CREATE INDEX IF NOT EXISTS household_grocery_items_household_idx
  ON public.household_grocery_items (household_id);

ALTER TABLE public.household_grocery_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_share_household_grocery(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members m
    JOIN public.households h ON h.id = m.household_id
    WHERE m.household_id = p_household_id
      AND m.user_id = auth.uid()
      AND h.share_grocery = true
  );
$$;

DROP POLICY IF EXISTS "Members read shared grocery" ON public.household_grocery_items;
CREATE POLICY "Members read shared grocery"
  ON public.household_grocery_items
  FOR SELECT
  USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "Members write shared grocery" ON public.household_grocery_items;
CREATE POLICY "Members write shared grocery"
  ON public.household_grocery_items
  FOR INSERT
  WITH CHECK (public.can_share_household_grocery(household_id));

DROP POLICY IF EXISTS "Members update shared grocery" ON public.household_grocery_items;
CREATE POLICY "Members update shared grocery"
  ON public.household_grocery_items
  FOR UPDATE
  USING (public.can_share_household_grocery(household_id))
  WITH CHECK (public.can_share_household_grocery(household_id));

DROP POLICY IF EXISTS "Members delete shared grocery" ON public.household_grocery_items;
CREATE POLICY "Members delete shared grocery"
  ON public.household_grocery_items
  FOR DELETE
  USING (public.can_share_household_grocery(household_id));

CREATE OR REPLACE FUNCTION public.set_household_grocery_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_household_grocery_updated_at ON public.household_grocery_items;
CREATE TRIGGER trg_household_grocery_updated_at
  BEFORE UPDATE ON public.household_grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_household_grocery_updated_at();
