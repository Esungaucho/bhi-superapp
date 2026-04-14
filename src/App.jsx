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
import TierSelect from '@/pages/onboarding/TierSelect';
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
      <Route path="/" element={<Navigate to="/ferry" replace />} />
      <Route path="/onboarding/tier-select" element={<TierSelect />} />
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
        <Route path="/rentals" element={<RentalsSearch />} />
        <Route path="/rentals/:id" element={<RentalDetail />} />
        <Route path="/rentals/my-rentals" element={<MyRentals />} />
      </Route>
      <Route element={<FoodShell />}>
        <Route path="/food" element={<FoodSearch />} />
        <Route path="/food/:restaurantId" element={<RestaurantMenu />} />
        <Route path="/food/my-orders" element={<MyOrders />} />
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