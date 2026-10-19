import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, X } from 'lucide-react';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  EVENT_TYPES,
  FOUNDATION_EVENTS,
} from '../../lib/data/eventsData.js';
import {
  getCustomEvent,
  createEvent,
  updateEvent,
} from '../../lib/data/eventStore.js';

const EMPTY = {
  title: '',
  category: '',
  shortDescription: '',
  fullDescription: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  eventType: 'in_person',
  registrationMethod: 'internal',
  registrationUrl: '',
  registrationDeadline: '',
  coverImage: '',
  organizer: 'InnoSpeak Global Foundation',
  contactEmail: 'info@innospeakglobal.org',
  contactPhone: '+254 716 921 700',
  status: 'draft',
  featured: false,
  capacity: '',
};

export default function FoundationEventEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (isNew) return;
    const found = getCustomEvent(id) || FOUNDATION_EVENTS.find((e) => e.id === id);
    if (found) {
      setData({ ...EMPTY, ...found });
    }
    setLoading(false);
  }, [id, isNew]);

  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!data.title.trim()) e.title = 'Required';
    if (!data.category) e.category = 'Required';
    if (!data.shortDescription.trim()) e.shortDescription = 'Required';
    if (!data.date) e.date = 'Required';
    if (!data.eventType) e.eventType = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(status) {
    if (!validate()) return;

    const payload = {
      ...data,
      status: status || data.status,
      capacity: data.capacity ? Number(data.capacity) : null,
    };

    if (isNew) {
      createEvent(payload);
    } else {
      updateEvent(id, payload);
    }
    setSavedAt(new Date().toLocaleTimeString());
    if (isNew) navigate('/admin/foundation/events');
  }

  if (loading) return <p className="font-body text-sm text-navy-500">Loading…</p>;

  const inputBase =
    'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';
  const labelBase = 'mb-2 block font-body text-sm font-bold text-navy-900';

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/foundation/events"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-100 text-navy-700 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
              Foundation Events
            </p>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              {isNew ? 'Create Event' : 'Edit Event'}
            </h1>
            {savedAt && (
              <p className="mt-1 font-body text-xs text-emerald-600">Saved at {savedAt}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 font-body text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
          >
            <Send size={14} />
            Publish
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
        {/* Title */}
        <div>
          <label className={labelBase}>
            Event title <span className="text-emerald-600">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Girls in STEM Workshop"
            className={inputBase}
          />
          {errors.title && (
            <p className="mt-1 font-body text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Category + type */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelBase}>
              Category <span className="text-emerald-600">*</span>
            </label>
            <select
              value={data.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputBase}
            >
              <option value="">Select a category…</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 font-body text-xs text-red-500">{errors.category}</p>
            )}
          </div>
          <div>
            <label className={labelBase}>
              Event type <span className="text-emerald-600">*</span>
            </label>
            <select
              value={data.eventType}
              onChange={(e) => update('eventType', e.target.value)}
              className={inputBase}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <label className={labelBase}>
            Short description <span className="text-emerald-600">*</span>
          </label>
          <input
            type="text"
            value={data.shortDescription}
            onChange={(e) => update('shortDescription', e.target.value)}
            placeholder="One-line summary that appears on the event card"
            className={inputBase}
          />
          {errors.shortDescription && (
            <p className="mt-1 font-body text-xs text-red-500">{errors.shortDescription}</p>
          )}
        </div>

        <div>
          <label className={labelBase}>Full description</label>
          <textarea
            rows={5}
            value={data.fullDescription}
            onChange={(e) => update('fullDescription', e.target.value)}
            placeholder="Full details about the event — what to expect, who should attend, what to bring…"
            className={`${inputBase} resize-y`}
          />
        </div>

        {/* Date + times */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelBase}>
              Date <span className="text-emerald-600">*</span>
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => update('date', e.target.value)}
              className={inputBase}
            />
            {errors.date && (
              <p className="mt-1 font-body text-xs text-red-500">{errors.date}</p>
            )}
          </div>
          <div>
            <label className={labelBase}>Start time</label>
            <input
              type="time"
              value={data.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>End time</label>
            <input
              type="time"
              value={data.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className={labelBase}>Venue / location</label>
          <input
            type="text"
            value={data.venue}
            onChange={(e) => update('venue', e.target.value)}
            placeholder="e.g. Nairobi Innovation Hub, or Online (Zoom)"
            className={inputBase}
          />
        </div>

        {/* Capacity */}
        <div>
          <label className={labelBase}>Capacity (optional)</label>
          <input
            type="number"
            value={data.capacity}
            onChange={(e) => update('capacity', e.target.value)}
            placeholder="Maximum number of attendees"
            className={inputBase}
          />
        </div>

        {/* Registration */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelBase}>Registration method</label>
            <select
              value={data.registrationMethod}
              onChange={(e) => update('registrationMethod', e.target.value)}
              className={inputBase}
            >
              <option value="internal">Internal (register on site)</option>
              <option value="external">External link</option>
            </select>
          </div>
          <div>
            <label className={labelBase}>Registration deadline</label>
            <input
              type="date"
              value={data.registrationDeadline}
              onChange={(e) => update('registrationDeadline', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        {data.registrationMethod === 'external' && (
          <div>
            <label className={labelBase}>External registration URL</label>
            <input
              type="url"
              value={data.registrationUrl}
              onChange={(e) => update('registrationUrl', e.target.value)}
              placeholder="https://..."
              className={inputBase}
            />
          </div>
        )}

        {/* Organizer + contact */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelBase}>Organizer</label>
            <input
              type="text"
              value={data.organizer}
              onChange={(e) => update('organizer', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Contact email</label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Contact phone</label>
            <input
              type="tel"
              value={data.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className={labelBase}>Cover image URL (optional)</label>
          <input
            type="url"
            value={data.coverImage}
            onChange={(e) => update('coverImage', e.target.value)}
            placeholder="https://..."
            className={inputBase}
          />
        </div>

        {/* Status + featured */}
        <div className="grid gap-5 border-t border-navy-100 pt-5 sm:grid-cols-2">
          <div>
            <label className={labelBase}>Status</label>
            <select
              value={data.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputBase}
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 rounded-xl border border-navy-100 bg-cream/40 px-4 py-3 font-body text-sm font-semibold text-navy-900">
              <input
                type="checkbox"
                checked={data.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="h-4 w-4 rounded border-navy-300 text-emerald-600 focus:ring-emerald-500"
              />
              Feature this event on the homepage
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}