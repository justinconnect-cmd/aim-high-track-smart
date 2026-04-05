
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'top_level'::app_role));
CREATE POLICY "Admins can update teams" ON public.teams FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'top_level'::app_role));
CREATE POLICY "Admins can delete teams" ON public.teams FOR DELETE TO authenticated USING (has_role(auth.uid(), 'top_level'::app_role));

-- Create positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert positions" ON public.positions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'top_level'::app_role));
CREATE POLICY "Admins can update positions" ON public.positions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'top_level'::app_role));
CREATE POLICY "Admins can delete positions" ON public.positions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'top_level'::app_role));

-- Add archived, team_id, position_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL;
