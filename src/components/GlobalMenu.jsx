import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Compass, Waves, CalendarDays, Users, User, Anchor, Shield } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';

const SECTIONS = [
  { label: 'Home', path: '/dashboard', Icon: Home },
  { label: 'Discovery', path: '/discovery', Icon: Compass },
  { label: 'Book Experiences', path: '/experiences', Icon: Waves },
  { label: 'Island Calendar', path: '/calendar', Icon: CalendarDays },
  { label: 'Community', path: '/community', Icon: Users },
  { label: 'My Island', path: '/my-island', Icon: User },
];

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const { showCaptainHub, showAdmin } = useUserAccess();

  const allSections = [
    ...SECTIONS,
    ...(showCaptainHub ? [{ label: "Captain Hub", path: '/captain/dashboard', Icon: Anchor }] : []),
    ...(showAdmin ? [{ label: 'Admin Console', path: '/admin/revenue', Icon: Shield }] : []),
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
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
        className={`fixed top-0 right-0 h-full w-72 bg-card shadow-2xl z-[101] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground">
          <span className="font-heading text-sm tracking-luxe-sm">Bald Head Island</span>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-2 overflow-y-auto h-[calc(100%-60px)]">
          {allSections.map(({ label, path, Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors border-b border-border/40 last:border-0"
            >
              <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}