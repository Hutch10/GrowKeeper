-- Add hardware attestation statement column to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS hardware_attestation_statement TEXT;
