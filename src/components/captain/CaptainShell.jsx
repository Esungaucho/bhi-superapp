import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Anchor, Home } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/captain/dashboard', label: 'Dashboard', exact: true },
  { path: '/captain/saved', label: 'Saved Captains' },
];

export default function CaptainShell() {
  const location = useLocation();
  const isDetail = location.pathname !== '/captain/dashboard' && location.pathname !== '/captain/saved';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-navy text-white shadow-md">
          {isDetail ? (
            <Link to="/captain/dashboard" className="flex items-center gap-1.5 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          ) : (
            <h1 className="font-heading text-lg tracking-luxe-sm flex items-center gap-2">
              <Anchor className="w-5 h-5" /> Captain's Hub
            </h1>
          )}
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Home">
              <Home className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 py-1 z-50">
          <div className="flex justify-around">
            {NAV.map(item => {
              const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}