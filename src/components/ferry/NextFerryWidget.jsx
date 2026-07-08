import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isToday } from 'date-fns';
import { Anchor, ArrowRight, Loader2 } from 'lucide-react';

export default function NextFerryWidget() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 200),
    refetchInterval: 60000,
  });

  const now = new Date();
  const todaySchedules = schedules.filter(s => isToday(new Date(s.departure_time)));

  const nextToBHI = todaySchedules
    .filter(s => s.direction === 'to_island' && new Date(s.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  const nextToMainland = todaySchedules
    .filter(s => s.direction === 'to_mainland' && new Date(s.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  if (isLoading) {
    return (
      <div className="mx-4 h-20 rounded-2xl border border-ocean/15 bg-ocean/5 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-ocean animate-spin" />
      </div>
    );
  }

  if (!nextToBHI && !nextToMainland) return null;

  return (
    <Link to="/ferry-tram" className="block mx-4">
      <div className="bg-gradient-to-br from-ocean/8 to-transparent rounded-2xl border border-ocean/15 p-4 hover:border-ocean/25 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Anchor className="w-4 h-4 text-ocean" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold text-ocean uppercase tracking-luxe-sm">Next Ferry Departure</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DepartureCell label="To BHI" departure={nextToBHI} now={now} />
          <DepartureCell label="To Southport" departure={nextToMainland} now={now} />
        </div>
        <div className="flex items-center justify-end gap-1 mt-2.5 text-[10px] text-ocean font-medium">
          View Ferry Hub <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  );
}

function DepartureCell({ label, departure, now }) {
  if (!departure) {
    return (
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-muted-foreground mt-0.5">No more today</p>
      </div>
    );
  }
  const minsUntil = Math.round((new Date(departure.departure_time) - now) / 60000);
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-base font-heading font-semibold text-foreground mt-0.5">
        {new Date(departure.departure_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </p>
      <p className="text-[10px] text-ocean font-medium">
        {minsUntil <= 0 ? 'Boarding now' : minsUntil < 60 ? `in ${minsUntil} min` : `in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`}
      </p>
    </div>
  );
}