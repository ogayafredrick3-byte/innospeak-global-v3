import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses, listCourseEnrollments } from '../../lib/supabase/lms';

export default function TeachStudents() {
  const [state, setState] = useState({ loading: true, error: null, courses: [], students: [] });

  useEffect(() => {
    listMyCourses()
      .then(async (courses) => {
        const allStudents = [];
        for (const course of courses || []) {
          try {
            const enrollments = await listCourseEnrollments(course.id);
            for (const e of enrollments) {
              allStudents.push({
                id: e.id,
                name: e.profiles?.full_name || '—',
                studentNumber: e.profiles?.student_number || '—',
                course: course.title,
                status: e.status,
              });
            }
          } catch { /* skip */ }
        }
        setState({ loading: false, error: null, courses, students: allStudents });
      })
      .catch(() => setState({ loading: false, error: 'Could not load students.', courses: [], students: [] }));
  }, []);

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'studentNumber', label: 'Student ID' },
    { key: 'course', label: 'Course' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <Seo title="Students" description="Students enrolled in your courses." path="/teach/students" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Students</h1>
        <p className="mt-2 font-body text-sm text-navy-500">All students enrolled across your courses.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.students.length === 0 && (
            <EmptyState icon={Users} title="No students yet" message="Students enrolled in your courses will appear here." />
          )}
          {!state.loading && !state.error && state.students.length > 0 && (
            <DataTable columns={columns} rows={state.students} />
          )}
        </SectionCard>
      </div>
    </>
  );
}
