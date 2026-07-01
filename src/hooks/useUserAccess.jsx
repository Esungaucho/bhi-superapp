import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserAccess() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: charters = [] } = useQuery({
    queryKey: ['myCharters', user?.email],
    queryFn: () => base44.entities.FishingCharter.filter({ owner_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['myShops', user?.email],
    queryFn: () => base44.entities.Shop.filter({ owner_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: conciergeProviders = [] } = useQuery({
    queryKey: ['myConciergeProvider', user?.email],
    queryFn: () => base44.entities.ConciergeProvider.filter({ email: user.email }),
    enabled: !!user?.email,
  });

  const isAdmin = user?.role === 'admin';
  const isCaptain = charters.length > 0;
  const isBusiness = shops.length > 0;
  const isConcierge = conciergeProviders.some(p => p.approval_status === 'approved');

  return {
    user,
    isAdmin,
    isCaptain,
    isBusiness,
    isConcierge,
    showCaptainHub: isCaptain || user?.tier === 'captain' || isAdmin,
    showBusiness: isBusiness || user?.tier === 'business_owner' || isAdmin,
    showAdmin: isAdmin,
    showConciergeDashboard: isConcierge,
  };
}