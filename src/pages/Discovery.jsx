import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Sun, Home, Bike, UtensilsCrossed, ShoppingBag } from 'lucide-react';

const ITEMS = [
  { label: 'Island Map', Icon: Map, path: '/map', desc: 'Navigate every corner', gradient: 'from-sea-glass/15 to-sea-glass-deep/5' },
  { label: 'Weather', Icon: Sun, path: '/weather', desc: 'Conditions & forecast', gradient: 'from-amber-400/15 to-orange-400/5' },
  { label: 'Lodging', Icon: Home, path: '/lodging', desc: 'Stays & vacation rentals', gradient: 'from-purple-500/12 to-indigo-500/5' },
  { label: 'Rentals', Icon: Bike, path: '/rentals', desc: 'Bikes, carts & gear', gradient: 'from-emerald-500/12 to-teal-500/5' },
  { label: 'Food & Dining', Icon: UtensilsCrossed, path: '/food', desc: 'Restaurants & orders', gradient: 'from-rose-500/12 to-red-500/5' },
  { label: 'Shops', Icon: ShoppingBag, path: '/shops', desc: 'Boutiques & essentials', gradient: 'from-driftwood/15 to-driftwood/5' },
];

export default function Discovery() {
  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Discovery</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything the island has to offer</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ label, Icon, path, desc, gradient }) => (
          <Link
            key={path}
            to={path}
            className={`group relative bg-gradient-to-br ${gradient} rounded-2xl border border-border/50 p-5 hover:shadow-[0_12px_32px_-16px_rgba(31,45,61,0.3)] hover:border-accent/20 transition-all duration-300 active:scale-[0.97] overflow-hidden`}
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 mb-4 group-hover:bg-card transition-colors">
              <Icon className="w-5 h-5 text-foreground/70 group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </span>
            <h3 className="text-sm font-heading font-medium text-foreground leading-tight">{label}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}