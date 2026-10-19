import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Save, Send, CircleCheck as CheckCircle2, Circle as XCircle, Clock, CircleAlert as AlertCircle, Upload, FileText, X, ArrowRight, User, BookOpen, Briefcase, Globe, Calendar, FileText as DocIcon, Camera } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import TextField from '../components/ui/TextField.jsx';
import SelectField from '../components/ui/SelectField.jsx';
import CheckboxField from '../components/ui/CheckboxField.jsx';
import StatusBadge from '../components/portal/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getMyTutorApplication, saveTutorApplication, submitTutorApplication,
  uploadTutorFile,
} from '../lib/supabase/tutor.js';

const SUBJECT_OPTIONS = [
  'English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Programming', 'Data Science', 'AI/ML', 'Business',
  'Accounting', 'Economics', 'History', 'Geography', 'Art', 'Music',
  'Public Speaking', 'Leadership', 'Soft Skills', 'Other',
];

const LANGUAGE_OPTIONS = [
  'English', 'Swahili', 'French', 'Arabic', 'Spanish', 'German',
  'Chinese', 'Hindi', 'Portuguese', 'Amharic', 'Other',
];

const AVAILABILITY_OPTIONS = [
  'Full-time', 'Part-time', 'Weekends only', 'Evenings only',
  'Flexible', 'Weekdays only',
];

const QUALIFICATION_OPTIONS = [
  'High School', 'Diploma', "Bachelor's Degree", "Master's Degree",
  'PhD', 'Teaching Certificate', 'Professional Certification', 'Other',
];

const emptyForm = {
  full_name: '', email: '', phone: '', nationality: '', country: '', city: '',
  highest_qualification: '', institution: '', field_of_study: '', year_completed: '',
  years_experience: '', teaching_experience: '', current_occupation: '',
  subjects: [], languages: [], availability: '', preferred_schedule: '', bio: '',
  profile_photo_path: '', cv_path: '', documents: [],
  declaration_accepted: false,
};

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
        <Icon size={18} />
      </span>
      <h2 className="font-display text-lg font-bold text-navy-900">{children}</h2>
    </div>
  );
}

function TutorHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-12 text-white sm:py-16">
      <HeroBackground variant="professional" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/80 to-navy-900/65" />
      <div className="container-premium relative z-10 mx-auto max-w-3xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-gold-300 backdrop-blur-sm">
          <GraduationCap size={26} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">Become a Tutor</h1>
        <p className="mx-auto mt-3 max-w-2xl font-body text-base leading-relaxed text-white/80">
          Join our community of educators and share your knowledge with learners around the world.
        </p>
      </div>
    </section>
  );
}

