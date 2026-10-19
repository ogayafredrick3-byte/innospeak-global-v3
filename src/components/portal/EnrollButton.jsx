import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, CircleCheck, LogIn, TriangleAlert, CreditCard, Sparkles, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEnrollmentByCode, enrollInCourse } from '../../lib/supabase/portal';
import { parseFee } from '../../lib/data/programmeData.js';
import { getCurriculumStatus } from '../../lib/data/courseReadiness.js';
import { checkCoursePaid } from '../../lib/supabase/payments';
import CheckoutModal from './CheckoutModal';

/**
 * EnrollButton — self-service enrollment for a course.
 * Free courses enroll directly. Paid courses open CheckoutModal.
 */
export default function EnrollButton({ course }) {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const location = useLocation();

  const [enrollment, setEnrollment] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const coursePrice = parseFee(course?.fees);
  const isPaid = coursePrice > 0 && course?.isFree !== true;
  const publicationAuthorized = course?.ownerAuthorizedForPublication === true
    || (course?.code && getCurriculumStatus(course.code).hasStructuredContent);
  // Owner-authorised catalogue courses are open for self-paced enrolment.
  // Fixed-date cohorts remain separate offerings and do not block self-paced access.
  const enrollmentOpen = course?.enrollmentOpen !== false && publicationAuthorized;

  useEffect(() => {
    if (!user || !publicationAuthorized || !enrollmentOpen) {
      setIsChecking(false);
      return;
    }
    let cancelled = false;
    setIsChecking(true);

    const checks = [getEnrollmentByCode(course.code)];
    if (isPaid) {
      checks.push(checkCoursePaid(course.code).catch(() => null));
    }

    Promise.all(checks)
      .then(([data, paid]) => {
        if (cancelled) return;
        setEnrollment(data);
        if (paid) setPaymentConfirmed(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, course.code, isPaid, publicationAuthorized, enrollmentOpen]);

  async function handleEnroll() {
    setError(null);
    setIsEnrolling(true);
    try {
      const data = await enrollInCourse({
        code: course.code,
        title: course.name,
        pathway: course.pathway,
      });
      setEnrollment(data);
    } catch (err) {
      setError(err.message || 'Could not enroll you right now. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  }

  /* ── Course is not ready for enrolment ── */
  if (!publicationAuthorized) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7" role="status">
        <p className="font-body text-sm font-bold text-amber-950">Curriculum publication pending</p>
        <p className="font-body text-sm leading-6 text-amber-900">This course does not yet have owner-authorised curriculum content in the catalogue. Enrolment remains unavailable until publication is authorised and a specific offering is confirmed.</p>
        <Link to={`/contact?interest=course-availability&courseCode=${encodeURIComponent(course.code)}`} className="inline-flex items-center gap-2 self-start font-body text-sm font-bold text-amber-950 underline underline-offset-4">Ask about availability <ArrowRight size={14} /></Link>
      </div>
    );
  }

  /* ── Backend unavailable ── */
  if (!isConfigured) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7" role="status">
        <p className="font-body text-sm font-bold text-amber-950">Online enrolment is temporarily unavailable</p>
        <p className="font-body text-sm leading-6 text-amber-900">The learning service is not connected in this environment. Your course details remain available, but enrolment and progress tracking require the configured learning backend.</p>
        <Link to="/contact?interest=course-enrolment-support" className="inline-flex items-center gap-2 self-start font-body text-sm font-bold text-amber-950 underline underline-offset-4">Contact support <ArrowRight size={14} /></Link>
      </div>
    );
  }

  /* ── Loading ── */
  if (authLoading || isChecking) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center rounded-2xl border border-navy-100 bg-white px-6 py-6 shadow-premium">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy-100 border-t-gold-500" />
      </div>
    );
  }

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-premium sm:flex-row sm:justify-between sm:p-7">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
            <GraduationCap size={20} />
          </span>
          <div>
            <p className="font-body text-sm font-bold text-navy-900">
              Log in to enroll in {course.name}
            </p>
            <p className="mt-0.5 font-body text-xs text-navy-500">
              Track your progress and access learning materials.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          state={{ from: location }}
          className="btn-gold inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap sm:w-auto"
        >
          <LogIn size={15} />
          Log In to Enroll
        </Link>
      </div>
    );
  }

  /* ── Already enrolled / paid ── */
  if (paymentConfirmed && !enrollment) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7" role="status">
        <p className="font-body text-sm font-bold text-amber-950">Payment confirmed — checking course access</p>
        <p className="font-body text-sm leading-6 text-amber-900">Your payment record is confirmed, but this page has not yet verified an active enrolment. Open My Learning to refresh your course list or contact support if the course is still missing.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/learn" className="inline-flex items-center gap-2 font-body text-sm font-bold text-amber-950 underline underline-offset-4">Open My Learning <ArrowRight size={14} /></Link>
          <Link to="/contact?interest=payment-support" className="inline-flex items-center gap-2 font-body text-sm font-bold text-amber-950 underline underline-offset-4">Contact support <ArrowRight size={14} /></Link>
        </div>
      </div>
    );
  }

  if (enrollment?.status === 'completed') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border-2 border-emerald-300/60 bg-emerald-50 p-6 shadow-premium sm:flex-row sm:justify-between sm:p-7">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><CircleCheck size={20} /></span>
          <div>
            <p className="font-body text-sm font-bold text-emerald-900">Course completed</p>
            <p className="mt-0.5 font-body text-xs text-emerald-800">Your completion is recorded. Visit My Learning to review your progress and eligible certificates.</p>
          </div>
        </div>
        <Link to="/learn" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-body text-sm font-bold text-white transition-all hover:bg-emerald-700 sm:w-auto">Open My Learning <ArrowRight size={15} /></Link>
      </div>
    );
  }

  if (enrollment && enrollment.status !== 'dropped') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border-2 border-emerald-300/60 bg-emerald-50 p-6 shadow-premium sm:flex-row sm:justify-between sm:p-7">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CircleCheck size={20} />
          </span>
          <div>
            <p className="font-body text-sm font-bold text-emerald-900">
              You're enrolled in this course
            </p>
            <p className="mt-0.5 font-body text-xs text-emerald-800">
              Continue from where you left off.
            </p>
          </div>
        </div>
        <Link
          to={enrollment?.courseId ? `/learn/courses/${enrollment.courseId}` : '/learn'}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-body text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 sm:w-auto"
        >
          Continue Learning
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  /* ── Ready to enroll ── */
  const enrollLabel = isPaid
    ? `Enroll Now — ${course.fees}`
    : 'Enroll Now — Free';

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
      <div className="w-full rounded-2xl border border-navy-100 bg-white p-6 shadow-premium sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isPaid
                  ? 'bg-navy-900 text-gold-400'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isPaid ? <CreditCard size={20} /> : <Sparkles size={20} />}
            </span>
            <div>
              <p className="font-body text-sm font-bold text-navy-900">
                {isPaid ? 'Ready to enroll?' : 'This course is free to complete'}
              </p>
              <p className="mt-0.5 font-body text-xs text-navy-500">
                {isPaid
                  ? 'Complete checkout securely. Course access is activated only after payment confirmation.'
                  : 'No payment required. Track your progress and check certificate eligibility against the course completion criteria.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => (isPaid ? setCheckoutOpen(true) : handleEnroll())}
              disabled={isEnrolling}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-6 py-3 sm:w-auto disabled:opacity-60"
            >
              {isEnrolling ? (
                'Enrolling…'
              ) : (
                <>
                  {enrollLabel}
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
            <Link
              to="/contact"
              className="text-center font-body text-[11px] font-semibold text-navy-500 transition-colors hover:text-navy-900"
            >
              Need help? Contact us
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {isPaid && (
        <CheckoutModal
          course={course}
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setPaymentConfirmed(true);
            setCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
}