import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Heart, ClipboardCheck, Handshake } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { FOUNDATION_INITIATIVES } from './foundationData.js';

/**
 * FoundationInitiatives — proposed sponsor-ready programme concepts.
 * They are deliberately not presented as live fundraisers until budgets,
 * funding status and beneficiary targets have been verified.
 */
export default function FoundationInitiatives() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Funding Opportunities in Development"
          title="Defined Programmes for Potential Partners"
          subtitle="These programme concepts show what InnoSpeak could deliver with the right partners. Budgets, cohort sizes and launch dates must be approved before a funding round opens."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-7">
          {FOUNDATION_INITIATIVES.map((initiative, i) => {

            return (
              <motion.article
                key={initiative.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-premium-lg"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-gold-400" />

                <div className="flex flex-1 flex-col p-7">
                  {/* Category + status */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {initiative.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                      {initiative.status === 'proposed' ? 'Proposed concept' : initiative.status === 'recruiting' ? 'Applications open' : initiative.status === 'funded' ? 'Fully funded' : 'In delivery'}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                    {initiative.title}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-600">
                    {initiative.description}
                  </p>

                  <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                    <div className="flex items-start gap-3">
                      <Handshake size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-wider text-navy-600">Potential sponsor funding</p>
                        <p className="mt-1 font-body text-sm leading-6 text-navy-700">{initiative.fundingBrief}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-navy-100 p-4">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-wider text-navy-600">Proposed measures</p>
                        <p className="mt-1 font-body text-sm leading-6 text-navy-700">{initiative.measures}</p>
                      </div>
                    </div>
                    <p className="mt-3 font-body text-xs leading-5 text-navy-500">Funding target, confirmed beneficiary count and launch status will be published after costing, approval and partner confirmation.</p>
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={`/contact?interest=foundation-donate-${initiative.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <Heart size={14} />
                      Support This
                    </Link>
                    <Link
                      to="/apply?division=foundation"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-2.5 font-body text-sm font-bold text-navy-900 transition-colors hover:border-emerald-400 hover:text-emerald-700"
                    >
                      Ask About Eligibility
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Closing note */}
        <p className="mx-auto mt-10 max-w-2xl text-center font-body text-xs leading-6 text-navy-500">
          These concepts are not a claim that funding is currently available. A programme becomes active only after its budget, eligibility, delivery partner, application window and reporting requirements are approved.
        </p>
      </div>
    </section>
  );
}