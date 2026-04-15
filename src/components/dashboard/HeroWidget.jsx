import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function HeroWidget({ upcomingBooking, user }) {
  const tierGreeting = {
    resident: 'Welcome home',
    owner: 'Welcome back',
    business: 'Good to see you',
    visitor: 'Welcome to BHI',
  };

  const greeting = tierGreeting[user?.tier] || 'Welcome to BHI';
  const firstName = user?.full_name?.split(' ')[0] || 'Explorer';

  if (upcomingBooking) {
    const depTime = new Date(upcomingBooking.departure_time || upcomingBooking.check_in || upcomingBooking.start_date);
    const daysUntil = Math.ceil((depTime - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div className="mx-4 mt-4 bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-primary-foreground shadow-lg">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Your Next Trip</p>
        <h2 className="text-xl font-bold mt-1">{daysUntil <= 0 ? "Today's the day! 🎉" : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away`}</h2>
        <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
          <CalendarDays className="w-4 h-4" />
          <span>{format(depTime, 'EEE, MMM d')}</span>
        </div>
        <Link
          to="/ferry/bookings"
          className="mt-4 flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2 w-fit"
        >
          View Booking <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-primary-foreground shadow-lg">
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{greeting}</p>
      <h2 className="text-xl font-bold mt-1">{firstName}! 🌴</h2>
      <p className="text-sm opacity-80 mt-1">Ready to plan your island adventure?</p>
      <div className="flex gap-2 mt-4">
        <Link
          to="/ferry"
          className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2"
        >
          ⛴️ Book Ferry
        </Link>
        <Link
          to="/lodging"
          className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2"
        >
          🏡 Find Lodging
        </Link>
      </div>
    </div>
  );
}