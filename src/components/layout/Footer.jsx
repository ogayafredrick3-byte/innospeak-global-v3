import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  UserCircle2,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const quickLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Founder', to: '/founder' },
  { label: 'Impact', to: '/impact' },
  { label: 'Career Hub', to: '/career-hub' },   // ← ADDED
  { label: 'Contact', to: '/contact' },
];

const programmes = [
  { label: 'Academy', to: '/academy' },
  { label: 'Foundation', to: '/foundation' },
  { label: 'Labs', to: '/labs' },
  { label: 'Apply Now', to: '/apply' },
];

const linkClass =
  'font-body text-sm text-navy-100/80 transition-colors duration-200 hover:text-gold-300';

const portalLinkClass =
  'flex items-center gap-2 font-body text-sm font-semibold text-gold-300 transition-colors duration-200 hover:text-gold-200';

export default function Footer() {
  const { user, profile } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'lms_admin';

  return (
    <footer className="bg-navy-gradient text-white">
      <div className="container-premium py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + socials */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center">
              <span className="font-display text-xl font-bold text-white">InnoSpeak</span>
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-gold-gradient shadow-gold" />
              <span className="ml-2 font-display text-xl font-bold text-white">Global</span>
            </Link>
            <p className="mt-4 font-body text-sm leading-relaxed text-navy-100/80">
              Transforming communication, technical and leadership skills for the next
              generation of innovators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-base font-semibold text-white">Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={user ? '/portal' : '/login'}
                  className={portalLinkClass}
                >
                  <UserCircle2 size={16} />
                  {user ? 'Student Portal' : 'Student Login'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <h3 className="font-display text-base font-semibold text-white">Programmes</h3>
            <ul className="mt-5 space-y-3">
              {programmes.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="font-display text-base font-semibold text-white">Portals</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/learn" className={portalLinkClass}>
                  <GraduationCap size={16} />
                  E-Learning
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/portal' : '/login'}
                  className={portalLinkClass}
                >
                  <BookOpen size={16} />
                  Student Portal
                </Link>
              </li>
              {(isAdmin || isInstructor) && (
                <li>
                  <Link to={isAdmin ? '/admin' : '/teach'} className={portalLinkClass}>
                    <ShieldCheck size={16} />
                    {isAdmin ? 'Staff Panel' : 'Tutor Dashboard'}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/become-tutor" className={portalLinkClass}>
                  <UserCheck size={16} />
                  Become a Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-display text-base font-semibold text-white">Get in Touch</h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-gold-400" />
                <a href="mailto:hello@innospeak.global" className={linkClass}>
                  hello@innospeak.global
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
                <span className={linkClass}>Global · Remote &amp; On-site</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-premium flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="font-body text-xs text-navy-100/70">
            © {new Date().getFullYear()} InnoSpeak Global. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="font-body text-xs text-navy-100/70 transition-colors hover:text-gold-300">
              Privacy
            </Link>
            <Link to="/terms" className="font-body text-xs text-navy-100/70 transition-colors hover:text-gold-300">
              Terms
            </Link>
            <Link to="/faq" className="font-body text-xs text-navy-100/70 transition-colors hover:text-gold-300">
              FAQ
            </Link>
          </div>
          <p className="font-body text-xs text-navy-100/70">
            Built for the next generation of leaders.
          </p>
        </div>
      </div>
    </footer>
  );
}