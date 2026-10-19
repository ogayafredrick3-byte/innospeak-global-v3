import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { updateOwnPassword } from '../../lib/supabase/auth';
import { updateStudentProfile } from '../../lib/supabase/studentPortal';

export default function ChangePassword() {
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
      await updateStudentProfile({ must_change_password: false });
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not update your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Set Your Password" description="Set your own password to continue." path="/portal/change-password" />

      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
          <ShieldCheck size={22} />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold text-navy-900">Set Your Password</h1>
        <p className="mt-2 text-center font-body text-sm text-navy-500">
          For your security, please set your own password before continuing to your portal.
        </p>

        <SectionCard className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="New Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 font-body text-sm text-navy-800">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-700" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:opacity-60">
              {isSubmitting ? 'Saving…' : 'Save Password & Continue'}
            </button>
          </form>
        </SectionCard>
      </div>
    </>
  );
}
