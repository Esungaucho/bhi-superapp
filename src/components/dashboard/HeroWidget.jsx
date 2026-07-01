import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const HERO_IMAGE = 'https://media.base44.com/images/public/69c9efaf81beb7831e6e5295/ce60e6889_generated_image.png';

export default function HeroWidget({ upcomingBooking, user }) {
  const tierGreeting = {
    resident: 'Welcome home',
    owner: 'Welcome back',
    business: 'Good to see you',
    visitor: 'Welcome to Bald Head',
  };

  const greeting = tierGreeting[user?.tier] || 'Welcome to Bald Head';
  const firstName = user?.full_name?.split(' ')[0] || 'Explorer';

  return (
    <section className="relative overflow-hidden animate-fade-in">
      {/* Cinematic photograph */}
      <div className="relative h-72 sm:h-80">
        <img
          src={HERO_IMAGE}
          alt="Bald Head Island at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/80 via-navy/55 to-navy-deep/40" />
      </div>

      {/* Editorial content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <p className="text-[10px] font-body tracking-luxe uppercase text-white/70">{greeting}</p>
        <h1 className="font-heading text-3xl sm:text-4xl leading-tight mt-1 text-balance">
          {upcomingBooking ? 'Your island awaits' : `Hello, ${firstName}`}
        </h1>

        {upcomingBooking ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CalendarDays className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-body">
                {(() => {
                  const depTime = new Date(upcomingBooking.departure_time || upcomingBooking.check_in || upcomingBooking.start_date);
                  const daysUntil = Math.ceil((depTime - new Date()) / (1000 * 60 * 60 * 24));
                  return daysUntil <= 0
                    ? "Today's the day"
                    : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away · ${format(depTime, 'EEE, MMM d')}`;
                })()}
              </span>
            </div>
            <Link
              to="/ferry/bookings"
              className="inline-flex items-center gap-2 text-sm font-body font-medium bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-colors rounded-full px-4 py-2 w-fit"
            >
              View itinerary <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <p className="text-sm font-body text-white/75 mt-2 max-w-xs leading-relaxed">
            Serene shores, maritime forests, and quiet luxury — your island journey begins here.
          </p>
        )}
      </div>

      {/* Floating quick-CTAs (only when no upcoming booking) */}
      {!upcomingBooking && (
        <div className="absolute bottom-0 right-0 flex gap-2 p-4">
          <Link
            to="/ferry"
            className="text-xs font-body font-medium bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-colors rounded-full px-3.5 py-1.5 text-white"
          >
            Ferry
          </Link>
          <Link
            to="/lodging"
            className="text-xs font-body font-medium bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-colors rounded-full px-3.5 py-1.5 text-white"
          >
            Stay
          </Link>
        </div>
      )}
    </section>
  );
}