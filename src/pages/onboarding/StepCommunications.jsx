import React from 'react';
import { Mail, Bell, MessageSquare, Newspaper } from 'lucide-react';

const CHANNELS = [
  { key: 'comm_push', label: 'Push Notifications', desc: 'Real-time alerts on your device', Icon: Bell },
  { key: 'comm_email', label: 'Email', desc: 'Updates sent to your inbox', Icon: Mail },
  { key: 'comm_sms', label: 'SMS / Text', desc: 'Text messages for important updates', Icon: MessageSquare },
];

export default function StepCommunications({ communications, setCommunications }) {
  const toggle = (key) => setCommunications({ ...communications, [key]: !communications[key] });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Choose how you'd like to receive updates. You can select one, two, or all three.
      </p>

      <div className="space-y-2.5">
        {CHANNELS.map(({ key, label, desc, Icon }) => {
          const selected = communications[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                selected ? 'border-accent bg-accent/5' : 'border-border bg-card'
              }`}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors ${
                selected ? 'bg-accent text-white' : 'bg-sand text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected ? 'border-accent bg-accent' : 'border-border'
              }`}>
                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Newsletter */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-accent/8 to-transparent p-4">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent flex-shrink-0">
            <Newspaper className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Weekly BHI Island Newsletter</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Events, restaurant specials, ferry updates, weather alerts, wildlife & turtle updates, seasonal activities, community highlights & local promotions.
            </p>
          </div>
          <button
            onClick={() => toggle('newsletter_subscribed')}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              communications.newsletter_subscribed ? 'border-accent bg-accent' : 'border-border'
            }`}
          >
            {communications.newsletter_subscribed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}