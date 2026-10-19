import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, ArrowRight, TriangleAlert } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import {
  getSponsorByEmail,
  upsertSponsor,
  setSponsorSession,
  getSponsorSession,
} from '../../lib/data/sponsorStore.js';

export default function SponsorSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSponsorSession();
    if (session) navigate('/sponsor', { replace: true });
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    let sponsor = getSponsorByEmail(trimmed);
    if (!sponsor) {
      // First-time visitor — create a sponsor record
      sponsor = upsertSponsor({ email: trimmed, name: name.trim() || null });
    } else if (name.trim() && name.trim() !== sponsor.name) {
      // Update name if provided
      upsertSponsor({ email: trimmed, name: name.trim() });
    }

    setSponsorSession(trimmed);
    navigate('/sponsor', { replace: true });
  }

  return (
    <>
      <Seo
        title="Sponsor Sign In"
        description="Sign in to your InnoSpeak Global Foundation sponsor portal."
        path="/sponsor/signin"
      />

      <div className="min-h-screen bg-white">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* Left brand panel */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
            <motion.div
              animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-20 right-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-[130px]"
            />
            <motion.div
              animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
            />

            <div className="relative z-10">
              <Link to="/foundation" className="inline-flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700">
                  <Heart size={20} className="text-white" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  InnoSpeak Foundation
                </span>
              </Link>

              <h1 className="mt-16 font-display text-4xl font-bold leading-[1.1] text-white xl:text-5xl">
                Every contribution
                <span className="mt-2 block text-emerald-300">changes a life.</span>
              </h1>

              <p className="mt-5 max-w-md font-body text-base leading-[1.7] text-emerald-50/90">
                Sign in to see the programs you support, your giving history, and the
                real impact your contributions are making.
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  'Track every program you support',
                  'See total contributions and disbursements',
                  'Read anonymized learner progress reports',
                  'No learner identities shared — privacy protected',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span className="font-body text-sm leading-6 text-emerald-50/90">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-8">
              <Link
                to="/foundation"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
              >
                Learn more about the Foundation
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>

          {/* Right form */}
          <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile brand */}
              <Link to="/foundation" className="mb-8 flex items-center gap-2 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                  <Heart size={16} className="text-white" />
                </div>
                <span className="font-display text-base font-bold text-navy-900">
                  Sponsor Portal
                </span>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
                  <Heart size={22} />
                </div>

                <h1 className="mt-5 font-display text-3xl font-bold text-navy-900">
                  Sponsor Sign In
                </h1>
                <p className="mt-2 font-body text-sm text-navy-500">
                  Enter the email you used when you gave to InnoSpeak Global Foundation.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400"
                      />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm text-navy-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-navy-700"
                    >
                      Your name <span className="font-normal text-navy-400">(optional)</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="How we should address you"
                      className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-navy-800">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn-gold w-full"
                  >
                    Continue to Sponsor Portal
                  </motion.button>
                </form>

                <p className="mt-6 text-center font-body text-xs text-navy-400">
                  Haven&rsquo;t given yet?{' '}
                  <Link
                    to="/foundation#ways-to-give"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Explore ways to support
                  </Link>
                </p>

                <p className="mt-4 text-center font-body text-xs text-navy-400">
                  <Link to="/" className="transition-colors hover:text-navy-700">
                    ← Back to home
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}