import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Eye, Pencil, Plus, Trash2, X, GripVertical, BookOpen,
  Video, FileText, Headphones, Presentation, Link as LinkIcon, Download,
  Upload, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Play,
  ArrowUp, ArrowDown, Target, ListChecks, File, ExternalLink,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  getLesson, updateLesson, getCourse,
  listLessonResources, createLessonResource, updateLessonResource,
  deleteLessonResource, uploadLessonResourceFile,
} from '../../lib/supabase/lms';
import QuizEditor from '../../components/teach/QuizEditor.jsx';
import AssignmentEditor from '../../components/teach/AssignmentEditor.jsx';
import SafeLessonContent, { sanitizeLessonContent } from '../../components/learn/SafeLessonContent.jsx';
import { getYouTubeEmbedUrl, safeHttpUrl } from '../../lib/security/urls.js';
import { getLessonValidationError } from '../../lib/lms/lessonValidation.js';
import CompassAssistButton from '../../components/teach/CompassAssistButton.jsx';
import { resolveLmsCourse } from '../../lib/data/lmsCourse';

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'pdf', label: 'PDF / Document', icon: FileText },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'presentation', label: 'Presentation', icon: Presentation },
  { value: 'document', label: 'Document', icon: File },
  { value: 'link', label: 'External Link', icon: LinkIcon },
  { value: 'downloadable', label: 'Downloadable File', icon: Download },
];

const CONTENT_TYPES = [
  { value: 'text', label: 'Text / Reading' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'audio', label: 'Audio' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'link', label: 'External Link' },
];

function getIcon(type) {
  const found = RESOURCE_TYPES.find((r) => r.value === type);
  return found ? found.icon : File;
}

