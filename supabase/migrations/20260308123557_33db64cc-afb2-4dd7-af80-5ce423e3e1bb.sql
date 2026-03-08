
CREATE POLICY "Public profiles visible for public personas"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM public.personas
    WHERE personas.user_id = profiles.id
    AND personas.is_public = true
  )
);
