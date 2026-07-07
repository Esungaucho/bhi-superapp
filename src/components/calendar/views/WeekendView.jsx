import React from 'react';
import { isThisWeek, isWeekend, format } from 'date-fns';
import EventCard from '../EventCard';

export default function WeekendView({ events, savedIds, onToggleSave }) {
  const weekendEvents = events
    .filter(e => {
      const d = new Date(e.start_time);
      return isThisWeek(d, { weekStartsOn: 0 }) && isWeekend(d);
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (weekendEvents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm font-medium text-foreground">No events this weekend</p>
        <p className="text-xs mt-1">Enjoy a peaceful island weekend</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-luxe-sm">
        This Weekend
      </p>
      {weekendEvents.map(event => (
        <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}