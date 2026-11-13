-- F10: Household sharing MVP
-- households + household_members, invite-code join, shared pantry read via RLS

CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_pantry BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT households_invite_code_format CHECK (invite_code ~ '^[A-Z0-9]{6,12}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS households_invite_code_uidx
  ON public.households (invite_code);

CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

-- MVP: one household membership per user
CREATE UNIQUE INDEX IF NOT EXISTS household_members_one_per_user
  ON public.household_members (user_id);

CREATE INDEX IF NOT EXISTS idx_household_members_household_id
  ON public.household_members (household_id);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Helpers (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.generate_household_invite_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.households WHERE invite_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_household_with(p_other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members a
    JOIN public.household_members b ON a.household_id = b.household_id
    WHERE a.user_id = auth.uid()
      AND b.user_id = p_other_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_household_pantry(p_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members a
    JOIN public.household_members b ON a.household_id = b.household_id
    JOIN public.households h ON h.id = a.household_id
    WHERE a.user_id = auth.uid()
      AND b.user_id = p_owner_id
      AND h.share_pantry = true
  );
$$;

CREATE OR REPLACE FUNCTION public.create_household(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h_id uuid;
  clean_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  clean_name := trim(p_name);
  IF clean_name IS NULL OR length(clean_name) < 2 THEN
    RAISE EXCEPTION 'Household name must be at least 2 characters';
  END IF;

  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already in a household';
  END IF;

  INSERT INTO public.households (name, invite_code, created_by)
  VALUES (clean_name, public.generate_household_invite_code(), auth.uid())
  RETURNING id INTO h_id;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (h_id, auth.uid(), 'owner');

  RETURN h_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_household_by_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h_id uuid;
  normalized text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  normalized := upper(regexp_replace(trim(p_code), '\s+', '', 'g'));
  IF normalized IS NULL OR length(normalized) < 6 THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already in a household';
  END IF;

  SELECT id INTO h_id
  FROM public.households
  WHERE invite_code = normalized;

  IF h_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (h_id, auth.uid(), 'member');

  RETURN h_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_household()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mem record;
  remaining int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, household_id, role
  INTO mem
  FROM public.household_members
  WHERE user_id = auth.uid();

  IF mem.id IS NULL THEN
    RAISE EXCEPTION 'Not in a household';
  END IF;

  IF mem.role = 'owner' THEN
    SELECT count(*) INTO remaining
    FROM public.household_members
    WHERE household_id = mem.household_id
      AND user_id <> auth.uid();

    IF remaining > 0 THEN
      -- Transfer ownership to earliest remaining member
      UPDATE public.household_members
      SET role = 'owner'
      WHERE id = (
        SELECT id FROM public.household_members
        WHERE household_id = mem.household_id
          AND user_id <> auth.uid()
        ORDER BY joined_at ASC
        LIMIT 1
      );
      DELETE FROM public.household_members WHERE id = mem.id;
    ELSE
      DELETE FROM public.households WHERE id = mem.household_id;
    END IF;
  ELSE
    DELETE FROM public.household_members WHERE id = mem.id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.regenerate_household_invite_code(p_household_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT public.is_household_owner(p_household_id) THEN
    RAISE EXCEPTION 'Only the owner can regenerate the invite code';
  END IF;

  new_code := public.generate_household_invite_code();
  UPDATE public.households
  SET invite_code = new_code, updated_at = now()
  WHERE id = p_household_id;

  RETURN new_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_household_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_household_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_household_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_household_with(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_household_pantry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_household(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_household_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_household() TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_household_invite_code(uuid) TO authenticated;

-- households RLS
DROP POLICY IF EXISTS "Members can view their household" ON public.households;
CREATE POLICY "Members can view their household"
  ON public.households FOR SELECT TO authenticated
  USING (public.is_household_member(id));

DROP POLICY IF EXISTS "Owners can update their household" ON public.households;
CREATE POLICY "Owners can update their household"
  ON public.households FOR UPDATE TO authenticated
  USING (public.is_household_owner(id))
  WITH CHECK (public.is_household_owner(id));

-- Direct inserts/deletes go through SECURITY DEFINER RPCs; block table-level writes
DROP POLICY IF EXISTS "No direct household inserts" ON public.households;
-- (no INSERT/DELETE policies = denied for non-owner; owner delete via leave_household)

-- household_members RLS
DROP POLICY IF EXISTS "Members can view household roster" ON public.household_members;
CREATE POLICY "Members can view household roster"
  ON public.household_members FOR SELECT TO authenticated
  USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "Owners can remove members" ON public.household_members;
CREATE POLICY "Owners can remove members"
  ON public.household_members FOR DELETE TO authenticated
  USING (
    public.is_household_owner(household_id)
    AND user_id <> auth.uid()
  );

-- Shared pantry: co-members can SELECT when household.share_pantry
DROP POLICY IF EXISTS "Household members can view shared pantry" ON public.pantry_items;
CREATE POLICY "Household members can view shared pantry"
  ON public.pantry_items FOR SELECT TO authenticated
  USING (
    user_id IS NOT NULL
    AND user_id <> auth.uid()
    AND public.can_view_household_pantry(user_id)
  );

-- Co-members can see basic profile fields for roster display
DROP POLICY IF EXISTS "Household members can view co-member profiles" ON public.profiles;
CREATE POLICY "Household members can view co-member profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.shares_household_with(id));

-- updated_at trigger
DROP TRIGGER IF EXISTS update_households_updated_at ON public.households;
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
