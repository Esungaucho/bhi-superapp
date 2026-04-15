import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const STATUS_COLOR = {
  confirmed: 'text-emerald-600 bg-emerald-50',
  active: 'text-blue-600 bg-blue-50',
  pending: 'text-amber-600 bg-amber-50',
};

function BookingRow({ emoji, label, date, status, linkTo }) {
  return (
    <Link to={linkTo} className="flex items-center gap-3 py-2.5 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-lg px-1">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] || STATUS_COLOR.confirmed}`}>
        {status}
      </span>
    </Link>
  );
}

export default function UpcomingBookings({ ferryBookings, lodgingBookings, rentalBookings }) {
  const now = new Date();

  const upcoming = [
    ...ferryBookings
      .filter(b => b.status === 'confirmed' && new Date(b.departure_time) >= now)
      .map(b => ({
        emoji: '⛴️',
        label: `Ferry — ${b.direction === 'to_island' ? 'To Island' : 'To Mainland'}`,
        date: format(new Date(b.departure_time), 'EEE, MMM d · h:mm a'),
        status: b.status,
        linkTo: '/ferry/bookings',
        sortDate: new Date(b.departure_time),
      })),
    ...lodgingBookings
      .filter(b => b.status === 'confirmed' && new Date(b.check_in) >= now)
      .map(b => ({
        emoji: '🏡',
        label: `Stay — ${b.lodging_title || 'Lodging'}`,
        date: `Check-in ${format(new Date(b.check_in), 'MMM d')}`,
        status: b.status,
        linkTo: '/lodging/my-stays',
        sortDate: new Date(b.check_in),
      })),
    ...rentalBookings
      .filter(b => b.status === 'confirmed' && new Date(b.start_date) >= now)
      .map(b => ({
        emoji: '🛺',
        label: `${b.item_name || 'Rental'} — ${b.days}d`,
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
    <div className="px-4 mt-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-foreground">Upcoming</h3>
        <Link to="/bookings" className="text-xs text-accent font-semibold hover:underline">View all</Link>
      </div>
      <div className="bg-card border rounded-xl px-3 py-1">
        {upcoming.map((item, i) => (
          <BookingRow key={i} {...item} />
        ))}
      </div>
    </div>
  );
}