import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppShell from '@/components/ferry/AppShell';
import FerrySchedule from '@/pages/FerrySchedule';
import FerryMap from '@/pages/FerryMap';
import FerryETA from '@/pages/FerryETA';
import BookFerry from '@/pages/BookFerry';
import FerryParking from '@/pages/FerryParking';
import MyBookings from '@/pages/MyBookings';
import OnboardingWizard from '@/pages/onboarding/OnboardingWizard';
import EditProfile from '@/pages/EditProfile';
import CommunicationSettings from '@/pages/CommunicationSettings';
import Privacy from '@/pages/Privacy';
import FerryRouteDetail from '@/pages/FerryRouteDetail';
import LodgingShell from '@/components/lodging/LodgingShell';
import LodgingSearch from '@/pages/LodgingSearch';
import LodgingDetail from '@/pages/LodgingDetail';
import MyStays from '@/pages/MyStays';
import RentalsShell from '@/components/rentals/RentalsShell';
import RentalsSearch from '@/pages/RentalsSearch';
import RentalDetail from '@/pages/RentalDetail';
import MyRentals from '@/pages/MyRentals';
import FoodShell from '@/components/food/FoodShell';
import FoodSearch from '@/pages/FoodSearch';
import RestaurantMenu from '@/pages/RestaurantMenu';
import MyOrders from '@/pages/MyOrders';
import ShopsShell from '@/components/shops/ShopsShell';
import ShopsDirectory from '@/pages/ShopsDirectory';
import ShopDetail from '@/pages/ShopDetail';
import ShopsMarketplace from '@/pages/ShopsMarketplace';
import WeatherShell from '@/components/weather/WeatherShell';
import WeatherDashboard from '@/pages/WeatherDashboard';
import IslandMap from '@/pages/IslandMap';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Dashboard from '@/pages/Dashboard';
import Discovery from '@/pages/Discovery';
import IslandShop from '@/pages/IslandShop';
import BirdieConcierge from '@/pages/BirdieConcierge';
import BirdieNewRequest from '@/pages/BirdieNewRequest';
import BirdieRequestDetail from '@/pages/BirdieRequestDetail';
import BirdieShoppers from '@/pages/BirdieShoppers';
import BHIConcierge from '@/pages/BHIConcierge';
import ConciergeRequest from '@/pages/ConciergeRequest';
import ConciergeTrack from '@/pages/ConciergeTrack';
import ConciergeProviders from '@/pages/ConciergeProviders';
import ConciergeProviderDashboard from '@/pages/ConciergeProviderDashboard';
import BookExperiences from '@/pages/BookExperiences';
import MyIsland from '@/pages/MyIsland';
import Settings from '@/pages/Settings';
import Saved from '@/pages/Saved';
import UniversalSearch from '@/pages/UniversalSearch';
import AgentShell from '@/components/agents/AgentShell';
import Agents from '@/pages/Agents';
import AgentChat from '@/pages/AgentChat';
import Notifications from '@/pages/Notifications';
import AllBookings from '@/pages/AllBookings';
import AdminShell from '@/components/admin/AdminShell';
import RevenueDashboard from '@/pages/admin/RevenueDashboard';
import AdCampaigns from '@/pages/admin/AdCampaigns';
import PartnerManagement from '@/pages/admin/PartnerManagement';
import SubmissionReview from '@/pages/admin/SubmissionReview';
import CommunityModeration from '@/pages/admin/CommunityModeration';
import CommunityShell from '@/components/community/CommunityShell';
import CommunityFeed from '@/pages/CommunityFeed';
import SubmitContent from '@/pages/SubmitContent';
import SubmissionDetail from '@/pages/SubmissionDetail';
import CalendarShell from '@/components/calendar/CalendarShell';
import IslandCalendar from '@/pages/IslandCalendar';
import EventDetail from '@/pages/EventDetail';
import SavedEvents from '@/pages/calendar/SavedEvents';
import CalendarPreferences from '@/pages/calendar/CalendarPreferences';
import EventManagement from '@/pages/admin/EventManagement';
import NewsletterAdmin from '@/pages/admin/NewsletterAdmin';
import IslandShopAdmin from '@/pages/admin/IslandShopAdmin';
import BirdieAdmin from '@/pages/admin/BirdieAdmin';
import ConciergeAdmin from '@/pages/admin/ConciergeAdmin';
import CaptainShell from '@/components/captain/CaptainShell';
import CaptainDashboard from '@/pages/CaptainDashboard';
import SavedCaptains from '@/pages/SavedCaptains';
import ThankYou from '@/pages/ThankYou';
import Babysitting from '@/pages/Babysitting';
import SitterProfile from '@/pages/SitterProfile';
import BabysittingBookingDetail from '@/pages/BabysittingBookingDetail';
import BabysittingMessage from '@/pages/BabysittingMessage';
import BabysittingAdmin from '@/pages/admin/BabysittingAdmin';
import EventsHub from '@/pages/EventsHub';
import StartEvent from '@/pages/StartEvent';
import EventDashboard from '@/pages/EventDashboard';
import EventVendors from '@/pages/EventVendors';
import EventVendorProfile from '@/pages/EventVendorProfile';
import EventGuestLogistics from '@/pages/EventGuestLogistics';
import EventTimeline from '@/pages/EventTimeline';
import EventRequests from '@/pages/EventRequests';
import EventConciergeHelp from '@/pages/EventConciergeHelp';
import EventsAdmin from '@/pages/admin/EventsAdmin';
import ConciergeServices from '@/pages/ConciergeServices';
import PreferredPartners from '@/pages/PreferredPartners';
import PartnerProfile from '@/pages/PartnerProfile';
import WeddingInquiryPage from '@/pages/WeddingInquiryPage';
import PartnersAdmin from '@/pages/admin/PartnersAdmin';
import LuxuryRealEstate from '@/pages/LuxuryRealEstate';
import BuildersHome from '@/pages/BuildersHome';
import CommunityPartners from '@/pages/CommunityPartners';
import SponsorshipDashboard from '@/pages/admin/SponsorshipDashboard';
import RelationshipCRMDashboard from '@/pages/admin/RelationshipCRMDashboard';
import ReferralTracking from '@/pages/admin/ReferralTracking';
import RentalsHub from '@/pages/RentalsHub';
import RentalPropertyDetail from '@/pages/RentalPropertyDetail';
import EventRentals from '@/pages/EventRentals';
import RentalPropertiesAdmin from '@/pages/admin/RentalPropertiesAdmin';
import TurtleEducation from '@/pages/TurtleEducation';
import TurtleNestMap from '@/pages/TurtleNestMap';
import TurtleNestAdmin from '@/pages/admin/TurtleNestAdmin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading BHI Ferry...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<DashboardShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/island-shop" element={<IslandShop />} />
        <Route path="/birdie" element={<BirdieConcierge />} />
        <Route path="/birdie/new" element={<BirdieNewRequest />} />
        <Route path="/birdie/request/:id" element={<BirdieRequestDetail />} />
        <Route path="/birdie/shoppers" element={<BirdieShoppers />} />
        <Route path="/concierge" element={<BHIConcierge />} />
        <Route path="/concierge/request" element={<ConciergeRequest />} />
        <Route path="/concierge/track/:id" element={<ConciergeTrack />} />
        <Route path="/concierge/providers" element={<ConciergeProviders />} />
        <Route path="/concierge/dashboard" element={<ConciergeProviderDashboard />} />
        <Route path="/babysitting" element={<Babysitting />} />
        <Route path="/babysitting/sitter/:id" element={<SitterProfile />} />
        <Route path="/babysitting/booking/:id" element={<BabysittingBookingDetail />} />
        <Route path="/babysitting/message/:sitterId" element={<BabysittingMessage />} />
        <Route path="/events" element={<EventsHub />} />
        <Route path="/events/start" element={<StartEvent />} />
        <Route path="/events/dashboard/:id" element={<EventDashboard />} />
        <Route path="/events/vendors" element={<EventVendors />} />
        <Route path="/events/vendors/:vendorId" element={<EventVendorProfile />} />
        <Route path="/events/:id/guests" element={<EventGuestLogistics />} />
        <Route path="/events/:id/timeline" element={<EventTimeline />} />
        <Route path="/events/:id/requests" element={<EventRequests />} />
        <Route path="/events/:id/concierge" element={<EventConciergeHelp />} />
        <Route path="/events/concierge" element={<EventConciergeHelp />} />
        <Route path="/concierge/services" element={<ConciergeServices />} />
        <Route path="/concierge/partners" element={<PreferredPartners />} />
        <Route path="/concierge/partners/:partnerId" element={<PartnerProfile />} />
        <Route path="/concierge/wedding-inquiry" element={<WeddingInquiryPage />} />
        <Route path="/real-estate" element={<LuxuryRealEstate />} />
        <Route path="/builders" element={<BuildersHome />} />
        <Route path="/community-partners" element={<CommunityPartners />} />
        <Route path="/rentals" element={<RentalsHub />} />
        <Route path="/rental-properties/:id" element={<RentalPropertyDetail />} />
        <Route path="/events/rentals" element={<EventRentals />} />
        <Route path="/experiences" element={<BookExperiences />} />
        <Route path="/my-island" element={<MyIsland />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/communication" element={<CommunicationSettings />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/search" element={<UniversalSearch />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/bookings" element={<AllBookings />} />
      </Route>
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/ferry/route/:routeId" element={<FerryRouteDetail />} />
      <Route element={<AppShell />}>
        <Route path="/ferry" element={<FerrySchedule />} />
        <Route path="/ferry/map" element={<FerryMap />} />
        <Route path="/ferry/eta" element={<FerryETA />} />
        <Route path="/ferry/book" element={<BookFerry />} />
        <Route path="/ferry/parking" element={<FerryParking />} />
        <Route path="/ferry/bookings" element={<MyBookings />} />
      </Route>
      <Route element={<LodgingShell />}>
        <Route path="/lodging" element={<LodgingSearch />} />
        <Route path="/lodging/:id" element={<LodgingDetail />} />
        <Route path="/lodging/my-stays" element={<MyStays />} />
      </Route>
      <Route element={<RentalsShell />}>
        <Route path="/equipment" element={<RentalsSearch />} />
        <Route path="/equipment/:id" element={<RentalDetail />} />
        <Route path="/equipment/my-rentals" element={<MyRentals />} />
      </Route>
      <Route element={<FoodShell />}>
        <Route path="/food" element={<FoodSearch />} />
        <Route path="/food/:restaurantId" element={<RestaurantMenu />} />
        <Route path="/food/my-orders" element={<MyOrders />} />
      </Route>
      <Route element={<ShopsShell />}>
        <Route path="/shops" element={<ShopsDirectory />} />
        <Route path="/shops/marketplace" element={<ShopsMarketplace />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
      </Route>
      <Route element={<WeatherShell />}>
        <Route path="/weather" element={<WeatherDashboard />} />
        <Route path="/map" element={<IslandMap />} />
      </Route>
      <Route element={<AgentShell />}>
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/chat/:agentName" element={<AgentChat />} />
      </Route>
      <Route element={<AdminShell />}>
        <Route path="/admin/revenue" element={<RevenueDashboard />} />
        <Route path="/admin/ads" element={<AdCampaigns />} />
        <Route path="/admin/partners" element={<PartnerManagement />} />
        <Route path="/admin/submissions" element={<SubmissionReview />} />
        <Route path="/admin/community" element={<CommunityModeration />} />
        <Route path="/admin/events" element={<EventManagement />} />
        <Route path="/admin/newsletter" element={<NewsletterAdmin />} />
        <Route path="/admin/shop" element={<IslandShopAdmin />} />
        <Route path="/admin/birdie" element={<BirdieAdmin />} />
        <Route path="/admin/concierge" element={<ConciergeAdmin />} />
        <Route path="/admin/babysitting" element={<BabysittingAdmin />} />
        <Route path="/admin/events" element={<EventsAdmin />} />
        <Route path="/admin/partners" element={<PartnersAdmin />} />
        <Route path="/admin/sponsorships" element={<SponsorshipDashboard />} />
        <Route path="/admin/crm" element={<RelationshipCRMDashboard />} />
        <Route path="/admin/referrals" element={<ReferralTracking />} />
        <Route path="/admin/rental-properties" element={<RentalPropertiesAdmin />} />
        <Route path="/admin/turtles" element={<TurtleNestAdmin />} />
        <Route path="/turtles" element={<TurtleEducation />} />
        <Route path="/turtles/map" element={<TurtleNestMap />} />
      </Route>
      <Route element={<CommunityShell />}>
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/community/submit" element={<SubmitContent />} />
        <Route path="/community/:id" element={<SubmissionDetail />} />
      </Route>
      <Route element={<CaptainShell />}>
        <Route path="/captain/dashboard" element={<CaptainDashboard />} />
        <Route path="/captain/saved" element={<SavedCaptains />} />
      </Route>
      <Route element={<CalendarShell />}>
        <Route path="/calendar" element={<IslandCalendar />} />
        <Route path="/calendar/event/:id" element={<EventDetail />} />
        <Route path="/calendar/saved" element={<SavedEvents />} />
        <Route path="/calendar/preferences" element={<CalendarPreferences />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App