-- GROWKEEPER SCHEMA EVOLUTION: 011_rename_plants_to_specimens
-- Migration: 2026-03-22

-- 1. Rename the core table
ALTER TABLE public.plants RENAME TO specimens;

-- 2. Update foreign key references in related tables
-- plant_events -> specimen_events (also renaming the table for consistency)
ALTER TABLE public.plant_events RENAME TO specimen_events;
ALTER TABLE public.specimen_events RENAME COLUMN plant_id TO specimen_id;

-- tasks
ALTER TABLE public.tasks RENAME COLUMN plant_id TO specimen_id;

-- 3. Update Indexes (Rename for clarity)
ALTER INDEX IF EXISTS plants_user_id_idx RENAME TO specimens_user_id_idx;
ALTER INDEX IF EXISTS plants_user_created_idx RENAME TO specimens_user_created_idx;
ALTER INDEX IF EXISTS idx_plants_kingdom RENAME TO idx_specimens_kingdom;
ALTER INDEX IF EXISTS idx_plants_heart_rate RENAME TO idx_specimens_heart_rate;
ALTER INDEX IF EXISTS plant_events_user_id_idx RENAME TO specimen_events_user_id_idx;
ALTER INDEX IF EXISTS plant_events_user_created_idx RENAME TO specimen_events_user_created_idx;

-- 4. Update Constraints
ALTER TABLE public.specimen_events DROP CONSTRAINT IF EXISTS plant_events_plant_id_fkey;
ALTER TABLE public.specimen_events ADD CONSTRAINT specimen_events_specimen_id_fkey 
    FOREIGN KEY (specimen_id) REFERENCES public.specimens(id) ON DELETE CASCADE;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_plant_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_specimen_id_fkey 
    FOREIGN KEY (specimen_id) REFERENCES public.specimens(id) ON DELETE CASCADE;

-- 5. Update RLS Policies (Rename for clarity, though logic remains same)
-- Note: In Supabase, renaming a table preserves policies, but we rename them for 'cleanliness'.
ALTER POLICY "plants_select_own" ON public.specimens RENAME TO "specimens_select_own";
ALTER POLICY "plants_insert_own" ON public.specimens RENAME TO "specimens_insert_own";
ALTER POLICY "plants_update_own" ON public.specimens RENAME TO "specimens_update_own";
ALTER POLICY "plants_delete_own" ON public.specimens RENAME TO "specimens_delete_own";

ALTER POLICY "plant_events_select_own" ON public.specimen_events RENAME TO "specimen_events_select_own";
ALTER POLICY "plant_events_insert_own" ON public.specimen_events RENAME TO "specimen_events_insert_own";
ALTER POLICY "plant_events_update_own" ON public.specimen_events RENAME TO "specimen_events_update_own";
