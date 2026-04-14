import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, ChevronLeft } from 'lucide-react';

const navItems = [
  { path: '/lodging', label: 'Search', icon: Search },
  { path: '/lodging/my-stays', label: 'My Stays', icon: Bookmark },
];

const subPages = ['/lodging/my-stays'];

export default function LodgingShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = location.pathname.match(/^\/lodging\/[^/]+$/) && !subPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-50 shadow-md">
          {isDetail && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">🏡 BHI Lodging</h1>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 py-1 z-50">
          <div className="flex justify-around">
            {navItems.map(item => {
              const isActive = item.path === '/lodging'
                ? location.pathname === '/lodging'
                : location.pathname.startsWith(item.path);
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