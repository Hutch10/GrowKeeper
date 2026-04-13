-- migration: 016_create_environmental_signals.sql
-- Agent #1: Environmental Sentinel persistence layer.

CREATE TYPE signal_severity AS ENUM ('NOMINAL', 'ELEVATED', 'HIGH', 'CRITICAL');
CREATE TYPE signal_status AS ENUM ('ACTIVE', 'EXPIRED', 'SUPPRESSED', 'NO_COVERAGE');

CREATE TABLE IF NOT EXISTS environmental_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specimen_id UUID NOT NULL REFERENCES specimens(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  provider TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  advisory_code TEXT NOT NULL,
  severity signal_severity NOT NULL DEFAULT 'NOMINAL',
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  provenance TEXT NOT NULL,
  status signal_status NOT NULL DEFAULT 'ACTIVE',
  
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  forecast_window_start TIMESTAMPTZ NOT NULL,
  forecast_window_end TIMESTAMPTZ NOT NULL,
  
  raw_source_ref TEXT,
  source_hash TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  operator_summary TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for duplicate suppression (specimen + provider + signal_type + source_hash + window)
CREATE INDEX IF NOT EXISTS idx_env_signals_suppression 
ON environmental_signals (specimen_id, provider, signal_type, source_hash, forecast_window_start);

-- Index for active signals query
CREATE INDEX IF NOT EXISTS idx_env_signals_active 
ON environmental_signals (specimen_id, status) 
WHERE status = 'ACTIVE';

-- RLS
ALTER TABLE environmental_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own environmental signals"
  ON environmental_signals FOR SELECT
  USING (auth.uid() = user_id OR (SELECT auth.uid()) IS NULL); -- Allow guest/alpha access if configured

CREATE POLICY "Users can insert their own environmental signals"
  ON environmental_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (SELECT auth.uid()) IS NULL);

CREATE POLICY "Users can update their own environmental signals"
  ON environmental_signals FOR UPDATE
  USING (auth.uid() = user_id OR (SELECT auth.uid()) IS NULL);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_environmental_signals_updated_at
    BEFORE UPDATE ON environmental_signals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
