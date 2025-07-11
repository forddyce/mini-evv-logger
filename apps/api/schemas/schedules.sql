CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  client_name text NOT NULL,
  client_avatar text,
  service_name text NOT NULL,
  location jsonb NOT NULL,
  shift_date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL, 
  status text NOT NULL DEFAULT 'scheduled',
  visit_start timestamptz,
  visit_end timestamptz,
  start_location jsonb,
  end_location jsonb,
  service_notes text
);

-- Optional: Add RLS policy for public read access (for demo)
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.schedules
  FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users" ON public.schedules
--   FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Enable update for authenticated users" ON public.schedules
--   FOR UPDATE USING (auth.uid() IS NOT NULL);
