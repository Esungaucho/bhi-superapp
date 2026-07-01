import React from 'react';
import { INTEREST_OPTIONS } from '@/lib/userConstants';

export default function StepInterests({ interests, setInterests }) {
  const toggle = (id) => {
    setInterests(
      interests.includes(id)
        ? interests.filter(i => i !== id)
        : [...interests, id]
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Select topics you'd like updates about. We'll only send notifications related to your interests.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {INTEREST_OPTIONS.map(({ id, label, Icon }) => {
          const selected = interests.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                selected
                  ? 'border-ocean bg-ocean/5 ring-1 ring-ocean/20'
                  : 'border-border bg-card hover:border-border/60'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0 text-foreground/60" strokeWidth={1.5} />
              <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">
        {interests.length} selected
      </p>
    </div>
  );
}