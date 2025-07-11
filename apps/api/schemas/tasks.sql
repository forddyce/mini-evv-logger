CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  description text NOT NULL,
  completed boolean NOT NULL DEFAULT FALSE,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Optional: Add RLS policy for public read access (for demo)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT USING (true);
