import React from 'react';
import EventCard from '../EventCard';

export default function ListView({ events, savedIds, onToggleSave }) {
  const upcoming = events
    .filter(e => new Date(e.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm font-medium text-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map(event => (
        <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}