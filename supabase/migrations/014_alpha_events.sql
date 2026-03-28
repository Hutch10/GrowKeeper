-- GROWKEEPER SCHEMA: 014_alpha_events
-- Migration: 2026-03-28

CREATE TABLE IF NOT EXISTS public.alpha_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    route TEXT
);

-- Enable RLS
ALTER TABLE public.alpha_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "alpha_events_insert_all" 
ON public.alpha_events FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "alpha_events_select_own" 
ON public.alpha_events FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Grants
GRANT INSERT ON public.alpha_events TO authenticated, anon;
GRANT SELECT ON public.alpha_events TO authenticated;
