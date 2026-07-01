import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1720247523641-96d1d3d8f3a7?q=80&w=1200&auto=format';

export default function HeroWidget({ upcomingBooking, user }) {
  const tierGreeting = {
    resident: 'Welcome home',
    homeowner: 'Welcome back',
    business_owner: 'Good to see you',
    captain: 'Welcome aboard',
    employee: 'Good to see you',
    visitor: 'Welcome to Bald Head',
  };

  const greeting = tierGreeting[user?.tier] || 'Welcome to Bald Head';
  const firstName = user?.full_name?.split(' ')[0] || 'Explorer';

  return (
    <section className="relative overflow-hidden animate-fade-in">
      <div className="relative h-[340px]">
        <img
          src={HERO_IMAGE}
          alt="Bald Head Island at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
        <p className="text-[10px] font-body tracking-luxe uppercase text-white/60">{greeting}</p>
        <h1 className="font-heading text-[2rem] leading-[1.05] mt-2 text-balance">
          {upcomingBooking ? 'Your island awaits' : `Hello, ${firstName}`}
        </h1>

        {upcomingBooking ? (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/75">
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
              className="inline-flex items-center gap-2 text-sm font-body font-medium bg-white text-charcoal hover:bg-white/90 transition-colors rounded-full px-5 py-2.5 w-fit"
            >
              View itinerary <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <p className="text-sm font-body text-white/65 mt-2 max-w-[16rem] leading-relaxed">
            Serene shores, maritime forests, and quiet luxury — your island journey begins here.
          </p>
        )}
      </div>
    </section>
  );
}