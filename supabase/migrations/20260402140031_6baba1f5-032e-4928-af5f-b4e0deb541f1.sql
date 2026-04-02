
-- Drop the existing ALL policy (it doesn't cover SELECT properly for other users' roles)
DROP POLICY IF EXISTS "Top level can manage roles" ON public.user_roles;

-- Top level can view all roles
CREATE POLICY "Top level can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'top_level'));

-- Top level can insert roles
CREATE POLICY "Top level can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'top_level'));

-- Top level can update roles
CREATE POLICY "Top level can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'top_level'));

-- Top level can delete roles
CREATE POLICY "Top level can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'top_level'));

-- Drop the original select policy since it's now covered above
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
