import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listTimetableEntriesAdmin,
  createTimetableEntry,
  deleteTimetableEntry,
  listExamsAdmin,
  createExam,
  deleteExam,
  listUnits,
  listSemesters,
} from '../../lib/supabase/admin';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SESSION_TYPES = [{ value: 'lecture', label: 'Lecture' }, { value: 'practical', label: 'Practical' }, { value: 'seminar', label: 'Seminar' }];
const EXAM_TYPES = [{ value: 'cat', label: 'CAT' }, { value: 'final', label: 'Final' }, { value: 'supplementary', label: 'Supplementary' }];

const emptyTimetableForm = { unit_id: '', semester_id: '', day_of_week: 'Monday', start_time: '', end_time: '', venue: '', session_type: 'lecture', lecturer_name: '' };
const emptyExamForm = { unit_id: '', semester_id: '', exam_date: '', start_time: '', end_time: '', venue: '', exam_type: 'final' };

function formatTime(t) {
  return t ? t.slice(0, 5) : '—';
}

export default function TimetableExams() {
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [units, setUnits] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timetableForm, setTimetableForm] = useState(emptyTimetableForm);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([listTimetableEntriesAdmin(), listExamsAdmin(), listUnits(), listSemesters()])
      .then(([tt, ex, u, s]) => {
        setTimetable(tt);
        setExams(ex);
        setUnits(u);
        setSemesters(s);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Could not load timetable and exams.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddTimetable(e) {
    e.preventDefault();
    if (!timetableForm.unit_id || !timetableForm.start_time || !timetableForm.end_time) return;
    setSaving(true);
    try {
      await createTimetableEntry(timetableForm);
      setTimetableForm(emptyTimetableForm);
      load();
    } catch (err) {
      setError(err.message || 'Could not add this timetable entry.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTimetable(id) {
    try {
      await deleteTimetableEntry(id);
      load();
    } catch (err) {
      setError(err.message || 'Could not delete this timetable entry.');
    }
  }

  async function handleAddExam(e) {
    e.preventDefault();
    if (!examForm.unit_id || !examForm.exam_date) return;
    setSaving(true);
    try {
      await createExam(examForm);
      setExamForm(emptyExamForm);
      load();
    } catch (err) {
      setError(err.message || 'Could not schedule this exam.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteExam(id) {
    try {
      await deleteExam(id);
      load();
    } catch (err) {
      setError(err.message || 'Could not delete this exam.');
    }
  }

  const unitOptions = units.map((u) => ({ value: u.id, label: `${u.code} — ${u.title}` }));
  const semesterOptions = semesters.map((s) => ({ value: s.id, label: `${s.name} (${s.academic_year})` }));

  const timetableColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'day', label: 'Day', render: (r) => r.day_of_week },
    { key: 'time', label: 'Time', render: (r) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}` },
    { key: 'venue', label: 'Venue', render: (r) => r.venue || '—' },
    { key: 'type', label: 'Type', render: (r) => r.session_type },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button type="button" onClick={() => handleDeleteTimetable(r.id)} className="inline-flex items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700">
          <Trash2 size={13} />
          Delete
        </button>
      ),
    },
  ];

  const examColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'date', label: 'Date', render: (r) => (r.exam_date ? new Date(r.exam_date).toLocaleDateString() : '—') },
    { key: 'time', label: 'Time', render: (r) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}` },
    { key: 'venue', label: 'Venue', render: (r) => r.venue || '—' },
    { key: 'type', label: 'Type', render: (r) => r.exam_type },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button type="button" onClick={() => handleDeleteExam(r.id)} className="inline-flex items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700">
          <Trash2 size={13} />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Seo title="Timetable & Exams" description="Schedule classes and examinations." path="/admin/timetable-exams" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Timetable &amp; Exams</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Schedule classes and examinations — students see these on their own Timetable and Exams pages.</p>
      </div>

      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      {loading ? (
        <div className="mt-8"><LoadingState /></div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Add Class Session" className="lg:col-span-1">
              <form onSubmit={handleAddTimetable} className="space-y-3">
                <SelectField label="Unit" name="tt_unit" value={timetableForm.unit_id} onChange={(e) => setTimetableForm((p) => ({ ...p, unit_id: e.target.value }))} options={unitOptions} required />
                <SelectField label="Semester" name="tt_semester" optional value={timetableForm.semester_id} onChange={(e) => setTimetableForm((p) => ({ ...p, semester_id: e.target.value }))} options={semesterOptions} />
                <SelectField label="Day" name="tt_day" value={timetableForm.day_of_week} onChange={(e) => setTimetableForm((p) => ({ ...p, day_of_week: e.target.value }))} options={DAYS} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Start Time" name="tt_start" type="time" value={timetableForm.start_time} onChange={(e) => setTimetableForm((p) => ({ ...p, start_time: e.target.value }))} required />
                  <TextField label="End Time" name="tt_end" type="time" value={timetableForm.end_time} onChange={(e) => setTimetableForm((p) => ({ ...p, end_time: e.target.value }))} required />
                </div>
                <TextField label="Venue" name="tt_venue" optional value={timetableForm.venue} onChange={(e) => setTimetableForm((p) => ({ ...p, venue: e.target.value }))} />
                <SelectField label="Session Type" name="tt_type" value={timetableForm.session_type} onChange={(e) => setTimetableForm((p) => ({ ...p, session_type: e.target.value }))} options={SESSION_TYPES} />
                <TextField label="Lecturer" name="tt_lecturer" optional value={timetableForm.lecturer_name} onChange={(e) => setTimetableForm((p) => ({ ...p, lecturer_name: e.target.value }))} />
                <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
                  <Plus size={16} />
                  Add Session
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Class Timetable" className="lg:col-span-2">
              {timetable.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No sessions scheduled" message="Add your first class session using the form on the left." />
              ) : (
                <DataTable columns={timetableColumns} rows={timetable} />
              )}
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Schedule Exam" className="lg:col-span-1">
              <form onSubmit={handleAddExam} className="space-y-3">
                <SelectField label="Unit" name="ex_unit" value={examForm.unit_id} onChange={(e) => setExamForm((p) => ({ ...p, unit_id: e.target.value }))} options={unitOptions} required />
                <SelectField label="Semester" name="ex_semester" optional value={examForm.semester_id} onChange={(e) => setExamForm((p) => ({ ...p, semester_id: e.target.value }))} options={semesterOptions} />
                <TextField label="Exam Date" name="ex_date" type="date" value={examForm.exam_date} onChange={(e) => setExamForm((p) => ({ ...p, exam_date: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Start Time" name="ex_start" type="time" value={examForm.start_time} onChange={(e) => setExamForm((p) => ({ ...p, start_time: e.target.value }))} />
                  <TextField label="End Time" name="ex_end" type="time" value={examForm.end_time} onChange={(e) => setExamForm((p) => ({ ...p, end_time: e.target.value }))} />
                </div>
                <TextField label="Venue" name="ex_venue" optional value={examForm.venue} onChange={(e) => setExamForm((p) => ({ ...p, venue: e.target.value }))} />
                <SelectField label="Exam Type" name="ex_type" value={examForm.exam_type} onChange={(e) => setExamForm((p) => ({ ...p, exam_type: e.target.value }))} options={EXAM_TYPES} />
                <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
                  <Plus size={16} />
                  Schedule Exam
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Exam Timetable" className="lg:col-span-2">
              {exams.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No exams scheduled" message="Schedule your first exam using the form on the left." />
              ) : (
                <DataTable columns={examColumns} rows={exams} />
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </>
  );
}
