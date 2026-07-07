import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isSameDay } from 'date-fns';
import DateScroller from '@/components/ferry/DateScroller';
import DirectionToggle from '@/components/ferry/DirectionToggle';
import ScheduleCard from '@/components/ferry/ScheduleCard';
import ConditionsBanner from '@/components/weather/ConditionsBanner';
import { Loader2, Map, Brain, Ticket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FerrySchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState('to_island');

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 500),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.FerryBooking.filter({ user_email: user.email, status: 'confirmed' });
    },
  });

  const bookedScheduleIds = useMemo(
    () => new Set(bookings.map(b => b.schedule_id)),
    [bookings]
  );

  const filtered = useMemo(() => {
    return schedules
      .filter(s => {
        const dep = new Date(s.departure_time);
        return isSameDay(dep, selectedDate) && s.direction === direction;
      })
      .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
  }, [schedules, selectedDate, direction]);

  const { data: conditionsAll = [] } = useQuery({
    queryKey: ['islandConditions'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });
  const conditions = conditionsAll[0];

  return (
    <div>
      <ConditionsBanner conditions={conditions} />
      <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <DirectionToggle direction={direction} onDirectionChange={setDirection} />

      <div className="px-4 space-y-3 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-2">⛴️</p>
            <p className="font-medium">No ferries scheduled</p>
            <p className="text-sm">Try a different date or direction</p>
          </div>
        ) : (
          <>
            {filtered.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                isUserBooking={bookedScheduleIds.has(schedule.id)}
              />
            ))}
            <p className="text-[11px] text-muted-foreground text-center pt-2 pb-4">
              Schedules are approximate. Real-time updates every 60 seconds.
            </p>
          </>
        )}
      </div>

      {/* Quick Access Tools */}
      <div className="px-4 pb-8">
        <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3 mt-2">Ferry Tools</p>
        <div className="grid grid-cols-1 gap-3">
          <QuickLink
            to="/ferry/eta"
            icon={<Brain className="w-5 h-5 text-primary" strokeWidth={1.5} />}
            title="AI Time Tracker"
            description="Get AI-powered arrival estimates and real-time travel predictions"
          />
          <QuickLink
            to="/ferry/map"
            icon={<Map className="w-5 h-5 text-primary" strokeWidth={1.5} />}
            title="Live Ferry Map"
            description="Track ferries in real-time as they cross the Cape Fear River"
          />
          <QuickLink
            to="/ferry/bookings"
            icon={<Ticket className="w-5 h-5 text-primary" strokeWidth={1.5} />}
            title="My Ferry Bookings"
            description="View and manage your upcoming ferry reservations"
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 shadow-luxe-sm hover:bg-sand/30 transition-colors"
    >
      <span className="w-11 h-11 rounded-full bg-sand/40 flex items-center justify-center border border-border/30 flex-shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
    </Link>
  );
}