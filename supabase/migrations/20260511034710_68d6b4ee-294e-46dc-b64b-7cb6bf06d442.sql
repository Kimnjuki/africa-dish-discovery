-- 1. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Editorial review on uploads
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.uploads;
CREATE POLICY "Admins can view all uploads" ON public.uploads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins can update uploads" ON public.uploads;
CREATE POLICY "Admins can update uploads" ON public.uploads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins can delete uploads" ON public.uploads;
CREATE POLICY "Admins can delete uploads" ON public.uploads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow admins to publish into recipes
DROP POLICY IF EXISTS "Admins can insert recipes" ON public.recipes;
CREATE POLICY "Admins can insert recipes" ON public.recipes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins can update any recipe" ON public.recipes;
CREATE POLICY "Admins can update any recipe" ON public.recipes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 4. Storage bucket for community uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-uploads', 'recipe-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view recipe uploads" ON storage.objects;
CREATE POLICY "Public can view recipe uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-uploads');

DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'recipe-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'recipe-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );