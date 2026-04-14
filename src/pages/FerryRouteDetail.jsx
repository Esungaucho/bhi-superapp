import React, { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isSameDay } from 'date-fns';
import { Loader2, Clock, Users, DollarSign } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ScheduleCard from '@/components/ferry/ScheduleCard';

export default function FerryRouteDetail() {
  const { routeId } = useParams();

  const { data: routes = [], isLoading: loadingRoute } = useQuery({
    queryKey: ['ferryRoutes'],
    queryFn: () => base44.entities.FerryRoute.list(),
  });

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
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

  const route = routes.find(r => r.id === routeId);

  // Track ad impression once when route loads with sponsor
  React.useEffect(() => {
    if (route?.is_sponsored && route?.id) {
      base44.entities.FerryRoute.update(route.id, {
        ad_impressions: (route.ad_impressions || 0) + 1,
      }).catch(() => {});
    }
  }, [route?.id]);

  const today = new Date();

  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter(s => new Date(s.departure_time) >= today && s.status !== 'canceled')
      .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))
      .slice(0, 10);
  }, [schedules]);

  const bookedScheduleIds = useMemo(
    () => new Set(bookings.map(b => b.schedule_id)),
    [bookings]
  );

  const isLoading = loadingRoute || loadingSchedules;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="px-4 py-12 text-center text-muted-foreground">
        <p className="text-4xl mb-2">⛴️</p>
        <p className="font-medium">Route not found</p>
        <Link to="/ferry" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">← Back to Schedule</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-44 bg-primary overflow-hidden">
        {route.image_url ? (
          <img src={route.image_url} alt={route.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">⛴️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-4 left-4 text-primary-foreground">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Ferry Route</p>
          <h2 className="text-xl font-bold">{route.name}</h2>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Sponsored banner */}
        {route.is_sponsored && route.sponsor_name && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
            {route.sponsor_logo_url && (
              <img src={route.sponsor_logo_url} alt={route.sponsor_name} className="w-8 h-8 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Sponsored</p>
              <p className="text-xs text-amber-800">{route.sponsor_cta || `Brought to you by ${route.sponsor_name}`}</p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Clock className="w-4 h-4" />} label="Duration" value={`${route.duration_minutes} min`} />
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Per Person" value={`$${route.price_per_person}`} />
          <StatCard icon={<Users className="w-4 h-4" />} label="Capacity" value="150 seats" />
        </div>

        {/* Description */}
        {route.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{route.description}</p>
        )}

        {/* Upcoming departures */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Upcoming Departures</h3>
          {upcomingSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No upcoming departures</p>
          ) : (
            <div className="space-y-3">
              {upcomingSchedules.map(s => (
                <ScheduleCard
                  key={s.id}
                  schedule={s}
                  isUserBooking={bookedScheduleIds.has(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-card rounded-xl border p-3 text-center">
      <div className="flex justify-center text-accent mb-1">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}