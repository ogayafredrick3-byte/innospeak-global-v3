import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Upload, X, Check, Send } from 'lucide-react';
import { COURSES } from '../../lib/data/programmeData.js';
import { REVIEWS_INTRO } from './learnersData.js';

/**
 * ReviewSubmission — form for learners to submit a review.
 * UI-complete. Wire onSubmit to Supabase (reviews table + storage) later.
 */

const MAX_PHOTO_MB = 5;

export default function ReviewSubmission({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Photo must be under ${MAX_PHOTO_MB}MB.`);
      return;
    }
    setError('');
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function reset() {
    setRating(0);
    setName('');
    setProgram('');
    setMessage('');
    clearPhoto();
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) return setError('Please choose a rating.');
    if (!name.trim()) return setError('Please enter your name.');
    if (!program) return setError('Please select the course you took.');
    if (message.trim().length < 20) return setError('Please write at least 20 characters.');

    setError('');

    const payload = { name: name.trim(), program, rating, message: message.trim(), photo };

    if (typeof onSubmit === 'function') {
      onSubmit(payload);
    } else {
      console.info('[ReviewSubmission] no onSubmit handler — payload:', payload);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 4000);
  }

  const inputBase =
    'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-premium-lg"
    >
      {/* Header */}
      <div className="border-b border-navy-100 bg-cream/60 px-6 py-6 sm:px-8 sm:py-7">
        <h3 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">
          {REVIEWS_INTRO.title}
        </h3>
        <p className="mt-1.5 max-w-2xl font-body text-sm leading-6 text-navy-600">
          {REVIEWS_INTRO.subtitle}
        </p>
      </div>

      {/* Success state */}
      {submitted ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Check size={26} className="text-emerald-600" strokeWidth={3} />
          </div>
          <h4 className="mt-5 font-display text-xl font-bold text-navy-900">
            Thank you for sharing your story.
          </h4>
          <p className="mt-2 max-w-md font-body text-sm text-navy-600">
            Your review will appear once it has been reviewed by our team.
          </p>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          {/* Rating */}
          <div>
            <label className="mb-2 block font-body text-sm font-bold text-navy-900">
              Your rating <span className="text-gold-600">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                  className="rounded-full p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={
                      n <= rating
                        ? 'fill-gold-500 text-gold-500'
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
          </div>

          {/* Name + Program row */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reviewer-name"
                className="mb-2 block font-body text-sm font-bold text-navy-900"
              >
                Your name <span className="text-gold-600">*</span>
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sacdiyo H."
                className={inputBase}
              />
            </div>

            <div>
              <label
                htmlFor="reviewer-program"
                className="mb-2 block font-body text-sm font-bold text-navy-900"
              >
                Course taken <span className="text-gold-600">*</span>
              </label>
              <select
                id="reviewer-program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className={inputBase}
              >
                <option value="">Select a course…</option>
                {COURSES.slice(0, 40).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="reviewer-message"
              className="mb-2 block font-body text-sm font-bold text-navy-900"
            >
              What did you think? <span className="text-gold-600">*</span>
            </label>
            <textarea
              id="reviewer-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share what you learned, how the trainers helped, and what changed for you…"
              className={`${inputBase} resize-y`}
            />
            <p className="mt-1 font-body text-xs text-navy-400">
              {message.length} / 500
            </p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="mb-2 block font-body text-sm font-bold text-navy-900">
              Add a photo <span className="font-normal text-navy-400">(optional)</span>
            </label>

            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-2xl border border-navy-100 object-cover shadow-premium"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  aria-label="Remove photo"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-white shadow-md transition hover:bg-red-500"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-cream/40 px-5 py-3 font-body text-sm font-semibold text-navy-600 transition-colors hover:border-gold-400 hover:text-gold-700"
              >
                <Upload size={16} />
                Choose a photo
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="mt-1.5 font-body text-xs text-navy-400">
              PNG, JPG or WebP · Max {MAX_PHOTO_MB}MB
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-3 border-t border-navy-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-xs text-navy-500">
              Your review will be reviewed before publishing.
            </p>
            <button
              type="submit"
              className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              Submit Review
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}