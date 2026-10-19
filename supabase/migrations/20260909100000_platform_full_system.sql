-- InnoSpeak Global — production learning/institutional workflow expansion.
-- Run after all previous LMS migrations.

-- ============================================================
-- Cohorts / classes
-- ============================================================
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  description text,
  program_id uuid references public.programs(id) on delete set null,
  start_date date,
  end_date date,
  status text not null default 'planned' check (status in ('planned','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  group_name text,
  joined_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  unique(cohort_id, student_id)
);

create index if not exists cohorts_status_idx on public.cohorts(status);
create index if not exists cohort_members_student_idx on public.cohort_members(student_id);

alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;

drop policy if exists "cohorts_read_authenticated" on public.cohorts;
create policy "cohorts_read_authenticated" on public.cohorts for select to authenticated using (true);
drop policy if exists "cohorts_admin_manage" on public.cohorts;
create policy "cohorts_admin_manage" on public.cohorts for all to authenticated using (is_lms_admin()) with check (is_lms_admin());
drop policy if exists "cohort_members_own_or_staff" on public.cohort_members;
create policy "cohort_members_own_or_staff" on public.cohort_members for select to authenticated using (student_id = auth.uid() or is_lms_admin());
drop policy if exists "cohort_members_admin_manage" on public.cohort_members;
create policy "cohort_members_admin_manage" on public.cohort_members for all to authenticated using (is_lms_admin()) with check (is_lms_admin());

-- ============================================================
-- Live session attendance / instructor management
-- ============================================================
drop policy if exists "learners manage own session attendance" on public.session_attendance;
create policy "learners manage own session attendance" on public.session_attendance
for select to authenticated using (student_id = auth.uid());
create policy "learners check in session" on public.session_attendance
for insert to authenticated with check (student_id = auth.uid());
create policy "learners update own attendance" on public.session_attendance
for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "instructors manage session attendance" on public.session_attendance
for all to authenticated using (exists (select 1 from course_sessions s where s.id = session_id and is_course_instructor(s.course_id)))
with check (exists (select 1 from course_sessions s where s.id = session_id and is_course_instructor(s.course_id)));

create policy "instructors create sessions" on public.course_sessions
for insert to authenticated with check (is_course_instructor(course_id));
create policy "instructors update sessions" on public.course_sessions
for update to authenticated using (is_course_instructor(course_id)) with check (is_course_instructor(course_id));
create policy "instructors delete sessions" on public.course_sessions
for delete to authenticated using (is_course_instructor(course_id));

-- ============================================================
-- Manual gradebook entries / practical assessment
-- ============================================================
create table if not exists public.grade_entries (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  component_name text not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz not null default now(),
  unique(course_id, student_id, component_name)
);
create index if not exists grade_entries_course_student_idx on public.grade_entries(course_id, student_id);
alter table public.grade_entries enable row level security;
drop policy if exists "grade entries student read own" on public.grade_entries;
create policy "grade entries student read own" on public.grade_entries for select to authenticated using (student_id = auth.uid());
drop policy if exists "grade entries instructor manage" on public.grade_entries;
create policy "grade entries instructor manage" on public.grade_entries for all to authenticated using (is_course_instructor(course_id)) with check (is_course_instructor(course_id));

-- ============================================================
-- Practical projects / milestones
-- ============================================================
create table if not exists public.learning_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.lms_courses(id) on delete set null,
  title text not null,
  description text,
  difficulty text not null default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),
  duration_weeks integer,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.learning_projects(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  unique(project_id, position)
);
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.learning_projects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  joined_at timestamptz not null default now(),
  unique(project_id, student_id)
);
create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.project_milestones(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_url text,
  comment text,
  status text not null default 'submitted' check (status in ('submitted','reviewed','needs_revision','approved')),
  score numeric,
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  unique(milestone_id, student_id)
);

