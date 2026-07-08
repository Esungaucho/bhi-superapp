import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DashboardHero from '@/components/dashboard/DashboardHero';
import SearchBar from '@/components/dashboard/SearchBar';
import QuickActions from '@/components/dashboard/QuickActions';
import DailyBrief from '@/components/dashboard/DailyBrief';
import MyPlansSection from '@/components/dashboard/MyPlansSection';
import HappeningNow from '@/components/dashboard/HappeningNow';
import WeatherMarineModule from '@/components/dashboard/WeatherMarineModule';
import NextFerryWidget from '@/components/ferry/NextFerryWidget';
import FeaturedRecommendation from '@/components/dashboard/FeaturedRecommendation';
import CommunityPreview from '@/components/dashboard/CommunityPreview';
import EventsToday from '@/components/dashboard/EventsToday';
import ConciergeCTA from '@/components/dashboard/ConciergeCTA';
import DealsCarousel from '@/components/dashboard/DealsCarousel';
import SponsoredBanner from '@/components/dashboard/SponsoredBanner';
import UpcomingBookings from '@/components/dashboard/UpcomingBookings';

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

  const nonSponsoredDeals = deals.filter(d => d.deal_type !== 'sponsored');

  return (
    <div className="pb-8">
      <DashboardHero user={user} />
      <DailyBrief />
      <QuickActions />
      <MyPlansSection />
      <SearchBar />
      <HappeningNow />

      {/* Weather Section */}
      <section className="px-5 mt-8">
        <div className="mb-3">
          <h2 className="font-heading text-lg text-foreground">Island Conditions</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Live weather & marine forecast</p>
        </div>
        <WeatherMarineModule variant="card" />
      </section>

      {/* Ferry Section */}
      <section className="mt-8">
        <div className="px-5 mb-3">
          <h2 className="font-heading text-lg text-foreground">Ferry Status</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Live departures & schedule</p>
        </div>
        <NextFerryWidget />
      </section>

      <FeaturedRecommendation />
      <CommunityPreview />
      <EventsToday />
      <ConciergeCTA />

      <UpcomingBookings
        ferryBookings={ferryBookings}
        lodgingBookings={lodgingBookings}
        rentalBookings={rentalBookings}
      />
      {nonSponsoredDeals.length > 0 && <DealsCarousel deals={nonSponsoredDeals} />}
      <SponsoredBanner deals={deals} />
    </div>
  );
}