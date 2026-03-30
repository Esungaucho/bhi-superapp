import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ferryBookings = [], isLoading: loadingFerry } = useQuery({
    queryKey: ['myFerryBookings', user?.email],
    queryFn: () => base44.entities.FerryBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: parkingReservations = [], isLoading: loadingParking } = useQuery({
    queryKey: ['myParkingReservations', user?.email],
    queryFn: () => base44.entities.ParkingReservation.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const cancelFerryMutation = useMutation({
    mutationFn: async (booking) => {
      await base44.entities.FerryBooking.update(booking.id, { status: 'canceled' });
      // Decrement passengers
      const schedules = await base44.entities.FerrySchedule.list();
      const schedule = schedules.find(s => s.id === booking.schedule_id);
      if (schedule) {
        await base44.entities.FerrySchedule.update(schedule.id, {
          current_passengers: Math.max(0, (schedule.current_passengers || 0) - booking.passengers),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFerryBookings'] });
      queryClient.invalidateQueries({ queryKey: ['ferrySchedules'] });
    },
  });

  const cancelParkingMutation = useMutation({
    mutationFn: (reservation) =>
      base44.entities.ParkingReservation.update(reservation.id, { status: 'canceled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParkingReservations'] });
    },
  });

  const now = new Date();

  const upcomingFerry = ferryBookings.filter(b => b.status === 'confirmed' && new Date(b.departure_time) >= now);
  const pastFerry = ferryBookings.filter(b => b.status !== 'confirmed' || new Date(b.departure_time) < now);
  const upcomingParking = parkingReservations.filter(p => p.status === 'confirmed' && new Date(p.end_date) >= now);
  const pastParking = parkingReservations.filter(p => p.status !== 'confirmed' || new Date(p.end_date) < now);

  const isLoading = loadingFerry || loadingParking;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const noBookings = upcomingFerry.length === 0 && upcomingParking.length === 0 && pastFerry.length === 0 && pastParking.length === 0;

  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-4">My Bookings</h2>

      {noBookings && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🎫</p>
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm mt-1">Book a ferry or parking to get started</p>
          <Link to="/ferry" className="text-accent font-semibold text-sm mt-3 inline-block hover:underline">
            View Schedule →
          </Link>
        </div>
      )}

      {/* Upcoming */}
      {(upcomingFerry.length > 0 || upcomingParking.length > 0) && (
        <Section title="Upcoming">
          {upcomingFerry.map(b => (
            <FerryBookingCard key={b.id} booking={b} onCancel={() => cancelFerryMutation.mutate(b)} canceling={cancelFerryMutation.isPending} />
          ))}
          {upcomingParking.map(p => (
            <ParkingCard key={p.id} reservation={p} onCancel={() => cancelParkingMutation.mutate(p)} canceling={cancelParkingMutation.isPending} />
          ))}
        </Section>
      )}

      {/* Past */}
      {(pastFerry.length > 0 || pastParking.length > 0) && (
        <Section title="Past">
          {pastFerry.map(b => (
            <FerryBookingCard key={b.id} booking={b} isPast />
          ))}
          {pastParking.map(p => (
            <ParkingCard key={p.id} reservation={p} isPast />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FerryBookingCard({ booking, onCancel, canceling, isPast }) {
  const [showQR, setShowQR] = useState(false);
  const depTime = new Date(booking.departure_time);

  const statusColors = {
    confirmed: 'text-emerald-600 bg-emerald-50',
    used: 'text-blue-600 bg-blue-50',
    canceled: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-card rounded-xl border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold">⛴️ Ferry — {booking.direction === 'to_island' ? 'To Island' : 'To Mainland'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{format(depTime, 'EEE, MMM d')} at {format(depTime, 'h:mm a')}</p>
          <p className="text-xs text-muted-foreground">{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''} • ${booking.total_price}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">{booking.booking_ref}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      {booking.status === 'confirmed' && !isPast && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="text-xs rounded-lg"
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={canceling}
            className="text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50"
          >
            Cancel
          </Button>
        </div>
      )}

      {showQR && (
        <div className="bg-muted rounded-xl h-32 flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground/40">QR</span>
        </div>
      )}
    </div>
  );
}

function ParkingCard({ reservation, onCancel, canceling, isPast }) {
  const statusColors = {
    confirmed: 'text-emerald-600 bg-emerald-50',
    active: 'text-blue-600 bg-blue-50',
    completed: 'text-muted-foreground bg-muted',
    canceled: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-card rounded-xl border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold">🅿️ {reservation.lot_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(reservation.start_date), 'MMM d')} — {format(new Date(reservation.end_date), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">Plate: {reservation.vehicle_plate} • ${reservation.total_price}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[reservation.status]}`}>
          {reservation.status}
        </span>
      </div>

      {reservation.status === 'confirmed' && !isPast && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={canceling}
          className="text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}