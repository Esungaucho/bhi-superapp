import React from 'react';
import { Home, Sun, Users, Heart, Fish, Briefcase, Umbrella } from 'lucide-react';

const VISIT_PURPOSES = [
  { value: 'resident', Icon: Home, label: 'Resident', desc: 'I live on the island' },
  { value: 'homeowner', Icon: Home, label: 'Homeowner', desc: 'I own property here' },
  { value: 'vacation_guest', Icon: Sun, label: 'Vacation Guest', desc: 'On vacation or getaway' },
  { value: 'visiting_family', Icon: Users, label: 'Visiting Family', desc: 'Staying with family' },
  { value: 'wedding_guest', Icon: Heart, label: 'Wedding Guest', desc: 'Attending a wedding' },
  { value: 'fishing_trip', Icon: Fish, label: 'Fishing Trip', desc: 'Here to fish' },
  { value: 'business', Icon: Briefcase, label: 'Business', desc: 'Work or business trip' },
  { value: 'family_vacation', Icon: Umbrella, label: 'Family Vacation', desc: 'Family getaway' },
];

export default function StepVisitPurpose({ visitPurpose, setVisitPurpose }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        This helps us tailor your feed, recommendations, and notifications to what matters most to you.
      </p>
      <div className="space-y-2.5">
        {VISIT_PURPOSES.map(({ value, Icon, label, desc }) => {
          const selected = visitPurpose === value;
          return (
            <button
              key={value}
              onClick={() => setVisitPurpose(value)}
              className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? 'border-ocean bg-ocean/5 ring-1 ring-ocean/20'
                  : 'border-border bg-card hover:border-border/60'
              }`}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors ${
                selected ? 'bg-ocean text-white' : 'bg-sand text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selected ? 'border-ocean bg-ocean' : 'border-border'
              }`}>
                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}