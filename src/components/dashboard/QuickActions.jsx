import React from 'react';
import { Link } from 'react-router-dom';

const ACTIONS = [
  { label: 'Ferry', emoji: '⛴️', path: '/ferry' },
  { label: 'Lodging', emoji: '🏡', path: '/lodging' },
  { label: 'Rentals', emoji: '🛺', path: '/rentals' },
  { label: 'Food', emoji: '🍽️', path: '/food' },
  { label: 'Shops', emoji: '🛍️', path: '/shops' },
  { label: 'Map', emoji: '🗺️', path: '/map' },
  { label: 'Weather', emoji: '🌤️', path: '/weather' },
  { label: 'Parking', emoji: '🅿️', path: '/ferry/parking' },
];

export default function QuickActions() {
  return (
    <div className="px-4 mt-5">
      <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(action => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl py-3 hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <span className="text-2xl">{action.emoji}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}