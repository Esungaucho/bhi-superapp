import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sun, Ship, CalendarDays, ChevronRight, Waves, CloudRain, Cloud, CloudSun } from 'lucide-react';
import { format } from 'date-fns';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format';

const WEATHER_ICONS = {
  sunny: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudRain,
  foggy: Cloud,
};

const CONDITION_LABELS = {
  sunny: 'Sunny',
  partly_cloudy: 'Partly Cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain',
  storm: 'Storm',
  foggy: 'Foggy',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHero({ user }) {
  const { data: conditions } = useQuery({
    queryKey: ['islandConditionsCurrent'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });
  const weather = conditions?.[0];

  const { data: ferrySchedules = [] } = useQuery({
    queryKey: ['ferryScheduleToday'],
    queryFn: () => base44.entities.FerrySchedule.list('departure_time', 50),
  });

  const now = new Date();
  const todayKey = format(now, 'yyyy-MM-dd');
  const nextFerry = ferrySchedules
    .filter(f => new Date(f.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  const { data: events = [] } = useQuery({
    queryKey: ['islandEventsToday'],
    queryFn: () => base44.entities.IslandEvent.list('start_time', 50),
  });

  const todayEvents = events
    .filter(e => e.status === 'approved' && format(new Date(e.start_time), 'yyyy-MM-dd') === todayKey)
    .slice(0, 3);

  const firstName = user?.full_name?.split(' ')[0] || 'Explorer';
  const WeatherIcon = weather ? (WEATHER_ICONS[weather.condition] || Sun) : Sun;

  return (
    <section className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Bald Head Island at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
          <p className="text-[11px] font-body tracking-luxe uppercase text-white/70">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="font-heading text-[1.75rem] leading-[1.1] mt-1.5 text-balance">
            Welcome to Bald Head Island
          </h1>
        </div>
      </div>

      {/* Three summary cards */}
      <div className="px-5 -mt-6 relative z-10 space-y-3">
        {/* Today's Weather */}
        <Link
          to="/weather"
          className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-4 shadow-luxe hover:shadow-luxe-lg hover:border-accent/30 transition-all"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent flex-shrink-0">
            <WeatherIcon className="w-6 h-6" strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-body tracking-luxe-sm uppercase text-muted-foreground">Today's Weather</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {weather ? `${Math.round(weather.temp_f)}°F · ${CONDITION_LABELS[weather.condition] || weather.condition}` : 'View forecast'}
            </p>
            {weather?.tide_next_event && (
              <p className="text-[11px] text-muted-foreground truncate">{weather.tide_next_event}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
        </Link>

        {/* Ferry Schedule */}
        <Link
          to="/ferry"
          className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-4 shadow-luxe hover:shadow-luxe-lg hover:border-accent/30 transition-all"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-ocean/10 text-ocean flex-shrink-0">
            <Ship className="w-6 h-6" strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-body tracking-luxe-sm uppercase text-muted-foreground">Ferry Schedule</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {nextFerry ? `Next ferry ${format(new Date(nextFerry.departure_time), 'h:mm a')}` : 'View schedule'}
            </p>
            {nextFerry && (
              <p className="text-[11px] text-muted-foreground capitalize">
                {nextFerry.direction === 'to_island' ? 'To island' : 'To mainland'}
                {nextFerry.status === 'on_time' ? ' · On time' : nextFerry.status === 'delayed' ? ` · ${nextFerry.delay_minutes}m delay` : ` · ${nextFerry.status}`}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
        </Link>

        {/* Island Events Today */}
        <Link
          to="/calendar"
          className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-4 shadow-luxe hover:shadow-luxe-lg hover:border-accent/30 transition-all"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex-shrink-0">
            <CalendarDays className="w-6 h-6" strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-body tracking-luxe-sm uppercase text-muted-foreground">Island Events Today</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {todayEvents.length > 0
                ? `${todayEvents.length} event${todayEvents.length !== 1 ? 's' : ''} happening`
                : 'No events today'}
            </p>
            {todayEvents[0] && (
              <p className="text-[11px] text-muted-foreground truncate">
                {format(new Date(todayEvents[0].start_time), 'h:mm a')} · {todayEvents[0].title}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}