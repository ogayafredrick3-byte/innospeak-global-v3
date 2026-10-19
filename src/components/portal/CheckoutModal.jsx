import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CreditCard, Loader2, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import {
  createPendingPayment,
  initiateMpesaPayment,
  createPaypalOrder,
  getPayment,
} from '../../lib/supabase/payments';
import { parseFee } from '../../lib/data/programmeData';

/**
 * CheckoutModal — payment flow for paid courses.
 *
 * Supports M-PESA (STK Push) and PayPal. The actual payment logic
 * runs in edge functions (mpesa-pay, paypal-pay) that verify the
 * transaction server-side before activating enrollment. The frontend
 * never grants access on its own.
 */
export default function CheckoutModal({ course, open, onClose, onSuccess }) {
  const [provider, setProvider] = useState(null);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('selecting'); // selecting | processing | waiting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [paypalRedirectUrl, setPaypalRedirectUrl] = useState('');
  const [activePaymentId, setActivePaymentId] = useState(null);

  const amount = parseFee(course?.fees);
  const currency = course?.fees?.includes('USD') || course?.fees?.includes('$') ? 'USD' : 'KES';
  const paypalAvailable = currency === 'USD' && amount > 0;

  function handleClose() {
    setStatus('selecting');
    setProvider(null);
    setPhone('');
    setErrorMsg('');
    setPaypalRedirectUrl('');
    setActivePaymentId(null);
    onClose();
  }

  useEffect(() => {
    if (status !== 'waiting' || provider !== 'mpesa' || !activePaymentId) return undefined;
    let cancelled = false;
    let timer;
    let attempts = 0;
    const maxAttempts = 45;

    const pollPayment = async () => {
      try {
        const payment = await getPayment(activePaymentId);
        if (cancelled) return;
        if (payment?.status === 'paid') {
          setStatus('success');
          setErrorMsg('');
          onSuccess?.();
          return;
        }
        if (['failed', 'cancelled', 'refunded'].includes(payment?.status)) {
          setStatus('error');
          setErrorMsg('The payment was not completed. You can safely try again.');
          return;
        }
      } catch {
        // A transient read failure should not mark a provider payment as failed.
      }
      attempts += 1;
      if (attempts < maxAttempts && !cancelled) {
        timer = setTimeout(pollPayment, 4000);
      } else if (!cancelled) {
        setErrorMsg('Your payment is still being checked. You can close this window and return later; do not pay again unless the payment status is confirmed.');
      }
    };

    pollPayment();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [status, provider, activePaymentId, onSuccess]);

  async function handleMpesa() {
    if (!phone || phone.length < 9) {
      setErrorMsg('Please enter a valid M-PESA phone number.');
      return;
    }
    setStatus('processing');
    setErrorMsg('');
    try {
      const payment = await createPendingPayment({
        courseCode: course.code,
        provider: 'mpesa',
        phone,
      });

      setActivePaymentId(payment.id);
      const result = await initiateMpesaPayment({ paymentId: payment.id });

      if (result?.success) {
        setStatus('waiting');
      } else {
        setStatus('error');
        setErrorMsg(result?.error || 'Could not initiate M-PESA payment.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong with the M-PESA payment.');
    }
  }

  async function handlePaypal() {
    setStatus('processing');
    setErrorMsg('');
    try {
      const payment = await createPendingPayment({
        courseCode: course.code,
        provider: 'paypal',
      });

      const result = await createPaypalOrder({ paymentId: payment.id });

      if (result?.success && result?.approvalUrl) {
        setPaypalRedirectUrl(result.approvalUrl);
        setStatus('waiting');
      } else {
        setStatus('error');
        setErrorMsg(result?.error || 'Could not create PayPal order.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong with PayPal.');
    }
  }


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-premium-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy-100 bg-navy-gradient px-6 py-5">
              <div>
                <p className="font-display text-lg font-bold text-white">Complete Your Enrollment</p>
                <p className="mt-0.5 font-body text-xs text-navy-100/70">{course?.name}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Price summary */}
              <div className="mb-6 rounded-2xl bg-gold-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-navy-600">Course Fee</span>
                  <span className="font-display text-2xl font-bold text-navy-900">
                    {currency} {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status: selecting */}
              {status === 'selecting' && (
                <div className="space-y-3">
                  <p className="mb-4 font-body text-sm text-navy-600">Choose a payment method:</p>
                  {currency === 'KES' && <p className="rounded-xl bg-navy-50 px-3 py-2 text-xs leading-5 text-navy-600">This course is currently priced in KES. PayPal checkout requires an approved USD price; use M-PESA for this price or contact support for international payment options.</p>}

                  <button
                    type="button"
                    onClick={() => setProvider('mpesa')}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                      provider === 'mpesa'
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-navy-100 hover:border-gold-300'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Smartphone size={20} />
                    </span>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-navy-900">M-PESA</p>
                      <p className="font-body text-xs text-navy-500">Pay via STK Push (KES only)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => paypalAvailable && setProvider('paypal')}
                    disabled={!paypalAvailable}
                    aria-disabled={!paypalAvailable}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      provider === 'paypal'
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-navy-100 hover:border-gold-300'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CreditCard size={20} />
                    </span>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-navy-900">PayPal</p>
                      <p className="font-body text-xs text-navy-500">{paypalAvailable ? 'Credit card / PayPal balance' : 'Available after an approved USD price is configured'}</p>
                    </div>
                  </button>

                  {/* M-PESA phone input */}
                  {provider === 'mpesa' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <label className="mb-1.5 block font-body text-xs font-semibold text-navy-600">
                        M-PESA Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="w-full rounded-xl border border-navy-200 px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                      />
                      <button
                        type="button"
                        onClick={handleMpesa}
                        disabled={!phone || phone.length < 9}
                        className="btn-gold mt-3 w-full disabled:opacity-50"
                      >
                        <Smartphone size={15} className="mr-2" />
                        Send STK Push
                      </button>
                    </motion.div>
                  )}

                  {/* PayPal button */}
                  {provider === 'paypal' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <button
                        type="button"
                        onClick={handlePaypal}
                        className="btn-gold w-full"
                      >
                        <CreditCard size={15} className="mr-2" />
                        Continue to PayPal
                      </button>
                    </motion.div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status: processing */}
              {status === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 size={32} className="animate-spin text-gold-500" />
                  <p className="font-body text-sm text-navy-600">Processing your payment...</p>
                </div>
              )}

              {/* Status: waiting (M-PESA) */}
              {status === 'waiting' && provider === 'mpesa' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <Smartphone size={26} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-navy-900">Check Your Phone</p>
                    <p className="mt-1 font-body text-sm text-navy-600">
                      We've sent an M-PESA payment request to {phone}. Enter your M-PESA PIN to complete
                      the payment. Your enrollment will be activated automatically once payment is confirmed.
                    </p>
                  </div>
                  <button type="button" onClick={handleClose} className="btn-outline mt-2">
                    Close
                  </button>
                </div>
              )}

              {/* Status: waiting (PayPal) */}
              {status === 'waiting' && provider === 'paypal' && paypalRedirectUrl && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CreditCard size={26} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-navy-900">Redirecting to PayPal</p>
                    <p className="mt-1 font-body text-sm text-navy-600">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                  <a href={paypalRedirectUrl} className="btn-gold mt-2" rel="noopener noreferrer">
                    <Lock size={14} className="mr-2" />
                    Go to PayPal
                  </a>
                </div>
              )}

              {/* Status: success */}
              {status === 'success' && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <CheckCircle2 size={28} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-navy-900">Payment Successful</p>
                    <p className="mt-1 font-body text-sm text-navy-600">
                      Your enrollment is now active. You can start learning right away.
                    </p>
                  </div>
                  <button type="button" onClick={handleClose} className="btn-gold mt-2">
                    Start Learning
                  </button>
                </div>
              )}

              {/* Status: error */}
              {status === 'error' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertTriangle size={26} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-navy-900">Payment Failed</p>
                    <p className="mt-1 font-body text-sm text-navy-600">{errorMsg}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('selecting');
                      setErrorMsg('');
                    }}
                    className="btn-outline mt-2"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Security note */}
              <div className="mt-6 flex items-center justify-center gap-2 font-body text-xs text-navy-400">
                <Lock size={12} />
                <span>Payments are processed securely. We never store your PIN or card details.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