/* ──────────────────────────────────────────────────────────────
   Rich Text Editor (lightweight, no external deps)
   ────────────────────────────────────────────────────────────── */

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Seed the editor once per mounted lesson. Avoid replacing innerHTML on
    // every keystroke, which would move the caret and make editing frustrating.
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = sanitizeLessonContent(value || '');
      initializedRef.current = true;
    }
  }, [value]);

  function exec(command, val) {
    if (!editorRef.current) return;
    document.execCommand(command, false, val || null);
    onChange(editorRef.current.innerHTML);
  }

  return (
    <div className="rounded-2xl border border-navy-100 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-navy-100 bg-navy-50/50 px-2 py-2">
        <button type="button" onClick={() => exec('bold')} className="rounded-lg px-2 py-1 font-body text-sm font-bold text-navy-700 hover:bg-navy-100" title="Bold">B</button>
        <button type="button" onClick={() => exec('italic')} className="rounded-lg px-2 py-1 font-body text-sm italic text-navy-700 hover:bg-navy-100" title="Italic">I</button>
        <button type="button" onClick={() => exec('underline')} className="rounded-lg px-2 py-1 font-body text-sm underline text-navy-700 hover:bg-navy-100" title="Underline">U</button>
        <span className="mx-1 h-5 w-px bg-navy-100" />
        <button type="button" onClick={() => exec('formatBlock', '<h2>')} className="rounded-lg px-2 py-1 font-display text-sm font-bold text-navy-700 hover:bg-navy-100" title="Heading">H</button>
        <button type="button" onClick={() => exec('formatBlock', '<p>')} className="rounded-lg px-2 py-1 font-body text-sm text-navy-700 hover:bg-navy-100" title="Paragraph">P</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="rounded-lg px-2 py-1 text-navy-700 hover:bg-navy-100" title="Bullet list"><ListChecks size={14} /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="rounded-lg px-2 py-1 text-navy-700 hover:bg-navy-100" title="Numbered list">1.</button>
        <span className="mx-1 h-5 w-px bg-navy-100" />
        <button type="button" onClick={() => { const url = prompt('Enter an HTTPS or HTTP URL'); if (url) { const safeUrl = safeHttpUrl(url); if (safeUrl) exec('createLink', safeUrl); else window.alert('Enter a valid HTTP or HTTPS URL.'); } }} className="rounded-lg px-2 py-1 text-navy-700 hover:bg-navy-100" title="Insert link"><LinkIcon size={14} /></button>
        <button type="button" onClick={() => exec('removeFormat')} className="rounded-lg px-2 py-1 text-navy-700 hover:bg-navy-100" title="Clear formatting"><X size={14} /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="min-h-[200px] px-5 py-4 font-body text-sm text-navy-900 focus:outline-none prose-sm max-w-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Resource Card
   ────────────────────────────────────────────────────────────── */

function ResourceCard({ resource, onEdit, onDelete, onMoveUp, onMoveDown, canUp, canDown }) {
  const Icon = getIcon(resource.resource_type);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-navy-50/60 px-4 py-3">
      <GripVertical size={14} className="text-navy-300" />
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-semibold text-navy-800">{resource.title}</p>
        <p className="font-body text-xs text-navy-400">
          {RESOURCE_TYPES.find((r) => r.value === resource.resource_type)?.label || resource.resource_type}
          {resource.file_type ? ` · ${resource.file_type}` : ''}
          {resource.external_url ? ` · ${resource.external_url}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" disabled={!canUp} onClick={onMoveUp} className="text-navy-400 hover:text-gold-600 disabled:opacity-30"><ArrowUp size={14} /></button>
        <button type="button" disabled={!canDown} onClick={onMoveDown} className="text-navy-400 hover:text-gold-600 disabled:opacity-30"><ArrowDown size={14} /></button>
        <button type="button" onClick={onEdit} className="text-navy-400 hover:text-gold-600"><Pencil size={14} /></button>
        <button type="button" onClick={onDelete} className="text-navy-400 hover:text-rose-600"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Resource Form (add/edit)
   ────────────────────────────────────────────────────────────── */

function ResourceForm({ onSave, onCancel, initial }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    resource_type: initial?.resource_type || 'downloadable',
    external_url: initial?.external_url || '',
    description: initial?.description || '',
    file_url: initial?.storage_path || initial?.file_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isFileType = ['video', 'pdf', 'audio', 'presentation', 'document', 'downloadable'].includes(form.resource_type);
  const isLinkType = form.resource_type === 'link';

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadLessonResourceFile(initial?.lesson_id, file);
      update('file_url', url);
      if (!form.title) update('title', file.name);
      update('file_type', file.type);
    } catch {
      setUploadError('Could not upload file. Please try again.');
    }
    setUploading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || uploading) return;
    if (isLinkType && !safeHttpUrl(form.external_url)) {
      setUploadError('Enter a valid HTTP or HTTPS link.');
      return;
    }
    if (isFileType && !form.file_url.trim()) {
      setUploadError('Upload a file or enter its HTTP or HTTPS URL before saving this resource.');
      return;
    }
    if (form.file_url && /^[a-z][a-z0-9+.-]*:/i.test(form.file_url) && !safeHttpUrl(form.file_url)) {
      setUploadError('The file URL must use HTTP or HTTPS, or be a valid uploaded storage path.');
      return;
    }
    setUploadError(null);
    onSave({ ...form, title: form.title.trim(), external_url: form.external_url ? safeHttpUrl(form.external_url) : '' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-navy-100 p-4">
      <TextField
        label="Resource Title"
        name="res_title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="e.g. Lesson Slides, Worksheet, Reference Document"
        required
      />
      <SelectField
        label="Resource Type"
        name="res_type"
        value={form.resource_type}
        options={RESOURCE_TYPES.map((r) => ({ value: r.value, label: r.label }))}
        onChange={(e) => update('resource_type', e.target.value)}
      />
      {isLinkType && (
        <TextField
          label="External URL"
          name="res_url"
          value={form.external_url}
          onChange={(e) => update('external_url', e.target.value)}
          placeholder="https://..."
          required
        />
      )}
      {isFileType && (
        <div>
          <label className="font-body text-sm font-bold tracking-wide text-navy-900">Upload File</label>
          {!form.file_url ? (
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy-200 bg-cream px-4 py-6 font-body text-sm text-navy-500 hover:border-gold-500 hover:text-gold-700">
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Click to upload a file'}
              <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading} />
            </label>
          ) : (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span className="flex-1 truncate font-body text-sm text-emerald-700">File uploaded</span>
              <button type="button" onClick={() => update('file_url', '')} className="text-navy-400 hover:text-rose-500"><X size={14} /></button>
            </div>
          )}
          {uploadError && <p className="mt-1 font-body text-xs text-rose-600">{uploadError}</p>}
          <p className="mt-1 font-body text-xs text-navy-400">Or paste a URL below if the file is hosted elsewhere.</p>
          <input
            type="text"
            value={form.file_url}
            onChange={(e) => update('file_url', e.target.value)}
            placeholder="https://... (optional if uploading)"
            className="mt-2 w-full rounded-xl border border-navy-100 px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="font-body text-sm font-bold tracking-wide text-navy-900">Description (optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-gold text-sm">{initial?.id ? 'Update Resource' : 'Add Resource'}</button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancel</button>
      </div>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────
   Student Preview
   ────────────────────────────────────────────────────────────── */

function StudentPreview({ lesson, resources }) {
  const Icon = getIcon;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(lesson.video_url);
  const safeVideoUrl = safeHttpUrl(lesson.video_url);
  const safeExternalUrl = safeHttpUrl(lesson.external_url);
  return (
    <div className="space-y-6">
      <SectionCard title={lesson.title}>
        {lesson.description && (
          <p className="mb-4 font-body text-sm text-navy-600">{lesson.description}</p>
        )}
        {lesson.learning_objectives?.length > 0 && (
          <div className="mb-4 rounded-xl bg-gold-500/5 p-4">
            <p className="flex items-center gap-2 font-body text-sm font-bold text-navy-900">
              <Target size={15} className="text-gold-600" /> Learning Objectives
            </p>
            <ul className="mt-2 space-y-1">
              {lesson.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-sm text-navy-700">
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-gold-600" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
        {lesson.content_type === 'video' && (youtubeEmbedUrl || safeVideoUrl) && (
          <div className="mb-4">
            {youtubeEmbedUrl ? (
              <iframe src={youtubeEmbedUrl} title={`${lesson.title} video`} className="aspect-video w-full rounded-xl" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : (
              <video controls preload="metadata" className="w-full rounded-xl" src={safeVideoUrl} />
            )}
          </div>
        )}
        {lesson.content_type === 'link' && safeExternalUrl && (
          <a href={safeExternalUrl} target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-gold-700 hover:underline">
            <ExternalLink size={15} /> Open external resource
          </a>
        )}
        {lesson.content && (
          <SafeLessonContent content={lesson.content} className="prose prose-sm max-w-none font-body text-navy-800" />
        )}
      </SectionCard>

      {resources.length > 0 && (
        <SectionCard title="Lesson Resources">
          <div className="space-y-2">
            {resources.map((r) => {
              const RIcon = Icon(r.resource_type);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-navy-50/60 px-4 py-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
                    <RIcon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-semibold text-navy-800">{r.title}</p>
                    {r.description && <p className="font-body text-xs text-navy-500">{r.description}</p>}
                  </div>
                  {r.is_downloadable && (safeHttpUrl(r.external_url) || safeHttpUrl(r.file_url)) && (
                    <a
                      href={safeHttpUrl(r.external_url) || safeHttpUrl(r.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-gold-500/10 px-3 py-1.5 font-body text-xs font-semibold text-gold-700 hover:bg-gold-500/20"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────── */

export default function LessonContentBuilder() {
  const { lessonId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, lesson: null, course: null, resources: [] });
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [form, setForm] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceError, setResourceError] = useState(null);

  const load = useCallback(() => {
    Promise.all([getLesson(lessonId), listLessonResources(lessonId)])
      .then(([lesson, resources]) => {
        const sorted = [...resources].sort((a, b) => a.position - b.position);
        setState({ loading: false, error: null, lesson, course: null, resources: sorted });
        setForm({
          title: lesson.title || '',
          description: lesson.description || '',
          content_type: lesson.content_type || 'text',
          content: lesson.content || '',
          video_url: lesson.video_url || '',
          external_url: lesson.external_url || '',
          practical_activity: lesson.practical_activity || '',
          status: lesson.status || 'draft',
        });
        setObjectives(lesson.learning_objectives || []);
        // Load course through resolveLmsCourse so it carries catalogue metadata
        // (pathway, level, code) — Compass uses these to draft better content.
        getCourse(lesson.modules.course_id)
          .then((c) => setState((p) => ({ ...p, course: resolveLmsCourse(c) })))
          .catch(() => {});
      })
      .catch(() => setState({ loading: false, error: 'Could not load this lesson.', lesson: null, resources: [] }));
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSave(publish = false) {
    const validationError = getLessonValidationError({
      title: form.title,
      videoUrl: form.video_url,
      externalUrl: form.external_url,
      content: form.content,
      practicalActivity: form.practical_activity,
      resourceCount: state.resources.length,
      publish: publish || state.lesson?.status === 'published',
    });
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    const safeVideoUrl = form.video_url ? safeHttpUrl(form.video_url) : null;
    const safeExternalUrl = form.external_url ? safeHttpUrl(form.external_url) : null;
    setSaving(true);
    setSaveError(null);
    try {
      const cleanObjectives = objectives.map((o) => o.trim()).filter(Boolean);
      await updateLesson(lessonId, {
        title: form.title.trim(),
        description: form.description,
        content_type: form.content_type,
        content: sanitizeLessonContent(form.content || ''),
        video_url: safeVideoUrl,
        external_url: safeExternalUrl,
        practical_activity: form.practical_activity || null,
        learning_objectives: cleanObjectives,
        status: publish || state.lesson?.status === 'published' ? 'published' : 'draft',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    } catch {
      setSaveError('Could not save the lesson. Please try again.');
    }
    setSaving(false);
  }

  async function handleSaveResource(fields) {
    setResourceError(null);
    try {
      if (editingResource) {
        await updateLessonResource(editingResource.id, fields);
      } else {
        await createLessonResource(lessonId, { ...fields, position: state.resources.length });
      }
      setShowResourceForm(false);
      setEditingResource(null);
      load();
    } catch {
      setResourceError('Could not save resource. Please try again.');
    }
  }

  async function handleDeleteResource(resourceId) {
    if (!confirm('Delete this resource?')) return;
    try {
      await deleteLessonResource(resourceId);
      load();
    } catch {
      setResourceError('Could not delete resource.');
    }
  }

  async function handleMoveResource(idx, direction) {
    const resources = [...state.resources];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= resources.length) return;
    const tmp = resources[idx];
    resources[idx] = resources[swapIdx];
    resources[swapIdx] = tmp;
    for (let i = 0; i < resources.length; i++) {
      if (resources[i].position !== i) {
        await updateLessonResource(resources[i].id, { position: i });
      }
    }
    load();
  }

  // Insert handler — routes Compass drafts into the right field for each mode
  function handleCompassInsert(draft, mode) {
    if (mode === 'objectives') {
      const newObjs = draft
        .split('\n')
        .map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
        .filter(Boolean);
      setObjectives((prev) => [...prev.filter(Boolean), ...newObjs]);
      return;
    }

    if (mode === 'practical') {
      update('practical_activity', (form.practical_activity ? form.practical_activity + '\n\n' : '') + draft);
      return;
    }

    // Convert markdown-ish text to HTML for the rich text editor
    const toHtml = (text) =>
      text
        .split('\n\n')
        .map((para) => {
          const trimmed = para.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
          if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
          if (/^[-*]\s/.test(trimmed)) {
            const items = trimmed.split('\n').map((l) => l.replace(/^[-*]\s/, ''));
            return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const items = trimmed.split('\n').map((l) => l.replace(/^\d+\.\s/, ''));
            return `<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
          }
          return `<p>${trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
        })
        .filter(Boolean)
        .join('');

    if (mode === 'quiz_ideas') {
      const html = `<h3>Quiz ideas</h3><pre style="white-space:pre-wrap;font-family:inherit;font-size:0.875rem">${draft}</pre>`;
      update('content', (form.content || '') + html);
      return;
    }

    // lesson_body
    update('content', (form.content || '') + toHtml(draft));
  }

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const lesson = state.lesson;
  const courseId = lesson.modules?.course_id;
  const isPublished = lesson.status === 'published';

  return (
    <>
      <Seo title={lesson.title} description="Lesson Content Builder" path={`/teach/lessons/${lessonId}`} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`/teach/courses/${courseId}`} className="inline-flex items-center gap-1 font-body text-sm font-semibold text-navy-500 hover:text-navy-800">
            <ArrowLeft size={15} /> Back to Course Builder
          </Link>
          <p className="mt-2 font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Lesson Content Builder</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{lesson.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={lesson.status} />
            <span className="font-body text-xs text-navy-400">{state.resources.length} resources</span>
            {lesson.modules?.title && <span className="font-body text-xs text-navy-400">· {lesson.modules.title}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setIsPreview((v) => !v)} className="btn-outline inline-flex items-center gap-2 text-sm">
            {isPreview ? <Pencil size={15} /> : <Eye size={15} />} {isPreview ? 'Edit Lesson' : 'Preview as Student'}
          </button>
        </div>
      </div>

      {/* Save status banners */}
      {saved && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <p className="font-body text-sm text-navy-700">Lesson saved successfully.</p>
        </div>
      )}
      {saveError && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="font-body text-sm text-navy-700">{saveError}</p>
        </div>
      )}
      {resourceError && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="font-body text-sm text-navy-700">{resourceError}</p>
        </div>
      )}

      {/* Preview Mode */}
      {isPreview ? (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-2">
            <Play size={14} className="text-gold-600" />
            <p className="font-body text-sm text-navy-700">This is exactly how students will see this lesson.</p>
          </div>
          <StudentPreview lesson={{ ...lesson, ...form, learning_objectives: objectives }} resources={state.resources} />
        </div>
      ) : (
        /* Edit Mode */
        <div className="mt-6 space-y-6">
          {/* Lesson Details */}
          <SectionCard title="Lesson Details" description="Set the title, description, and learning objectives for this lesson.">
            <div className="space-y-4">
              <TextField
                label="Lesson Title"
                name="lesson_title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Introduction to Neural Networks"
                required
              />
              <div>
                <label className="font-body text-sm font-bold tracking-wide text-navy-900">Lesson Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={2}
                  placeholder="A short summary shown to students before they open the lesson"
                  className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
                />
              </div>
              <SelectField
                label="Primary Content Type"
                name="content_type"
                value={form.content_type}
                options={CONTENT_TYPES}
                onChange={(e) => update('content_type', e.target.value)}
              />
              <div>
                <p className="font-body text-sm font-bold tracking-wide text-navy-900">Learning Objectives</p>
                <p className="mt-1 font-body text-xs text-navy-400">What students should be able to do after completing this lesson. Use action verbs (e.g. "Define", "Build", "Analyse").</p>
                <div className="mt-2 space-y-2">
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-700">{idx + 1}</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => setObjectives((prev) => prev.map((x, i) => i === idx ? e.target.value : x))}
                        className="flex-1 rounded-xl border border-navy-100 px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setObjectives((prev) => prev.filter((_, i) => i !== idx))} className="text-navy-400 hover:text-rose-500"><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setObjectives((prev) => [...prev, ''])} className="text-sm font-semibold text-gold-700 hover:text-gold-800">
                    <Plus size={14} className="mr-1 inline" />Add objective
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Video Content */}
          {form.content_type === 'video' && (
            <SectionCard title="Video Content" description="Add a video URL (YouTube, Vimeo, or direct file URL).">
              <TextField
                label="Video URL"
                name="video_url"
                value={form.video_url}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
              />
              {form.video_url && (form.video_url.includes('youtube.com') || form.video_url.includes('youtu.be')) && (
                <div className="mt-3">
                  <iframe src={form.video_url.replace('watch?v=', 'embed/')} className="aspect-video w-full rounded-xl" allowFullScreen />
                </div>
              )}
              {form.video_url && !form.video_url.includes('youtube.com') && !form.video_url.includes('youtu.be') && (
                <div className="mt-3">
                  <video controls className="w-full rounded-xl" src={form.video_url} />
                </div>
              )}
            </SectionCard>
          )}

          {/* External Link */}
          {form.content_type === 'link' && (
            <SectionCard title="External Link" description="Add a link to an external resource.">
              <TextField
                label="External URL"
                name="external_url"
                value={form.external_url}
                onChange={(e) => update('external_url', e.target.value)}
                placeholder="https://..."
              />
            </SectionCard>
          )}

          {/* Rich Text Content — with Compass drafting assist */}
          <SectionCard
            title="Lesson Content"
            description="Write the main body of the lesson. Use headings, short paragraphs, and bullet lists to keep it scannable."
            action={
              <CompassAssistButton
                course={state.course}
                lessonTitle={form.title}
                lessonObjectives={objectives.filter(Boolean)}
                onInsert={handleCompassInsert}
              />
            }
          >
            <RichTextEditor
              key={lesson.id}
              value={form.content}
              onChange={(html) => update('content', html)}
              placeholder="Write your lesson content here, or click 'Draft with Compass' above…"
            />
          </SectionCard>

          {/* Resources */}
          <SectionCard
            title="Lesson Resources"
            description="Add downloadable files, external links, videos, audio, presentations, and documents."
            action={
              !showResourceForm && (
                <button type="button" onClick={() => { setShowResourceForm(true); setEditingResource(null); }} className="btn-outline inline-flex items-center gap-2 text-sm">
                  <Plus size={15} /> Add Resource
                </button>
              )
            }
          >
            <AnimatePresence>
              {showResourceForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <ResourceForm
                    initial={editingResource ? { ...editingResource, lesson_id: lessonId } : null}
                    onSave={handleSaveResource}
                    onCancel={() => { setShowResourceForm(false); setEditingResource(null); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 space-y-2">
              {state.resources.length === 0 && !showResourceForm && (
                <EmptyState icon={BookOpen} title="No resources yet" message="Add downloadable files, links, videos, audio, presentations, and documents for your students." />
              )}
              {state.resources.map((resource, idx) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  canUp={idx > 0}
                  canDown={idx < state.resources.length - 1}
                  onMoveUp={() => handleMoveResource(idx, 'up')}
                  onMoveDown={() => handleMoveResource(idx, 'down')}
                  onEdit={() => { setEditingResource(resource); setShowResourceForm(true); }}
                  onDelete={() => handleDeleteResource(resource.id)}
                />
              ))}
            </div>
          </SectionCard>

          {/* Quiz / Knowledge Check */}
          <SectionCard
            title="Quiz / Knowledge Check"
            description="Add a quiz to test student understanding. Students see it inline when viewing the lesson."
          >
            <QuizEditor lessonId={lessonId} />
          </SectionCard>

          {/* Assignment */}
          <SectionCard
            title="Assignment"
            description="Attach an assignment to this lesson. Students can submit text, files, or both — then you grade their work."
          >
            <AssignmentEditor lessonId={lessonId} courseId={courseId} moduleId={lesson.modules?.id} />
          </SectionCard>

          {/* Practical Activity */}
          <SectionCard title="Practical Activity / Instructions" description="Give students a hands-on task to apply what they learned — an exercise, mini-project, or reflection prompt.">
            <div>
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">Activity Instructions</label>
              <textarea
                value={form.practical_activity || ''}
                onChange={(e) => update('practical_activity', e.target.value)}
                rows={4}
                placeholder="Describe a hands-on activity, exercise, or practice task for students to complete after this lesson..."
                className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
              />
            </div>
          </SectionCard>

          {/* Save Bar */}
          <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-navy-100 bg-white/90 p-4 shadow-premium backdrop-blur">
            <span className="font-body text-sm text-navy-400">
              {isPublished ? 'Published · saved changes go live' : 'Saved as draft'}
            </span>
            <button type="button" onClick={() => handleSave(false)} disabled={saving} className="btn-outline inline-flex items-center gap-2 text-sm disabled:opacity-60">
              <Save size={15} /> {saving ? 'Saving...' : isPublished ? 'Save Changes' : 'Save as Draft'}
            </button>
            <button type="button" onClick={() => handleSave(true)} disabled={saving} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60">
              <CheckCircle2 size={15} /> {saving ? 'Publishing...' : 'Publish Lesson'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}