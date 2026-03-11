-- Move GrowKeeper to user-owned data with Supabase Auth + RLS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Link domain tables to auth users
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.plant_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS plants_user_id_idx ON public.plants(user_id);
CREATE INDEX IF NOT EXISTS plant_events_user_id_idx ON public.plant_events(user_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);

-- Backfill event/task ownership from parent plants where possible
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

-- Auto-create profile rows on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- Grants: authenticated users only
REVOKE ALL ON public.plants FROM anon;
REVOKE ALL ON public.plant_events FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.profiles FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Remove old public policies
DROP POLICY IF EXISTS "plants_public_select" ON public.plants;
DROP POLICY IF EXISTS "plants_public_insert" ON public.plants;
DROP POLICY IF EXISTS "plant_events_public_select" ON public.plant_events;
DROP POLICY IF EXISTS "plant_events_public_insert" ON public.plant_events;
DROP POLICY IF EXISTS "tasks_public_select" ON public.tasks;
DROP POLICY IF EXISTS "tasks_public_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_public_update" ON public.tasks;

-- Profiles: owner-only
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Plants: owner-only
DROP POLICY IF EXISTS "plants_select_own" ON public.plants;
CREATE POLICY "plants_select_own"
ON public.plants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "plants_insert_own" ON public.plants;
CREATE POLICY "plants_insert_own"
ON public.plants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "plants_update_own" ON public.plants;
CREATE POLICY "plants_update_own"
ON public.plants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "plants_delete_own" ON public.plants;
CREATE POLICY "plants_delete_own"
ON public.plants
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Plant events: owner-only, and parent plant must belong to user
DROP POLICY IF EXISTS "plant_events_select_own" ON public.plant_events;
CREATE POLICY "plant_events_select_own"
ON public.plant_events
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = plant_events.plant_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "plant_events_insert_own" ON public.plant_events;
CREATE POLICY "plant_events_insert_own"
ON public.plant_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = plant_events.plant_id
      AND p.user_id = auth.uid()
  )
);

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

DROP POLICY IF EXISTS "plant_events_delete_own" ON public.plant_events;
CREATE POLICY "plant_events_delete_own"
ON public.plant_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Tasks: owner-only, and parent plant must belong to user
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = tasks.plant_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
CREATE POLICY "tasks_insert_own"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.plants p
    WHERE p.id = tasks.plant_id
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

DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own"
ON public.tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
