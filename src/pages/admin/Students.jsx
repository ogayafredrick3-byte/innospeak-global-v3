import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listStudents, createStudentAccount, listPrograms } from '../../lib/supabase/admin';

function generateTempPassword() {
  return `Isg${Math.random().toString(36).slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

const emptyForm = {
  fullName: '',
  email: '',
  courseCode: '',
  password: generateTempPassword(),
  programId: '',
  department: '',
  levelYear: '',
  academicYear: '',
};

export default function Students() {
  const [state, setState] = useState({ loading: true, error: null, students: [] });
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [created, setCreated] = useState(null);

  function load() {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    listStudents()
      .then((students) => setState({ loading: false, error: null, students }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load students.', students: [] }));
  }

  useEffect(() => {
    load();
    listPrograms().then(setPrograms).catch(() => setPrograms([]));
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreated(null);
    try {
      const result = await createStudentAccount(form);
      setCreated({ studentNumber: result.studentNumber, email: form.email, password: form.password });
      setForm({ ...emptyForm, password: generateTempPassword() });
      load();
    } catch (err) {
      setCreateError(err.message || 'Could not create the student account.');
    } finally {
      setCreating(false);
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (r) => (
        <Link to={`/admin/students/${r.id}`} className="font-semibold text-navy-900 hover:text-gold-700">
          {r.full_name || 'Unnamed'}
        </Link>
      ),
    },
    { key: 'student_number', label: 'Student ID', render: (r) => r.student_number || '—' },
    { key: 'program', label: 'Program', render: (r) => r.programs?.name || r.department || '—' },
    { key: 'level_year', label: 'Level/Year', render: (r) => r.level_year || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.student_status} /> },
  ];

  return (
    <>
      <Seo title="Students" description="Manage student accounts." path="/admin/students" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Students</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Issue a Student ID and temporary password once a student has been admitted to a program.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Create Student Account" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange('fullName')} required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange('email')} required />
            <TextField label="Course Code" name="courseCode" value={form.courseCode} onChange={handleChange('courseCode')} placeholder="e.g. ENG101, WEB101, ELE201" required />
            <TextField label="Temporary Password" name="password" value={form.password} onChange={handleChange('password')} required />
            <SelectField
              label="Program"
              name="programId"
              value={form.programId}
              onChange={handleChange('programId')}
              options={programs.map((p) => ({ value: p.id, label: p.name }))}
              optional
            />
            <TextField label="Department" name="department" optional value={form.department} onChange={handleChange('department')} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Level / Year" name="levelYear" optional value={form.levelYear} onChange={handleChange('levelYear')} />
              <TextField label="Academic Year" name="academicYear" optional value={form.academicYear} onChange={handleChange('academicYear')} />
            </div>

            {createError && <ErrorState message={createError} />}
            {created && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-900">
                Account created for <strong>{created.studentNumber}</strong>. Share these credentials with the
                student securely — they will be required to set their own password on first login:
                <br />
                Email: {created.email}
                <br />
                Temporary password: {created.password}
              </div>
            )}

            <button type="submit" disabled={creating} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <UserPlus size={16} />
              {creating ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Students" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.students.length === 0 && (
            <EmptyState icon={Users} title="No students yet" message="Create the first student account using the form on the left." />
          )}
          {!state.loading && !state.error && state.students.length > 0 && <DataTable columns={columns} rows={state.students} />}
        </SectionCard>
      </div>
    </>
  );
}
