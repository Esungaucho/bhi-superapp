import React from 'react';
import { isThisWeek, isWeekend, format } from 'date-fns';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function WeekendView({ events, savedIds, onToggleSave }) {
  const weekendEvents = events
    .filter(e => {
      const d = new Date(e.start_time);
      return isThisWeek(d, { weekStartsOn: 0 }) && isWeekend(d);
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (weekendEvents.length === 0) {
    return <NoEventsFound message="No verified events found for this weekend" />;
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