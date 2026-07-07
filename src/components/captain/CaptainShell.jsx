import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Anchor, Home } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import BottomNav from '@/components/shared/BottomNav';

export default function CaptainShell() {
  const location = useLocation();
  const isDetail = location.pathname !== '/captain/dashboard' && location.pathname !== '/captain/saved';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-card border-b border-border/50 text-foreground">
          {isDetail ? (
            <Link to="/captain/dashboard" className="flex items-center gap-1.5 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
            </Link>
          ) : (
            <h1 className="font-heading text-sm tracking-luxe-sm flex items-center gap-2">
              <Anchor className="w-5 h-5 text-primary" strokeWidth={1.5} /> Captain's Hub
            </h1>
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