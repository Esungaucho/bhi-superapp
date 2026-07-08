import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react';

export default function EventsToday() {
  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');
  const todayStart = new Date(todayKey + 'T00:00:00').toISOString();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['islandEventsToday', todayKey],
    queryFn: () => base44.entities.IslandEvent.filter({ start_time: { $gte: todayStart } }, 'start_time', 50),
  });

  const todayEvents = events
    .filter(e => format(new Date(e.start_time), 'yyyy-MM-dd') === todayKey)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 4);

  if (isLoading || todayEvents.length === 0) {
    if (isLoading) return null;
    return (
      <section className="px-5 mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-heading text-lg text-foreground">Events Today</h2>
          <Link to="/calendar" className="text-[11px] font-medium text-accent tracking-luxe-xs uppercase hover:underline">View Calendar</Link>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-6 text-center shadow-luxe-sm">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No verified events scheduled today</p>
          <Link to="/calendar" className="text-[11px] font-medium text-accent mt-2 inline-block hover:underline">Browse upcoming events →</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 mt-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading text-lg text-foreground">Events Today</h2>
        <Link to="/calendar" className="text-[11px] font-medium text-accent tracking-luxe-xs uppercase hover:underline">
          All Events
        </Link>
      </div>
      <div className="bg-card border border-border/40 rounded-2xl divide-y divide-border/30 shadow-luxe-sm">
        {todayEvents.map(event => (
          <Link key={event.id} to={`/calendar/event/${event.id}`} className="flex items-center gap-3.5 p-3.5 hover:bg-sand/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-accent/8 flex-shrink-0">
              <span className="text-[9px] font-medium tracking-wide uppercase text-muted-foreground">
                {format(new Date(event.start_time), 'MMM')}
              </span>
              <span className="text-base font-heading font-semibold text-foreground leading-none">
                {format(new Date(event.start_time), 'd')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{format(new Date(event.start_time), 'h:mm a')}</span>
                {event.location_name && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground truncate flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" strokeWidth={1.5} />
                      {event.location_name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
      <Link to="/calendar" className="block text-center text-[11px] font-medium text-accent mt-3 hover:underline">
        Tap for all events →
      </Link>
    </section>
  );
}