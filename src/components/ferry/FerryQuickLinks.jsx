import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FerryQuickLinks() {
  const links = [
    { to: '/ferry/parking', icon: '🅿️', title: 'Parking', desc: 'Reserve parking at Deep Point Marina' },
    { to: '/ferry/book', icon: '🎫', title: 'Book Tickets', desc: 'Purchase ferry tickets online' },
    { to: '/ferry/eta', icon: '🧠', title: 'AI Tracker', desc: 'AI-powered arrival estimates' },
    { to: '/ferry/bookings', icon: '📋', title: 'My Bookings', desc: 'View and manage reservations' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3 hover:bg-sand/30 transition-colors"
        >
          <span className="text-lg flex-shrink-0">{l.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{l.title}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">{l.desc}</p>
          </div>
        </Link>
      ))}
      <a
        href="https://www.baldheadislandferry.com/schedule/"
        target="_blank"
        rel="noopener noreferrer"
        className="col-span-2 flex items-center gap-3 bg-gradient-to-r from-ocean/8 to-transparent border border-ocean/15 rounded-xl p-3 hover:bg-ocean/5 transition-colors"
      >
        <span className="text-lg">📋</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Luggage & Boarding Info</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Official baggage policies and boarding procedures</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
      </a>
    </div>
  );
}