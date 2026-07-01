import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

export default function CommunityShell() {
  const location = useLocation();
  const isDetail = /^\/community\/(?!submit)[^/]+$/.test(location.pathname);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-50 h-16 bg-primary text-primary-foreground shadow-md flex items-center justify-between px-4">
          {isDetail ? (
            <Link to="/community" className="flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-5 h-5" /> Back
            </Link>
          ) : (
            <h1 className="font-heading text-lg">Island Community</h1>
          )}
          <GlobalMenu />
        </header>

        <main className="flex-1 overflow-y-auto pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}