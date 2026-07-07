import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Megaphone, Users, ChevronLeft, FileCheck, CalendarDays, Mail, ShoppingBag, Bird, ConciergeBell, Baby, CalendarHeart, Handshake, Home, Turtle, UtensilsCrossed, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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
  { path: '/admin/event-sources', label: 'Sources', icon: Globe },
  { path: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/admin/birdie', label: 'Birdie', icon: Bird },
  { path: '/admin/concierge', label: 'Concierge', icon: ConciergeBell },
  { path: '/admin/babysitting', label: 'Childcare', icon: Baby },
  { path: '/admin/turtles', label: 'Turtles', icon: Turtle },
  { path: '/admin/restaurants', label: 'Dining', icon: UtensilsCrossed },
];

export default function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground mt-1">You need admin permissions to view this area.</p>
        <Link to="/dashboard" className="text-sm text-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="bg-card border-b border-border/50 px-4 py-3 sticky top-0 z-50 text-foreground flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 -ml-1 rounded-lg hover:bg-sand/50 transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h1 className="font-heading text-sm tracking-luxe-sm">Admin Console</h1>
          <div className="ml-auto"><GlobalMenu /></div>
        </header>

        {/* Tab bar */}
        <div className="bg-card border-b border-border/50 grid grid-cols-5 gap-1 p-2">
          {NAV.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-[10px] font-semibold border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-sand/40'
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