import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Heart } from 'lucide-react';
import { sponsorNav } from './sponsorNav.js';
import {
  getSponsorSession,
  getSponsorByEmail,
  clearSponsorSession,
} from '../../lib/data/sponsorStore.js';

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {sponsorNav.map(({ key, label, path, icon: Icon, end }) => (
        <NavLink
          key={key}
          to={path}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-navy-100/80 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon size={17} className="shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function SponsorShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const session = getSponsorSession();
  const sponsor = session ? getSponsorByEmail(session.email) : null;
  const displayName = sponsor?.name || session?.email || 'Sponsor';

  function handleSignOut() {
    clearSponsorSession();
    navigate('/sponsor/signin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col bg-gradient-to-b from-navy-950 to-navy-900 lg:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <Link to="/foundation" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                <Heart size={16} className="text-white" />
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  InnoSpeak
                </p>
                <p className="font-display text-sm font-bold text-white">
                  Sponsor Portal
                </p>
              </div>
            </Link>
          </div>

          <NavItems />

          <div className="border-t border-white/10 p-4">
            <p className="truncate font-body text-xs text-navy-100/70">
              Signed in as
            </p>
            <p className="mt-0.5 truncate font-body text-sm font-semibold text-white">
              {displayName}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-navy-100/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden">
            <div
              className="absolute inset-0 bg-navy-950/60"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative flex w-64 max-w-[80%] flex-col bg-gradient-to-b from-navy-950 to-navy-900 shadow-premium-lg">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                    <Heart size={14} className="text-white" />
                  </div>
                  <p className="font-display text-sm font-bold text-white">
                    Sponsor Portal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-navy-100/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col">
          <header className="sticky top-20 z-30 flex items-center justify-between gap-3 border-b border-navy-100 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-navy-700 hover:bg-navy-50"
            >
              <Menu size={20} />
            </button>
            <p className="font-display text-base font-bold text-navy-900">
              Sponsor Portal
            </p>
            <span className="w-9" />
          </header>

          <div className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}