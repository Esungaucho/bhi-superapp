import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, BookOpen, Map } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home, exact: true },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/bookings', label: 'Bookings', icon: BookOpen },
  { path: '/notifications', label: 'Alerts', icon: Bell },
];

export default function DashboardShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="relative sticky top-0 z-50 h-16 overflow-hidden shadow-md">
          <img
            src="https://media.base44.com/images/public/69c9efaf81beb7831e6e5295/2dee2eee0_generated_image.png"
            alt="Bald Head Island maritime forest"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/80 via-navy/55 to-navy-deep/40" />
          <div className="relative h-full flex items-center justify-between px-4">
            <h1 className="font-heading text-lg text-white tracking-luxe-sm">Bald Head Island</h1>
            <GlobalMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 py-1 z-50">
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
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}