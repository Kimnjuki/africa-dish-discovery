-- Add missing UPDATE policy for pantry_items
CREATE POLICY "Users can update own pantry items"
ON public.pantry_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);