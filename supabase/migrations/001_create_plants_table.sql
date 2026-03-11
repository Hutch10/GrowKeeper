CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  nickname text NOT NULL,
  species_name text,
  notes text
);

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON TABLE public.plants TO anon;

DROP POLICY IF EXISTS "plants_public_select" ON public.plants;
CREATE POLICY "plants_public_select"
ON public.plants
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "plants_public_insert" ON public.plants;
CREATE POLICY "plants_public_insert"
ON public.plants
FOR INSERT
TO anon
WITH CHECK (true);
