import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Star, Check, Image as ImageIcon, Video, Send,
  User, MapPin, Mail, Trash2, AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'sponsor', label: 'Sponsor Story', description: 'You or your organisation gave' },
  { id: 'learner', label: 'Learner Story', description: 'You received support' },
  { id: 'activity', label: 'Activity Report', description: 'An event or program' },
  { id: 'review', label: 'Review', description: 'Your feedback & rating' },
];

const MAX_PHOTOS = 6;
const MAX_PHOTO_MB = 5;
const MAX_VIDEO_MB = 50;

/**
 * StorySubmissionForm — modal where visitors submit their Foundation story.
 * UI-complete. Wire `onSubmit` to Supabase to persist.
 */
export default function StorySubmissionForm({ open, onClose, onSubmit }) {
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  function reset() {
    setCategory('');
    setRating(0);
    setName('');
    setRole('');
    setEmail('');
    setLocation('');
    setTitle('');
    setBody('');
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    if (video) URL.revokeObjectURL(video.preview);
    setVideo(null);
    setVideoUrl('');
    setConsent(false);
    setError('');
  }

  function handleClose() {
    if (submitted) {
      reset();
      setSubmitted(false);
    }
    onClose();
  }

  function handlePhotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [];
    for (const file of files) {
      if (photos.length + next.length >= MAX_PHOTOS) break;
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
        setError(`Each photo must be under ${MAX_PHOTO_MB}MB.`);
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos((prev) => [...prev, ...next]);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (error.startsWith('Each photo')) setError('');
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }

  function handleVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB, or paste a video URL instead.`);
      return;
    }
    if (video) URL.revokeObjectURL(video.preview);
    setVideo({ file, preview: URL.createObjectURL(file) });
    setError('');
  }

  function removeVideo() {
    if (video) URL.revokeObjectURL(video.preview);
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!category) return setError('Please choose a story type.');
    if (category === 'review' && rating < 1) return setError('Please add a star rating.');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email.');
    if (title.trim().length < 5) return setError('Title must be at least 5 characters.');
    if (body.trim().length < 40) return setError('Story must be at least 40 characters.');
    if (!consent) return setError('Please accept the consent checkbox.');

    setError('');

    const payload = {
      category,
      rating: category === 'review' ? rating : null,
      author: { name: name.trim(), role: role.trim(), email: email.trim() },
      location: location.trim(),
      title: title.trim(),
      body: body.trim(),
      photos: photos.map((p) => p.file),
      video: video?.file || null,
      videoUrl: videoUrl.trim() || null,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    if (typeof onSubmit === 'function') {
      onSubmit(payload);
    } else {
      console.info('[StorySubmission] no onSubmit handler — payload:', payload);
    }

    setSubmitted(true);
  }

  const inputBase =
    'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';
  const labelBase = 'mb-2 block font-body text-sm font-bold text-navy-900';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-premium-lg"
          >
            {/* Header */}
            <div className="border-b border-navy-100 bg-gradient-to-br from-emerald-50 to-white px-6 py-6 sm:px-10 sm:py-7">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-900 shadow-md transition hover:bg-cream"
              >
                <X size={18} />
              </button>
              <p className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Share Your Story
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                Add to the Foundation Community
              </h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-600">
                Sponsors, learners, volunteers and community partners — tell your part of the story.
                Submissions are reviewed before they appear publicly.
              </p>
            </div>

            {/* Success state */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={32} className="text-emerald-600" strokeWidth={3} />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">
                  Story received — thank you.
                </h3>
                <p className="mt-3 max-w-md font-body text-sm leading-6 text-navy-600">
                  Our team will review your submission. If approved, it will appear on the
                  Foundation page within a few days. We'll email you at{' '}
                  <span className="font-semibold text-navy-900">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-gold mt-8 inline-flex items-center gap-2 px-6 py-3"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-7 px-6 py-7 sm:px-10 sm:py-8">
                {/* Category */}
                <div>
                  <label className={labelBase}>
                    What kind of story is this? <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {CATEGORIES.map((cat) => {
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 shadow-md'
                              : 'border-navy-100 bg-white hover:border-emerald-300'
                          }`}
                        >
                          <span className="block font-body text-sm font-bold text-navy-900">
                            {cat.label}
                          </span>
                          <span className="mt-1 block font-body text-xs text-navy-500">
                            {cat.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating — only for reviews */}
                <AnimatePresence>
                  {category === 'review' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className={labelBase}>
                        Your rating <span className="text-emerald-600">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            aria-label={`Rate ${n} stars`}
                            className="rounded-full p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={
                                n <= rating
                                  ? 'fill-emerald-500 text-emerald-500'
                                  : 'text-navy-200'
                              }
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 font-body text-sm font-semibold text-navy-700">
                            {rating} / 5
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name + role */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="story-name" className={labelBase}>
                      Your name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        id="story-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sacdiyo Halima"
                        className={`${inputBase} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="story-role" className={labelBase}>
                      Your role / connection
                    </label>
                    <input
                      id="story-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Learner, Sponsor, Program Lead"
                      className={inputBase}
                    />
                  </div>
                </div>

                {/* Email + location */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="story-email" className={labelBase}>
                      Email <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        id="story-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`${inputBase} pl-10`}
                      />
                    </div>
                    <p className="mt-1.5 font-body text-xs text-navy-400">
                      Not shown publicly — we use it to contact you about the review.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="story-location" className={labelBase}>
                      Location
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        id="story-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nairobi, Kenya"
                        className={`${inputBase} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="story-title" className={labelBase}>
                    Story title <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="story-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your story a clear, short title"
                    className={inputBase}
                  />
                </div>

                {/* Body */}
                <div>
                  <label htmlFor="story-body" className={labelBase}>
                    Your story <span className="text-emerald-600">*</span>
                  </label>
                  <textarea
                    id="story-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    placeholder="Tell us what happened. What did you learn, build or give? Include names, places, and any impact numbers you know."
                    className={`${inputBase} resize-y`}
                  />
                  <p className="mt-1 font-body text-xs text-navy-400">
                    {body.length} / 3000 characters
                  </p>
                </div>

                {/* Photos */}
                <div>
                  <label className={labelBase}>
                    Photos <span className="font-normal text-navy-400">(optional, up to {MAX_PHOTOS})</span>
                  </label>

                  {photos.length > 0 && (
                    <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                      {photos.map((photo, i) => (
                        <div key={i} className="group relative">
                          <img
                            src={photo.preview}
                            alt=""
                            className="aspect-square w-full rounded-xl border border-navy-100 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label="Remove photo"
                            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-white opacity-0 shadow-md transition group-hover:opacity-100 hover:bg-red-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-cream/40 px-5 py-3 font-body text-sm font-semibold text-navy-600 transition-colors hover:border-emerald-400 hover:text-emerald-700"
                    >
                      <ImageIcon size={16} />
                      Add photos
                    </button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handlePhotos}
                    className="hidden"
                  />
                </div>

                {/* Video */}
                <div>
                  <label className={labelBase}>
                    Video <span className="font-normal text-navy-400">(optional)</span>
                  </label>

                  {video ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-cream/60 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                        <Video size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-body text-sm font-semibold text-navy-900">
                          {video.file.name}
                        </p>
                        <p className="font-body text-xs text-navy-500">
                          {(video.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        aria-label="Remove video"
                        className="rounded-lg p-2 text-navy-500 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-cream/40 px-5 py-3 font-body text-sm font-semibold text-navy-600 transition-colors hover:border-emerald-400 hover:text-emerald-700"
                      >
                        <Upload size={16} />
                        Upload video
                      </button>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Or paste a YouTube / Vimeo URL"
                        className={inputBase}
                      />
                    </div>
                  )}

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideo}
                    className="hidden"
                  />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-cream/40 p-4">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-navy-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-body text-sm leading-6 text-navy-700">
                    I confirm this story is true, that I have permission to share any photos or
                    video of other people, and I consent to InnoSpeak Global publishing this
                    story after review.
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <p className="font-body text-sm font-semibold text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex flex-col gap-3 border-t border-navy-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-body text-xs text-navy-500">
                    Reviewed before publishing · Usually within 3 working days
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                  >
                    Submit Story
                    <Send size={15} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}