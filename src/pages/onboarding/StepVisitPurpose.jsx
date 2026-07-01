import React from 'react';

const VISIT_PURPOSES = [
  { value: 'resident', emoji: '🌴', label: 'Resident', desc: 'I live on the island' },
  { value: 'homeowner', emoji: '🏡', label: 'Homeowner', desc: 'I own property here' },
  { value: 'vacation_guest', emoji: '🏖️', label: 'Vacation Guest', desc: 'On vacation or getaway' },
  { value: 'visiting_family', emoji: '👨‍👩‍👧‍👦', label: 'Visiting Family', desc: 'Staying with family' },
  { value: 'wedding_guest', emoji: '💍', label: 'Wedding Guest', desc: 'Attending a wedding' },
  { value: 'fishing_trip', emoji: '🎣', label: 'Fishing Trip', desc: 'Here to fish' },
  { value: 'business', emoji: '💼', label: 'Business', desc: 'Work or business trip' },
  { value: 'family_vacation', emoji: '🏖️', label: 'Family Vacation', desc: 'Family getaway' },
];

export default function StepVisitPurpose({ visitPurpose, setVisitPurpose }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        This helps us tailor your feed, recommendations, and notifications to what matters most to you.
      </p>
      <div className="space-y-2.5">
        {VISIT_PURPOSES.map(({ value, emoji, label, desc }) => {
          const selected = visitPurpose === value;
          return (
            <button
              key={value}
              onClick={() => setVisitPurpose(value)}
              className={`w-full flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                selected
                  ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selected ? 'border-accent bg-accent' : 'border-border'
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