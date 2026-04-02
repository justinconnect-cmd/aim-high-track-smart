CREATE POLICY "Top level can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'top_level'))
WITH CHECK (public.has_role(auth.uid(), 'top_level'));