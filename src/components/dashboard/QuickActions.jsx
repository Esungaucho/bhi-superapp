import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Home, UtensilsCrossed, Compass, Calendar } from 'lucide-react';

const ACTIONS = [
  { label: 'Stay', Icon: Home, path: '/lodging' },
  { label: 'Ferry', Icon: Ship, path: '/ferry' },
  { label: 'Dine', Icon: UtensilsCrossed, path: '/food' },
  { label: 'Experiences', Icon: Compass, path: '/map' },
];

export default function QuickActions() {
  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map(({ label, Icon, path }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col items-center gap-2.5"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/50 shadow-[0_2px_12px_-6px_rgba(31,45,61,0.15)] group-hover:shadow-[0_8px_20px_-10px_rgba(31,45,61,0.25)] group-hover:border-accent/30 transition-all duration-300 group-active:scale-95">
              <Icon className="w-5 h-5 text-foreground/70 group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </span>
            <span className="text-[11px] font-medium text-foreground/70 tracking-wide">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}