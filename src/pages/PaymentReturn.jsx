import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CreditCard, LoaderCircle } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { capturePaypalOrder } from '../lib/supabase/payments.js';

export default function PaymentReturn() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const started = useRef(false);
  const [state, setState] = useState({ status: 'checking', message: 'Verifying your PayPal payment securely…' });
  const orderId = searchParams.get('token');
  const cancelled = searchParams.get('cancelled') === '1' || searchParams.has('PayerID') === false && !orderId;

  useEffect(() => {
    if (authLoading || started.current) return;
    if (cancelled) {
      setState({ status: 'cancelled', message: 'Checkout was cancelled. No course access has been granted.' });
      return;
    }
    if (!user) {
      setState({ status: 'login', message: 'Sign in with the same account you used to start checkout, then return to this page.' });
      return;
    }
    if (!orderId) {
      setState({ status: 'error', message: 'The PayPal order reference is missing. Check your payments or contact support before trying again.' });
      return;
    }

    started.current = true;
    setState({ status: 'processing', message: 'Confirming the captured payment and activating enrolment…' });
    capturePaypalOrder({ orderId })
      .then((result) => {
        if (result?.success && (result?.enrolled || result?.status === 'enrolled' || result?.message === 'Already confirmed')) {
          setState({ status: 'success', message: 'Payment verified. Your course enrolment is active.' });
        } else if (result?.success) {
          setState({ status: 'pending', message: result?.message || 'Payment was confirmed. Course access is awaiting a course-record check; contact support if it does not appear shortly.' });
        } else {
          setState({ status: 'error', message: result?.error || 'The payment could not be verified. No new course access has been granted.' });
        }
      })
      .catch((error) => setState({ status: 'error', message: error?.message || 'The payment could not be verified. Please check your payments or contact support.' }));
  }, [authLoading, cancelled, user, orderId]);

  const icon = state.status === 'success' ? CheckCircle2 : state.status === 'processing' || state.status === 'checking' ? LoaderCircle : state.status === 'pending' ? CreditCard : AlertTriangle;
  const Icon = icon;
  const iconTone = state.status === 'success' ? 'text-emerald-600 bg-emerald-50' : state.status === 'processing' || state.status === 'checking' ? 'text-gold-600 bg-gold-50' : 'text-amber-700 bg-amber-50';

  return (
    <>
      <Seo title="Payment status" description="Verify payment and course enrolment status." path="/payment-return" />
      <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center px-4 py-12">
        <section className="w-full rounded-3xl border border-navy-100 bg-white p-7 text-center shadow-premium sm:p-10" aria-live="polite">
          <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${iconTone}`}>
            <Icon size={30} className={state.status === 'processing' || state.status === 'checking' ? 'animate-spin' : ''} />
          </span>
          <p className="mt-5 font-body text-xs font-bold uppercase tracking-[0.18em] text-gold-700">InnoSpeak Global Checkout</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-900">
            {state.status === 'success' ? 'Payment successful' : state.status === 'cancelled' ? 'Checkout cancelled' : state.status === 'login' ? 'Sign in to verify payment' : state.status === 'pending' ? 'Payment confirmed' : state.status === 'error' ? 'Payment needs attention' : 'Verifying payment'}
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-6 text-navy-600">{state.message}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {state.status === 'login' && <Link to="/login" state={{ from: location }} className="btn-gold">Sign in to continue</Link>}
            {(state.status === 'success' || state.status === 'pending') && <Link to="/learn" className="btn-gold">Go to My Learning</Link>}
            {(state.status === 'cancelled' || state.status === 'error') && <Link to="/learn/catalog" className="btn-outline">Return to course catalogue</Link>}
            <Link to="/contact?interest=payment-support" className="btn-outline">Contact support</Link>
          </div>
        </section>
      </main>
    </>
  );
}
