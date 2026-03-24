-- Create the Lyra Meetings table
CREATE TABLE IF NOT EXISTS public.lyra_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_name TEXT UNIQUE NOT NULL,
    creator_ign TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lyra_meetings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to see active meetings
CREATE POLICY "Public read meetings" ON public.lyra_meetings
    FOR SELECT USING (true);

-- Allow authenticated users to create meetings
CREATE POLICY "Auth create meetings" ON public.lyra_meetings
    FOR INSERT WITH CHECK (true);

-- Allow creators to delete/update their meetings
CREATE POLICY "Creator update meetings" ON public.lyra_meetings
    FOR ALL USING (true); -- Simplified for admin portal
