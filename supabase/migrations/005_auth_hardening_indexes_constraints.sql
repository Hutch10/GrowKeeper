-- Production hardening for auth-owned data queries and ownership integrity

-- Re-backfill ownership from plants where possible (safe to re-run)
UPDATE public.plant_events e
SET user_id = p.user_id
FROM public.plants p
WHERE e.plant_id = p.id
  AND e.user_id IS NULL;

UPDATE public.tasks t
SET user_id = p.user_id
FROM public.plants p
WHERE t.plant_id = p.id
  AND t.user_id IS NULL;

-- Enforce non-null ownership on all NEW rows without breaking legacy rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'plants_user_id_required'
      AND conrelid = 'public.plants'::regclass
  ) THEN
    ALTER TABLE public.plants
      ADD CONSTRAINT plants_user_id_required
      CHECK (user_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'plant_events_user_id_required'
      AND conrelid = 'public.plant_events'::regclass
  ) THEN
    ALTER TABLE public.plant_events
      ADD CONSTRAINT plant_events_user_id_required
      CHECK (user_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_user_id_required'
      AND conrelid = 'public.tasks'::regclass
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_user_id_required
      CHECK (user_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

-- Composite indexes for common user-scoped query paths.
CREATE INDEX IF NOT EXISTS plants_user_created_idx
  ON public.plants (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS plant_events_user_created_idx
  ON public.plant_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS plant_events_user_plant_created_idx
  ON public.plant_events (user_id, plant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS tasks_user_completed_due_created_idx
  ON public.tasks (user_id, completed, due_date ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS tasks_user_plant_due_created_idx
  ON public.tasks (user_id, plant_id, due_date ASC, created_at DESC);

-- Tighten update policies to also require ownership of parent plant.
DROP POLICY IF EXISTS "plant_events_update_own" ON public.plant_events;
CREATE POLICY "plant_events_update_own"
ON public.plant_events
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = plant_events.plant_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = plant_events.plant_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = tasks.plant_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = tasks.plant_id
      AND p.user_id = auth.uid()
  )
);
