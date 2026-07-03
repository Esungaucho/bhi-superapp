import React from 'react';
import { USER_ROLES } from '@/lib/userConstants';

export default function StepRole({ role, setRole }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        This helps us tailor your homepage, recommendations, alerts, and content to what matters most to you.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {USER_ROLES.map(({ value, Icon, label, desc }) => {
          const selected = role === value;
          return (
            <button
              key={value}
              onClick={() => setRole(value)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all ${
                selected
                  ? 'border-ocean bg-ocean/5 ring-1 ring-ocean/20'
                  : 'border-border bg-card hover:border-border/60'
              }`}
            >
              <span className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-colors ${
                selected ? 'bg-ocean text-white' : 'bg-sand text-muted-foreground'
              }`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
              </div>
              {selected && (
                <div className="absolute">
                  <div className="w-2 h-2 rounded-full bg-ocean" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}