CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  department text NOT NULL,
  designation text NOT NULL,
  manager text,
  joining_date date NOT NULL,
  date_of_birth date,
  phone text,
  status text NOT NULL DEFAULT 'active',
  onboarding_status text DEFAULT 'not-started',
  onboarding_progress integer DEFAULT 0,
  exit_status text DEFAULT 'none',
  exit_progress integer DEFAULT 0,
  last_working_day date,
  avatar text,
  location text,
  employment_type text DEFAULT 'full-time',
  exit_date date,
  exit_interview_notes text,
  fnf_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();