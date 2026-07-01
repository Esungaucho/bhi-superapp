import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, BookOpen } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home, exact: true },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/bookings', label: 'Trips', icon: BookOpen },
];

export default function DashboardShell() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header — floats over hero on dashboard, clean white elsewhere */}
        <header className={`top-0 inset-x-0 z-50 flex items-center justify-between px-5 h-16 ${
          isDashboard ? 'absolute text-white' : 'sticky bg-background/90 backdrop-blur-md text-foreground border-b border-border/50'
        }`}>
          {isDashboard ? (
            <h1 className="font-heading text-lg tracking-luxe-sm">Bald Head Island</h1>
          ) : (
            <span className="font-heading text-base text-foreground/80">Bald Head Island</span>
          )}
          <GlobalMenu />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        {/* Bottom Nav — clean, minimal */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/90 backdrop-blur-md border-t border-border/50 px-6 py-2 z-50">
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
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground/70'
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