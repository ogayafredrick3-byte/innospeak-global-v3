import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, BookOpen, ArrowUp, ArrowDown, Eye, Send,
  CheckCircle2, AlertCircle, X, Save, Users, GripVertical, Pencil,
  ExternalLink, Wand2, Link2,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import CourseCatalogPicker from '../../components/teach/CourseCatalogPicker.jsx';
import { supabase } from '../../lib/supabase/client';
import {
  getCourse, updateCourse, listModulesWithLessons,
  createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
  uploadCourseThumbnail,
  submitCourseForReview,
  reorderModules, reorderLessons,
} from '../../lib/supabase/lms';
import { resolveLmsCourse } from '../../lib/data/lmsCourse';
import CourseBadges from '../../components/learn/CourseBadges.jsx';

const LESSON_TYPES = [
  { value: 'text', label: 'Text / Reading' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'audio', label: 'Audio' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'link', label: 'External Link' },
];

const EDITABLE_STATUSES = ['draft', 'rejected', 'changes_requested'];

/* ──────────────────────────────────────────────────────────────
   Lesson row (unchanged)
   ────────────────────────────────────────────────────────────── */

function LessonRow({ lesson, onMoveUp, onMoveDown, canUp, canDown, onDelete, isPreview }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-navy-50/60 px-3 py-2">
      {!isPreview && <GripVertical size={12} className="text-navy-300" />}
      <BookOpen size={13} className="text-navy-400" />
      <span className="flex-1 font-body text-sm text-navy-800">
        {lesson.title} <span className="text-xs text-navy-400">({lesson.content_type})</span>
        {lesson.status === 'published' && (
          <span className="ml-2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">
            Published
          </span>
        )}
      </span>
      {!isPreview && (
        <div className="flex items-center gap-1">
          <Link
            to={`/teach/lessons/${lesson.id}`}
            className="text-navy-400 hover:text-gold-600"
            title="Edit lesson content"
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            disabled={!canUp}
            onClick={onMoveUp}
            className="text-navy-400 hover:text-gold-600 disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            disabled={!canDown}
            onClick={onMoveDown}
            className="text-navy-400 hover:text-gold-600 disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-navy-400 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Module card (unchanged except editor link pass-through)
   ────────────────────────────────────────────────────────────── */

function ModuleCard({ module, index, totalModules, onChanged, isPreview }) {
  const [lessonForm, setLessonForm] = useState({ title: '', content_type: 'text', content: '' });
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(module.title);

  async function handleMoveUp() {
    if (index === 0) return;
    const { data: allMods } = await supabase
      .from('modules').select('id').eq('course_id', module.course_id).order('position');
    const ids = allMods.map((m) => m.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderModules(module.course_id, ids);
    onChanged();
  }

  async function handleMoveDown() {
    if (index === totalModules - 1) return;
    const { data: allMods } = await supabase
      .from('modules').select('id').eq('course_id', module.course_id).order('position');
    const ids = allMods.map((m) => m.id);
    [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
    await reorderModules(module.course_id, ids);
    onChanged();
  }

  async function handleSaveTitle() {
    if (titleDraft.trim() && titleDraft !== module.title) {
      await updateModule(module.id, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
    onChanged();
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    if (!lessonForm.title) return;
    await createLesson(module.id, { ...lessonForm, position: module.lessons.length });
    setLessonForm({ title: '', content_type: 'text', content: '' });
    setShowAddLesson(false);
    onChanged();
  }

  async function handleLessonMove(lessonIdx, direction) {
    const lessons = [...module.lessons].sort((a, b) => a.position - b.position);
    if (direction === 'up' && lessonIdx === 0) return;
    if (direction === 'down' && lessonIdx === lessons.length - 1) return;
    const swapIdx = direction === 'up' ? lessonIdx - 1 : lessonIdx + 1;
    const tmp = lessons[lessonIdx].id;
    lessons[lessonIdx] = { ...lessons[lessonIdx], id: lessons[swapIdx].id };
    lessons[swapIdx] = { ...lessons[swapIdx], id: tmp };
    await reorderLessons(module.id, lessons.map((l) => l.id));
    onChanged();
  }

  async function handleDeleteLesson(lessonId) {
    await deleteLesson(lessonId);
    onChanged();
  }

  const sortedLessons = [...(module.lessons || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        {!isPreview && editingTitle ? (
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            className="flex-1 rounded-lg border border-gold-500 px-3 py-1.5 font-display text-base font-bold text-navy-900 focus:outline-none"
          />
        ) : (
          <h3
            className={`font-display text-base font-bold text-navy-900 ${!isPreview ? 'cursor-pointer hover:text-gold-600' : ''}`}
            onClick={() => !isPreview && setEditingTitle(true)}
          >
            {module.title}
          </h3>
        )}
        {!isPreview && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={handleMoveUp}
              className="text-navy-400 hover:text-gold-600 disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              disabled={index === totalModules - 1}
              onClick={handleMoveDown}
              className="text-navy-400 hover:text-gold-600 disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm('Delete this module and all its lessons?')) {
                  await deleteModule(module.id);
                  onChanged();
                }
              }}
              className="text-navy-400 hover:text-rose-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      {module.description && <p className="mt-1 font-body text-sm text-navy-500">{module.description}</p>}

      <div className="mt-4 space-y-2">
        {sortedLessons.map((lesson, idx) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            canUp={idx > 0}
            canDown={idx < sortedLessons.length - 1}
            onMoveUp={() => handleLessonMove(idx, 'up')}
            onMoveDown={() => handleLessonMove(idx, 'down')}
            onDelete={() => handleDeleteLesson(lesson.id)}
            isPreview={isPreview}
          />
        ))}
        {sortedLessons.length === 0 && !showAddLesson && (
          <p className="font-body text-sm text-navy-400">No lessons yet.</p>
        )}
      </div>

      {!isPreview && (
        <div className="mt-4">
          {!showAddLesson ? (
            <button type="button" onClick={() => setShowAddLesson(true)} className="btn-outline text-xs">
              <Plus size={13} className="mr-1 inline" /> Add Lesson
            </button>
          ) : (
            <form onSubmit={handleAddLesson} className="space-y-3 rounded-xl border border-navy-100 p-4">
              <TextField
                label="Lesson Title"
                name="lesson_title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <SelectField
                label="Type"
                name="content_type"
                value={lessonForm.content_type}
                options={LESSON_TYPES}
                onChange={(e) => setLessonForm((p) => ({ ...p, content_type: e.target.value }))}
              />
              <div>
                <label className="font-body text-sm font-bold tracking-wide text-navy-900">Content / URL</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                  rows={3}
                  placeholder="Lesson body text, or a video/file URL"
                  className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
                />
                <p className="mt-1.5 font-body text-xs text-navy-400">
                  Tip: after adding, open the lesson to use Compass to draft the full content.
                </p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-gold text-sm">Add Lesson</button>
                <button type="button" onClick={() => setShowAddLesson(false)} className="btn-outline text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Course settings panel (unchanged except catalogue picker added)
   ────────────────────────────────────────────────────────────── */

function CourseSettingsPanel({ course, onSaved }) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    level: course.level || 'Beginner',
    duration: course.duration || '',
    language: course.language || 'English',
    requirements: course.requirements || '',
  });
  const [programmeCode, setProgrammeCode] = useState(course.programme_code || null);
  const [outcomes, setOutcomes] = useState(course.learning_outcomes || []);
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_path || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleThumbnail(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadCourseThumbnail(course.id, file);
      setThumbnailUrl(url);
      await updateCourse(course.id, { thumbnail_path: url });
    } catch { /* ignore */ }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleanOutcomes = outcomes.map((o) => o.trim()).filter(Boolean);
      await updateCourse(course.id, {
        ...form,
        programme_code: programmeCode,
        learning_outcomes: cleanOutcomes,
        thumbnail_path: thumbnailUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <SectionCard
      title="Course Settings"
      action={saved && <span className="font-body text-xs font-semibold text-emerald-600">Saved!</span>}
    >
      <div className="space-y-5">
        {/* Catalogue link */}
        <CourseCatalogPicker
          value={programmeCode}
          onChange={(code) => setProgrammeCode(code)}
          helpText="Change the public catalogue course this LMS course links to."
        />

        {/* Thumbnail */}
        <div className="flex items-center gap-4">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail" className="h-20 w-32 rounded-xl border border-navy-100 object-cover" />
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-xl border-2 border-dashed border-navy-100 bg-cream text-navy-300">
              <BookOpen size={18} />
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy-200 px-3 py-1.5 font-body text-xs font-semibold text-navy-700 hover:bg-navy-50">
            <Plus size={13} /> Change
            <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnail} />
          </label>
        </div>

        <TextField label="Title" name="edit_title" value={form.title} onChange={(e) => update('title', e.target.value)} />

        <div>
          <label className="font-body text-sm font-bold tracking-wide text-navy-900">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Category" name="edit_category" value={form.category} onChange={(e) => update('category', e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-bold text-navy-900">Level</label>
            <select
              value={form.level}
              onChange={(e) => update('level', e.target.value)}
              className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-900 shadow-sm outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/20"
            >
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <TextField label="Duration" name="edit_duration" value={form.duration} onChange={(e) => update('duration', e.target.value)} />
          <TextField label="Language" name="edit_language" value={form.language} onChange={(e) => update('language', e.target.value)} />
        </div>

        <div>
          <label className="font-body text-sm font-bold tracking-wide text-navy-900">Requirements</label>
          <textarea
            value={form.requirements}
            onChange={(e) => update('requirements', e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
          />
        </div>

        <div>
          <p className="font-body text-sm font-bold tracking-wide text-navy-900">Learning Outcomes</p>
          <div className="mt-2 space-y-2">
            {outcomes.map((o, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-700">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={o}
                  onChange={(e) => setOutcomes((prev) => prev.map((x, i) => (i === idx ? e.target.value : x)))}
                  className="flex-1 rounded-xl border border-navy-100 px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOutcomes((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-navy-400 hover:text-rose-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOutcomes((prev) => [...prev, ''])}
              className="text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              <Plus size={14} className="mr-1 inline" /> Add outcome
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
        >
          <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────────── */

export default function CourseBuilder() {
  const { courseId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, course: null, modules: [] });
  const [moduleTitle, setModuleTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const load = useCallback(() => {
    Promise.all([getCourse(courseId), listModulesWithLessons(courseId)])
      .then(([raw, modules]) => {
        const course = resolveLmsCourse(raw);
        // resolveLmsCourse merges catalogue fields; keep the raw row for update calls
        setState({ loading: false, error: null, course: { ...course, _raw: raw }, modules });
      })
      .catch(() => setState({ loading: false, error: 'Could not load this course.', course: null, modules: [] }));
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  async function handleAddModule(e) {
    e.preventDefault();
    if (!moduleTitle) return;
    await createModule(courseId, { title: moduleTitle, position: state.modules.length });
    setModuleTitle('');
    load();
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCourseForReview(courseId);
      setSubmitSuccess(true);
      load();
    } catch {
      setSubmitError('Could not submit this course for review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const course = state.course;
  const raw = course._raw || {};
  const canEdit = EDITABLE_STATUSES.includes(raw.status);
  const canSubmit = ['draft', 'rejected', 'changes_requested'].includes(raw.status);
  const sortedModules = [...state.modules].sort((a, b) => a.position - b.position);

  return (
    <>
      <Seo title={course.title} description="Course builder." path={`/teach/courses/${courseId}`} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{course.title}</h1>

          {/* Catalogue badges */}
          <div className="mt-2.5">
            <CourseBadges course={course} size="sm" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={raw.status} />
            <span className="font-body text-xs text-navy-400">{sortedModules.length} modules</span>
            {course.hasCatalogueMatch && (
              <Link
                to={`/courses/${course.code}`}
                className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
              >
                View in catalogue
                <ExternalLink size={11} />
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview((v) => !v)}
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <Eye size={15} /> {isPreview ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <BookOpen size={15} /> Settings
          </button>
          <Link
            to={`/teach/courses/${courseId}/submissions`}
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <Users size={15} /> Students
          </Link>
        </div>
      </div>

      {/* Catalogue-link prompt (only when unlinked) */}
      {!course.hasCatalogueMatch && !isPreview && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50/50 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700">
            <Link2 size={16} />
          </span>
          <div className="flex-1">
            <p className="font-body text-sm font-bold text-navy-900">
              Not yet linked to a catalogue course
            </p>
            <p className="mt-0.5 font-body text-xs leading-5 text-navy-600">
              Linking this course to its catalogue entry means learners see the correct pathway,
              level, and division across the platform.
            </p>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="mt-2 font-body text-xs font-bold text-gold-800 hover:text-gold-900"
            >
              Link now →
            </button>
          </div>
        </div>
      )}

      {/* Reviewer feedback */}
      {(raw.status === 'rejected' || raw.status === 'changes_requested') && raw.reviewer_notes && (
        <div className={`mt-4 rounded-2xl border p-4 ${raw.status === 'rejected' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className={`mt-0.5 shrink-0 ${raw.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <p className="font-body text-sm font-bold text-navy-900">Reviewer Feedback</p>
              <p className="mt-1 font-body text-sm text-navy-700">{raw.reviewer_notes}</p>
            </div>
          </div>
        </div>
      )}

      {raw.status === 'approved' && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <p className="font-body text-sm text-navy-700">
            This course has been approved and is ready for publishing by staff.
          </p>
        </div>
      )}

      {submitSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <p className="font-body text-sm text-navy-700">
            Your course has been submitted for review. Staff will review it shortly.
          </p>
        </div>
      )}

      {submitError && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="font-body text-sm text-navy-700">{submitError}</p>
        </div>
      )}

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <CourseSettingsPanel course={raw} onSaved={load} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Module */}
      {!isPreview && canEdit && (
        <SectionCard title="Add Module" className="mt-6">
          <form onSubmit={handleAddModule} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField
              label="Module Title"
              name="module_title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g. Module 1: Introduction"
              className="flex-1"
            />
            <button type="submit" className="btn-gold inline-flex items-center gap-2">
              <Plus size={16} /> Add Module
            </button>
          </form>
        </SectionCard>
      )}

      {/* Modules */}
      <div className="mt-6 space-y-4">
        {sortedModules.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No modules yet"
            message={
              isPreview
                ? 'This course has no content yet.'
                : 'Add your first module above to start building this course.'
            }
          />
        )}
        {sortedModules.map((module, idx) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={idx}
            totalModules={sortedModules.length}
            onChanged={load}
            isPreview={isPreview}
          />
        ))}
      </div>

      {/* Submit for review */}
      {!isPreview && canSubmit && sortedModules.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={submitting}
            className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Send size={16} />
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      )}
    </>
  );
}