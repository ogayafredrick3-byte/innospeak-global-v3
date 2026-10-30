import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  UserCircle2,
  ShieldCheck,
  ChevronDown,
  GraduationCap,
  BookOpen,
  UserCheck,
  FlaskConical,
  HeartHandshake,
  LayoutGrid,
} from 'lucide-react';
import useScrolled from '../../hooks/useScrolled.js';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo/logo.png';

/**
 * Routes whose hero opens with a dark image or gradient.
 * Only these get the transparent navbar at the top of the page.
 * Every other page gets the navy-glass navbar from first paint.
 */
const DARK_HERO_PATHS = new Set([
  '/programs',
]);


  { label: 'Academy', to: '/academy', icon: GraduationCap, description: 'Structured courses & certification' },
  { label: 'Labs', to: '/labs', icon: FlaskConical, description: 'Practical engineering & innovation' },
  { label: 'Foundation', to: '/foundation', icon: HeartHandshake, description: 'Scholarships & educational support' },
  { label: 'All Programs', to: '/programs', icon: LayoutGrid, description: 'Browse the full catalogue' },
];

const aboutLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Our Founder', to: '/founder' },
  { label: 'Our Impact', to: '/impact' },
];

const topNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Compass', to: '/tutor' },
  { label: 'Career Hub', to: '/career-hub' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const scrolled = useScrolled(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const accountRef = useRef(null);
  const aboutRef = useRef(null);
  const exploreRef = useRef(null);
  const { pathname } = useLocation();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isInstructor = ['admin', 'lms_admin', 'instructor'].includes(profile?.role);

  const hasDarkHero = DARK_HERO_PATHS.has(pathname);
  const isSolid = scrolled || !hasDarkHero;

  useEffect(() => {
    function onClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const aboutActive = aboutLinks.some((l) => pathname === l.to);
  const exploreActive = exploreLinks.some((l) => pathname === l.to);

  // ── Style tokens ────────────────────────────────────────────
  // Text is white in both states. Background switches from fully
  // transparent (over dark heroes) to navy glass (everywhere else).
  const linkBase = 'font-body text-sm font-medium transition-colors duration-200';
  const linkIdle = 'text-white/85 hover:text-gold-400';
  const linkActive = 'text-gold-400';
  const wordmarkColor = 'text-white';
  const menuIconColor = 'text-white hover:bg-white/10';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isSolid
          ? 'border-b border-gold-500/25 bg-navy-900/90 shadow-premium-lg backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-premium flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt="InnoSpeak Global" className="mr-2 h-10 w-10 select-none" draggable={false} />
          <span className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 sm:text-2xl ${wordmarkColor}`}>
            InnoSpeak
          </span>
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-gold-gradient shadow-gold transition-transform duration-300 group-hover:scale-125" />
          <span className={`ml-2 font-display text-xl font-bold tracking-tight transition-colors duration-300 sm:text-2xl ${wordmarkColor}`}>
            Global
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 lg:flex">
          <li>
            <Link to="/" className={`${linkBase} ${linkIdle} ${pathname === '/' ? linkActive : ''}`}>
              Home
            </Link>
          </li>

          <li className="relative" ref={aboutRef}>
            <button
              type="button"
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              aria-controls="about-navigation-menu"
              className={`flex items-center gap-1 ${linkBase} ${linkIdle} ${aboutActive ? linkActive : ''}`}
            >
              About
              <ChevronDown size={13} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  id="about-navigation-menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-48 overflow-hidden rounded-xl border border-navy-700 bg-navy-900 py-2 shadow-premium-lg backdrop-blur-xl"
                >
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setAboutOpen(false)}
                      className={`block px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${
                        pathname === link.to ? 'bg-white/5 text-gold-400' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          <li className="relative" ref={exploreRef}>
            <button
              type="button"
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              aria-controls="explore-navigation-menu"
              className={`flex items-center gap-1 ${linkBase} ${linkIdle} ${exploreActive ? linkActive : ''}`}
            >
              Explore
              <ChevronDown size={13} className={`transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  id="explore-navigation-menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 mt-3 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 py-3 shadow-premium-lg backdrop-blur-xl"
                >
                  {exploreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setExploreOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${
                          pathname === link.to ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
                          <Icon size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className={`font-body text-sm font-bold ${pathname === link.to ? 'text-gold-400' : 'text-white'}`}>
                            {link.label}
                          </p>
                          <p className="font-body text-xs text-white/60">{link.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {topNavLinks.slice(1).map((link) => {
            const active = pathname === link.to;
            return (
              <li key={link.to}>
                <Link to={link.to} className={`${linkBase} ${linkIdle} ${active ? linkActive : ''}`}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-controls="account-navigation-menu"
                className={`flex items-center gap-1.5 ${linkBase} ${linkIdle}`}
              >
                <UserCircle2 size={17} />
                My Account
                <ChevronDown size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    id="account-navigation-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-navy-700 bg-navy-900 py-2 shadow-premium-lg backdrop-blur-xl"
                  >
                    <Link to="/portal" onClick={() => setAccountOpen(false)} className={`flex items-center gap-2.5 px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${pathname === '/portal' ? 'bg-white/5 text-gold-400' : ''}`}>
                      <UserCircle2 size={16} />
                      Student Portal
                    </Link>
                    <Link to="/learn" onClick={() => setAccountOpen(false)} className={`flex items-center gap-2.5 px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${pathname.startsWith('/learn') ? 'bg-white/5 text-gold-400' : ''}`}>
                      <BookOpen size={16} />
                      E-Learning
                    </Link>
                    {isInstructor && (
                      <Link to="/teach" onClick={() => setAccountOpen(false)} className={`flex items-center gap-2.5 px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${pathname.startsWith('/teach') ? 'bg-white/5 text-gold-400' : ''}`}>
                        <GraduationCap size={16} />
                        Teach
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)} className={`flex items-center gap-2.5 border-t border-white/10 px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${pathname.startsWith('/admin') ? 'bg-white/5 text-gold-400' : ''}`}>
                        <ShieldCheck size={16} />
                        Staff Panel
                      </Link>
                    )}
                    <Link to="/become-tutor" onClick={() => setAccountOpen(false)} className={`flex items-center gap-2.5 border-t border-white/10 px-4 py-2.5 font-body text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-gold-400 ${pathname === '/become-tutor' ? 'bg-white/5 text-gold-400' : ''}`}>
                      <UserCheck size={16} />
                      Become a Tutor
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className={`flex items-center gap-1.5 ${linkBase} ${linkIdle} ${pathname === '/login' ? linkActive : ''}`}>
              <UserCircle2 size={17} />
              Student Login
            </Link>
          )}
          <Link to="/apply" className="btn-gold">
            Apply Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors lg:hidden ${menuIconColor}`}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-navy-900/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-premium flex flex-col gap-1 py-4">
              <li>
                <Link to="/" onClick={() => setMobileOpen(false)} className={`block rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${pathname === '/' ? 'bg-gold-500/15 text-gold-400' : 'text-white/85 hover:bg-white/5'}`}>
                  Home
                </Link>
              </li>

              <li className="px-4 pt-3 pb-1 font-body text-xs font-bold uppercase tracking-wider text-white/40">
                About
              </li>
              {aboutLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${pathname === link.to ? 'bg-gold-500/15 text-gold-400' : 'text-white/85 hover:bg-white/5'}`}>
                    {link.label}
                  </Link>
                </li>
              ))}

              <li className="px-4 pt-3 pb-1 font-body text-xs font-bold uppercase tracking-wider text-white/40">
                Explore
              </li>
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${pathname === link.to ? 'bg-gold-500/15 text-gold-400' : 'text-white/85 hover:bg-white/5'}`}>
                    <link.icon size={16} className="text-gold-400" />
                    {link.label}
                  </Link>
                </li>
              ))}

              {topNavLinks.slice(1).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${pathname === link.to ? 'bg-gold-500/15 text-gold-400' : 'text-white/85 hover:bg-white/5'}`}>
                    {link.label}
                  </Link>
                </li>
              ))}

              <li className="mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/portal" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">Student Portal</Link>
                    <Link to="/learn" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">E-Learning</Link>
                    {isInstructor && <Link to="/teach" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">Teach</Link>}
                    {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">Staff Panel</Link>}
                    <Link to="/become-tutor" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">Become a Tutor</Link>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center font-body text-sm font-bold text-white transition-colors hover:bg-white/10">Student Login</Link>
                )}
                <Link to="/apply" onClick={() => setMobileOpen(false)} className="btn-gold w-full">Apply Now</Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}