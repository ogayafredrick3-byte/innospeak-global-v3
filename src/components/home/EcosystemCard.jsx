import { motion } from 'framer-motion';
import { GraduationCap, Heart, FlaskConical, BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = {
  graduation: GraduationCap,
  heart: Heart,
  flask: FlaskConical,
  career: BriefcaseBusiness,
};

export default function EcosystemCard({ card, index }) {
  const Icon = ICONS[card.icon] ?? GraduationCap;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-premium transition-all duration-300 hover:shadow-premium-lg"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
        <Icon size={26} strokeWidth={1.8} />
      </div>

      <p className="mt-5 font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
        {card.tagline}
      </p>
      <h3 className="mt-2 font-display text-xl font-bold text-navy-900">
        {card.name}
      </h3>
      <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-navy-600">
        {card.description}
      </p>

      <ul className="mt-5 grid grid-cols-2 gap-2">
        {card.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 font-body text-xs text-navy-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to={card.link}
        className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-navy-900 transition-colors group-hover:text-gold-600"
      >
        Learn More
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.article>
  );
}
