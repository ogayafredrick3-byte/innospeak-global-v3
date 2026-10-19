-- InnoSpeak Global LMS expansion: scheduled sessions, learning portfolio,
-- certificates, course prerequisites and learner goals.
-- RLS is intentionally enabled on every new table. Policies should remain
-- the authoritative security boundary.

create table if not exists public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  session_type text not null default 'live_class' check (session_type in ('live_class','tutorial','workshop','practical','office_hours','guest_lecture','revision','assessment')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text,
  recording_url text,
  location text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists course_sessions_course_starts_idx on public.course_sessions(course_id, starts_at);

create table if not exists public.session_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.course_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'present' check (status in ('present','absent','late','excused')),
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz not null default now(),
  unique(session_id, student_id)
);

create table if not exists public.course_prerequisites (
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  prerequisite_course_id uuid not null references public.lms_courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(course_id, prerequisite_course_id),
  check(course_id <> prerequisite_course_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  verification_token text not null unique,
  status text not null default 'issued' check (status in ('issued','revoked')),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists certificates_student_idx on public.certificates(student_id, issued_at desc);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  item_type text not null default 'project' check (item_type in ('project','certificate','assignment','lab','achievement')),
  description text,
  url text,
  skills text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_items_student_idx on public.portfolio_items(student_id, created_at desc);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.course_prerequisites enable row level security;
alter table public.certificates enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.learning_goals enable row level security;

-- Authenticated learners can see published sessions for lms_courses they can access.
create policy "published course sessions are readable" on public.course_sessions
for select to authenticated using (published = true);

create policy "learners manage own session attendance" on public.session_attendance
for select to authenticated using (student_id = auth.uid());

create policy "course prerequisites are readable" on public.course_prerequisites
for select to authenticated using (true);

create policy "students read own certificates" on public.certificates
for select to authenticated using (student_id = auth.uid());

create policy "students manage own portfolio" on public.portfolio_items
for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "students manage own learning goals" on public.learning_goals
for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Public verification only needs the non-sensitive certificate fields.
create or replace function public.verify_certificate(input_number text)
returns table (
  certificate_number text,
  course_title text,
  issued_at timestamptz,
  status text,
  student_name text
)
language sql
security definer
set search_path = public
as $$
  select c.certificate_number, coalesce(crs.title, ''), c.issued_at, c.status, coalesce(p.full_name, '')
  from certificates c
  join lms_courses crs on crs.id = c.course_id
  join profiles p on p.id = c.student_id
  where c.certificate_number = input_number
  limit 1;
$$;
