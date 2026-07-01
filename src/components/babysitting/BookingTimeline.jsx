import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { BOOKING_STATUS_FLOW, BOOKING_STATUS_META } from '@/lib/babysittingConstants';

export default function BookingTimeline({ currentStatus }) {
  const currentIdx = BOOKING_STATUS_FLOW.indexOf(currentStatus);
  const isDisputed = currentStatus === 'disputed';
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'declined';

  if (isDisputed || isCancelled) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <p className="text-sm font-medium text-destructive">
          {BOOKING_STATUS_META[currentStatus]?.label || currentStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-4">Booking Progress</p>
      <div className="space-y-3">
        {BOOKING_STATUS_FLOW.map((status, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const meta = BOOKING_STATUS_META[status];

          return (
            <div key={status} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
              ) : isCurrent ? (
                <Clock className="w-5 h-5 text-amber-500 animate-pulse flex-shrink-0" strokeWidth={1.5} />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" strokeWidth={1.5} />
              )}
              <div>
                <p className={`text-sm ${isDone || isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {meta?.label || status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}