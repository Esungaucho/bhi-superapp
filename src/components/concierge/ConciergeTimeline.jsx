import React from 'react';
import { Check } from 'lucide-react';
import { TRACKING_STAGES } from '@/lib/conciergeConstants';

export default function ConciergeTimeline({ currentStatus, events = [] }) {
  const currentIdx = TRACKING_STAGES.findIndex(s => s.id === currentStatus);
  if (currentIdx === -1) return null;

  return (
    <div>
      {TRACKING_STAGES.map((stage, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;
        const Icon = stage.Icon;
        const event = events.find(e => e.stage === stage.id);

        return (
          <div key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isDone ? 'bg-accent text-white' : isCurrent ? 'bg-ocean text-white' : 'bg-sand/50 text-muted-foreground'
              }`}>
                {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Icon className="w-4 h-4" strokeWidth={1.5} />}
              </div>
              {idx < TRACKING_STAGES.length - 1 && (
                <div className={`w-0.5 h-8 ${isDone ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
            <div className="pb-6 flex-1">
              <p className={`text-sm font-medium ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stage.description}</p>
              {event && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(event.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
              {isCurrent && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-ocean/10 text-[10px] font-medium text-ocean">
                  In Progress
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}