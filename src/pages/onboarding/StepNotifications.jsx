import React from 'react';
import { NOTIFICATION_FREQUENCY_OPTIONS } from '@/lib/userConstants';
import { Moon } from 'lucide-react';

export default function StepNotifications({ notifications, setNotifications }) {
  const set = (key, value) => setNotifications({ ...notifications, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Delivery Style</label>
        <div className="space-y-2">
          {NOTIFICATION_FREQUENCY_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => set('notification_frequency', value)}
              className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                notifications.notification_frequency === value
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                notifications.notification_frequency === value ? 'border-accent bg-accent' : 'border-border'
              }`}>
                {notifications.notification_frequency === value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DND */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Do Not Disturb</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pause non-emergency notifications during set hours</p>
          </div>
          <button
            onClick={() => set('dnd_enabled', !notifications.dnd_enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              notifications.dnd_enabled ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              notifications.dnd_enabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>

        {notifications.dnd_enabled && (
          <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
            <div>
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">From</label>
              <input
                type="time"
                value={notifications.dnd_start}
                onChange={e => set('dnd_start', e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Until</label>
              <input
                type="time"
                value={notifications.dnd_end}
                onChange={e => set('dnd_end', e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
        You can change these preferences anytime in Settings.
      </p>
    </div>
  );
}