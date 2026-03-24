-- FINAL SQL FIX: RUN THIS IN SUPABASE SQL EDITOR

DO $$ 
BEGIN
    -- 1. Try renaming 'roomName' to 'room_name'
    BEGIN
        ALTER TABLE public.lyra_meetings RENAME COLUMN "roomName" TO room_name;
    EXCEPTION WHEN undefined_column THEN
        NULL; -- Already renamed or column doesn't exist
    END;

    -- 2. Try renaming 'host' to 'creator_ign'
    BEGIN
        ALTER TABLE public.lyra_meetings RENAME COLUMN host TO creator_ign;
    EXCEPTION WHEN undefined_column THEN
        NULL;
    END;

    -- 3. Try renaming 'timestamp' to 'created_at'
    BEGIN
        ALTER TABLE public.lyra_meetings RENAME COLUMN "timestamp" TO created_at;
    EXCEPTION WHEN undefined_column THEN
        NULL;
    END;
END $$;

-- 4. Add missing columns (Safe to run multiple times)
ALTER TABLE public.lyra_meetings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.lyra_meetings ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT now();

-- 5. Final constraint check
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lyra_meetings_room_name_key') THEN
        ALTER TABLE public.lyra_meetings ADD CONSTRAINT lyra_meetings_room_name_key UNIQUE (room_name);
    END IF;
EXCEPTION
    WHEN OTHERS THEN RAISE NOTICE 'Unique constraint already exists or could not be applied.';
END $$;
