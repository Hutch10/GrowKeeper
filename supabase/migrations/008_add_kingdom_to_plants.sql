-- Add kingdom and specialized care columns to plants table
ALTER TABLE plants
ADD COLUMN IF NOT EXISTS kingdom TEXT DEFAULT 'Plantae',
ADD COLUMN IF NOT EXISTS substrate TEXT,
ADD COLUMN IF NOT IN EXISTS misting_schedule TEXT;

-- Create an index on kingdom for faster filtering in the future
CREATE INDEX IF NOT EXISTS idx_plants_kingdom ON plants(kingdom);
