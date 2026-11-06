-- Restrict public access to user profiles
-- 1) Drop existing public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2) Create a safer SELECT policy limited to authenticated users
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: Existing INSERT/UPDATE policies remain unchanged:
--  - "Users can create own profile" (WITH CHECK auth.uid() = id)
--  - "Users can update own profile" (USING auth.uid() = id)
-- These already prevent anonymous writes.