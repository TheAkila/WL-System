-- Add image_url column to competitions table
-- This migration adds the ability to store competition images

ALTER TABLE competitions 
ADD COLUMN image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN competitions.image_url IS 'URL or path to the competition cover image';
