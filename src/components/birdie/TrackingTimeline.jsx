import React from 'react';
import { Check } from 'lucide-react';
import { TRACKING_STAGES, getTrackingStage } from '@/lib/birdieConstants';

export default function TrackingTimeline({ currentStatus, events = [] }) {
  const currentIdx = TRACKING_STAGES.findIndex(s => s.id === currentStatus);

  return (
    <div className="space-y-0">
      {TRACKING_STAGES.map((stage, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;
        const Icon = stage.Icon;
        const event = events.find(e => e.stage === stage.id);

        return (
          <div key={stage.id} className="flex gap-3">
            {/* Vertical line + icon */}
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

            {/* Content */}
            <div className="pb-6 flex-1">
              <p className={`text-sm font-medium ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stage.description}</p>
              {event && (
                <div className="mt-1.5">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(event.created_date || event.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                  {event.note && <p className="text-[11px] text-foreground mt-0.5">{event.note}</p>}
                  {event.photo_url && (
                    <img src={event.photo_url} alt="Update" className="w-20 h-20 rounded-lg object-cover mt-1.5" />
                  )}
                </div>
              )}
              {isCurrent && (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-ocean/10 text-[10px] font-medium text-ocean">
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