import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  Sun, Ship, Waves, Turtle, Music, UtensilsCrossed, Bike, CalendarDays,
  ChevronRight, AlertCircle,
} from 'lucide-react';

export default function DailyBrief() {
  const { data: conditions = [] } = useQuery({
    queryKey: ['islandConditionsCurrent'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });
  const weather = conditions?.[0];

  const { data: ferryStatuses = [] } = useQuery({
    queryKey: ['ferryStatusActive'],
    queryFn: () => base44.entities.FerryStatus.list('-last_checked', 5),
  });
  const activeFerry = ferryStatuses.find(f => f.active) || ferryStatuses[0];

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayStart = new Date(todayKey + 'T00:00:00').toISOString();
  const { data: events = [] } = useQuery({
    queryKey: ['islandEventsToday', todayKey],
    queryFn: () => base44.entities.IslandEvent.filter({ start_time: { $gte: todayStart } }, 'start_time', 50),
  });
  const todayEvents = events.filter(e => format(new Date(e.start_time), 'yyyy-MM-dd') === todayKey);

  const { data: turtleNests = [] } = useQuery({
    queryKey: ['turtleNestsToday'],
    queryFn: () => base44.entities.TurtleNest.list('-created_date', 50),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurantsBrief'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 50),
  });
  const todaysSpecials = restaurants.filter(r =>
    r.specials?.length > 0 && r.is_open !== false
  ).slice(0, 1);

  const briefLines = [];

  if (weather?.temp_f != null) {
    briefLines.push({ icon: Sun, text: `${Math.round(weather.temp_f)}°F`, sub: weather.condition?.replace(/_/g, ' ') });
  }
  if (activeFerry) {
    const isOnTime = activeFerry.status === 'on_time';
    briefLines.push({
      icon: Ship,
      text: isOnTime ? 'Ferry on schedule' : activeFerry.status === 'delayed' ? `Ferry delayed ${activeFerry.delay_minutes || ''}min` : `Ferry ${activeFerry.status.replace(/_/g, ' ')}`,
      sub: isOnTime ? null : activeFerry.severity,
    });
  }
  if (weather?.tide_next_event) {
    briefLines.push({ icon: Waves, text: weather.tide_next_event, sub: weather.tide_status });
  }
  if (turtleNests.length > 0) {
    const todayNests = turtleNests.filter(n => n.created_date && format(new Date(n.created_date), 'yyyy-MM-dd') === todayKey);
    briefLines.push({ icon: Turtle, text: `${todayNests.length > 0 ? todayNests.length : turtleNests.length} turtle nest${turtleNests.length !== 1 ? 's' : ''} protected`, sub: 'BHI Conservancy' });
  }
  if (todayEvents.length > 0) {
    briefLines.push({ icon: CalendarDays, text: `${todayEvents.length} event${todayEvents.length !== 1 ? 's' : ''} happening`, sub: todayEvents[0]?.title });
  }
  if (todaysSpecials.length > 0) {
    const special = todaysSpecials[0].specials[0];
    briefLines.push({ icon: Music, text: `${todaysSpecials[0].name} — ${special}`, sub: 'Tonight' });
  }
  if (weather?.crowd_level) {
    const crowdLabel = { quiet: 'Light traffic', moderate: 'Moderate golf cart traffic', busy: 'Busy island traffic', very_busy: 'Heavy traffic expected' }[weather.crowd_level] || weather.crowd_level;
    briefLines.push({ icon: Bike, text: crowdLabel, sub: null });
  }

  if (briefLines.length === 0) {
    return null;
  }

  return (
    <section className="px-5 mt-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading text-lg text-foreground">Your Island Today</h2>
        <p className="text-[11px] text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
      </div>
      <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-luxe-sm divide-y divide-border/30">
        {briefLines.map((line, i) => {
          const Icon = line.icon;
          return (
            <div key={i} className="flex items-center gap-3.5 py-2.5 first:pt-0 last:pb-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/8 text-accent flex-shrink-0">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-tight">{line.text}</p>
                {line.sub && <p className="text-[11px] text-muted-foreground truncate mt-0.5 capitalize">{line.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}