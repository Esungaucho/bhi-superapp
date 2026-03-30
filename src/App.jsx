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
      <Route element={<AppShell />}>
        <Route path="/ferry" element={<FerrySchedule />} />
        <Route path="/ferry/map" element={<FerryMap />} />
        <Route path="/ferry/eta" element={<FerryETA />} />
        <Route path="/ferry/book" element={<BookFerry />} />
        <Route path="/ferry/parking" element={<FerryParking />} />
        <Route path="/ferry/bookings" element={<MyBookings />} />
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