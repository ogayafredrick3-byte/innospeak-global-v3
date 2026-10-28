import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { TextField, SelectField, Button } from '../../ui';
import { submitContactMessage } from '../../../lib/supabase/contact';
import { fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Admissions',
  'Foundation Donation',
  'Foundation Sponsorship',
  'Corporate Partnership',
  'Foundation Grant',
  'Partnerships',
  'Media & Press',
  'Other',
];

// ?interest= values → subject option + optional intro copy
const INTEREST_MAP = {
  'foundation':                  { subject: 'Foundation Donation' },
  'foundation-donate':           { subject: 'Foundation Donation', intro: "Tell us how you'd like to support us, whether through a one-time, monthly, or unrestricted donation." },
  'foundation-donate-individual':{ subject: 'Foundation Donation', intro: "Tell us how you'd like to support us, whether through a one-time, monthly, or unrestricted donation." },
  'foundation-donate-girls-in-tech': { subject: 'Foundation Donation', intro: "You are supporting the Girls in Tech Scholarship. Every $500 funds one full scholar." },
  'foundation-donate-community-digital': { subject: 'Foundation Donation', intro: "You are supporting the Community Digital Literacy fund." },
  'foundation-donate-children-education': { subject: 'Foundation Donation', intro: "You are supporting the Children Education Fund." },
  'foundation-donate-youth-careers': { subject: 'Foundation Donation', intro: "You are supporting the Youth Career Accelerator." },
  'foundation-sponsor-learner':  { subject: 'Foundation Sponsorship', intro: "Sponsor a named learner through their full program. We'll match you with a scholar." },
  'foundation-corporate':        { subject: 'Corporate Partnership', intro: "Let's discuss funding a cohort or sponsoring a Labs track." },
  'foundation-grant':            { subject: 'Foundation Grant', intro: "For foundations, NGOs and institutional funders." },
  'partnership':                 { subject: 'Partnerships' },
  'tvet':                        { subject: 'Admissions' },
};

const initialData = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const interest = searchParams.get('interest');
  const interestConfig = interest ? INTEREST_MAP[interest] : null;

  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill subject from ?interest=
  useEffect(() => {
    if (interestConfig?.subject && !data.subject) {
      setData((prev) => ({ ...prev, subject: interestConfig.subject }));
    }
  }, [interestConfig?.subject, data.subject]);

  const showFoundationBanner = useMemo(
    () => interestConfig?.intro && interestConfig.subject.startsWith('Foundation') || interestConfig?.subject === 'Corporate Partnership',
    [interestConfig]
  );

  function update(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!data.name.trim()) e.name = 'Required';
    if (!data.email.trim()) e.email = 'Required';
    if (!data.subject) e.subject = 'Required';
    if (!data.message.trim()) e.message = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      setSubmitError('');
      await submitContactMessage({ ...data, interest: interest || null });
      setSubmitted(true);
      setData(initialData);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-3xl border border-navy-100 bg-white p-10 text-center shadow-premium-lg"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10">
          <CheckCircle2 size={32} className="text-gold-600" aria-hidden="true" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">Message Sent</h3>
        <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-navy-600">
          Thank you for reaching out. Our team will get back to you as soon as possible.
        </p>
        <Button
          variant="outline"
          size="md"
          className="mt-8"
          onClick={() => setSubmitted(false)}
          withArrow={false}
        >
          Send Another Message
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={fadeUpItem}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-navy-100 bg-white p-8 shadow-premium-lg md:p-10"
    >
      {/* Context banner when arriving from a Foundation link */}
      {showFoundationBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <Heart size={18} />
          </div>
          <div>
            <p className="font-body text-sm font-bold text-emerald-900">
              Foundation support
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-emerald-800">
              {interestConfig.intro}
            </p>
          </div>
        </div>
      )}

      <h3 className="font-display text-2xl font-bold text-navy-900">
        {interestConfig?.subject?.startsWith('Foundation') ? 'Reach the Foundation Team' : 'Send Us a Message'}
      </h3>
      <p className="mt-2 font-body text-sm text-navy-600">
        {interestConfig?.subject?.startsWith('Foundation')
          ? 'Tell us how you would like to help. We reply within 2 working days.'
          : "Fill out the form below and we'll respond as soon as we can."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          label="Full Name"
          name="name"
          required
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
          placeholder="Jane Doe"
        />
        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          placeholder="jane@example.com"
        />
        <TextField
          label="Phone Number"
          name="phone"
          optional
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+254 700 000 000"
        />
        <SelectField
          label="Subject"
          name="subject"
          required
          value={data.subject}
          onChange={(e) => update('subject', e.target.value)}
          error={errors.subject}
          options={SUBJECT_OPTIONS}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="field-message" className="font-body text-sm font-bold tracking-wide text-navy-900">
          Message
          <span className="ml-1 text-gold-600">*</span>
        </label>
        <div className="group relative">
          <textarea
            id="field-message"
            name="message"
            rows={5}
            value={data.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="How can we help?"
            aria-invalid={errors.message ? 'true' : 'false'}
            className={`w-full resize-none rounded-2xl border bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm transition-all duration-300 placeholder:text-navy-400 focus:outline-none focus:ring-4 focus:ring-gold-500/20 ${
              errors.message
                ? 'border-red-400 focus:border-red-400'
                : 'border-navy-100 hover:border-gold-300 focus:border-gold-500'
            }`}
          />
        </div>
        {errors.message && (
          <p className="font-body text-xs font-semibold text-red-500">{errors.message}</p>
        )}
      </div>

      {submitError && (
        <p className="mt-4 font-body text-sm font-semibold text-red-600">{submitError}</p>
      )}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          'Sending...'
        ) : (
          <>
            {interestConfig?.subject?.startsWith('Foundation') ? (
              <>
                Send to Foundation
                <Heart size={18} className="ml-2" />
              </>
            ) : (
              <>
                Send Message
                <Send size={18} className="ml-2" />
              </>
            )}
          </>
        )}
      </Button>
    </motion.form>
  );
}