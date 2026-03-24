-- GROWKEEPER SCHEMA: 012_tester_feedback
-- Migration: 2026-03-24

CREATE TABLE IF NOT EXISTS public.tester_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route TEXT NOT NULL,
    action_attempted TEXT,
    content TEXT NOT NULL,
    error_context TEXT,
    device_info JSONB
);

-- Enable RLS
ALTER TABLE public.tester_feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tester_feedback_insert_own" 
ON public.tester_feedback FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tester_feedback_select_own" 
ON public.tester_feedback FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Grants
GRANT INSERT, SELECT ON public.tester_feedback TO authenticated;
