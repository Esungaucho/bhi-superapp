import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TABS = [
  { id: 'ferry', label: '⛴️ Ferry' },
  { id: 'lodging', label: '🏡 Stays' },
  { id: 'rentals', label: '🛺 Rentals' },
  { id: 'parking', label: '🅿️ Parking' },
];

const STATUS_COLORS = {
  confirmed: 'text-emerald-600 bg-emerald-50',
  active: 'text-blue-600 bg-blue-50',
  completed: 'text-muted-foreground bg-muted',
  canceled: 'text-red-600 bg-red-50',
  pending: 'text-amber-600 bg-amber-50',
};

export default function AllBookings() {
  const [tab, setTab] = useState('ferry');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: ferryBookings = [], isLoading: lf } = useQuery({
    queryKey: ['myFerryBookings', user?.email],
    queryFn: () => base44.entities.FerryBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: lodgingBookings = [], isLoading: ll } = useQuery({
    queryKey: ['myLodgingBookings', user?.email],
    queryFn: () => base44.entities.LodgingBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: rentalBookings = [], isLoading: lr } = useQuery({
    queryKey: ['myRentalBookings', user?.email],
    queryFn: () => base44.entities.RentalBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: parkingReservations = [], isLoading: lp } = useQuery({
    queryKey: ['myParkingReservations', user?.email],
    queryFn: () => base44.entities.ParkingReservation.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const isLoading = lf || ll || lr || lp;

  const counts = {
    ferry: ferryBookings.length,
    lodging: lodgingBookings.length,
    rentals: rentalBookings.length,
    parking: parkingReservations.length,
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-bold">All Bookings</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              tab === t.id ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-muted'}`}>
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {tab === 'ferry' && (
            ferryBookings.length === 0
              ? <Empty emoji="⛴️" label="No ferry bookings" link="/ferry" cta="Book a Ferry" />
              : ferryBookings
                  .sort((a, b) => new Date(b.departure_time) - new Date(a.departure_time))
                  .map(b => (
                    <BookingCard key={b.id}
                      emoji="⛴️"
                      title={`Ferry — ${b.direction === 'to_island' ? 'To Island' : 'To Mainland'}`}
                      sub={`${format(new Date(b.departure_time), 'EEE MMM d')} at ${format(new Date(b.departure_time), 'h:mm a')}`}
                      ref_no={b.booking_ref}
                      amount={b.total_price}
                      status={b.status}
                    />
                  ))
          )}
          {tab === 'lodging' && (
            lodgingBookings.length === 0
              ? <Empty emoji="🏡" label="No lodging bookings" link="/lodging" cta="Find a Stay" />
              : lodgingBookings
                  .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
                  .map(b => (
                    <BookingCard key={b.id}
                      emoji="🏡"
                      title="Lodging Stay"
                      sub={`${format(new Date(b.check_in), 'MMM d')} — ${format(new Date(b.check_out), 'MMM d, yyyy')}`}
                      ref_no={b.booking_ref}
                      amount={b.total_price}
                      status={b.status}
                    />
                  ))
          )}
          {tab === 'rentals' && (
            rentalBookings.length === 0
              ? <Empty emoji="🛺" label="No rental bookings" link="/equipment" cta="Browse Rentals" />
              : rentalBookings
                  .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                  .map(b => (
                    <BookingCard key={b.id}
                      emoji="🛺"
                      title={b.item_name || 'Rental'}
                      sub={`${format(new Date(b.start_date), 'MMM d')} — ${format(new Date(b.end_date), 'MMM d')} · ${b.days}d`}
                      ref_no={b.booking_ref}
                      amount={b.total_price}
                      status={b.status}
                    />
                  ))
          )}
          {tab === 'parking' && (
            parkingReservations.length === 0
              ? <Empty emoji="🅿️" label="No parking reservations" link="/ferry/parking" cta="Reserve Parking" />
              : parkingReservations
                  .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                  .map(b => (
                    <BookingCard key={b.id}
                      emoji="🅿️"
                      title={b.lot_name}
                      sub={`${format(new Date(b.start_date), 'MMM d')} — ${format(new Date(b.end_date), 'MMM d, yyyy')}`}
                      ref_no={b.vehicle_plate}
                      amount={b.total_price}
                      status={b.status}
                    />
                  ))
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ emoji, title, sub, ref_no, amount, status }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex justify-between items-start">
      <div className="flex gap-3 items-start">
        <span className="text-xl mt-0.5">{emoji}</span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          {ref_no && <p className="text-[10px] font-mono text-muted-foreground mt-1">{ref_no}</p>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status] || STATUS_COLORS.confirmed}`}>
          {status}
        </span>
        {amount != null && <span className="text-sm font-bold">${amount}</span>}
      </div>
    </div>
  );
}

function Empty({ emoji, label, link, cta }) {
  return (
    <div className="text-center py-14 text-muted-foreground">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="font-medium">{label}</p>
      <Link to={link} className="text-accent font-semibold text-sm mt-3 inline-block hover:underline">{cta} →</Link>
    </div>
  );
}