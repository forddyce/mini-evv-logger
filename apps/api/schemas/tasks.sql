CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE, -- Foreign key to schedules
    description text NOT NULL,
    completed boolean NOT NULL DEFAULT FALSE,
    reason text, -- Optional reason if not completed
    created_at timestamptz DEFAULT now()
);

-- Optional: Add RLS policy for public read access (for demo)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Enable read access for all users
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT USING (true);

-- Enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON public.tasks
  FOR INSERT WITH CHECK (true); -- Changed to true for demo simplicity

-- Enable update for authenticated users
CREATE POLICY "Enable update for authenticated users" ON public.tasks
  FOR UPDATE USING (true); -- Changed to true for demo simplicity
