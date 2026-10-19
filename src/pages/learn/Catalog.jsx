import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Search, Clock, Award, BookOpen, ArrowRight, FlaskConical, GraduationCap } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listPublishedCourses, enrollInCourse } from '../../lib/supabase/lms';
import { resolveLmsCourses } from '../../lib/data/lmsCourse';
import { parseFee } from '../../lib/data/programmeData.js';
import CourseBadges from '../../components/learn/CourseBadges.jsx';
import { cn } from '../../utils/cn.js';

const DIVISION_FILTERS = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'academy', label: 'Academy', icon: GraduationCap },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
];

export default function Catalog() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, courses: [] });
  const [enrollingId, setEnrollingId] = useState(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');

  useEffect(() => {
    listPublishedCourses()
      .then((rows) => setState({ loading: false, error: null, courses: resolveLmsCourses(rows) }))
      .catch((err) =>
        setState({ loading: false, error: err.message || 'Could not load the course catalog.', courses: [] })
      );
  }, []);

  const levels = useMemo(() => {
    const set = new Set();
    state.courses.forEach((c) => { if (c.level) set.add(c.level); });
    return ['all', ...Array.from(set).sort()];
  }, [state.courses]);

  const counts = useMemo(() => ({
    all: state.courses.length,
    academy: state.courses.filter((c) => c.division === 'academy').length,
    labs: state.courses.filter((c) => c.division === 'labs').length,
  }), [state.courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.courses.filter((c) => {
      const matchesSearch =
        !q ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.pathway || '').toLowerCase().includes(q);
      const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
      const matchesDivision = divisionFilter === 'all' || c.division === divisionFilter;
      return matchesSearch && matchesLevel && matchesDivision;
    });
  }, [state.courses, search, levelFilter, divisionFilter]);

  async function handleEnroll(course) {
    const isPaidCatalogueCourse = course.hasCatalogueMatch && !course.isFree && parseFee(course.fees) > 0;
    if (isPaidCatalogueCourse) {
      navigate(`/courses/${course.code}`);
      return;
    }
    setEnrollingId(course.id);
    try {
      await enrollInCourse(course.id);
      navigate(`/learn/courses/${course.id}`);
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not enroll in this course.' }));
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <>
      <Seo title="Browse Courses" description="Find a course to start learning." path="/learn/catalog" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Learn</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Browse Courses</h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            {counts.all > 0
              ? `${counts.all} published course${counts.all === 1 ? '' : 's'} across Academy and Labs.`
              : 'Courses published by InnoSpeak tutors appear here.'}
          </p>
        </div>
        <Link to="/courses" className="btn-outline inline-flex flex-shrink-0 items-center gap-2 text-sm">
          <Compass size={15} aria-hidden="true" />
          Full Catalogue
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, code, or pathway…"
              className="w-full rounded-xl border border-navy-100 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          {levels.length > 2 && (
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none"
            >
              {levels.map((lv) => (
                <option key={lv} value={lv}>{lv === 'all' ? 'All Levels' : lv}</option>
              ))}
            </select>
          )}
        </div>

        {/* Division pills */}
        {state.courses.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {DIVISION_FILTERS.map((d) => {
              const Icon = d.icon;
              const isActive = divisionFilter === d.id;
              const count = counts[d.id] ?? 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDivisionFilter(d.id)}
                  disabled={count === 0 && d.id !== 'all'}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-body text-xs font-bold transition-all',
                    isActive
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700',
                    count === 0 && d.id !== 'all' && 'opacity-40'
                  )}
                >
                  <Icon size={12} />
                  {d.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[10px] font-bold',
                      isActive ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {state.loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="h-5 w-3/4 rounded bg-navy-100" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-navy-50" />
                </div>
                <div className="h-6 w-16 rounded-full bg-navy-50" />
              </div>
              <div className="mt-3 h-4 w-full rounded bg-navy-50" />
              <div className="mt-2 h-4 w-2/3 rounded bg-navy-50" />
              <div className="mt-4 h-9 w-28 rounded-lg bg-navy-50" />
            </div>
          ))}
        </div>
      )}

      {!state.loading && state.error && (
        <SectionCard className="mt-6">
          <ErrorState message={state.error} />
        </SectionCard>
      )}

      {!state.loading && !state.error && state.courses.length === 0 && (
        <SectionCard className="mt-6">
          <EmptyState
            icon={Compass}
            title="No published courses yet"
            message="Check back once an instructor publishes a course."
          />
        </SectionCard>
      )}

      {!state.loading && !state.error && state.courses.length > 0 && filtered.length === 0 && (
        <SectionCard className="mt-6">
          <EmptyState
            icon={Search}
            title="No matching courses"
            message="Try adjusting your search or filters."
          />
        </SectionCard>
      )}

      {!state.loading && !state.error && filtered.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((course) => {
            const isPaidCatalogueCourse = course.hasCatalogueMatch && !course.isFree && parseFee(course.fees) > 0;
            return (
            <div
              key={course.id}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all hover:border-gold-300/60 hover:shadow-premium"
            >
              {/* Badges row */}
              <CourseBadges course={course} size="sm" showDuration={false} />

              {/* Title + description */}
              <h2 className="mt-3 font-display text-base font-bold leading-snug text-navy-900">
                {course.title}
              </h2>
              {course.description && (
                <p className="mt-1.5 line-clamp-2 font-body text-sm leading-6 text-navy-500">
                  {course.description}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {course.duration && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <Clock size={12} className="text-navy-400" />
                    {course.duration}
                  </span>
                )}
                {course.estimated_hours && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <BookOpen size={12} className="text-navy-400" />
                    {course.estimated_hours}h
                  </span>
                )}
                {course.awards_certificate !== false && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <Award size={12} className="text-navy-400" />
                    Certificate
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-4">
                <button
                  type="button"
                  onClick={() => handleEnroll(course)}
                  disabled={!isPaidCatalogueCourse && enrollingId === course.id}
                  className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
                >
                  {isPaidCatalogueCourse ? 'View pricing & enroll' : enrollingId === course.id ? 'Enrolling…' : 'Enroll Now'}
                  {(!isPaidCatalogueCourse && enrollingId !== course.id || isPaidCatalogueCourse) && <ArrowRight size={14} />}
                </button>
                {course.hasCatalogueMatch && course.code && (
                  <Link
                    to={`/courses/${course.code}`}
                    className="font-body text-xs font-bold text-gold-700 hover:text-gold-800"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </>
  );
}