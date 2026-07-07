import React, { useMemo } from 'react';
import { isThisWeek, format } from 'date-fns';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function WeekView({ events, savedIds, onToggleSave }) {
  const grouped = useMemo(() => {
    const weekEvents = events
      .filter(e => isThisWeek(new Date(e.start_time), { weekStartsOn: 0 }))
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const groups = {};
    weekEvents.forEach(e => {
      const dayKey = format(new Date(e.start_time), 'yyyy-MM-dd');
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  if (grouped.length === 0) {
    return <NoEventsFound message="No verified events found for this week" />;
  }

  return (
    <div className="space-y-5">
      {grouped.map(([dayKey, dayEvents]) => (
        <div key={dayKey} className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-luxe-sm">
            {format(new Date(dayKey), 'EEEE, MMM d')}
          </p>
          {dayEvents.map(event => (
            <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
          ))}
        </div>
      ))}
    </div>
  );
}