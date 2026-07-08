import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bird, ShoppingBag, Baby, Bike, UtensilsCrossed, CalendarClock, ChevronRight,
} from 'lucide-react';

const SERVICES = [
  { icon: ShoppingBag, label: 'Need Groceries?', sub: 'Birdie delivery & pickup', link: '/birdie/new', accent: 'bg-teal-50 text-teal-600' },
  { icon: Baby, label: 'Need Babysitting?', sub: 'Trusted island sitters', link: '/babysitting', accent: 'bg-pink-50 text-pink-600' },
  { icon: Bike, label: 'Need a Golf Cart?', sub: 'Rentals & equipment', link: '/equipment', accent: 'bg-emerald-50 text-emerald-600' },
  { icon: UtensilsCrossed, label: 'Dinner Reservations', sub: 'Best island dining', link: '/food', accent: 'bg-amber-50 text-amber-600' },
  { icon: CalendarClock, label: 'Plan My Day', sub: 'AI-powered itinerary', link: '/birdie/new', accent: 'bg-blue-50 text-blue-600' },
];

export default function ConciergeCTA() {
  return (
    <section className="px-5 mt-8">
      <div className="bg-gradient-to-br from-primary to-ocean-deep rounded-2xl p-5 shadow-luxe">
        <div className="flex items-center gap-2 mb-1">
          <Bird className="w-5 h-5 text-white/90" strokeWidth={1.5} />
          <h2 className="font-heading text-lg text-white">Need Something?</h2>
        </div>
        <p className="text-[11px] text-white/60 mb-4">Your island concierge is standing by</p>
        <div className="space-y-2">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link key={i} to={s.link} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-colors">
                <span className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${s.accent}`}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.label}</p>
                  <p className="text-[10px] text-white/60">{s.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            );
          })}
        </div>
        <Link to="/birdie" className="flex items-center justify-center gap-2 mt-4 w-full bg-white text-primary rounded-xl py-3 text-sm font-semibold hover:bg-white/90 transition-colors">
          <Bird className="w-4 h-4" strokeWidth={1.5} />
          Message Concierge
        </Link>
      </div>
    </section>
  );
}