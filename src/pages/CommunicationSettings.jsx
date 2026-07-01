import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Check, Mail, Bell, MessageSquare, Newspaper, Moon } from 'lucide-react';
import { useUserPreference } from '@/hooks/useUserPreference';
import { INTEREST_OPTIONS, NOTIFICATION_FREQUENCY_OPTIONS } from '@/lib/userConstants';

const CHANNELS = [
  { key: 'comm_push', label: 'Push Notifications', desc: 'Real-time alerts on your device', Icon: Bell },
  { key: 'comm_email', label: 'Email', desc: 'Updates sent to your inbox', Icon: Mail },
  { key: 'comm_sms', label: 'SMS / Text', desc: 'Text messages for important updates', Icon: MessageSquare },
];

export default function CommunicationSettings() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { pref } = useUserPreference(user);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    comm_push: true,
    comm_email: true,
    comm_sms: false,
    newsletter_subscribed: false,
    notification_frequency: 'immediate',
    dnd_enabled: false,
    dnd_start: '22:00',
    dnd_end: '07:00',
    interests: [],
  });

  useEffect(() => {
    if (pref) {
      setForm({
        comm_push: pref.comm_push ?? true,
        comm_email: pref.comm_email ?? true,
        comm_sms: pref.comm_sms ?? false,
        newsletter_subscribed: pref.newsletter_subscribed ?? false,
        notification_frequency: pref.notification_frequency || 'immediate',
        dnd_enabled: pref.dnd_enabled ?? false,
        dnd_start: pref.dnd_start || '22:00',
        dnd_end: pref.dnd_end || '07:00',
        interests: pref.interests || [],
      });
    }
  }, [pref]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggleInterest = (id) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter(i => i !== id) : [...f.interests, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const existing = await base44.entities.UserPreference.filter({ user_email: user.email });
      const prefData = { user_email: user.email, user_name: user.full_name, ...form };
      if (existing.length > 0) {
        await base44.entities.UserPreference.update(existing[0].id, prefData);
      } else {
        await base44.entities.UserPreference.create(prefData);
      }
      queryClient.invalidateQueries(['userPreference']);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Communication</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage how and when we reach you</p>
      </header>

      {/* Channels */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Notification Methods</h3>
      <div className="bg-card border border-border/50 rounded-2xl p-2 mb-6">
        {CHANNELS.map(({ key, label, desc, Icon }) => {
          const selected = form[key];
          return (
            <button
              key={key}
              onClick={() => set(key, !selected)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sand/40 transition-colors text-left"
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors ${
                selected ? 'bg-accent text-white' : 'bg-sand text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                selected ? 'bg-accent' : 'bg-border'
              }`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  selected ? 'translate-x-5' : ''
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Newsletter */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/8 to-transparent p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent flex-shrink-0">
            <Newspaper className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Weekly BHI Island Newsletter</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Events, restaurant specials, ferry updates, weather, wildlife, seasonal activities & local promotions.
            </p>
          </div>
          <button
            onClick={() => set('newsletter_subscribed', !form.newsletter_subscribed)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              form.newsletter_subscribed ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              form.newsletter_subscribed ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Frequency */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Delivery Style</h3>
      <div className="bg-card border border-border/50 rounded-2xl p-2 mb-6 space-y-1">
        {NOTIFICATION_FREQUENCY_OPTIONS.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => set('notification_frequency', value)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sand/40 transition-colors text-left"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              form.notification_frequency === value ? 'border-accent bg-accent' : 'border-border'
            }`}>
              {form.notification_frequency === value && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      {/* DND */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Do Not Disturb</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pause non-emergency notifications</p>
          </div>
          <button
            onClick={() => set('dnd_enabled', !form.dnd_enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              form.dnd_enabled ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              form.dnd_enabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
        {form.dnd_enabled && (
          <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
            <div>
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">From</label>
              <input
                type="time"
                value={form.dnd_start}
                onChange={e => set('dnd_start', e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Until</label>
              <input
                type="time"
                value={form.dnd_end}
                onChange={e => set('dnd_end', e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Interests */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Topics You Care About</h3>
      <div className="grid grid-cols-2 gap-2 mb-8">
        {INTEREST_OPTIONS.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => toggleInterest(id)}
            className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all ${
              form.interests.includes(id) ? 'border-accent bg-accent/10' : 'border-border bg-card'
            }`}
          >
            <span className="text-sm">{emoji}</span>
            <span className="text-[11px] font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-40"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? (
          <><Check className="w-5 h-5" strokeWidth={2} /> Saved</>
        ) : 'Save Preferences'}
      </button>
    </div>
  );
}