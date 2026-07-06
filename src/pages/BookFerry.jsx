import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRICE_PER_PERSON = 23;

function generateRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'BHI-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * 26)];
  return code;
}

export default function BookFerry() {
  const urlParams = new URLSearchParams(window.location.search);
  const scheduleId = urlParams.get('id');
  const [passengers, setPassengers] = useState(1);
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const queryClient = useQueryClient();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['ferrySchedule', scheduleId],
    queryFn: async () => {
      const all = await base44.entities.FerrySchedule.list();
      return all.find(s => s.id === scheduleId);
    },
    enabled: !!scheduleId,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('book-ferry', {
        schedule_id: scheduleId,
        passengers,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setBooking(data);
      queryClient.invalidateQueries({ queryKey: ['ferrySchedules'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (error) => {
      setBookingError(error?.response?.data?.error || error?.message || 'Booking failed');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">Schedule not found</p>
      </div>
    );
  }

  const depTime = new Date(schedule.departure_time);
  const total = passengers * PRICE_PER_PERSON;

  // Confirmation view
  if (booking) {
    return (
      <div className="px-4 py-8">
        <div className="bg-card rounded-2xl border p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <div className="bg-secondary rounded-xl p-4 space-y-1">
            <p className="text-lg font-bold tracking-wider">{booking.booking_ref}</p>
            <p className="text-sm text-muted-foreground">Booking Reference</p>
          </div>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>{format(depTime, 'EEEE, MMMM d, yyyy')}</p>
            <p className="font-semibold text-foreground">{format(depTime, 'h:mm a')} — {schedule.direction === 'to_island' ? '🌴 To Island' : '🏙️ To Mainland'}</p>
            <p>{passengers} passenger{passengers > 1 ? 's' : ''} • ${total}</p>
          </div>
          <p className="text-xs text-muted-foreground">Show this at the terminal</p>
          <div className="bg-muted rounded-xl h-40 flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground/40">QR</span>
          </div>
          <Link to="/ferry/bookings" className="block text-accent font-semibold text-sm hover:underline pt-2">
            View My Bookings →
          </Link>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div className="px-4 py-5 space-y-5">
      {/* Departure info */}
      <div className="bg-card rounded-xl border p-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {schedule.direction === 'to_island' ? '🌴 To Island' : '🏙️ To Mainland'}
        </p>
        <p className="text-2xl font-bold mt-1">{format(depTime, 'h:mm a')}</p>
        <p className="text-sm text-muted-foreground">{format(depTime, 'EEEE, MMMM d, yyyy')}</p>
        <p className="text-xs mt-2">
          Vessel: {schedule.vessel_name} • Status:{' '}
          <span className={schedule.status === 'on_time' ? 'text-emerald-600' : 'text-amber-600'}>
            {schedule.status === 'on_time' ? 'On Time' : schedule.status}
          </span>
        </p>
      </div>

      {/* Passenger picker */}
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm font-semibold mb-3">Passengers</p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-3xl font-bold w-12 text-center">{passengers}</span>
          <button
            onClick={() => setPassengers(Math.min(10, passengers + 1))}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">${PRICE_PER_PERSON} per person × {passengers}</span>
          <span className="font-bold text-lg">${total}</span>
        </div>
      </div>

      {bookingError && (
        <p className="text-xs text-destructive text-center bg-destructive/5 rounded-xl p-2.5">{bookingError}</p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        You will complete your purchase on the ferry operator's secure site.
      </p>

      <Button
        onClick={() => bookMutation.mutate()}
        disabled={bookMutation.isPending}
        className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
      >
        {bookMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to Booking'}
      </Button>
    </div>
  );
}