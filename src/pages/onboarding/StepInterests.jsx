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
        {INTEREST_OPTIONS.map(({ id, label, emoji }) => {
          const selected = interests.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                selected
                  ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span className="text-lg flex-shrink-0">{emoji}</span>
              <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/70 text-center">
        {interests.length} selected
      </p>
    </div>
  );
}