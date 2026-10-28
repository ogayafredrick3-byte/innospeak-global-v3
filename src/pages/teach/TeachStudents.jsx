import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, ArrowRight, Hash } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses, listCourseEnrollments } from '../../lib/supabase/lms';

const STATUS_FILTERS = ['all', 'active', 'dropped', 'pending', 'completed'];

export default function TeachStudents() {
  const [state, setState] = useState({ loading: true, error: null, courses: [], enrollments: [] });
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    listMyCourses()
      .then(async (courses) => {
        const all = [];
        for (const course of courses || []) {
          try {
            const enrollments = await listCourseEnrollments(course.id);
            for (const e of enrollments) {
              all.push({
                enrollmentId: e.id,
                studentId: e.student_id,
                name: e.profiles?.full_name || '—',
                studentNumber: e.profiles?.student_number || '—',
                email: e.profiles?.email || '—',
                courseId: course.id,
                course: course.title,
                courseCode: course.code || course.programme_code || '—',
                status: e.status,
                enrolledAt: e.enrolled_at,
              });
            }
          } catch { /* skip course on error */ }
        }
        if (!cancelled) setState({ loading: false, error: null, courses: courses || [], enrollments: all });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: 'Could not load enrollments.', courses: [], enrollments: [] });
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let rows = state.enrollments;
    if (selectedCourse !== 'all') rows = rows.filter((r) => r.courseId === selectedCourse);
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status?.toLowerCase() === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [state.enrollments, selectedCourse, statusFilter, search]);

  const courseOptions = state.courses.map((c) => ({ value: c.id, label: c.title }));
  const activeCount = state.enrollments.filter((e) => e.status?.toLowerCase() === 'active').length;

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-navy-900">{r.name}</span>
          <span className="text-xs text-navy-400">{r.email}</span>
        </div>
      ),
    },
    {
      key: 'studentNumber',
      label: 'Admission No.',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-navy-700">
          <Hash size={12} className="text-gold-500" />
          {r.studentNumber}
        </span>
      ),
    },
    { key: 'course', label: 'Course' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'enrolledAt',
      label: 'Enrolled',
      render: (r) =>
        r.enrolledAt
          ? new Date(r.enrolledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Link
          to={`/teach/courses/${r.courseId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700"
        >
          View course <ArrowRight size={12} />
        </Link>
      ),
    },
  ];

  return (
    <>
      <Seo title="Enrollment Management" description="Students enrolled in your courses." path="/teach/students" />
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Enrollment Management</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          {state.enrollments.length} enrollment{state.enrollments.length === 1 ? '' : 's'} across {state.courses.length} course{state.courses.length === 1 ? '' : 's'} · {activeCount} active
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name, admission no, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-navy-200 bg-white py-2 pl-9 pr-3 font-body text-sm text-navy-800 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-navy-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-xl border border-navy-200 bg-white px-3 py-2 font-body text-sm text-navy-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="all">All courses</option>
              {courseOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-navy-200 bg-white px-3 py-2 font-body text-sm text-navy-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        {(search || selectedCourse !== 'all' || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedCourse('all'); setStatusFilter('all'); }}
            className="font-body text-xs font-semibold text-navy-400 hover:text-navy-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-4">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title={state.enrollments.length === 0 ? 'No students yet' : 'No matches'}
              message={
                state.enrollments.length === 0
                  ? 'Students enrolled in your courses will appear here.'
                  : 'Try adjusting your search or filters.'
              }
            />
          )}
          {!state.loading && !state.error && filtered.length > 0 && (
            <>
              <p className="mb-3 font-body text-xs font-semibold text-navy-400">
                Showing {filtered.length} of {state.enrollments.length}
              </p>
              <DataTable columns={columns} rows={filtered} keyField="enrollmentId" />
            </>
          )}
        </SectionCard>
      </div>
    </>
  );
}
