import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import HeroWidget from '@/components/dashboard/HeroWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import DealsCarousel from '@/components/dashboard/DealsCarousel';
import UpcomingBookings from '@/components/dashboard/UpcomingBookings';
import SponsoredBanner from '@/components/dashboard/SponsoredBanner';

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ferryBookings = [] } = useQuery({
    queryKey: ['dashFerryBookings', user?.email],
    queryFn: () => base44.entities.FerryBooking.filter({ user_email: user.email, status: 'confirmed' }),
    enabled: !!user?.email,
  });

  const { data: lodgingBookings = [] } = useQuery({
    queryKey: ['dashLodgingBookings', user?.email],
    queryFn: () => base44.entities.LodgingBooking.filter({ user_email: user.email, status: 'confirmed' }),
    enabled: !!user?.email,
  });

  const { data: rentalBookings = [] } = useQuery({
    queryKey: ['dashRentalBookings', user?.email],
    queryFn: () => base44.entities.RentalBooking.filter({ user_email: user.email, status: 'confirmed' }),
    enabled: !!user?.email,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['promoDeals'],
    queryFn: () => base44.entities.PromoDeal.filter({ is_active: true }),
  });

  // Find soonest upcoming ferry booking for hero
  const now = new Date();
  const soonestFerry = ferryBookings
    .filter(b => new Date(b.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  return (
    <div className="pb-12 pt-1">
      <HeroWidget upcomingBooking={soonestFerry} user={user} />
      <QuickActions />
      <UpcomingBookings
        ferryBookings={ferryBookings}
        lodgingBookings={lodgingBookings}
        rentalBookings={rentalBookings}
      />
      <DealsCarousel deals={deals.filter(d => d.deal_type !== 'sponsored')} />
      <SponsoredBanner deals={deals} />
    </div>
  );
}