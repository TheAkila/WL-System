-- Add image_url column to competitions table
-- Run this in Supabase SQL Editor

ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN competitions.image_url IS 'URL to the competition image stored in Supabase Storage';
