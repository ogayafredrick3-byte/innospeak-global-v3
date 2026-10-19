-- LMS core tables

CREATE TABLE IF NOT EXISTS lms_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  code text,
  description text DEFAULT '',
  thumbnail_path text DEFAULT '',
  category text DEFAULT '',
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  duration text DEFAULT '',
  language text DEFAULT 'English',
  requirements text DEFAULT '',
  learning_outcomes jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'published', 'rejected', 'changes_requested')),
  created_by uuid REFERENCES auth.users(id),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_notes text DEFAULT '',
  reviewed_at timestamptz,
  awards_certificate boolean DEFAULT true,
  requires_lesson_completion boolean DEFAULT true,
  requires_quiz_pass boolean DEFAULT false,
  requires_assignment_completion boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lms_courses_status ON lms_courses(status);
CREATE INDEX IF NOT EXISTS idx_lms_courses_created_by ON lms_courses(created_by);

CREATE TABLE IF NOT EXISTS course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'co_instructor', 'assistant')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);
CREATE INDEX IF NOT EXISTS idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor ON course_instructors(instructor_id);

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, position);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'pdf', 'audio', 'presentation', 'link')),
  content text DEFAULT '',
  learning_objectives jsonb DEFAULT '[]'::jsonb,
  video_url text DEFAULT '',
  external_url text DEFAULT '',
  practical_activity text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, position);

CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'downloadable' CHECK (resource_type IN ('video', 'pdf', 'audio', 'presentation', 'document', 'link', 'downloadable')),
  external_url text DEFAULT '',
  file_url text DEFAULT '',
  file_type text DEFAULT '',
  file_size_bytes bigint,
  description text DEFAULT '',
  is_downloadable boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

CREATE TABLE IF NOT EXISTS lms_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (course_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON lms_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON lms_enrollments(student_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  instructions text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  passing_score_percent integer NOT NULL DEFAULT 70,
  max_attempts integer NOT NULL DEFAULT 3,
  time_limit_minutes integer,
  require_pass_to_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  question_text text NOT NULL,
  marks integer NOT NULL DEFAULT 1,
  explanation text,
  correct_short_answer text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_question_options(question_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES lms_enrollments(id) ON DELETE SET NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 0,
  score_percent numeric DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_student ON quiz_attempts(quiz_id, student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_attempt_number ON quiz_attempts(quiz_id, student_id, attempt_number);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  text_answer text,
  is_correct boolean,
  awarded_marks numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_answers_attempt_question ON quiz_answers(attempt_id, question_id);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  instructions text DEFAULT '',
  description text DEFAULT '',
  learning_objectives jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  max_score integer NOT NULL DEFAULT 100,
  submission_type text NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'text_file')),
  allowed_file_types text DEFAULT '',
  max_file_size_mb integer DEFAULT 10,
  allow_multiple_submissions boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES lms_enrollments(id) ON DELETE SET NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  text_response text DEFAULT '',
  file_url text DEFAULT '',
  file_name text DEFAULT '',
  is_late boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
  score integer,
  feedback text DEFAULT '',
  graded_by uuid REFERENCES auth.users(id),
  graded_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text DEFAULT '',
  is_instructor_reply boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grade_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight numeric NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES lms_enrollments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  course_title text NOT NULL,
  instructor_name text,
  issue_date timestamptz NOT NULL DEFAULT now(),
  completion_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  revoke_reason text,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);

CREATE TABLE IF NOT EXISTS course_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES lms_enrollments(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  lessons_total integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  quizzes_total integer NOT NULL DEFAULT 0,
  quizzes_passed integer NOT NULL DEFAULT 0,
  assignments_total integer NOT NULL DEFAULT 0,
  assignments_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id)
);
CREATE INDEX IF NOT EXISTS idx_completions_student ON course_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_completions_course ON course_completions(course_id);

CREATE TABLE IF NOT EXISTS course_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  session_type text NOT NULL DEFAULT 'live_class' CHECK (session_type IN ('live_class','tutorial','workshop','practical','office_hours','guest_lecture','revision','assessment')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  meeting_url text,
  recording_url text,
  location text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS course_sessions_course_starts_idx ON course_sessions(course_id, starts_at);

CREATE TABLE IF NOT EXISTS session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  item_type text NOT NULL DEFAULT 'project' CHECK (item_type IN ('project','certificate','assignment','lab','achievement')),
  description text,
  url text,
  skills text[] NOT NULL DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_items_student_idx ON portfolio_items(student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS learning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_prerequisites (
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  prerequisite_course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, prerequisite_course_id),
  CHECK (course_id <> prerequisite_course_id)
);

CREATE TABLE IF NOT EXISTS cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  description text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','completed','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_name text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','withdrawn')),
  UNIQUE (cohort_id, student_id)
);
CREATE INDEX IF NOT EXISTS cohort_members_student_idx ON cohort_members(student_id);

CREATE TABLE IF NOT EXISTS grade_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_name text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0),
  max_score numeric NOT NULL CHECK (max_score > 0),
  feedback text,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id, component_name)
);
CREATE INDEX IF NOT EXISTS grade_entries_course_student_idx ON grade_entries(course_id, student_id);

CREATE TABLE IF NOT EXISTS learning_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES lms_courses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_weeks integer,
  published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES learning_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (project_id, position)
);

CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES learning_projects(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','withdrawn')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);

CREATE TABLE IF NOT EXISTS project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  comment text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','needs_revision','approved')),
  score numeric,
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (milestone_id, student_id)
);

CREATE TABLE IF NOT EXISTS career_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organisation text NOT NULL,
  opportunity_type text NOT NULL DEFAULT 'internship' CHECK (opportunity_type IN ('internship','job','scholarship','volunteer','project')),
  location text,
  remote boolean NOT NULL DEFAULT false,
  description text,
  application_url text,
  closing_date date,
  skills text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  goal text NOT NULL,
  preferred_schedule text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','scheduled','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS student_number_seq START 1;

-- Applications bridge columns
ALTER TABLE applications ADD COLUMN IF NOT EXISTS student_number text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS admitted_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lms_course_id uuid REFERENCES lms_courses(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lms_enrollment_status text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_notes text;
CREATE INDEX IF NOT EXISTS idx_applications_admitted_profile ON applications(admitted_profile_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);