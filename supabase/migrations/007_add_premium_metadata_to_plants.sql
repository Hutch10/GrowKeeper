-- Add premium botanical metadata columns to plants table
ALTER TABLE plants
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS light TEXT,
ADD COLUMN IF NOT EXISTS watering TEXT,
ADD COLUMN IF NOT EXISTS fertilizer TEXT;

-- Update existing rows with some defaults if necessary (optional)
-- UPDATE plants SET location = 'Living Room' WHERE location IS NULL;
