import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import BottomNav from '@/components/shared/BottomNav';

export default function CalendarShell() {
  const location = useLocation();
  const isDetail = /^\/calendar\/event\//.test(location.pathname);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="bg-card border-b border-border/50 px-4 h-14 flex items-center justify-between sticky top-0 z-50 text-foreground">
          {isDetail ? (
            <Link to="/calendar" className="flex items-center gap-1 text-sm font-medium">
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} /> Back
            </Link>
          ) : (
            <h1 className="font-heading text-sm tracking-luxe-sm">Island Calendar</h1>
          )}
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-sand/50 transition-colors" aria-label="Home">
              <Home className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <GlobalMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}