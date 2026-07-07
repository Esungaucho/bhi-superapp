import React from 'react';
import EventCard from '../EventCard';

export default function UpcomingView({ events, savedIds, onToggleSave }) {
  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.start_time) >= now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 30);

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm font-medium text-foreground">No upcoming events</p>
        <p className="text-xs mt-1">Check back soon for new additions</p>
      </div>
    );
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