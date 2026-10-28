import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Hash,
  Loader2,
  TriangleAlert,
  UserCheck,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import { verifyAdmissionNumber } from '../lib/supabase/admissions';
import { signUpWithEmail } from '../lib/supabase/auth';

const inputClass =
  'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';

export default function Register() {
  const navigate = useNavigate();

  // step: 'number' | 'password' | 'verify-email'
  const [step, setStep] = useState('number');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [verified, setVerified] = useState(null); // { name, institutional_email, already_registered }
  const [personalEmail, setPersonalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* ── Step 1: verify the admission number ──────────────── */
  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const normalizedAdmissionNumber = admissionNumber.trim().toUpperCase();
      const result = await verifyAdmissionNumber(normalizedAdmissionNumber);
      if (!result?.valid) {
        setError(
          result?.reason === 'empty'
            ? 'Please enter your admission number.'
            : 'We could not find that admission number. Check the format (ISGENG260001) and try again.'
        );
        setSubmitting(false);
        return;
      }
      if (result.already_registered) {
        setError('This admission number is already registered. Please log in instead.');
        setSubmitting(false);
        return;
      }
      setAdmissionNumber(normalizedAdmissionNumber);
      setVerified(result);
      // Personal email is intentionally not returned by public admission verification.
      setPersonalEmail('');
      setStep('password');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Register] verify failed:', err);
      setError(
        err?.message?.includes('Supabase')
          ? 'Registration is temporarily unavailable. Please try again shortly.'
          : 'Could not verify your admission number right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Step 2: create the account ────────────────────────── */
  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!personalEmail.trim()) {
      setError('Please enter your personal email address.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await signUpWithEmail({
        email: personalEmail.trim(),
        password,
        fullName: verified.name,
        admissionNumber,
      });

      if (data.session) {
        // Email confirmation is disabled — signed in immediately.
        navigate('/portal', { replace: true });
      } else {
        // Email confirmation required.
        setStep('verify-email');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Register] signup failed:', err);
      setError(
        err?.message?.toLowerCase().includes('already')
          ? 'An account already exists with this email. Please log in instead.'
          : 'We could not create your account right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Register Your Account"
        description="Register your InnoSpeak Global account using your admission number."
        path="/register"
      />

      <div className="min-h-screen bg-white">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* Left brand panel */}
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
                You&rsquo;ve been admitted.
                <span className="mt-2 block text-emerald-300">Now claim your account.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-md font-body text-base leading-[1.7] text-emerald-50/90"
              >
                Use the admission number issued to you by the institution.
                Once registered, you can log in with your admission number
                or personal email.
              </motion.p>
            </div>

            <div className="relative z-10 border-t border-white/10 px-10 py-8 xl:px-16">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="font-body text-xs font-semibold text-white/80">
                  Admission numbers follow the format ISG + 3-letter course code + YY + 4-digit serial.
                </span>
              </div>
            </div>
          </aside>

          {/* Right form */}
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
              {/* ── Step 1 — Enter admission number ─────────────── */}
              {step === 'number' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                    <Hash size={22} />
                  </div>

                  <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                    Register your account
                  </h1>
                  <p className="mt-2 font-body text-sm text-navy-500">
                    Enter the admission number issued to you after your application
                    was approved.
                  </p>

                  <form onSubmit={handleVerify} className="mt-8 space-y-5">
                    <div>
                      <label
                        htmlFor="admissionNumber"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Admission number
                      </label>
                      <input
                        id="admissionNumber"
                        type="text"
                        required
                        autoComplete="off"
                        autoCapitalize="characters"
                        placeholder="ISGENG260001"
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                        className={inputClass}
                      />
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-navy-800">
                        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !admissionNumber.trim()}
                      className="btn-gold w-full disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Verifying…
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2">
                          Verify Admission Number
                          <ArrowRight size={15} />
                        </span>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center font-body text-sm text-navy-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                      Log in
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* ── Step 2 — Set password ──────────────────────── */}
              {step === 'password' && verified && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                    <UserCheck size={22} />
                  </div>

                  <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                    Welcome, {verified.name || 'Student'}
                  </h1>
                  <p className="mt-2 font-body text-sm text-navy-500">
                    Set a password for your account. You&rsquo;ll use it together
                    with your admission number or email to log in.
                  </p>

                  <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                    <p className="font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Admission number
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-navy-900">
                      {admissionNumber}
                    </p>
                    {verified.institutional_email && (
                      <p className="mt-2 font-body text-xs text-navy-500">
                        Institutional email: <strong className="text-navy-700">{verified.institutional_email}</strong>
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleRegister} className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="personalEmail"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Personal email
                      </label>
                      <input
                        id="personalEmail"
                        type="email"
                        required
                        autoComplete="email"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        className={inputClass}
                      />
                      <p className="mt-1.5 font-body text-xs text-navy-400">
                        Enter the same email address you submitted with your application. This is checked before your account is linked.
                      </p>
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
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                      />
                      <p className="mt-1.5 font-body text-xs text-navy-400">
                        At least 8 characters.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-navy-800">
                        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-gold w-full disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Creating account…
                        </span>
                      ) : (
                        'Create My Account'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStep('number'); setError(''); }}
                      className="w-full text-center font-body text-xs font-semibold text-navy-400 hover:text-navy-700"
                    >
                      ← Use a different admission number
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 3 — Verify email ──────────────────────── */}
              {step === 'verify-email' && (
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
                    <strong className="font-semibold text-navy-900">{personalEmail}</strong>.
                    Click it to activate your account, then log in with your admission number.
                  </p>
                  <Link to="/login" className="btn-gold mt-8 inline-block px-8 py-3">
                    Go to Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}