import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

function getCapacityColor(pct) {
  if (pct < 50) return 'bg-emerald-500';
  if (pct < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

function getCapacityBg(pct) {
  if (pct < 50) return 'bg-emerald-100';
  if (pct < 80) return 'bg-amber-100';
  return 'bg-red-100';
}

function StatusBadge({ status, delayMinutes }) {
  if (status === 'on_time') {
    return <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">On Time</span>;
  }
  if (status === 'delayed') {
    return <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Delayed +{delayMinutes}m</span>;
  }
  if (status === 'canceled') {
    return <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Canceled</span>;
  }
  if (status === 'boarding') {
    return <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Boarding</span>;
  }
  return null;
}

export default function ScheduleCard({ schedule, isUserBooking }) {
  const capPct = (schedule.current_passengers / schedule.capacity) * 100;
  const depTime = new Date(schedule.departure_time);
  const arrTime = new Date(schedule.arrival_time);

  return (
    <div className={`bg-card rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
      isUserBooking ? 'border-l-4 border-l-accent border-t border-r border-b' : 'border'
    }`}>
      {isUserBooking && (
        <p className="text-[11px] font-semibold text-accent mb-2">⭐ Your Booking</p>
      )}
      <div className="flex items-center justify-between gap-3">
        {/* Left — departure time */}
        <div className="min-w-[70px]">
          <p className="text-xl font-bold text-foreground">{format(depTime, 'h:mm a')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">→ {format(arrTime, 'h:mm a')}</p>
        </div>

        {/* Middle — capacity bar */}
        <div className="flex-1 px-2">
          <div className={`h-1.5 rounded-full ${getCapacityBg(capPct)} overflow-hidden`}>
            <div
              className={`h-full rounded-full transition-all ${getCapacityColor(capPct)}`}
              style={{ width: `${Math.min(capPct, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {schedule.current_passengers}/{schedule.capacity} passengers
          </p>
        </div>

        {/* Right — status + book */}
        <div className="flex flex-col items-end gap-2 min-w-[80px]">
          <StatusBadge status={schedule.status} delayMinutes={schedule.delay_minutes} />
          {schedule.status !== 'canceled' && (
            <Link
              to={`/ferry/book?id=${schedule.id}`}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Book →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}