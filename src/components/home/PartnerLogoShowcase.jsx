import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PARTNERS, PARTNER_GROUPS } from './partnersData.js';

/**
 * PartnerLogoShowcase — renders real partner logos grouped by category.
 * Groups with zero partners are hidden automatically, so the layout
 * works with 1, 2, 5 or 20 partners.
 */

function PartnerCard({ partner, index }) {
  const Wrapper = partner.link ? 'a' : 'div';
  const wrapperProps = partner.link
    ? { href: partner.link, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Wrapper
        {...wrapperProps}
        className={`group block h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg sm:p-8 ${
          partner.link ? 'cursor-pointer' : ''
        }`}
      >
        {/* Logo container */}
        <div className="flex h-32 items-center justify-center rounded-xl bg-cream/60 p-4">
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Name */}
        <h4 className="mt-5 font-display text-base font-bold text-navy-900">
          {partner.name}
        </h4>

        {/* Location tag */}
        <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
          {partner.location}
        </p>

        {/* Description */}
        <p className="mt-3 font-body text-sm leading-6 text-navy-600">
          {partner.description}
        </p>

        {/* External link hint */}
        {partner.link && (
          <span className="mt-4 inline-flex items-center gap-1 font-body text-xs font-semibold text-navy-500 group-hover:text-gold-700">
            Visit website
            <ExternalLink size={12} />
          </span>
        )}
      </Wrapper>
    </motion.div>
  );
}

export default function PartnerLogoShowcase() {
  // Build groups that actually have partners — hides empty ones
  const groupsWithPartners = PARTNER_GROUPS.map((group) => ({
    ...group,
    partners: PARTNERS.filter((p) => p.group === group.id),
  })).filter((g) => g.partners.length > 0);

  if (groupsWithPartners.length === 0) return null;

  return (
    <div className="space-y-12">
      {groupsWithPartners.map((group) => (
        <div key={group.id}>
          {/* Group header */}
          <div className="mb-6 text-center">
            <h3 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">
              {group.label}
            </h3>
            <p className="mx-auto mt-1 max-w-xl font-body text-sm text-navy-500">
              {group.description}
            </p>
          </div>

          {/* Partner grid — auto columns based on count */}
          <div
            className={`mx-auto grid max-w-4xl gap-6 ${
              group.partners.length === 1
                ? 'grid-cols-1 max-w-md'
                : group.partners.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {group.partners.map((partner, i) => (
              <PartnerCard key={partner.id} partner={partner} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}