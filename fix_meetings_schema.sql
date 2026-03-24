-- FIX FOR "is_active column does not exist"
ALTER TABLE public.lyra_meetings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.lyra_meetings ADD COLUMN IF NOT EXISTS creator_ign TEXT DEFAULT 'Unknown';
ALTER TABLE public.lyra_meetings ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT now();

-- Ensure UNIQUE constraint on room_name for UPSERT to work
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lyra_meetings_room_name_key') THEN
        ALTER TABLE public.lyra_meetings ADD CONSTRAINT lyra_meetings_room_name_key UNIQUE (room_name);
    END IF;
END $$;
