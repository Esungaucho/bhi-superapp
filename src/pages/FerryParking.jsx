import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Car } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { Link } from 'react-router-dom';

const LOTS = [
  { name: 'Deep Point Lot A', rate: 20, availability: 'available' },
  { name: 'Deep Point Lot B', rate: 20, availability: 'limited' },
  { name: 'Overflow Lot', rate: 15, availability: 'available' },
];

const availColors = {
  available: 'text-emerald-600 bg-emerald-50',
  limited: 'text-amber-600 bg-amber-50',
  full: 'text-red-600 bg-red-50',
};

export default function FerryParking() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plate, setPlate] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const queryClient = useQueryClient();

  const lot = LOTS.find(l => l.name === selectedLot);
  const numDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1);
  }, [startDate, endDate]);
  const totalPrice = lot ? lot.rate * numDays : 0;

  const reserveMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ParkingReservation.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        lot_name: selectedLot,
        start_date: startDate,
        end_date: endDate,
        vehicle_plate: plate,
        daily_rate: lot.rate,
        total_price: totalPrice,
        status: 'confirmed',
      });
    },
    onSuccess: (data) => {
      setConfirmation(data);
      queryClient.invalidateQueries({ queryKey: ['myParkingReservations'] });
    },
  });

  if (confirmation) {
    return (
      <div className="px-4 py-8">
        <div className="bg-card rounded-2xl border p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Parking Reserved!</h2>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p className="font-semibold text-foreground">{confirmation.lot_name}</p>
            <p>{format(new Date(confirmation.start_date), 'MMM d')} — {format(new Date(confirmation.end_date), 'MMM d, yyyy')}</p>
            <p>Vehicle: {confirmation.vehicle_plate}</p>
            <p className="font-bold text-foreground text-lg">${confirmation.total_price}</p>
          </div>
          <Link to="/ferry/bookings" className="block text-accent font-semibold text-sm hover:underline pt-2">
            View My Bookings →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-xl font-bold">🅿️ Parking Reservation</h2>
        <p className="text-sm text-muted-foreground mt-1">Reserve your spot at Deep Point Marina</p>
      </div>

      {/* Lot selection */}
      <div className="space-y-2">
        {LOTS.map(l => (
          <button
            key={l.name}
            onClick={() => setSelectedLot(l.name)}
            className={`w-full bg-card rounded-xl border p-4 text-left transition-all ${
              selectedLot === l.name ? 'border-accent ring-2 ring-accent/20' : 'hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{l.name}</p>
                <p className="text-xs text-muted-foreground">${l.rate}/day</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${availColors[l.availability]}`}>
                {l.availability}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="mt-1 h-11 rounded-xl bg-card"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="mt-1 h-11 rounded-xl bg-card"
          />
        </div>
      </div>

      {/* Vehicle plate */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Vehicle License Plate</Label>
        <div className="relative mt-1">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ABC-1234"
            value={plate}
            onChange={e => setPlate(e.target.value.toUpperCase())}
            className="pl-10 h-11 rounded-xl bg-card uppercase"
          />
        </div>
      </div>

      {/* Price summary */}
      {selectedLot && numDays > 0 && (
        <div className="bg-card rounded-xl border p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">${lot.rate}/day × {numDays} day{numDays > 1 ? 's' : ''}</span>
            <span className="font-bold text-lg">${totalPrice}</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => reserveMutation.mutate()}
        disabled={!selectedLot || !startDate || !endDate || !plate || reserveMutation.isPending}
        className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
      >
        {reserveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reserve Parking'}
      </Button>
    </div>
  );
}