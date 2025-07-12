CREATE TABLE public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id text NOT NULL,
    client_name text NOT NULL,
    client_avatar text,
    service_name text NOT NULL,
    location jsonb NOT NULL, -- Stores Latitude, Longitude, Address as JSON
    shift_date text NOT NULL, -- e.g., "Mon, 15 Jan 2025"
    start_time text NOT NULL, -- e.g., "09:00"
    end_time text NOT NULL,   -- e.g., "10:00"
    status text NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    visit_start timestamptz, -- Actual clock-in timestamp
    visit_end timestamptz,   -- Actual clock-out timestamp
    start_location jsonb,    -- Location at clock-in (JSONB)
    end_location jsonb,      -- Location at clock-out (JSONB)
    service_notes text
);

-- Optional: Add RLS policy for public read access (for demo)
-- For production, you'd want more granular policies based on user roles.
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Enable read access for all users
CREATE POLICY "Enable read access for all users" ON public.schedules
  FOR SELECT USING (true);

-- Enable insert for authenticated users (or true for demo simplicity with service role)
CREATE POLICY "Enable insert for authenticated users" ON public.schedules
  FOR INSERT WITH CHECK (true); -- Changed to true for demo simplicity, service role bypasses auth.uid()

-- Enable update for authenticated users (or true for demo simplicity with service role)
CREATE POLICY "Enable update for authenticated users" ON public.schedules
  FOR UPDATE USING (true); -- Changed to true for demo simplicity, service role bypasses auth.uid()
