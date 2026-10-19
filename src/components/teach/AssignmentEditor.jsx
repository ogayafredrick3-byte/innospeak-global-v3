import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, X, Calendar, Award, FileType, Upload, CheckCircle2, AlertCircle, FileText, Pencil } from 'lucide-react';
import SectionCard from '../portal/SectionCard.jsx';
import TextField from '../ui/TextField.jsx';
import SelectField from '../ui/SelectField.jsx';
import StatusBadge from '../portal/StatusBadge.jsx';
import { LoadingState, EmptyState } from '../portal/PortalStates.jsx';
import {
  getLessonAssignment, createAssignment, updateAssignment, deleteAssignment,
} from '../../lib/supabase/lms';

const SUBMISSION_TYPES = [
  { value: 'text', label: 'Text Response' },
  { value: 'file', label: 'File Upload' },
  { value: 'text_file', label: 'Text + File Upload' },
];

const emptyForm = {
  title: '',
  instructions: '',
  description: '',
  due_date: '',
  max_score: 100,
  submission_type: 'text',
  allowed_file_types: '',
  max_file_size_mb: 10,
  allow_multiple_submissions: false,
  status: 'draft',
};

export default function AssignmentEditor({ lessonId, courseId, moduleId }) {
  const [state, setState] = useState({ loading: true, assignment: null, error: null });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [objectives, setObjectives] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = useCallback(() => {
    setState((p) => ({ ...p, loading: true }));
    getLessonAssignment(lessonId)
      .then((assignment) => {
        setState({ loading: false, assignment, error: null });
        if (assignment) {
          setForm({
            title: assignment.title || '',
            instructions: assignment.instructions || '',
            description: assignment.description || '',
            due_date: assignment.due_date ? assignment.due_date.slice(0, 16) : '',
            max_score: assignment.max_score || 100,
            submission_type: assignment.submission_type || 'text',
            allowed_file_types: assignment.allowed_file_types || '',
            max_file_size_mb: assignment.max_file_size_mb || 10,
            allow_multiple_submissions: assignment.allow_multiple_submissions || false,
            status: assignment.status || 'draft',
          });
          setObjectives(assignment.learning_objectives || []);
        }
      })
      .catch(() => setState({ loading: false, assignment: null, error: 'Could not load assignment.' }));
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSave(publish = false) {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const cleanObjectives = objectives.map((o) => o.trim()).filter(Boolean);
      const fields = {
        title: form.title.trim(),
        instructions: form.instructions,
        description: form.description,
        learning_objectives: cleanObjectives,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        max_score: Number(form.max_score) || 100,
        submission_type: form.submission_type,
        allowed_file_types: form.allowed_file_types,
        max_file_size_mb: Number(form.max_file_size_mb) || 10,
        allow_multiple_submissions: form.allow_multiple_submissions,
        status: publish ? 'published' : 'draft',
      };
      if (state.assignment) {
        await updateAssignment(state.assignment.id, fields);
      } else {
        await createAssignment(lessonId, courseId, moduleId, fields);
      }
      setEditing(false);
      load();
    } catch {
      setSaveError('Could not save the assignment. Please try again.');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!state.assignment || !confirm('Delete this assignment and all student submissions?')) return;
    try {
      await deleteAssignment(state.assignment.id);
      setForm(emptyForm);
      setObjectives([]);
      load();
    } catch {
      setSaveError('Could not delete the assignment.');
    }
  }

  if (state.loading) return <LoadingState />;

  const assignment = state.assignment;

  // View mode (assignment exists, not editing)
  if (assignment && !editing) {
    return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
            <FileText size={16} />
          </span>
          <div>
            <p className="font-body text-sm font-bold text-navy-900">{assignment.title}</p>
            <p className="font-body text-xs text-navy-400">
              {assignment.submission_type === 'text' ? 'Text response' : assignment.submission_type === 'file' ? 'File upload' : 'Text + file'}
              {' · '}Max score: {assignment.max_score}
              {assignment.due_date && ` · Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={assignment.status} />
          <button type="button" onClick={() => setEditing(true)} className="text-navy-400 hover:text-gold-600"><Pencil size={15} /></button>
          <button type="button" onClick={handleDelete} className="text-navy-400 hover:text-rose-600"><Trash2 size={15} /></button>
        </div>
      </div>
      {assignment.description && <p className="px-1 font-body text-sm text-navy-600">{assignment.description}</p>}
      {assignment.instructions && (
        <div className="rounded-xl bg-navy-50/40 p-3">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Instructions</p>
          <p className="mt-1 whitespace-pre-wrap font-body text-sm text-navy-700">{assignment.instructions}</p>
        </div>
      )}
    </div>
    );
  }

  // Edit/create mode
  return (
    <div className="space-y-4">
      {saveError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="font-body text-sm text-navy-700">{saveError}</p>
        </div>
      )}

      <TextField
        label="Assignment Title"
        name="asg_title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="e.g. Lesson 1 Essay — My Communication Goals"
        required
      />

      <div>
        <label className="font-body text-sm font-bold tracking-wide text-navy-900">Description</label>
        <p className="mt-0.5 font-body text-xs text-navy-400">Short summary shown to students</p>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          placeholder="A brief description of this assignment..."
          className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
        />
      </div>

      <div>
        <label className="font-body text-sm font-bold tracking-wide text-navy-900">Instructions</label>
        <p className="mt-0.5 font-body text-xs text-navy-400">Detailed instructions for students</p>
        <textarea
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
          rows={4}
          placeholder="Step-by-step instructions for completing this assignment..."
          className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
        />
      </div>

      {/* Learning Objectives */}
      <div>
        <p className="font-body text-sm font-bold tracking-wide text-navy-900">Learning Objectives</p>
        <div className="mt-2 space-y-2">
          {objectives.map((obj, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-700">{idx + 1}</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => setObjectives((prev) => prev.map((x, i) => i === idx ? e.target.value : x))}
                placeholder="e.g. Apply active listening techniques"
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

      {/* Configuration grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="font-body text-sm font-bold tracking-wide text-navy-900">Due Date</label>
          <div className="relative mt-2">
            <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="datetime-local"
              value={form.due_date}
              onChange={(e) => update('due_date', e.target.value)}
              className="w-full rounded-xl border border-navy-100 bg-white pl-9 pr-3 py-2.5 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
        <TextField
          label="Maximum Score"
          name="asg_max_score"
          type="number"
          value={form.max_score}
          onChange={(e) => update('max_score', e.target.value)}
        />
        <SelectField
          label="Submission Type"
          name="asg_type"
          value={form.submission_type}
          options={SUBMISSION_TYPES}
          onChange={(e) => update('submission_type', e.target.value)}
        />
        <TextField
          label="Max File Size (MB)"
          name="asg_max_size"
          type="number"
          value={form.max_file_size_mb}
          onChange={(e) => update('max_file_size_mb', e.target.value)}
        />
      </div>

      {(form.submission_type === 'file' || form.submission_type === 'text_file') && (
        <TextField
          label="Allowed File Types"
          name="asg_file_types"
          value={form.allowed_file_types}
          onChange={(e) => update('allowed_file_types', e.target.value)}
          placeholder="e.g. .pdf,.doc,.docx,.txt (leave blank for all types)"
        />
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.allow_multiple_submissions}
          onChange={(e) => update('allow_multiple_submissions', e.target.checked)}
          className="h-4 w-4 rounded border-navy-200 text-gold-600 focus:ring-gold-500"
        />
        <span className="font-body text-sm text-navy-700">Allow students to resubmit before grading</span>
      </label>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => handleSave(false)} disabled={saving} className="btn-outline inline-flex items-center gap-2 text-sm disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button type="button" onClick={() => handleSave(true)} disabled={saving} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60">
          <CheckCircle2 size={15} /> {saving ? 'Publishing…' : 'Publish Assignment'}
        </button>
        {assignment && (
          <button type="button" onClick={() => { setEditing(false); load(); }} className="btn-outline text-sm">Cancel</button>
        )}
      </div>
    </div>
  );
}
