-- LYRA Esports Supabase PostgreSQL Schema

-- 1. applications
CREATE TABLE IF NOT EXISTS public.lyra_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    ign TEXT,
    email TEXT,
    discord TEXT,
    role TEXT,
    roleValue TEXT,
    gameRole TEXT,
    socialLink TEXT,
    tracker TEXT,
    experience TEXT,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- 2. approved_admins
CREATE TABLE IF NOT EXISTS public.lyra_approved_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    ign TEXT NOT NULL UNIQUE,
    email TEXT,
    discord TEXT,
    pfp TEXT,
    banner TEXT,
    password TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. roster
CREATE TABLE IF NOT EXISTS public.lyra_roster (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game TEXT NOT NULL,
    name TEXT NOT NULL,
    ign TEXT,
    rawRole TEXT NOT NULL,
    customRole TEXT,
    country TEXT,
    socialLink TEXT,
    discord TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. chat_channels
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id TEXT PRIMARY KEY, -- e.g. 'general', 'roster-drafts'
    name TEXT NOT NULL,
    created_by TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    time TEXT NOT NULL, -- e.g. '10:05 AM'
    text TEXT,
    imageUrl TEXT,
    avatarClass TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. presence (Realtime Tracking)
CREATE TABLE IF NOT EXISTS public.lyra_presence (
    id TEXT PRIMARY KEY, -- currentUser (e.g. 'Admin')
    status TEXT NOT NULL, -- 'online', 'away', 'dnd', 'offline'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. system_broadcast
CREATE TABLE IF NOT EXISTS public.lyra_system_broadcast (
    id TEXT PRIMARY KEY,
    active BOOLEAN DEFAULT false,
    message TEXT,
    url TEXT,
    dismissible BOOLEAN DEFAULT true,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. meetings
CREATE TABLE IF NOT EXISTS public.lyra_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roomName TEXT NOT NULL,
    host TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. calls
CREATE TABLE IF NOT EXISTS public.lyra_calls (
    id TEXT PRIMARY KEY, -- targetAdmin
    from_user TEXT NOT NULL,
    roomName TEXT NOT NULL,
    status TEXT NOT NULL, -- 'ringing', 'accepted', 'declined'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. perf_reviews
CREATE TABLE IF NOT EXISTS public.lyra_perf_reviews (
    id BIGINT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    meta TEXT,
    score TEXT,
    scoreclass TEXT,
    notes TEXT,
    archived BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. daily_reports
CREATE TABLE IF NOT EXISTS public.lyra_daily_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. scheduling (Availability)
CREATE TABLE IF NOT EXISTS public.lyra_scheduling (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    mon TEXT,
    tue TEXT,
    wed TEXT,
    thu TEXT,
    fri TEXT,
    sat TEXT,
    sun TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. events (Scrims, Meetings, etc.)
CREATE TABLE IF NOT EXISTS public.lyra_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Scrim', 'Meeting', 'Bootcamp', 'Other'
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    description TEXT,
    author TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lyra_events DISABLE ROW LEVEL SECURITY;

-- ENABLE REALTIME FOR ALL TABLES
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