alter table public.learning_projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_members enable row level security;
alter table public.project_submissions enable row level security;
create policy "published projects readable" on public.learning_projects for select to authenticated using (published = true or is_lms_admin() or created_by = auth.uid());
create policy "project staff manage" on public.learning_projects for all to authenticated using (is_lms_admin() or created_by = auth.uid()) with check (is_lms_admin() or created_by = auth.uid());
create policy "project milestones readable" on public.project_milestones for select to authenticated using (exists (select 1 from learning_projects p where p.id = project_id and (p.published or p.created_by = auth.uid() or is_lms_admin())));
create policy "project milestones staff manage" on public.project_milestones for all to authenticated using (exists (select 1 from learning_projects p where p.id = project_id and (p.created_by = auth.uid() or is_lms_admin()))) with check (exists (select 1 from learning_projects p where p.id = project_id and (p.created_by = auth.uid() or is_lms_admin())));
create policy "project members own or staff" on public.project_members for select to authenticated using (student_id = auth.uid() or is_lms_admin());
create policy "project members self join" on public.project_members for insert to authenticated with check (student_id = auth.uid() and exists (select 1 from learning_projects p where p.id = project_id and p.published = true));
create policy "project members staff" on public.project_members for all to authenticated using (is_lms_admin()) with check (is_lms_admin());
create policy "project submissions own read" on public.project_submissions for select to authenticated using (student_id = auth.uid() or is_lms_admin() or exists (select 1 from project_milestones pm join learning_projects p on p.id = pm.project_id where pm.id = milestone_id and is_course_instructor(p.course_id)));
create policy "project submissions own write" on public.project_submissions for insert to authenticated with check (student_id = auth.uid());
create policy "project submissions own update" on public.project_submissions for update to authenticated using (student_id = auth.uid() or is_lms_admin() or exists (select 1 from project_milestones pm join learning_projects p on p.id = pm.project_id where pm.id = milestone_id and is_course_instructor(p.course_id))) with check (student_id = auth.uid() or is_lms_admin() or exists (select 1 from project_milestones pm join learning_projects p on p.id = pm.project_id where pm.id = milestone_id and is_course_instructor(p.course_id)));

-- ============================================================
-- Career / mentorship
-- ============================================================
create table if not exists public.career_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organisation text not null,
  opportunity_type text not null default 'internship' check (opportunity_type in ('internship','job','scholarship','volunteer','project')),
  location text,
  remote boolean not null default false,
  description text,
  application_url text,
  closing_date date,
  skills text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  goal text not null,
  preferred_schedule text,
  message text,
  status text not null default 'pending' check (status in ('pending','matched','scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.career_opportunities enable row level security;
alter table public.mentorship_requests enable row level security;
create policy "published career opportunities readable" on public.career_opportunities for select to authenticated using (published = true or is_lms_admin());
create policy "career staff manage" on public.career_opportunities for all to authenticated using (is_lms_admin()) with check (is_lms_admin());
create policy "mentorship own or staff" on public.mentorship_requests for select to authenticated using (student_id = auth.uid() or mentor_id = auth.uid() or is_lms_admin());
create policy "mentorship student create" on public.mentorship_requests for insert to authenticated with check (student_id = auth.uid());
create policy "mentorship student update" on public.mentorship_requests for update to authenticated using (student_id = auth.uid() or mentor_id = auth.uid() or is_lms_admin()) with check (student_id = auth.uid() or mentor_id = auth.uid() or is_lms_admin());

-- ============================================================
-- Admissions workflow
-- ============================================================
alter table public.applications add column if not exists status text not null default 'submitted';
alter table public.applications add column if not exists reviewed_at timestamptz;
alter table public.applications add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.applications add column if not exists review_notes text;
create index if not exists applications_status_idx on public.applications(status);

-- ============================================================
-- Certificate verification: safe public RPC already exists; expose execute.
-- ============================================================
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ============================================================
-- Updated-at triggers
-- ============================================================
drop trigger if exists trg_cohorts_updated_at on public.cohorts;
create trigger trg_cohorts_updated_at before update on public.cohorts for each row execute function public.set_updated_at();
drop trigger if exists trg_mentorship_updated_at on public.mentorship_requests;
create trigger trg_mentorship_updated_at before update on public.mentorship_requests for each row execute function public.set_updated_at();

-- Replace broad session visibility with course-scoped visibility.
drop policy if exists "published course sessions are readable" on public.course_sessions;
create policy "published sessions accessible by enrolled learners or staff" on public.course_sessions
for select to authenticated using (
  published = true and (is_lms_admin() or is_course_instructor(course_id) or is_enrolled(course_id))
);

-- Automatically issue one certificate when an enrollment becomes completed.
create or replace function public.issue_course_certificate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_number text;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select coalesce(code, 'COURSE') into v_code from lms_courses where id = new.course_id;
    v_number := 'ISG-' || to_char(now(), 'YYYY') || '-' || upper(v_code) || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    insert into certificates(student_id, course_id, certificate_number, verification_token, metadata)
    values(new.student_id, new.course_id, v_number, replace(gen_random_uuid()::text,'-',''), jsonb_build_object('issued_automatically', true))
    on conflict (student_id, course_id) do nothing;
  end if;
  return new;
end;
$$;

create unique index if not exists certificates_student_course_uidx on public.certificates(student_id, course_id);
drop trigger if exists trg_issue_course_certificate on public.lms_enrollments;
create trigger trg_issue_course_certificate after update on public.lms_enrollments for each row execute function public.issue_course_certificate();
