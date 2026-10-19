import { ArrowRight, Wrench, Lightbulb, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';

const labBenefits = [
  {
    icon: Wrench,
    title: 'Learn by Building',
    description: 'Don\'t just watch lectures. Work on real technical challenges and experiments.',
  },
  {
    icon: Lightbulb,
    title: 'Apply Concepts',
    description: 'Turn theory into practice through hands-on projects and practical assessments.',
  },
  {
    icon: Rocket,
    title: 'Create Evidence',
    description: 'Build portfolio pieces and credentials that prove your capabilities.',
  },
];

/**
 * LabsPromotion — premium section highlighting the practical Labs offering.
 * 
 * Position this early in the home page journey to communicate that InnoSpeak
 * is not just theoretical — it's practical and applied.
 */
export default function LabsPromotion() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Practical Learning"
          title="Don't Just Learn It. Build It."
          subtitle="Practical Labs help you apply concepts through experiments, technical tasks, projects and evidence-based assessments."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {labBenefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-navy-100 bg-white p-6 transition hover:shadow-premium">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/labs"
            className="btn-gold inline-flex items-center gap-2"
          >
            Explore Labs
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
