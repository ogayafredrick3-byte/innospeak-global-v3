import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Linkedin, Facebook, MessageCircle } from 'lucide-react';
import { fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'info@innospeakglobal.org',
    href: 'mailto:info@innospeakglobal.org',
    hint: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    label: 'Call or WhatsApp',
    value: '+254 716 921 700',
    href: 'tel:+254716921700',
    hint: 'Mon–Sun, available all day',
  },
  {
    icon: MapPin,
    label: 'Based In',
    value: 'Nairobi, Kenya',
    href: null,
    hint: 'Serving learners worldwide',
  },
];

const SOCIALS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/innospeak-global',
    hoverClass: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    href: 'https://wa.me/254716921700',
    hoverClass: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/innospeakglobal',
    hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      {/* Contact channels grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {CHANNELS.map(({ icon: Icon, label, value, href, hint }) => {
          const content = (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                <Icon size={22} aria-hidden="true" />
              </div>
              <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                {label}
              </p>
              <p className="mt-1 font-body text-sm font-bold text-navy-900 break-words">
                {value}
              </p>
              {hint && (
                <p className="mt-1 font-body text-xs text-navy-500">{hint}</p>
              )}
            </>
          );

          const className =
            'flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg';

          return (
            <motion.div
              key={label}
              variants={fadeUpItem}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
            >
              {href ? (
                <a href={href} className={className}>
                  {content}
                </a>
              ) : (
                <div className={className}>{content}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Working hours + socials row */}
      <motion.div
        variants={fadeUpItem}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        className="flex flex-col items-start gap-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-premium sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Working hours */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <Clock size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Open 7 Days
            </p>
            <p className="mt-0.5 font-body text-sm font-bold text-navy-900">
              Monday – Sunday · Available all day
            </p>
            <p className="mt-0.5 font-body text-xs text-navy-500">
              Reach out any time. We reply within 24 hours.
            </p>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-2">
          {SOCIALS.map(({ id, label, icon: Icon, href, hoverClass }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-700 transition-all duration-300 ${hoverClass}`}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}