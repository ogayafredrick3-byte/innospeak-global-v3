import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { learnNav } from './learnNav';
import NotificationBell from '../lms/NotificationBell.jsx';

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {learnNav.map(({ key, label, path, icon: Icon, end }) => (
        <NavLink
          key={key}
          to={path}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? 'bg-gold-500/15 text-gold-700'
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

export default function LearnShell() {
  const { profile, user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student';

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-72 shrink-0 flex-col bg-navy-gradient lg:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-300">E-Learning</p>
            <p className="mt-1 font-display text-lg font-bold text-white">Learn</p>
          </div>
          <NavItems />
          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-navy-100/80 transition-colors hover:bg-white/5 hover:text-white">
              <LogOut size={17} />
              Log Out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden">
            <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} />
            <aside className="relative flex w-72 max-w-[80%] flex-col bg-navy-gradient shadow-premium-lg">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-300">E-Learning</p>
                  <p className="mt-1 font-display text-lg font-bold text-white">Learn</p>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col">
          <header className="sticky top-20 z-30 flex items-center justify-between gap-4 border-b border-navy-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden">
                <Menu size={20} />
              </button>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Welcome back</p>
                <p className="font-display text-base font-bold text-navy-900 sm:text-lg">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={signOut}
                className="hidden items-center gap-2 rounded-xl border border-navy-200 px-4 py-2 font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 sm:inline-flex"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
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
