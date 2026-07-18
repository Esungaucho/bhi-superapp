import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, ArrowRight } from 'lucide-react';

export default function SharkTrackerCard() {
  return (
    <Link
      to="/shark-tracker"
      className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-luxe-sm hover:shadow-luxe hover:border-accent/30 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center flex-shrink-0">
        <Fish className="w-5 h-5 text-ocean" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-sm font-semibold text-foreground">Shark Tracker</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Tagged shark activity & community sightings near Cape Fear</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
    </Link>
  );
}