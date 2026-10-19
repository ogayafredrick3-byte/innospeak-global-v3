import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import LearnerProfileCard from './LearnerProfileCard.jsx';
import ReviewSubmission from './ReviewSubmission.jsx';
import Button from '../ui/Button.jsx';
import { LEARNERS, LEARNERS_INTRO } from './learnersData.js';

export default function Testimonials() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow={LEARNERS_INTRO.eyebrow}
          title={LEARNERS_INTRO.title}
          subtitle={LEARNERS_INTRO.subtitle}
        />

        {/* Learner profile grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNERS.map((learner, i) => (
            <LearnerProfileCard key={learner.id} learner={learner} index={i} />
          ))}
        </div>

        {/* Review submission */}
        <div className="mt-16">
          <ReviewSubmission
            // TODO: wire to Supabase — see src/lib/supabase/
            // onSubmit={async (payload) => { await supabase.from('reviews').insert(payload) }}
          />
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 overflow-hidden rounded-3xl bg-navy-gradient p-8 text-center shadow-premium-lg sm:p-12"
        >
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to Write Your Story?
          </h3>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-navy-200 sm:text-base">
            Join a growing community of learners building skills, qualifications
            and confidence through InnoSpeak Global.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button to="/apply" variant="gold" size="lg" className="group">
              Apply Now
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:border-gold-400 hover:text-gold-400"
            >
              Talk to Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}