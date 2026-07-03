import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, Megaphone, Users, ChevronLeft, FileCheck, CalendarDays, Mail, ShoppingBag, Bird, ConciergeBell, Baby, CalendarHeart, Handshake, Home, Turtle } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const NAV = [
  { path: '/admin/revenue', label: 'Revenue', icon: BarChart2 },
  { path: '/admin/sponsorships', label: 'Sponsors', icon: Handshake },
  { path: '/admin/crm', label: 'CRM', icon: Users },
  { path: '/admin/rental-properties', label: 'Properties', icon: Home },
  { path: '/admin/referrals', label: 'Referrals', icon: FileCheck },
  { path: '/admin/ads', label: 'Campaigns', icon: Megaphone },
  { path: '/admin/partners', label: 'Partners', icon: Handshake },
  { path: '/admin/submissions', label: 'Review', icon: FileCheck },
  { path: '/admin/events', label: 'Events', icon: CalendarDays },
  { path: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/admin/birdie', label: 'Birdie', icon: Bird },
  { path: '/admin/concierge', label: 'Concierge', icon: ConciergeBell },
  { path: '/admin/babysitting', label: 'Childcare', icon: Baby },
  { path: '/admin/turtles', label: 'Turtles', icon: Turtle },
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
        <div className="bg-card border-b grid grid-cols-5 gap-1 p-2">
          {NAV.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-[10px] font-semibold border-b-2 transition-colors ${
                  isActive ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-sand/40'
                }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
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