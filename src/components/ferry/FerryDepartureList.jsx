import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { Clock, MapPin, ArrowRight } from 'lucide-react';

export default function FerryDepartureList({ departures, direction, title, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-3.5 animate-pulse">
            <div className="h-4 w-20 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">No departures found</p>
      </div>
    );
  }

  const now = new Date();
  const upcoming = departures.filter(d => new Date(d.departure_time) >= now);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-luxe-sm">{title}</h3>
        <span className="text-[10px] text-muted-foreground">({upcoming.length} upcoming)</span>
      </div>
      {upcoming.slice(0, 8).map((dep) => {
        const depTime = new Date(dep.departure_time);
        const arrTime = new Date(dep.arrival_time);
        const isNext = upcoming[0]?.id === dep.id;
        let dayLabel = '';
        if (isToday(depTime)) dayLabel = 'Today';
        else if (isTomorrow(depTime)) dayLabel = 'Tomorrow';
        else dayLabel = format(depTime, 'EEE, MMM d');

        const minutesUntil = Math.round((depTime - now) / 60000);
        const isImminent = minutesUntil <= 60 && minutesUntil >= 0;

        return (
          <div
            key={dep.id}
            className={`bg-card rounded-xl border p-3.5 flex items-center gap-3 ${isNext ? 'border-accent/40 bg-accent/5' : 'border-border'}`}
          >
            <div className="flex flex-col items-center justify-center w-14 flex-shrink-0">
              <span className="text-base font-bold text-foreground">{format(depTime, 'h:mm')}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{format(depTime, 'a')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">{dayLabel}</span>
                {isNext && (
                  <span className="text-[9px] font-bold uppercase tracking-wide bg-accent text-white rounded-full px-1.5 py-0.5">
                    Next
                  </span>
                )}
                {isImminent && !isNext && (
                  <span className="text-[9px] font-semibold text-amber-600">
                    {minutesUntil <= 0 ? 'Boarding' : `${minutesUntil}m`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <span>{dep.departure_location}</span>
                <ArrowRight className="w-2.5 h-2.5" strokeWidth={1.5} />
                <span>{dep.arrival_location}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span>{format(arrTime, 'h:mm a')}</span>
            </div>
          </div>
        );
      })}
      {upcoming.length > 8 && (
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          +{upcoming.length - 8} more departures today
        </p>
      )}
    </div>
  );
}