-- Create plant_events table for care logging
CREATE TABLE IF NOT EXISTS public.plant_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('watered', 'fertilized', 'pruned', 'repotted')),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient plant event queries
CREATE INDEX IF NOT EXISTS plant_events_plant_id_idx ON public.plant_events(plant_id);
CREATE INDEX IF NOT EXISTS plant_events_created_at_idx ON public.plant_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.plant_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
GRANT SELECT, INSERT ON TABLE public.plant_events TO anon;

-- RLS policies
DROP POLICY IF EXISTS "plant_events_public_select" ON public.plant_events;
CREATE POLICY "plant_events_public_select"
ON public.plant_events
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "plant_events_public_insert" ON public.plant_events;
CREATE POLICY "plant_events_public_insert"
ON public.plant_events
FOR INSERT
TO anon
WITH CHECK (true);
