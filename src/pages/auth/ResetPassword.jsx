import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import { updateOwnPassword } from '../../lib/supabase/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOwnPassword(password);
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not update your password. The reset link may have expired — request a new one.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Set New Password" description="Set a new password for your InnoSpeak Global account." path="/reset-password" />

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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
              <ShieldCheck size={22} />
            </div>
            <h1 className="mt-5 text-center font-display text-2xl font-bold text-navy-900">
              Set a new password
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block font-body text-xs font-semibold text-navy-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-navy-100 bg-white px-4 py-2.5 font-body text-sm text-navy-900 transition-colors duration-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block font-body text-xs font-semibold text-navy-700">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? 'Updating\u2026' : 'Update Password'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}