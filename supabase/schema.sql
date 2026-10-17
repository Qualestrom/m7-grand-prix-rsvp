-- ==============================================================================
-- M7 GRAND PRIX — GUEST RSVP & PIT CREW DATABASE SCHEMA
-- Formula 1 7th Birthday Event for Mattheu Amari
-- ==============================================================================

-- 1. Create table for RSVPs
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Guest',
    attending BOOLEAN NOT NULL DEFAULT true,
    companions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_headcount INTEGER NOT NULL DEFAULT 1,
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow inserting RSVPs (public guests & admin)
DROP POLICY IF EXISTS "Allow public RSVP submission" ON public.rsvps;
CREATE POLICY "Allow public RSVP submission" 
ON public.rsvps 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow reading RSVPs for telemetry & Pit Wall Admin
DROP POLICY IF EXISTS "Allow public read for telemetry" ON public.rsvps;
CREATE POLICY "Allow public read for telemetry" 
ON public.rsvps 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 5. Policy: Allow updating RSVPs (guests modifying details or admin updating)
DROP POLICY IF EXISTS "Allow public update for RSVPs" ON public.rsvps;
CREATE POLICY "Allow public update for RSVPs" 
ON public.rsvps 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Policy: Allow deleting RSVPs (admin removing records)
DROP POLICY IF EXISTS "Allow public delete for RSVPs" ON public.rsvps;
CREATE POLICY "Allow public delete for RSVPs" 
ON public.rsvps 
FOR DELETE 
TO anon, authenticated
USING (true);

-- 7. Indexes for fast sorting and querying on Pit Wall
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON public.rsvps (attending);
