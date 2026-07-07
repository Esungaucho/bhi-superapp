import React from 'react';
import { isToday, format } from 'date-fns';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function TodayView({ events, savedIds, onToggleSave }) {
  const todayEvents = events
    .filter(e => isToday(new Date(e.start_time)))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (todayEvents.length === 0) {
    return <NoEventsFound message="No verified events found for today" />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-luxe-sm">
        {format(new Date(), 'EEEE, MMMM d')}
      </p>
      {todayEvents.map(event => (
        <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}