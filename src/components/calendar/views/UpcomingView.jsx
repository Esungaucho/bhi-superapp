import React from 'react';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function UpcomingView({ events, savedIds, onToggleSave }) {
  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.start_time) >= now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 30);

  if (upcoming.length === 0) {
    return <NoEventsFound />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-luxe-sm">
        Upcoming Events
      </p>
      {upcoming.map(event => (
        <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}