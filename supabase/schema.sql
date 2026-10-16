-- ==============================================================================
-- M7 GRAND PRIX — GUEST RSVP & PIT CREW DATABASE SCHEMA
-- Formula 1 7th Birthday Event for Mattheu Amari
-- ==============================================================================

-- 1. Create table for RSVPs
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    attending BOOLEAN NOT NULL DEFAULT true,
    companions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_headcount INTEGER NOT NULL DEFAULT 1,
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone (guests) to insert their RSVP
CREATE POLICY "Allow public RSVP submission" 
ON public.rsvps 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow reading of RSVPs for live Pit Wall telemetry & Admin
CREATE POLICY "Allow public read for telemetry" 
ON public.rsvps 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 5. Optional Index for fast sorting on Pit Wall
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON public.rsvps (attending);
