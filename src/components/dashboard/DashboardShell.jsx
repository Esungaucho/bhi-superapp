import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Compass, Waves, CalendarDays, Users, User } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home, exact: true },
  { path: '/discovery', label: 'Discover', icon: Compass },
  { path: '/experiences', label: 'Book', icon: Waves },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/community', label: 'Community', icon: Users },
];

export default function DashboardShell() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header */}
        <header className={`top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16 ${
          isDashboard
            ? 'absolute text-white'
            : 'sticky bg-background/85 backdrop-blur-xl border-b border-border/40 text-foreground'
        }`}>
          {isDashboard ? (
            <h1 className="font-heading text-base tracking-luxe-sm">Bald Head Island</h1>
          ) : (
            <span className="font-heading text-base text-foreground/80 tracking-luxe-sm">Bald Head Island</span>
          )}
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Home"
            >
              <Home className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              to="/my-island"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="My Island"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-28">
          <Outlet />
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/85 backdrop-blur-xl border-t border-border/30 px-2 py-2 z-50">
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
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all duration-200 ${
                    isActive ? 'text-ocean' : 'text-muted-foreground/50'
                  }`}
                >
                  <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[9px] font-medium tracking-luxe-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}