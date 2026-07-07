import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Bell, Check } from 'lucide-react';
import { INTERESTS, NOTIFICATION_TIMINGS, EVENT_CATEGORIES } from '@/lib/calendarConstants';

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
  const notifFreq = userPrefs?.notification_frequency || 'immediate';
  const dndEnabled = userPrefs?.dnd_enabled || false;

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

  const updateNotifFreq = async (freq) => {
    if (userPrefs) {
      await base44.entities.UserPreference.update(userPrefs.id, { notification_frequency: freq });
    }
    queryClient.invalidateQueries({ queryKey: ['userPrefs', user?.email] });
  };

  const toggleDnd = async () => {
    if (userPrefs) {
      await base44.entities.UserPreference.update(userPrefs.id, { dnd_enabled: !dndEnabled });
    }
    queryClient.invalidateQueries({ queryKey: ['userPrefs', user?.email] });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      {/* Notification Timing */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-accent" strokeWidth={1.5} />
          <h2 className="font-heading text-xl text-foreground">Notification Settings</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how and when you receive event reminders.
        </p>

        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground">Default Reminder Timing</p>
          <p className="text-[11px] text-muted-foreground -mt-1">Applies to all saved events. You can customize per event on its detail page.</p>
          <div className="space-y-1.5">
            {NOTIFICATION_TIMINGS.map(t => (
              <button key={t.id}
                onClick={() => updateNotifFreq(t.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${notifFreq === t.id ? 'bg-accent/10 border-accent' : 'bg-secondary/30 border-transparent'}`}>
                <span className="flex items-center gap-2">
                  <t.Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className={`text-xs font-medium ${notifFreq === t.id ? 'text-accent' : 'text-foreground'}`}>{t.label}</span>
                </span>
                {notifFreq === t.id && <Check className="w-4 h-4 text-accent" strokeWidth={1.5} />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Do Not Disturb</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Silence non-emergency notifications</p>
            </div>
            <button onClick={toggleDnd}
              className={`w-9 h-5 rounded-full flex items-center transition-colors ${dndEnabled ? 'bg-primary' : 'bg-border'}`}>
              <span className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${dndEnabled ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Notifications */}
      <div>
        <h3 className="font-heading text-lg text-foreground mb-1">Categories to Follow</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified about events in categories you care about.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {EVENT_CATEGORIES.map(cat => {
            const isSelected = selectedInterests.includes(cat.id);
            return (
              <button key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`flex items-center gap-2 p-3 rounded-2xl border transition-all text-left ${isSelected ? 'bg-accent/10 border-accent' : 'bg-card border-border'}`}>
                <cat.Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <span className={`text-xs font-medium ${isSelected ? 'text-accent' : 'text-foreground'}`}>{cat.label}</span>
                {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0 ml-auto" strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          You can change these preferences anytime. Notifications help you stay in the loop with what matters most to you on the island.
        </p>
      </div>
    </div>
  );
}