import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Send, User, Mail, Phone, Building, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * EventRegistrationForm — modal for registering for a Foundation event.
 * UI-complete. Wire `onSubmit` to Supabase to persist.
 */
export default function EventRegistrationForm({ event, open, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [attendanceMode, setAttendanceMode] = useState(
    event?.eventType === 'hybrid' ? 'in_person' : event?.eventType || 'in_person'
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const inputBase =
    'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';

  function reset() {
    setName('');
    setEmail('');
    setPhone('');
    setOrganization('');
    setNotes('');
    setError('');
  }

  function handleClose() {
    if (submitted) {
      reset();
      setSubmitted(false);
    }
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email.');
    setError('');

    const payload = {
      eventId: event.id,
      eventTitle: event.title,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      organization: organization.trim(),
      attendanceMode,
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    if (typeof onSubmit === 'function') onSubmit(payload);
    else console.info('[EventRegistration] payload:', payload);

    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      {open && event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-premium-lg"
          >
            <div className="border-b border-navy-100 bg-gradient-to-br from-emerald-50 to-white px-6 py-6 sm:px-8">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-900 shadow-md transition hover:bg-cream"
              >
                <X size={18} />
              </button>
              <p className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Register for Event
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-navy-900 sm:text-2xl">
                {event.title}
              </h2>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={32} className="text-emerald-600" strokeWidth={3} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-navy-900">
                  Registration details prepared
                </h3>
                <p className="mt-3 max-w-sm font-body text-sm leading-6 text-navy-600">
                  Your request for <strong>{event.title}</strong> has not been saved online yet. Please contact our team to confirm your place.
                </p>
                <Link to="/contact" onClick={handleClose} className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3">
                  Contact the team
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-gold mt-8 inline-flex items-center gap-2 px-6 py-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-7 sm:px-8">
                <div>
                  <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                    Full name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                    Email <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                    Phone number <span className="font-normal text-navy-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 700 000 000"
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                    School / Organisation <span className="font-normal text-navy-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="If applicable"
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </div>

                {event.eventType === 'hybrid' && (
                  <div>
                    <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                      How will you attend?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAttendanceMode('in_person')}
                        className={`rounded-xl border-2 px-4 py-3 font-body text-sm font-semibold transition ${
                          attendanceMode === 'in_person'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-navy-100 bg-white text-navy-700 hover:border-emerald-300'
                        }`}
                      >
                        In person
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceMode('online')}
                        className={`rounded-xl border-2 px-4 py-3 font-body text-sm font-semibold transition ${
                          attendanceMode === 'online'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-navy-100 bg-white text-navy-700 hover:border-emerald-300'
                        }`}
                      >
                        Online
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                    Anything we should know? <span className="font-normal text-navy-400">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Accessibility needs, dietary requirements, questions..."
                    className={`${inputBase} resize-y`}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <p className="font-body text-sm font-semibold text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end border-t border-navy-100 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                  >
                    Confirm Registration
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