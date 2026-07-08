import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { getSunsetCountdown, formatSunsetTime } from '@/lib/sunTimes';
import {
  Music, Sunset, Wine, Ship, Turtle, Radio, ChevronRight,
} from 'lucide-react';

export default function HappeningNow() {
  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');
  const todayStart = new Date(todayKey + 'T00:00:00').toISOString();

  const { data: events = [] } = useQuery({
    queryKey: ['islandEventsToday', todayKey],
    queryFn: () => base44.entities.IslandEvent.filter({ start_time: { $gte: todayStart } }, 'start_time', 50),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurantsHappening'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 50),
  });

  const { data: ferrySchedules = [] } = useQuery({
    queryKey: ['ferrySchedulesNow'],
    queryFn: () => base44.entities.FerrySchedule.list('departure_time', 50),
    refetchInterval: 60000,
  });

  const sunsetCountdown = getSunsetCountdown();
  const sunsetTime = formatSunsetTime();

  // Events happening now or starting within the next 2 hours
  const happeningNowEvents = events
    .filter(e => {
      const start = new Date(e.start_time);
      const end = e.end_time ? new Date(e.end_time) : new Date(start.getTime() + 2 * 3600000);
      return format(start, 'yyyy-MM-dd') === todayKey && start <= new Date(now.getTime() + 2 * 3600000) && end >= now;
    })
    .slice(0, 3);

  // Happy hour / specials
  const happyHourSpots = restaurants
    .filter(r => r.is_open !== false && r.specials?.some(s => s.toLowerCase().includes('happy hour')))
    .slice(0, 1);

  // Next ferry boarding (within 30 min)
  const nextBoarding = ferrySchedules
    .filter(f => {
      const dep = new Date(f.departure_time);
      const mins = (dep - now) / 60000;
      return mins >= 0 && mins <= 30;
    })
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  // Turtle walks tonight
  const turtleWalkTonight = events.find(e =>
    e.title?.toLowerCase().includes('turtle') &&
    new Date(e.start_time) >= now &&
    format(new Date(e.start_time), 'yyyy-MM-dd') === todayKey
  );

  const items = [];

  if (sunsetCountdown && sunsetCountdown.totalMinutes <= 120) {
    items.push({
      icon: Sunset,
      label: `Sunset in ${sunsetCountdown.minutes} min`,
      sub: `${sunsetTime} tonight`,
      link: '/weather',
      accent: 'text-amber-600 bg-amber-50',
    });
  } else if (sunsetCountdown) {
    items.push({
      icon: Sunset,
      label: `Sunset at ${sunsetTime}`,
      sub: `${sunsetCountdown.hours}h ${sunsetCountdown.minutes}m away`,
      link: '/weather',
      accent: 'text-amber-600 bg-amber-50',
    });
  }

  if (nextBoarding) {
    const mins = Math.round((new Date(nextBoarding.departure_time) - now) / 60000);
    items.push({
      icon: Ship,
      label: `${format(new Date(nextBoarding.departure_time), 'h:mm a')} ferry boarding`,
      sub: `${mins <= 0 ? 'Boarding now' : `${mins} min`} · ${nextBoarding.direction === 'to_island' ? 'To BHI' : 'To mainland'}`,
      link: '/ferry-tram',
      accent: 'text-ocean bg-ocean/8',
    });
  }

  happeningNowEvents.forEach(e => {
    const isMusic = e.category === 'music' || e.title?.toLowerCase().includes('music') || e.title?.toLowerCase().includes('live');
    items.push({
      icon: isMusic ? Music : Radio,
      label: e.title,
      sub: `${format(new Date(e.start_time), 'h:mm a')}${e.location_name ? ` · ${e.location_name}` : ''}`,
      link: `/calendar/event/${e.id}`,
      accent: isMusic ? 'text-purple-600 bg-purple-50' : 'text-accent bg-accent/8',
    });
  });

  if (happyHourSpots.length > 0) {
    items.push({
      icon: Wine,
      label: `Happy Hour at ${happyHourSpots[0].name}`,
      sub: happyHourSpots[0].specials.find(s => s.toLowerCase().includes('happy hour')),
      link: `/dining/${happyHourSpots[0].id}`,
      accent: 'text-rose-600 bg-rose-50',
    });
  }

  if (turtleWalkTonight) {
    items.push({
      icon: Turtle,
      label: 'Turtle Walk Tonight',
      sub: `${format(new Date(turtleWalkTonight.start_time), 'h:mm a')} · BHI Conservancy`,
      link: `/calendar/event/${turtleWalkTonight.id}`,
      accent: 'text-emerald-600 bg-emerald-50',
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="px-5 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <h2 className="font-heading text-lg text-foreground">Happening Now</h2>
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} to={item.link} className="flex items-center gap-3.5 bg-card border border-border/40 rounded-2xl p-3.5 shadow-luxe-sm hover:shadow-luxe hover:border-accent/30 transition-all">
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${item.accent}`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                {item.sub && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.sub}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}