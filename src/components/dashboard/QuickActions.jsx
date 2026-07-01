import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Home, UtensilsCrossed, Waves } from 'lucide-react';

const ACTIONS = [
  { label: 'Stay', Icon: Home, path: '/lodging' },
  { label: 'Ferry', Icon: Ship, path: '/ferry' },
  { label: 'Dine', Icon: UtensilsCrossed, path: '/food' },
  { label: 'Explore', Icon: Waves, path: '/experiences' },
];

export default function QuickActions() {
  return (
    <section className="px-5 mt-7">
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(({ label, Icon, path }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col items-center gap-2.5"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/40 shadow-luxe-sm group-hover:shadow-luxe group-hover:border-ocean/20 transition-all duration-300 group-active:scale-95">
              <Icon className="w-5 h-5 text-foreground/60 group-hover:text-ocean transition-colors" strokeWidth={1.5} />
            </span>
            <span className="text-[10px] font-medium text-foreground/60 tracking-luxe-xs">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}