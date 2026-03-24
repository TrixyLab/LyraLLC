-- Lyra Database Schema Repair
-- Execute this entire file in the Supabase SQL Editor

-- 1. Add banner column to lyra_approved_admins
ALTER TABLE lyra_approved_admins ADD COLUMN IF NOT EXISTS banner TEXT;

-- 2. Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lyra_approved_admins' AND column_name = 'banner';
