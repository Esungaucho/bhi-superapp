import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, Bookmark, Bell } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/calendar', label: 'Calendar', icon: Calendar, exact: true },
  { path: '/calendar/saved', label: 'Saved', icon: Bookmark },
  { path: '/calendar/preferences', label: 'Interests', icon: Bell },
];

export default function CalendarShell() {
  const location = useLocation();
  const isDetail = /^\/calendar\/event\//.test(location.pathname);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="bg-navy text-white px-4 h-14 flex items-center justify-between sticky top-0 z-50 shadow-md">
          {isDetail ? (
            <Link to="/calendar" className="flex items-center gap-1 text-sm font-medium">
              ← Back
            </Link>
          ) : (
            <h1 className="font-heading text-base tracking-luxe-sm">📅 Island Calendar</h1>
          )}
          <GlobalMenu />
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 py-1 z-50">
          <div className="flex justify-around">
            {NAV.map(item => {
              const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
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