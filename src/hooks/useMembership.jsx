import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function useMembership() {
  const queryClient = useQueryClient();

  const { data: membership, isLoading } = useQuery({
    queryKey: ['membership'],
    queryFn: async () => {
      try {
        const records = await base44.entities.Membership.filter({}, '-created_date', 1);
        return records[0] || null;
      } catch {
        return null;
      }
    },
  });

  const now = new Date();
  const trialEnd = membership?.trial_end_date ? new Date(membership.trial_end_date) : null;
  const subEnd = membership?.subscription_end_date ? new Date(membership.subscription_end_date) : null;

  const isTrialActive = membership?.status === 'free_trial' && trialEnd && trialEnd > now;
  const isSubActive = membership?.status === 'active' && subEnd && subEnd > now;
  const isPremium = isTrialActive || isSubActive;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))) : 0;

  const startTrial = async () => {
    const start = new Date();
    const end = new Date(start.getTime() + SEVEN_DAYS);
    const record = await base44.entities.Membership.create({
      user_email: '',
      status: 'free_trial',
      trial_start_date: start.toISOString(),
      trial_end_date: end.toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['membership'] });
    return record;
  };

  return {
    membership,
    isPremium,
    isTrialActive,
    isSubActive,
    trialDaysLeft,
    isLoading,
    startTrial,
  };
}