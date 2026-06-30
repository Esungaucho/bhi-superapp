import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Home, Bike, UtensilsCrossed, ShoppingBag, Map, Sun, ParkingCircle } from 'lucide-react';

const ACTIONS = [
  { label: 'Ferry', Icon: Ship, path: '/ferry' },
  { label: 'Lodging', Icon: Home, path: '/lodging' },
  { label: 'Rentals', Icon: Bike, path: '/rentals' },
  { label: 'Dining', Icon: UtensilsCrossed, path: '/food' },
  { label: 'Shops', Icon: ShoppingBag, path: '/shops' },
  { label: 'Map', Icon: Map, path: '/map' },
  { label: 'Weather', Icon: Sun, path: '/weather' },
  { label: 'Parking', Icon: ParkingCircle, path: '/ferry/parking' },
];

export default function QuickActions() {
  return (
    <section className="px-4 mt-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-heading text-xl text-foreground">Explore the island</h2>
        <span className="text-[10px] font-body tracking-luxe-sm uppercase text-muted-foreground">Curated</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(({ label, Icon, path }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col items-center gap-2 bg-card border border-border/70 rounded-2xl py-4 px-2 shadow-[0_4px_16px_-10px_rgba(31,45,61,0.18)] hover:shadow-[0_10px_24px_-12px_rgba(31,45,61,0.28)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-sand text-navy group-hover:bg-sea-glass group-hover:text-white transition-colors duration-300">
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <span className="text-[11px] font-body font-medium text-foreground/80 tracking-wide">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}