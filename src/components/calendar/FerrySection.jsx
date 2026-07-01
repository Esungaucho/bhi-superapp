import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isToday, format } from 'date-fns';
import { Ship, AlertTriangle, Clock } from 'lucide-react';

export default function FerrySection() {
  const { data: schedules = [] } = useQuery({
    queryKey: ['calendarFerry'],
    queryFn: () => base44.entities.FerrySchedule.filter({}, 'departure_time', 20),
  });

  const todaySchedules = schedules.filter(s => isToday(new Date(s.departure_time)));
  if (todaySchedules.length === 0) return null;

  const hasAlert = todaySchedules.some(s => s.status === 'delayed' || s.status === 'canceled');

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ship className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Today's Ferry</h3>
        {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 ml-auto" />}
      </div>
      <div className="space-y-2">
        {todaySchedules.slice(0, 6).map(s => (
          <div key={s.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-foreground">{format(new Date(s.departure_time), 'h:mm a')}</span>
              <span className="text-muted-foreground">{s.direction === 'to_island' ? '→ Island' : '→ Mainland'}</span>
            </div>
            <span className={`font-medium ${s.status === 'on_time' ? 'text-emerald-600' : s.status === 'canceled' ? 'text-destructive' : 'text-amber-600'}`}>
              {s.status === 'on_time' ? 'On Time' : s.status === 'delayed' ? `Delayed ${s.delay_minutes || 0}m` : s.status === 'canceled' ? 'Canceled' : 'Boarding'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}