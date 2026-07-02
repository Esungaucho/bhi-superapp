import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2, CalendarHeart } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import RentalPropertyCard from '@/components/rentals/RentalPropertyCard';

export default function EventRentals() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['rentalProperties'],
    queryFn: () => base44.entities.RentalProperty.list('-is_featured', 200),
  });

  // Only show event-friendly properties
  const eventVenues = useMemo(
    () => properties.filter(p =>
      p.approval_status === 'approved' &&
      p.is_active !== false &&
      (p.is_event_friendly || p.is_wedding_friendly || p.is_private_event_friendly)
    ),
    [properties]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <Link to="/events" className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </Link>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-2">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Events & Weddings</p>
          <h1 className="font-heading text-2xl text-white mt-1">Event Venues</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-4 flex items-start gap-2">
          <CalendarHeart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <p className="text-xs text-foreground/80 leading-relaxed">
            These properties are approved for weddings, private dinners, rehearsal dinners, family reunions, and special events.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : eventVenues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarHeart className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
            <p className="text-sm">No event venues available yet</p>
            <p className="text-xs mt-1">Check back soon for event-friendly rentals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {eventVenues.map(p => <RentalPropertyCard key={p.id} property={p} />)}
          </div>
        )}

        {/* Link to full rentals */}
        <Link
          to="/rentals"
          className="mt-4 block text-center text-sm font-medium text-accent py-3"
        >
          Browse All Rentals →
        </Link>
      </div>
    </div>
  );
}