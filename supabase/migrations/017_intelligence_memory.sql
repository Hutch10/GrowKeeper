-- [MIGRATION] 017_intelligence_memory.sql
-- Deploys cloud-canonical memory layers for the Deterministic Intelligence Stack.

-- 1. Conflict History Ledger
CREATE TABLE IF NOT EXISTS public.conflict_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    correlation_id TEXT NOT NULL,
    specimen_id UUID REFERENCES public.specimens(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL, -- e.g. 'PROPERTY_DIVERGENCE', 'SYNC_COLLISION', 'PROVENANCE_MISMATCH'
    local_state JSONB NOT NULL,
    cloud_state JSONB NOT NULL,
    resolution_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED', 'IGNORED'
    recommendation JSONB, -- Ranked options from the Conflict Resolution Assistant
    provenance TEXT DEFAULT 'AUDIT_SENTINEL',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Operator Interventions Ledger
CREATE TABLE IF NOT EXISTS public.operator_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    correlation_id TEXT NOT NULL, -- Ties back to conflict_history or alpha_events
    specimen_id UUID REFERENCES public.specimens(id) ON DELETE CASCADE,
    intervention_type TEXT NOT NULL, -- e.g. 'CONFLICT_RESOLUTION', 'MANUAL_OVERRIDE', 'INTEGRITY_REPAIR'
    rationale TEXT,
    payload JSONB NOT NULL, -- The specific data change applied
    provenance TEXT DEFAULT 'USER',
    sync_status TEXT DEFAULT 'SYNCED_CLOUD',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Integrity Timeline Entries
CREATE TABLE IF NOT EXISTS public.integrity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    specimen_id UUID REFERENCES public.specimens(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'CREATION', 'PROVENANCE_CHANGE', 'SYNC_TRANSITION', 'CONFLICT', 'INTERVENTION', 'ENV_SIGNAL', 'FAILURE'
    description TEXT NOT NULL,
    significance_score INTEGER DEFAULT 0, -- Higher score = more likely to appear in Narrative sliding window
    metadata JSONB,
    provenance TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS Policies
ALTER TABLE public.conflict_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_timeline ENABLE ROW LEVEL SECURITY;

-- Conflict History: User-only
CREATE POLICY conflict_history_user_policy ON public.conflict_history
    FOR ALL USING (auth.uid() = user_id);

-- Operator Interventions: User-only
CREATE POLICY operator_interventions_user_policy ON public.operator_interventions
    FOR ALL USING (auth.uid() = user_id);

-- Integrity Timeline: User-only
CREATE POLICY integrity_timeline_user_policy ON public.integrity_timeline
    FOR ALL USING (auth.uid() = user_id);

-- 5. Indexes for performant narrative generation
CREATE INDEX IF NOT EXISTS idx_integrity_timeline_specimen_created ON public.integrity_timeline (specimen_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflict_history_status ON public.conflict_history (user_id, resolution_status);
