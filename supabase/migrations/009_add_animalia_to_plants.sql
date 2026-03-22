-- Add Animalia specialized care columns to plants table
ALTER TABLE plants
ADD COLUMN IF NOT EXISTS heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS activity_level INTEGER,
ADD COLUMN IF NOT EXISTS dietary_notes TEXT;

-- Create an index on dietary_notes if needed for future search, but likely unnecessary for now.
-- Indexing heart_rate might be useful for population-wide analytics.
CREATE INDEX IF NOT EXISTS idx_plants_heart_rate ON plants(heart_rate);
