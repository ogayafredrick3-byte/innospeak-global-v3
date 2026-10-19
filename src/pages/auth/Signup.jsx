import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  TriangleAlert,
  CheckCircle2,
  GraduationCap,
  FlaskConical,
  HeartHandshake,
  Check,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import { signUpWithEmail } from '../../lib/supabase/auth';

const BRAND_BENEFITS = [
  { icon: GraduationCap, label: 'Learn', text: 'Explore structured learning pathways across Academy and Labs' },
  { icon: FlaskConical, label: 'Build', text: 'Hands-on projects in software, AI, cloud and more' },
  { icon: HeartHandshake, label: 'Get support', text: 'Explore Foundation support options and programme updates' },
];

const FLOATING_DOTS = [
  { left: '15%', top: '20%', size: 5, delay: 0, duration: 9 },
  { left: '80%', top: '28%', size: 4, delay: 1.2, duration: 11 },
  { left: '25%', top: '75%', size: 6, delay: 0.6, duration: 10 },
  { left: '70%', top: '70%', size: 3, delay: 1.8, duration: 12 },
];

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signUpWithEmail({ email, password, fullName });
      if (data.session) {
        navigate('/portal', { replace: true });
      } else {
        setNeedsVerification(true);
      }
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Sign Up"
        description="Create your InnoSpeak Global student account."
        path="/signup"
      />

      <div className="min-h-screen bg-white">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* ═══ Left — Brand panel (desktop only) ═══ */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900 lg:flex lg:flex-col lg:justify-between">
            <motion.div
              animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-20 right-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-[130px]"
              aria-hidden="true"
            />
            <motion.div
              animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
                backgroundSize: '64px 64px',
              }}
              aria-hidden="true"
            />

            {FLOATING_DOTS.map((dot, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute rounded-full bg-emerald-300/40"
                style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{
                  duration: dot.duration,
                  delay: dot.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              />
            ))}

            <div className="relative z-10 px-10 pt-12 xl:px-16">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                  <span className="font-display text-base font-bold text-white">IS</span>
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  InnoSpeak Global
                </span>
              </Link>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-14 font-display text-4xl font-bold leading-[1.1] text-white xl:text-5xl"
              >
                Your journey starts
                <span className="mt-2 block text-emerald-300">with one account.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-md font-body text-base leading-[1.7] text-emerald-50/90"
              >
                Join learners across Kenya and beyond building skills, qualifications
                and careers through InnoSpeak Global.
              </motion.p>
            </div>

            <div className="relative z-10 px-10 xl:px-16">
              <ul className="space-y-4">
                {BRAND_BENEFITS.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.li
                      key={benefit.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                        <Icon size={18} className="text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-bold text-white">
                          {benefit.label}
                        </p>
                        <p className="mt-0.5 font-body text-xs leading-5 text-emerald-100/70">
                          {benefit.text}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative z-10 border-t border-white/10 px-10 py-8 xl:px-16"
            >
              <div className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400" />
                <span className="font-body text-xs font-semibold text-white/80">
                  Free to create. No payment required to browse and start learning.
                </span>
              </div>
            </motion.div>
          </aside>

          {/* ═══ Right — Signup form ═══ */}
          <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                  <span className="font-display text-sm font-bold">IS</span>
                </div>
                <span className="font-display text-base font-bold text-navy-900">
                  InnoSpeak Global
                </span>
              </Link>
            </div>

            <div className="mx-auto w-full max-w-md">
              {needsVerification ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
                    <CheckCircle2 size={26} />
                  </div>
                  <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                    Check your email
                  </h1>
                  <p className="mt-3 font-body text-sm leading-6 text-navy-500">
                    We&rsquo;ve sent a confirmation link to{' '}
                    <strong className="font-semibold text-navy-900">{email}</strong>. Click it to
                    activate your account, then log in.
                  </p>
                  <Link to="/login" className="btn-gold mt-8 inline-block px-8 py-3">
                    Go to Login
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
                    <UserPlus size={22} />
                  </div>

                  <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                    Create your account
                  </h1>
                  <p className="mt-2 font-body text-sm text-navy-500">
                    Join the InnoSpeak Global student portal.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Full name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                      <p className="mt-1.5 font-body text-xs text-navy-400">
                        At least 8 characters.
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-navy-800">
                        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full disabled:opacity-60"
                    >
                      {isSubmitting ? 'Creating account…' : 'Sign Up'}
                    </motion.button>
                  </form>

                  {/* Admitted-student path */}
                  <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                    <p className="font-body text-xs leading-5 text-navy-700">
                      <strong className="text-navy-900">Been admitted?</strong>{' '}
                      Register with the admission number issued to you after your
                      application was approved.{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Register with admission number →
                      </Link>
                    </p>
                  </div>

                  <p className="mt-8 text-center font-body text-sm text-navy-500">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Log in
                    </Link>
                  </p>

                  <p className="mt-4 text-center font-body text-xs text-navy-400">
                    <Link to="/" className="transition-colors hover:text-navy-700">
                      ← Back to home
                    </Link>
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}