import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, Megaphone, Users, ChevronLeft, FileCheck, CalendarDays, Mail, ShoppingBag, Bird, ConciergeBell } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/admin/revenue', label: 'Revenue', icon: BarChart2 },
  { path: '/admin/ads', label: 'Campaigns', icon: Megaphone },
  { path: '/admin/partners', label: 'Partners', icon: Users },
  { path: '/admin/submissions', label: 'Review', icon: FileCheck },
  { path: '/admin/events', label: 'Events', icon: CalendarDays },
  { path: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/admin/birdie', label: 'Birdie', icon: Bird },
  { path: '/admin/concierge', label: 'Concierge', icon: ConciergeBell },
];

export default function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground px-4 py-3 sticky top-0 z-50 shadow-md flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Admin</h1>
          <div className="ml-auto"><GlobalMenu /></div>
        </header>

        {/* Tab bar */}
        <div className="bg-card border-b flex">
          {NAV.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-semibold border-b-2 transition-colors ${
                  isActive ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}