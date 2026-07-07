import React from 'react';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function ListView({ events, savedIds, onToggleSave }) {
  const upcoming = events
    .filter(e => new Date(e.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (upcoming.length === 0) {
    return <NoEventsFound />;
  }

  return (
    <div className="space-y-3">
      {upcoming.map(event => (
        <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}