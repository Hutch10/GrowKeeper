-- Phase 0.7.0: Institutional RBAC & Security Hardening
-- Deployment: 2026-03-31

-- 1. Identity & Role Registry
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'FOUNDER'));
  END IF;
END $$;

-- 2. Institutional Authorization Helpers
CREATE OR REPLACE FUNCTION public.is_admin_or_founder()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'FOUNDER')
  );
END;
$$;

-- 3. Hardened Trigger: Assign Default Role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- 4. Hardened Row-Level Security (RLS)

-- Profiles: Owner or Admin/Founder
DROP POLICY IF EXISTS "profiles_select_institutional" ON public.profiles;
CREATE POLICY "profiles_select_institutional"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin_or_founder());

-- Specimens: Owner or Admin/Founder
DROP POLICY IF EXISTS "specimens_select_institutional" ON public.specimens;
CREATE POLICY "specimens_select_institutional"
ON public.specimens FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin_or_founder());

DROP POLICY IF EXISTS "specimens_update_institutional" ON public.specimens;
CREATE POLICY "specimens_update_institutional"
ON public.specimens FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.is_admin_or_founder())
WITH CHECK (auth.uid() = user_id OR public.is_admin_or_founder());

-- Tasks: Owner or Admin/Founder
DROP POLICY IF EXISTS "tasks_select_institutional" ON public.tasks;
CREATE POLICY "tasks_select_institutional"
ON public.tasks FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin_or_founder());

-- Audit Logs: Admin/Founder oversight only
DROP POLICY IF EXISTS "audit_logs_institutional_oversight" ON public.audit_logs;
CREATE POLICY "audit_logs_institutional_oversight"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin_or_founder());

-- 5. Adversarial Mitigation Logging (Signatures)
-- Ensure signatures are locked for non-founders
CREATE POLICY "Only Founders can modify signatures"
ON public.audit_logs FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'FOUNDER'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'FOUNDER'));
