-- GROWKEEPER SCHEMA: 013_alpha_observability_fields
-- Migration: 2026-03-24

-- Add fields to specimens
ALTER TABLE public.specimens ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.specimens ADD COLUMN IF NOT EXISTS last_action_type TEXT;

-- Add fields to specimen_events
ALTER TABLE public.specimen_events ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.specimen_events ADD COLUMN IF NOT EXISTS last_action_type TEXT;

-- Add fields to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_action_type TEXT;

-- Index for observability
CREATE INDEX IF NOT EXISTS idx_specimens_last_modified ON public.specimens(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_specimen_events_last_modified ON public.specimen_events(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_last_modified ON public.tasks(last_modified DESC);
