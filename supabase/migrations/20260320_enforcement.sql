-- RAIS Phase 0: Audit & Enforcement Schema
-- Deployment: 2026-03-20

-- 1. Audit Logs for Sovereign Integrity
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    raw_data JSONB,
    confidence_matrix JSONB,
    decision TEXT,
    approval_status TEXT CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'AUTO')),
    signature TEXT -- ZK-proof or operator signature
);

-- 2. Pending Actions Gate
CREATE TABLE IF NOT EXISTS public.pending_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    alert_id TEXT NOT NULL,
    region TEXT NOT NULL,
    action_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'PENDING'
);

-- 3. RLS Policies for Sovereign Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view all logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "System can insert logs" 
ON public.audit_logs FOR INSERT 
TO service_role 
WITH CHECK (true);
