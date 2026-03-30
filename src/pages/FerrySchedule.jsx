import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isSameDay } from 'date-fns';
import DateScroller from '@/components/ferry/DateScroller';
import DirectionToggle from '@/components/ferry/DirectionToggle';
import ScheduleCard from '@/components/ferry/ScheduleCard';
import { Loader2 } from 'lucide-react';

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

  return (
    <div>
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
    </div>
  );
}