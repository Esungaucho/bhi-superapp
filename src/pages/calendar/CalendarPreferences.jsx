import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Bell, Check } from 'lucide-react';
import { INTERESTS } from '@/lib/calendarConstants';

export default function CalendarPreferences() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: prefs = [], isLoading } = useQuery({
    queryKey: ['userPrefs', user?.email],
    queryFn: () => base44.entities.UserPreference.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const userPrefs = prefs[0];
  const selectedInterests = userPrefs?.interests || [];

  const toggleInterest = async (interestId) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(i => i !== interestId)
      : [...selectedInterests, interestId];

    if (userPrefs) {
      await base44.entities.UserPreference.update(userPrefs.id, { interests: newInterests, onboarding_completed: true });
    } else {
      await base44.entities.UserPreference.create({
        user_email: user.email,
        user_name: user.full_name,
        interests: newInterests,
        onboarding_completed: true,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['userPrefs', user?.email] });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-accent" />
        <h2 className="font-heading text-xl text-foreground">Your Interests</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Choose what you'd like to be notified about. We'll send you personalized updates only for the categories you follow.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {INTERESTS.map(interest => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`flex items-center gap-2 p-3 rounded-2xl border transition-all text-left ${isSelected ? 'bg-accent/10 border-accent' : 'bg-card border-border'}`}
            >
              <span className="text-xl flex-shrink-0">{interest.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isSelected ? 'text-accent' : 'text-foreground'}`}>{interest.label}</p>
              </div>
              {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 mt-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🌿 You can change these preferences anytime. Notifications help you stay in the loop with what matters most to you on the island.
        </p>
      </div>
    </div>
  );
}