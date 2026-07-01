import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Compass, Waves, CalendarDays, Users, User } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home, exact: true },
  { path: '/discovery', label: 'Discovery', icon: Compass },
  { path: '/experiences', label: 'Experiences', icon: Waves },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/community', label: 'Community', icon: Users },
];

export default function DashboardShell() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header — floats over hero on dashboard, clean bar elsewhere */}
        <header className={`top-0 inset-x-0 z-50 flex items-center justify-between px-5 h-16 ${
          isDashboard ? 'absolute text-white' : 'sticky bg-background/90 backdrop-blur-md border-b border-border/50 text-foreground'
        }`}>
          {isDashboard ? (
            <h1 className="font-heading text-lg tracking-luxe-sm">Bald Head Island</h1>
          ) : (
            <span className="font-heading text-base text-foreground/80">Bald Head Island</span>
          )}
          <div className="flex items-center gap-1">
            <Link
              to="/my-island"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="My Island"
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        {/* Bottom Nav — clean, minimal */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/90 backdrop-blur-md border-t border-border/50 px-4 py-2 z-50">
          <div className="flex justify-around">
            {NAV.map(item => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground/60'
                  }`}
                >
                  <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}