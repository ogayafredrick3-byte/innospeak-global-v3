import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, TriangleAlert, CheckCircle2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import { sendPasswordResetEmail } from '../../lib/supabase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Reset Password" description="Reset your InnoSpeak Global student portal password." path="/forgot-password" />

      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-navy-gradient py-20">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 bg-navy-radial opacity-60" />
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-premium-lg sm:p-10"
          >
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
                  <CheckCircle2 size={22} />
                </div>
                <h1 className="mt-5 font-display text-2xl font-bold text-navy-900">Check your email</h1>
                <p className="mt-2 font-body text-sm text-navy-500">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                </p>
                <Link to="/login" className="btn-gold mt-6 inline-block">
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
                  <KeyRound size={22} />
                </div>
                <h1 className="mt-5 text-center font-display text-2xl font-bold text-navy-900">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-center font-body text-sm text-navy-500">
                  Enter your email and we&rsquo;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block font-body text-xs font-semibold text-navy-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-navy-100 bg-white px-4 py-2.5 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 font-body text-sm text-navy-800">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-700" />
                      <span>{error}</span>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending\u2026' : 'Send Reset Link'}
                  </motion.button>
                </form>

                <p className="mt-6 text-center font-body text-sm text-navy-500">
                  <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
                    Back to Login
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}