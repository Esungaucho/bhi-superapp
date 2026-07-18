import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Route-based code splitting: every shell and page is its own chunk, fetched
// on first navigation, so visitors only download the areas they actually use.
const AppShell = lazy(() => import('@/components/ferry/AppShell'));
const FerrySchedule = lazy(() => import('@/pages/FerrySchedule'));
const FerryStatus = lazy(() => import('@/pages/FerryStatus'));
const FerryMap = lazy(() => import('@/pages/FerryMap'));
const FerryETA = lazy(() => import('@/pages/FerryETA'));
const BookFerry = lazy(() => import('@/pages/BookFerry'));
const FerryParking = lazy(() => import('@/pages/FerryParking'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));
const OnboardingWizard = lazy(() => import('@/pages/onboarding/OnboardingWizard'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const CommunicationSettings = lazy(() => import('@/pages/CommunicationSettings'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const FerryRouteDetail = lazy(() => import('@/pages/FerryRouteDetail'));
const LodgingShell = lazy(() => import('@/components/lodging/LodgingShell'));
const LodgingSearch = lazy(() => import('@/pages/LodgingSearch'));
const LodgingDetail = lazy(() => import('@/pages/LodgingDetail'));
const MyStays = lazy(() => import('@/pages/MyStays'));
const RentalsShell = lazy(() => import('@/components/rentals/RentalsShell'));
const RentalsSearch = lazy(() => import('@/pages/RentalsSearch'));
const RentalDetail = lazy(() => import('@/pages/RentalDetail'));
const MyRentals = lazy(() => import('@/pages/MyRentals'));
const FoodShell = lazy(() => import('@/components/food/FoodShell'));
const FoodSearch = lazy(() => import('@/pages/FoodSearch'));
const RestaurantMenu = lazy(() => import('@/pages/RestaurantMenu'));
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail'));
const MyOrders = lazy(() => import('@/pages/MyOrders'));
const ShopsShell = lazy(() => import('@/components/shops/ShopsShell'));
const ShopsDirectory = lazy(() => import('@/pages/ShopsDirectory'));
const ShopDetail = lazy(() => import('@/pages/ShopDetail'));
const ShopsMarketplace = lazy(() => import('@/pages/ShopsMarketplace'));
const WeatherShell = lazy(() => import('@/components/weather/WeatherShell'));
const WeatherDashboard = lazy(() => import('@/pages/WeatherDashboard'));
const IslandMap = lazy(() => import('@/pages/IslandMap'));
const DashboardShell = lazy(() => import('@/components/dashboard/DashboardShell'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Discovery = lazy(() => import('@/pages/Discovery'));
const IslandShop = lazy(() => import('@/pages/IslandShop'));
const BirdieConcierge = lazy(() => import('@/pages/BirdieConcierge'));
const BirdieNewRequest = lazy(() => import('@/pages/BirdieNewRequest'));
const BirdieItinerary = lazy(() => import('@/pages/BirdieItinerary'));
const BirdieRequestDetail = lazy(() => import('@/pages/BirdieRequestDetail'));
const BirdieShoppers = lazy(() => import('@/pages/BirdieShoppers'));
const BHIConcierge = lazy(() => import('@/pages/BHIConcierge'));
const ConciergeRequest = lazy(() => import('@/pages/ConciergeRequest'));
const ConciergeTrack = lazy(() => import('@/pages/ConciergeTrack'));
const ConciergeProviders = lazy(() => import('@/pages/ConciergeProviders'));
const ConciergeProviderDashboard = lazy(() => import('@/pages/ConciergeProviderDashboard'));
const BookExperiences = lazy(() => import('@/pages/BookExperiences'));
const MyIsland = lazy(() => import('@/pages/MyIsland'));
const Settings = lazy(() => import('@/pages/Settings'));
const Saved = lazy(() => import('@/pages/Saved'));
const UniversalSearch = lazy(() => import('@/pages/UniversalSearch'));
const AgentShell = lazy(() => import('@/components/agents/AgentShell'));
const Agents = lazy(() => import('@/pages/Agents'));
const AgentChat = lazy(() => import('@/pages/AgentChat'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const AllBookings = lazy(() => import('@/pages/AllBookings'));
const AdminShell = lazy(() => import('@/components/admin/AdminShell'));
const RevenueDashboard = lazy(() => import('@/pages/admin/RevenueDashboard'));
const AdCampaigns = lazy(() => import('@/pages/admin/AdCampaigns'));
const PartnerManagement = lazy(() => import('@/pages/admin/PartnerManagement'));
const SubmissionReview = lazy(() => import('@/pages/admin/SubmissionReview'));
const CommunityModeration = lazy(() => import('@/pages/admin/CommunityModeration'));
const CommunityShell = lazy(() => import('@/components/community/CommunityShell'));
const CommunityFeed = lazy(() => import('@/pages/CommunityFeed'));
const SubmitContent = lazy(() => import('@/pages/SubmitContent'));
const SubmissionDetail = lazy(() => import('@/pages/SubmissionDetail'));
const CalendarShell = lazy(() => import('@/components/calendar/CalendarShell'));
const IslandCalendar = lazy(() => import('@/pages/IslandCalendar'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const SavedEvents = lazy(() => import('@/pages/calendar/SavedEvents'));
const CalendarPreferences = lazy(() => import('@/pages/calendar/CalendarPreferences'));
const EventManagement = lazy(() => import('@/pages/admin/EventManagement'));
const EventSourceManager = lazy(() => import('@/pages/admin/EventSourceManager'));
const NewsletterAdmin = lazy(() => import('@/pages/admin/NewsletterAdmin'));
const IslandShopAdmin = lazy(() => import('@/pages/admin/IslandShopAdmin'));
const BirdieAdmin = lazy(() => import('@/pages/admin/BirdieAdmin'));
const ConciergeAdmin = lazy(() => import('@/pages/admin/ConciergeAdmin'));
const CaptainShell = lazy(() => import('@/components/captain/CaptainShell'));
const CaptainDashboard = lazy(() => import('@/pages/CaptainDashboard'));
const SavedCaptains = lazy(() => import('@/pages/SavedCaptains'));
const ThankYou = lazy(() => import('@/pages/ThankYou'));
const Babysitting = lazy(() => import('@/pages/Babysitting'));
const SitterProfile = lazy(() => import('@/pages/SitterProfile'));
const BabysittingBookingDetail = lazy(() => import('@/pages/BabysittingBookingDetail'));
const BabysittingMessage = lazy(() => import('@/pages/BabysittingMessage'));
const BabysittingAdmin = lazy(() => import('@/pages/admin/BabysittingAdmin'));
const EventsHub = lazy(() => import('@/pages/EventsHub'));
const StartEvent = lazy(() => import('@/pages/StartEvent'));
const EventDashboard = lazy(() => import('@/pages/EventDashboard'));
const EventVendors = lazy(() => import('@/pages/EventVendors'));
const EventVendorProfile = lazy(() => import('@/pages/EventVendorProfile'));
const EventGuestLogistics = lazy(() => import('@/pages/EventGuestLogistics'));
const EventTimeline = lazy(() => import('@/pages/EventTimeline'));
const EventRequests = lazy(() => import('@/pages/EventRequests'));
const EventConciergeHelp = lazy(() => import('@/pages/EventConciergeHelp'));
const EventsAdmin = lazy(() => import('@/pages/admin/EventsAdmin'));
const ConciergeServices = lazy(() => import('@/pages/ConciergeServices'));
const PreferredPartners = lazy(() => import('@/pages/PreferredPartners'));
const PartnerProfile = lazy(() => import('@/pages/PartnerProfile'));
const WeddingInquiryPage = lazy(() => import('@/pages/WeddingInquiryPage'));
const PartnersAdmin = lazy(() => import('@/pages/admin/PartnersAdmin'));
const LuxuryRealEstate = lazy(() => import('@/pages/LuxuryRealEstate'));
const BuildersHome = lazy(() => import('@/pages/BuildersHome'));
const CommunityPartners = lazy(() => import('@/pages/CommunityPartners'));
const SponsorshipDashboard = lazy(() => import('@/pages/admin/SponsorshipDashboard'));
const RelationshipCRMDashboard = lazy(() => import('@/pages/admin/RelationshipCRMDashboard'));
const ReferralTracking = lazy(() => import('@/pages/admin/ReferralTracking'));
const RentalsHub = lazy(() => import('@/pages/RentalsHub'));
const RentalPropertyDetail = lazy(() => import('@/pages/RentalPropertyDetail'));
const EventRentals = lazy(() => import('@/pages/EventRentals'));
const RentalPropertiesAdmin = lazy(() => import('@/pages/admin/RentalPropertiesAdmin'));
const TurtleEducation = lazy(() => import('@/pages/TurtleEducation'));
const TurtleNestMap = lazy(() => import('@/pages/TurtleNestMap'));
const TurtleNestAdmin = lazy(() => import('@/pages/admin/TurtleNestAdmin'));
const RestaurantsAdmin = lazy(() => import('@/pages/admin/RestaurantsAdmin'));
const NotificationAdmin = lazy(() => import('@/pages/admin/NotificationAdmin'));
const FerryAdmin = lazy(() => import('@/pages/admin/FerryAdmin'));
const ConciergeToolsAdmin = lazy(() => import('@/pages/admin/ConciergeToolsAdmin'));
const VillageInfo = lazy(() => import('@/pages/VillageInfo'));
const Founders = lazy(() => import('@/pages/Founders'));
const TransportationParking = lazy(() => import('@/pages/TransportationParking'));
const CarLocator = lazy(() => import('@/pages/CarLocator'));
const MyPlans = lazy(() => import('@/pages/MyPlans'));
const Membership = lazy(() => import('@/pages/Membership'));
const MainlandShoppers = lazy(() => import('@/pages/MainlandShoppers'));
const ShopBeforeArrive = lazy(() => import('@/pages/ShopBeforeArrive'));
const FerryTramHub = lazy(() => import('@/pages/FerryTramHub'));
const SharkTracker = lazy(() => import('@/pages/SharkTracker'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<DashboardShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/island-shop" element={<IslandShop />} />
        <Route path="/birdie" element={<BirdieConcierge />} />
        <Route path="/birdie/new" element={<BirdieNewRequest />} />
        <Route path="/birdie/itinerary" element={<BirdieItinerary />} />
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
        <Route path="/village-info" element={<VillageInfo />} />
        <Route path="/founders" element={<Founders />} />
        <Route path="/transportation" element={<TransportationParking />} />
        <Route path="/car-locator" element={<CarLocator />} />
        <Route path="/my-plans" element={<MyPlans />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/mainland-shoppers" element={<MainlandShoppers />} />
        <Route path="/shop-before-arrive" element={<ShopBeforeArrive />} />
        <Route path="/ferry-tram" element={<FerryTramHub />} />
        <Route path="/shark-tracker" element={<SharkTracker />} />
        <Route path="/bookings" element={<AllBookings />} />
      </Route>
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/ferry/route/:routeId" element={<FerryRouteDetail />} />
      <Route element={<AppShell />}>
        <Route path="/ferry" element={<FerrySchedule />} />
        <Route path="/ferry/status" element={<FerryStatus />} />
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
        <Route path="/dining/:restaurantId" element={<RestaurantDetail />} />
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
        <Route path="/admin/event-sources" element={<EventSourceManager />} />
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
        <Route path="/admin/restaurants" element={<RestaurantsAdmin />} />
        <Route path="/admin/notifications" element={<NotificationAdmin />} />
        <Route path="/admin/ferry" element={<FerryAdmin />} />
        <Route path="/admin/concierge-tools" element={<ConciergeToolsAdmin />} />
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
    </Suspense>
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