import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Ship, Home, Bike, ArrowRight } from 'lucide-react';

const STATUS_STYLE = {
  confirmed: 'text-sea-glass-deep bg-sea-glass/10',
  active: 'text-sea-glass-deep bg-sea-glass/10',
  pending: 'text-driftwood bg-driftwood/10',
};

function BookingRow({ Icon, label, date, status, linkTo }) {
  return (
    <Link
      to={linkTo}
      className="group flex items-center gap-4 py-3.5 border-b border-border/60 last:border-0 hover:bg-sand/40 transition-colors rounded-lg px-2 -mx-2"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-sand text-navy flex-shrink-0">
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-medium text-foreground truncate">{label}</p>
        <p className="text-xs font-body text-muted-foreground mt-0.5">{date}</p>
      </div>
      <span className={`text-[10px] font-body font-medium tracking-luxe-sm uppercase px-2.5 py-1 rounded-full ${STATUS_STYLE[status] || STATUS_STYLE.confirmed}`}>
        {status}
      </span>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
    </Link>
  );
}

export default function UpcomingBookings({ ferryBookings, lodgingBookings, rentalBookings }) {
  const now = new Date();

  const upcoming = [
    ...ferryBookings
      .filter(b => b.status === 'confirmed' && new Date(b.departure_time) >= now)
      .map(b => ({
        Icon: Ship,
        label: `Ferry · ${b.direction === 'to_island' ? 'To the Island' : 'To Mainland'}`,
        date: format(new Date(b.departure_time), 'EEE, MMM d · h:mm a'),
        status: b.status,
        linkTo: '/ferry/bookings',
        sortDate: new Date(b.departure_time),
      })),
    ...lodgingBookings
      .filter(b => b.status === 'confirmed' && new Date(b.check_in) >= now)
      .map(b => ({
        Icon: Home,
        label: `Stay · ${b.lodging_title || 'Bald Head Lodging'}`,
        date: `Check-in ${format(new Date(b.check_in), 'MMM d')}`,
        status: b.status,
        linkTo: '/lodging/my-stays',
        sortDate: new Date(b.check_in),
      })),
    ...rentalBookings
      .filter(b => b.status === 'confirmed' && new Date(b.start_date) >= now)
      .map(b => ({
        Icon: Bike,
        label: `${b.item_name || 'Island Rental'} · ${b.days} day${b.days !== 1 ? 's' : ''}`,
        date: `Starts ${format(new Date(b.start_date), 'MMM d')}`,
        status: b.status,
        linkTo: '/rentals/my-rentals',
        sortDate: new Date(b.start_date),
      })),
  ]
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <section className="px-4 mt-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-heading text-xl text-foreground">Your upcoming journeys</h2>
        <Link to="/bookings" className="text-xs font-body text-sea-glass-deep hover:text-sea-glass transition-colors tracking-luxe-sm uppercase">
          View all
        </Link>
      </div>
      <div className="bg-card border border-border/70 rounded-2xl px-4 py-1 shadow-[0_4px_16px_-12px_rgba(31,45,61,0.18)]">
        {upcoming.map((item, i) => (
          <BookingRow key={i} {...item} />
        ))}
      </div>
    </section>
  );
}