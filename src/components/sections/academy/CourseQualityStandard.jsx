import { BookOpenCheck, ClipboardCheck, FolderCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';

const STANDARD = [
  {
    icon: BookOpenCheck,
    title: 'A clear learning purpose',
    description: 'Each course should state who it serves, the entry expectations and the skills a learner is working toward.',
  },
  {
    icon: ClipboardCheck,
    title: 'Structured modules and assessment',
    description: 'Lessons, practice activities and assessments should map to explicit learning outcomes—not just a list of topics.',
  },
  {
    icon: FolderCheck,
    title: 'Evidence of applied learning',
    description: 'Where appropriate, learners produce assignments, demonstrations or projects that show how they can use the skill.',
  },
  {
    icon: BadgeCheck,
    title: 'Transparent completion and credentials',
    description: 'Completion rules and certificate issuers should be clear. External accreditation is claimed only when verified.',
  },
];

export default function CourseQualityStandard() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20 lg:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="The InnoSpeak Course Standard"
          title="A Course Should Lead to Demonstrable Capability"
          subtitle="Our quality direction is simple: clear outcomes, structured learning, meaningful assessment and honest credential information. Each published course should meet this standard before it is promoted as launch-ready."
          light
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARD.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-navy-900">
                <Icon size={22} aria-hidden="true" />
              </div>
              <p className="mt-5 font-body text-xs font-bold uppercase tracking-widest text-gold-300">Standard {String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 font-body text-sm leading-6 text-navy-100">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
          <p className="max-w-2xl font-body text-sm leading-6 text-navy-100">Course availability, delivery mode, fees and recognition status should always be confirmed on the individual course page.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 font-body text-sm font-bold text-navy-900 transition-transform hover:scale-[1.02]">
            Explore courses <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
