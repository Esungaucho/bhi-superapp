import React from 'react';
import { Link } from 'react-router-dom';
import {
  Map, UtensilsCrossed, CalendarDays, ShoppingBag, Waves,
  Bike, Home, Baby,
} from 'lucide-react';

const ACTIONS = [
  { label: 'Island Map', Icon: Map, path: '/map' },
  { label: 'Dining', Icon: UtensilsCrossed, path: '/food' },
  { label: 'Events', Icon: CalendarDays, path: '/calendar' },
  { label: 'Shop', Icon: ShoppingBag, path: '/island-shop' },
  { label: 'Beaches', Icon: Waves, path: '/weather' },
  { label: 'Transport', Icon: Bike, path: '/transportation' },
  { label: 'Rentals', Icon: Home, path: '/lodging' },
  { label: 'Babysitters', Icon: Baby, path: '/babysitting' },
];

export default function QuickActions() {
  return (
    <section className="px-5 mt-6">
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(({ label, Icon, path }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col items-center gap-2"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/40 shadow-luxe-sm group-hover:shadow-luxe group-hover:border-accent/30 transition-all duration-300 group-active:scale-95">
              <Icon className="w-5 h-5 text-foreground/60 group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </span>
            <span className="text-[10px] font-medium text-foreground/60 tracking-luxe-xs text-center">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}