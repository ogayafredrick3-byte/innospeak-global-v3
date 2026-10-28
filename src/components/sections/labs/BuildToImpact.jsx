import { ClipboardList, Wrench, FlaskConical, FileCheck2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';

const BUILD_STEPS = [
  { icon: ClipboardList, title: 'Define the problem', detail: 'A project brief names the user, the need, constraints and what success means.' },
  { icon: Wrench, title: 'Build a solution', detail: 'Learners work with appropriate tools, software, simulation or supervised equipment.' },
  { icon: FlaskConical, title: 'Test and improve', detail: 'The project is checked against requirements, safety considerations and feedback.' },
  { icon: FileCheck2, title: 'Publish the evidence', detail: 'A portfolio record captures the deliverable, tests, learner contribution and review.' },
];

export default function BuildToImpact() {
  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="InnoSpeak Build-to-Impact"
          title="Make the Work Visible"
          subtitle="A distinctive Lab experience should leave learners with evidence of what they built, how it was tested and what they learned. The experience should offer more than a course completion badge."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BUILD_STEPS.map(({ icon: Icon, title, detail }, index) => (
            <article key={title} className="relative rounded-2xl border border-navy-100 bg-white p-6 shadow-premium">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <span className="font-display text-2xl font-bold text-navy-200">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900">{title}</h3>
              <p className="mt-2 font-body text-sm leading-6 text-navy-600">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-gold-300/50 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <h3 className="font-display text-lg font-bold text-navy-900">Projects should be honest about how they were built.</h3>
            <p className="mt-2 max-w-3xl font-body text-sm leading-6 text-navy-600">Each project should identify the learner's contribution, tools used, testing limitations and whether it was simulated, remotely supported or built with supervised physical equipment.</p>
          </div>
          <Link to="/labs#labs-catalogue" className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 font-body text-sm font-bold text-white transition-colors hover:bg-navy-800 sm:mt-0">
            Explore Lab tracks <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
