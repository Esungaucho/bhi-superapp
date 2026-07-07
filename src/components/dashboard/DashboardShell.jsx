import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import BottomNav from '@/components/shared/BottomNav';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';

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
            : 'sticky bg-card border-b border-border/50 text-foreground'
        }`}>
          {isDashboard ? (
            <h1 className="font-heading text-base tracking-luxe-sm">Bald Head Island</h1>
          ) : (
            <span className="font-heading text-base text-foreground/80 tracking-luxe-sm">Bald Head Island</span>
          )}
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className="p-2 rounded-full hover:bg-sand/50 transition-colors"
              aria-label="Home"
            >
              <Home className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              to="/my-island"
              className="p-2 rounded-full hover:bg-sand/50 transition-colors"
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

        <BottomNav />
        <NotificationPermissionPrompt />
      </div>
    </div>
  );
}