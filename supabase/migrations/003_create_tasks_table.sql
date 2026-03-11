-- Create tasks table for plant task tracking
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  due_date timestamp with time zone,
  completed boolean NOT NULL DEFAULT false
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_task_type_check'
      AND conrelid = 'public.tasks'::regclass
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_task_type_check
      CHECK (task_type IN ('watered', 'fertilized', 'prune', 'repot', 'inspect'));
  END IF;
END $$;

-- Indexes for plant detail task queries
CREATE INDEX IF NOT EXISTS tasks_plant_id_idx ON public.tasks(plant_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date ASC);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at DESC);

-- Enable RLS and grant anon permissions for rapid testing
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON TABLE public.tasks TO anon;

DROP POLICY IF EXISTS "tasks_public_select" ON public.tasks;
CREATE POLICY "tasks_public_select"
ON public.tasks
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "tasks_public_insert" ON public.tasks;
CREATE POLICY "tasks_public_insert"
ON public.tasks
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_public_update" ON public.tasks;
CREATE POLICY "tasks_public_update"
ON public.tasks
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
