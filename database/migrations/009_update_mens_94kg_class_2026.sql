-- =====================================================
-- MIGRATION 009: Update Men's 98kg class to 94kg (2026)
-- =====================================================
-- Men:    60, 65, 71, 79, 88, 94, 110, +110
-- Women:  48, 53, 58, 63, 69, 77, 86, +86
-- =====================================================

-- Update all existing competition category presets
UPDATE competitions
SET weight_categories = '{"male": ["60", "65", "71", "79", "88", "94", "110", "+110"], "female": ["48", "53", "58", "63", "69", "77", "86", "+86"]}'::jsonb
WHERE weight_categories IS NOT NULL;

-- Ensure future rows default to the new category set
ALTER TABLE competitions
ALTER COLUMN weight_categories
SET DEFAULT '{"male": ["60", "65", "71", "79", "88", "94", "110", "+110"], "female": ["48", "53", "58", "63", "69", "77", "86", "+86"]}'::jsonb;
