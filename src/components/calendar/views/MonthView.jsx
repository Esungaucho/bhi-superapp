import React from 'react';
import { isSameMonth, format } from 'date-fns';
import MonthGrid from '../MonthGrid';
import EventCard from '../EventCard';
import NoEventsFound from '../NoEventsFound';

export default function MonthView({ events, savedIds, onToggleSave, selectedDate, onSelectDate }) {
  const monthEvents = events.filter(e => isSameMonth(new Date(e.start_time), selectedDate));
  const dayEvents = monthEvents
    .filter(e => format(new Date(e.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div className="space-y-4">
      <MonthGrid events={monthEvents} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-luxe-sm">
          {format(selectedDate, 'EEEE, MMMM d')}
        </p>
        {dayEvents.length === 0 ? (
          <NoEventsFound message="No verified events found on this day" />
        ) : (
          dayEvents.map(event => (
            <EventCard key={event.id} event={event} isSaved={savedIds.includes(event.id)} onToggleSave={onToggleSave} />
          ))
        )}
      </div>
    </div>
  );
}