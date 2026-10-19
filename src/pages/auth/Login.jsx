import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogIn,
  TriangleAlert,
  GraduationCap,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import { signInWithIdentifier } from '../../lib/supabase/auth';

const BRAND_FEATURES = [
  { icon: GraduationCap, label: 'Academy', text: 'Structured courses across 12 pathways' },
  { icon: FlaskConical, label: 'Labs', text: 'Software, AI, Cloud, Security & Engineering' },
  { icon: HeartHandshake, label: 'Foundation', text: 'Scholarships and community programs' },
  { icon: ShieldCheck, label: 'Certificates', text: 'Verifiable, division-branded credentials' },
];

// Small floating dots on the brand panel — matches emerald heroes
const FLOATING_DOTS = [
  { left: '15%', top: '20%', size: 5, delay: 0, duration: 9 },
  { left: '80%', top: '28%', size: 4, delay: 1.2, duration: 11 },
  { left: '25%', top: '75%', size: 6, delay: 0.6, duration: 10 },
  { left: '70%', top: '70%', size: 3, delay: 1.8, duration: 12 },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/portal';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithIdentifier({ identifier, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log you in. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Log In" description="Log in to your InnoSpeak Global student portal." path="/login" />

      <div className="min-h-screen bg-white">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* ═══ Left — Brand panel (desktop only) ═══ */}
          <aside className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between">
            <HeroBackground variant="learning" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-950/85 via-navy-900/75 to-emerald-950/85" aria-hidden="true" />
            {/* Animated orbs */}
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

            {/* Grid pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
                backgroundSize: '64px 64px',
              }}
              aria-hidden="true"
            />

            {/* Floating dots */}
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

            {/* Top: logo + intro */}
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
                One account.
                <span className="mt-2 block text-emerald-300">Every part of the ecosystem.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-md font-body text-base leading-[1.7] text-emerald-50/90"
              >
                Access your courses, projects, certificates and Foundation support —
                all in one place.
              </motion.p>
            </div>

            {/* Middle: feature list */}
            <div className="relative z-10 px-10 xl:px-16">
              <ul className="space-y-4">
                {BRAND_FEATURES.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.li
                      key={feature.label}
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
                          {feature.label}
                        </p>
                        <p className="mt-0.5 font-body text-xs leading-5 text-emerald-100/70">
                          {feature.text}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom: trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative z-10 border-t border-white/10 px-10 py-8 xl:px-16"
            >
              <div className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400" />
                <span className="font-body text-xs font-semibold text-white/80">
                  Trusted by learners, communities and partners in Kenya and beyond
                </span>
              </div>
            </motion.div>
          </aside>

          {/* ═══ Right — Login form ═══ */}
          <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
            {/* Mobile: small brand header */}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Header */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
                  <LogIn size={22} />
                </div>

                <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                  Welcome back
                </h1>
                <p className="mt-2 font-body text-sm text-navy-500">
                  Log in with your Student ID or email to access your portal.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                    >
                      Student ID or Email
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="ISGENG260001 or you@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                    <p className="mt-1.5 font-body text-xs text-navy-400">
                      Newly admitted students: use the Student ID and temporary password
                      issued by the institution.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="font-body text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
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
                    {isSubmitting ? 'Logging in…' : 'Log In'}
                  </motion.button>
                </form>

                {/* Signup link */}
                <p className="mt-8 text-center font-body text-sm text-navy-500">
                  Don&rsquo;t have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Sign up
                  </Link>
                </p>

                {/* Back home */}
                <p className="mt-4 text-center font-body text-xs text-navy-400">
                  <Link to="/" className="transition-colors hover:text-navy-700">
                    ← Back to home
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}