function ChipSelector({ options, selected, onChange, disabled }) {
  function toggle(item) {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt)}
            className={`rounded-full px-4 py-2 font-body text-sm font-semibold transition-all duration-200 ${
              active
                ? 'bg-gold-500 text-navy-900 ring-2 ring-gold-500'
                : 'border border-navy-100 bg-white text-navy-600 hover:border-gold-300 hover:bg-gold-50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FilePicker({ label, accept, onUpload, existingPath, disabled, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(existingPath ? existingPath.split('/').pop() : '');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const path = await onUpload(file);
      setFileName(path.split('/').pop());
    } catch (err) {
      setError('Could not upload this file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="font-body text-sm font-bold tracking-wide text-navy-900">{label}</p>
      {hint && <p className="mt-0.5 font-body text-xs text-navy-400">{hint}</p>}
      <div className={`mt-2 flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 ${disabled ? 'opacity-60' : ''}`}>
        <FileText size={18} className="text-navy-300" />
        {fileName ? (
          <span className="flex-1 truncate font-body text-sm text-navy-700">{fileName}</span>
        ) : (
          <span className="flex-1 font-body text-sm text-navy-400">No file selected</span>
        )}
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gold-500/10 px-3 py-1.5 font-body text-xs font-semibold text-gold-700 transition-colors hover:bg-gold-500/20 ${disabled ? 'cursor-not-allowed' : ''}`}>
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Browse'}
          <input type="file" accept={accept} className="sr-only" onChange={handleFile} disabled={disabled || uploading} />
        </label>
      </div>
      {error && <p className="mt-1 font-body text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function SupportingDocsUploader({ docs, onAdd, onRemove, disabled }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const path = await uploadTutorFile(file, 'document');
        onAdd({ name: file.name, path });
      }
    } catch {
      // skip
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <p className="font-body text-sm font-bold tracking-wide text-navy-900">Supporting Documents</p>
      <p className="mt-0.5 font-body text-xs text-navy-400">Certificates, references, or any other relevant documents</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy-200 bg-cream px-4 py-3 font-body text-sm font-semibold text-navy-600 transition-colors hover:border-gold-300 hover:bg-gold-50 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
          <Upload size={16} className="text-gold-600" />
          {uploading ? 'Uploading…' : 'Add documents'}
          <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" onChange={handleFile} disabled={disabled || uploading} />
        </label>
      </div>
      {docs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {docs.map((doc, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-2.5">
              <FileText size={16} className="text-navy-300" />
              <span className="flex-1 truncate font-body text-sm text-navy-700">{doc.name || doc.path?.split('/').pop()}</span>
              {!disabled && (
                <button type="button" onClick={() => onRemove(i)} className="text-navy-400 hover:text-red-500">
                  <X size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BecomeTutor() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [appId, setAppId] = useState(null);
  const [appStatus, setAppStatus] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const isReadOnly = ['submitted', 'under_review', 'approved'].includes(appStatus);
  const isRejected = appStatus === 'rejected';
  const isApproved = appStatus === 'approved';
  const isChangesRequested = appStatus === 'changes_requested';

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getMyTutorApplication();
      if (data) {
        setForm({ ...emptyForm, ...data, subjects: data.subjects || [], languages: data.languages || [], documents: data.documents || [] });
        setAppId(data.id);
        setAppStatus(data.status);
        setReviewerNotes(data.reviewer_notes || '');
      } else {
        setForm((prev) => ({ ...prev, full_name: profile?.full_name || '', email: user.email || '' }));
      }
    } catch {
      setError('Could not load your application. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    load();
  }, [load]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      const data = await saveTutorApplication(form);
      setAppId(data.id);
      setAppStatus(data.status);
      setSuccess('Draft saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Could not save your draft. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!form.full_name || !form.email || !form.highest_qualification || !form.bio) {
      setError('Please fill in all required fields before submitting.');
      return;
    }
    if (!form.declaration_accepted) {
      setError('Please accept the declaration to continue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const saved = await saveTutorApplication(form);
      const submitted = await submitTutorApplication(saved.id);
      setAppId(submitted.id);
      setAppStatus(submitted.status);
      setSuccess('Your application has been submitted for review.');
    } catch {
      setError('Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-100 border-t-gold-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Seo title="Become a Tutor" description="Apply to become a tutor at InnoSpeak Global." path="/become-tutor" />
        <TutorHero />
        <div className="container-premium max-w-2xl py-10 sm:py-12">
          <p className="text-center font-body text-base text-navy-500">
            Share your expertise with learners worldwide. Sign in to start your tutor application.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" className="btn-gold inline-flex items-center gap-2">
              Sign In to Apply
              <ArrowRight size={16} />
            </Link>
            <Link to="/signup" className="btn-outline inline-flex items-center gap-2">
              Create an Account
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isApproved) {
    return (
      <>
        <Seo title="Application Approved" description="Your tutor application has been approved." path="/become-tutor" />
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20">
              <CheckCircle2 size={30} />
            </span>
            <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">Application Approved</h1>
            <p className="mt-3 font-body text-base text-navy-500">
              Congratulations! Your tutor application has been approved. You now have access to the Tutor Dashboard.
            </p>
            <Link to="/teach" className="btn-gold mt-8 inline-flex items-center gap-2">
              Go to Tutor Dashboard
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title="Become a Tutor" description="Apply to become a tutor at InnoSpeak Global." path="/become-tutor" />

      <TutorHero />
      <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        {/* Status banner */}
        {appStatus && appStatus !== 'draft' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 rounded-2xl border p-5 ${
              isRejected
                ? 'border-rose-200 bg-rose-50'
                : isChangesRequested
                ? 'border-amber-200 bg-amber-50'
                : 'border-navy-100 bg-navy-50/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isRejected && <XCircle size={20} className="text-rose-600" />}
                {isChangesRequested && <AlertCircle size={20} className="text-amber-600" />}
                {(appStatus === 'submitted' || appStatus === 'under_review') && <Clock size={20} className="text-navy-600" />}
                <div>
                  <p className="font-body text-sm font-bold text-navy-900">Application Status: <StatusBadge status={appStatus} /></p>
                  <p className="mt-1 font-body text-sm text-navy-500">
                    {appStatus === 'submitted' && 'Your application has been submitted and is awaiting review.'}
                    {appStatus === 'under_review' && 'Your application is currently being reviewed by our team.'}
                    {isRejected && 'Your application was not approved at this time. See feedback below.'}
                    {isChangesRequested && 'Our team has requested some changes. Please update your application and resubmit.'}
                  </p>
                </div>
              </div>
            </div>
            {(isRejected || isChangesRequested) && reviewerNotes && (
              <div className="mt-4 rounded-xl border border-navy-100 bg-white p-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Reviewer Feedback</p>
                <p className="mt-2 font-body text-sm text-navy-700">{reviewerNotes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-navy-800">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <div className="mt-8 space-y-6">
          {/* Personal Info */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={User}>Personal Information</SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Full Name" name="full_name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} disabled={isReadOnly} required />
              <TextField label="Email" name="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} disabled={isReadOnly} required />
              <TextField label="Phone" name="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} disabled={isReadOnly} />
              <TextField label="Nationality" name="nationality" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} disabled={isReadOnly} />
              <TextField label="Country of Residence" name="country" value={form.country} onChange={(e) => update('country', e.target.value)} disabled={isReadOnly} />
              <TextField label="City" name="city" value={form.city} onChange={(e) => update('city', e.target.value)} disabled={isReadOnly} />
            </div>
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={BookOpen}>Education & Qualifications</SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField label="Highest Qualification" name="highest_qualification" value={form.highest_qualification} onChange={(e) => update('highest_qualification', e.target.value)} options={QUALIFICATION_OPTIONS} disabled={isReadOnly} required />
              <TextField label="Institution" name="institution" value={form.institution} onChange={(e) => update('institution', e.target.value)} disabled={isReadOnly} />
              <TextField label="Field of Study" name="field_of_study" value={form.field_of_study} onChange={(e) => update('field_of_study', e.target.value)} disabled={isReadOnly} />
              <TextField label="Year Completed" name="year_completed" value={form.year_completed} onChange={(e) => update('year_completed', e.target.value)} disabled={isReadOnly} placeholder="e.g. 2023" />
            </div>
          </div>

          {/* Teaching Experience */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={Briefcase}>Teaching Experience</SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField label="Years of Experience" name="years_experience" value={form.years_experience} onChange={(e) => update('years_experience', e.target.value)} options={['0-1', '1-3', '3-5', '5-10', '10+']} disabled={isReadOnly} />
              <TextField label="Current Occupation" name="current_occupation" value={form.current_occupation} onChange={(e) => update('current_occupation', e.target.value)} disabled={isReadOnly} />
            </div>
            <div className="mt-4">
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">Teaching Experience Details</label>
              <textarea
                value={form.teaching_experience}
                onChange={(e) => update('teaching_experience', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                placeholder="Describe your teaching experience, including any institutions, platforms, or contexts where you've taught..."
                className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm transition-all duration-300 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Subjects & Languages */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={Globe}>Subjects & Languages</SectionTitle>
            <div className="mt-5">
              <p className="font-body text-sm font-bold tracking-wide text-navy-900">Subjects You Can Teach</p>
              <p className="mt-0.5 font-body text-xs text-navy-400">Select all that apply</p>
              <div className="mt-3">
                <ChipSelector options={SUBJECT_OPTIONS} selected={form.subjects} onChange={(val) => update('subjects', val)} disabled={isReadOnly} />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-body text-sm font-bold tracking-wide text-navy-900">Languages You Speak</p>
              <p className="mt-0.5 font-body text-xs text-navy-400">Select all that apply</p>
              <div className="mt-3">
                <ChipSelector options={LANGUAGE_OPTIONS} selected={form.languages} onChange={(val) => update('languages', val)} disabled={isReadOnly} />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={Calendar}>Availability</SectionTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField label="Availability" name="availability" value={form.availability} onChange={(e) => update('availability', e.target.value)} options={AVAILABILITY_OPTIONS} disabled={isReadOnly} />
              <TextField label="Preferred Schedule" name="preferred_schedule" value={form.preferred_schedule} onChange={(e) => update('preferred_schedule', e.target.value)} disabled={isReadOnly} placeholder="e.g. Mornings, Afternoons" />
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={DocIcon}>Teaching Profile / Bio</SectionTitle>
            <div className="mt-5">
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">Tell us about your teaching approach <span className="text-gold-500">*</span></label>
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                disabled={isReadOnly}
                rows={5}
                placeholder="Write a short bio that will appear on your tutor profile. Describe your teaching philosophy, approach, and what makes you a great tutor..."
                className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm transition-all duration-300 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={FileText}>Documents & Photo</SectionTitle>
            <div className="mt-5 space-y-5">
              <FilePicker
                label="Profile Photo"
                accept="image/*"
                hint="A clear headshot for your tutor profile"
                onUpload={(file) => uploadTutorFile(file, 'photo').then((path) => { update('profile_photo_path', path); return path; })}
                existingPath={form.profile_photo_path}
                disabled={isReadOnly}
              />
              <FilePicker
                label="CV / Resume"
                accept=".pdf,.doc,.docx"
                hint="Your most recent CV or resume"
                onUpload={(file) => uploadTutorFile(file, 'cv').then((path) => { update('cv_path', path); return path; })}
                existingPath={form.cv_path}
                disabled={isReadOnly}
              />
              <SupportingDocsUploader
                docs={form.documents}
                onAdd={(doc) => update('documents', [...form.documents, doc])}
                onRemove={(idx) => update('documents', form.documents.filter((_, i) => i !== idx))}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
            <SectionTitle icon={CheckCircle2}>Declaration</SectionTitle>
            <div className="mt-5">
              <CheckboxField
                label="I confirm that all information provided is accurate and complete. I understand that providing false information may result in the rejection of my application or termination of my tutor status."
                name="declaration"
                checked={form.declaration_accepted}
                onChange={(e) => update('declaration_accepted', e.target.checked)}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving || submitting}
                  className="btn-outline inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || submitting}
                  className="btn-gold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? 'Submitting…' : isRejected || isChangesRequested ? 'Resubmit Application' : 'Submit Application'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
