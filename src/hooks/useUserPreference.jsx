import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserPreference(user) {
  const { data: pref, isLoading } = useQuery({
    queryKey: ['userPreference', user?.email],
    queryFn: async () => {
      const existing = await base44.entities.UserPreference.filter({ user_email: user.email });
      if (existing.length > 0) return existing[0];
      return null;
    },
    enabled: !!user?.email,
  });

  return { pref, isLoading };
}