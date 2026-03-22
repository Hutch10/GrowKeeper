-- Add image_url column to plants table
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS image_url text;

-- Note: You will need to manually create a storage bucket named 'plant-images' 
-- in the Supabase dashboard and set its access to 'Public'.
-- RLS for the bucket can be handled via the dashboard or additional SQL if using extensions.
