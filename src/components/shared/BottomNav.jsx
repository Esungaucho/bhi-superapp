import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Map, CalendarDays, Users } from 'lucide-react';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home, exact: true },
  { path: '/my-plans', label: 'My Plans', icon: ClipboardList },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/community', label: 'Community', icon: Users },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border/50 px-2 py-2 z-50">
      <div className="flex justify-around">
        {NAV.map(item => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground/50'
              }`}
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] font-medium tracking-luxe-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}