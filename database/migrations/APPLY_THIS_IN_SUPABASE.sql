-- IWF Competition Flow Migration
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Step 1: Add new columns to athletes table
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS opening_snatch INTEGER,
ADD COLUMN IF NOT EXISTS opening_clean_jerk INTEGER,
ADD COLUMN IF NOT EXISTS lot_number INTEGER,
ADD COLUMN IF NOT EXISTS weigh_in_completed_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Add constraints to ensure positive values
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_opening_snatch_positive') THEN
    ALTER TABLE athletes ADD CONSTRAINT check_opening_snatch_positive 
    CHECK (opening_snatch IS NULL OR opening_snatch > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_opening_clean_jerk_positive') THEN
    ALTER TABLE athletes ADD CONSTRAINT check_opening_clean_jerk_positive 
    CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_lot_number_positive') THEN
    ALTER TABLE athletes ADD CONSTRAINT check_lot_number_positive 
    CHECK (lot_number IS NULL OR lot_number > 0);
  END IF;
END $$;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_athletes_opening_snatch ON athletes(opening_snatch);
CREATE INDEX IF NOT EXISTS idx_athletes_opening_clean_jerk ON athletes(opening_clean_jerk);
CREATE INDEX IF NOT EXISTS idx_athletes_lot_number ON athletes(lot_number);

-- Step 4: Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'athletes' 
AND column_name IN ('opening_snatch', 'opening_clean_jerk', 'lot_number', 'weigh_in_completed_at')
ORDER BY column_name;
