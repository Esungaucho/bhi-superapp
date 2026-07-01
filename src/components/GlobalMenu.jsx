import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const SECTIONS = [
  { label: '🏠 Home', path: '/dashboard' },
  { label: '📅 Island Calendar', path: '/calendar' },
  { label: '⛴️ Ferry Schedule', path: '/ferry' },
  { label: '🗺️ Island Map', path: '/map' },
  { label: '🌤️ Weather', path: '/weather' },
  { label: '🏡 Lodging', path: '/lodging' },
  { label: '🛺 Rentals', path: '/rentals' },
  { label: '🍽️ Food & Dining', path: '/food' },
  { label: '🛒 Shops', path: '/shops' },
  { label: '📖 Community', path: '/community' },
  { label: '📋 My Bookings', path: '/bookings' },
  { label: '🔔 Notifications', path: '/notifications' },
  { label: '🤖 Concierge', path: '/agents' },
  { label: '🔍 Search', path: '/search' },
  { label: '⚙️ Admin', path: '/admin/revenue' },
];

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-card shadow-2xl z-[101] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 bg-primary text-primary-foreground">
          <span className="font-bold text-sm">🌴 BHI SuperApp</span>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-2 overflow-y-auto h-[calc(100%-60px)]">
          {SECTIONS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="flex items-center px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}