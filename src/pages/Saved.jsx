import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Anchor, ChevronRight } from 'lucide-react';

const SAVED_SECTIONS = [
  {
    to: '/calendar/saved',
    Icon: CalendarDays,
    label: 'Saved Events',
    desc: 'Island events you\'re interested in',
  },
  {
    to: '/captain/saved',
    Icon: Anchor,
    label: 'Saved Captains',
    desc: 'Captains you follow for updates',
  },
];

export default function Saved() {
  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground mt-1">Your favorite island picks</p>
      </header>

      <div className="bg-card border border-border/50 rounded-2xl px-4 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
        {SAVED_SECTIONS.map(({ to, Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 py-4 border-b border-border/50 last:border-0 hover:bg-sand/40 transition-colors rounded-lg px-3 -mx-3"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );
}