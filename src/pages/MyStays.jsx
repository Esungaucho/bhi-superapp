import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SOURCE_COLORS = {
  vrbo: 'text-blue-700 bg-blue-50',
  airbnb: 'text-rose-700 bg-rose-50',
  intracoastal: 'text-emerald-700 bg-emerald-50',
};

const STATUS_COLORS = {
  confirmed: 'text-emerald-600 bg-emerald-50',
  pending: 'text-amber-600 bg-amber-50',
  canceled: 'text-red-600 bg-red-50',
  completed: 'text-muted-foreground bg-muted',
};

export default function MyStays() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myLodgingBookings', user?.email],
    queryFn: () => base44.entities.LodgingBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: lodgings = [] } = useQuery({
    queryKey: ['lodgings'],
    queryFn: () => base44.entities.Lodging.list(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.LodgingBooking.update(id, { status: 'canceled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLodgingBookings'] }),
  });

  const now = new Date();
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.check_out) >= now);
  const past = bookings.filter(b => b.status !== 'confirmed' || new Date(b.check_out) < now);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div>
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-bold">My Stays</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your lodging reservations on BHI</p>
      </div>

      <div className="px-4 pb-6 space-y-6">
        {bookings.length === 0 && (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🏡</p>
            <p className="font-medium">No stays yet</p>
            <Link to="/lodging" className="text-accent font-semibold text-sm mt-3 inline-block hover:underline">Browse Lodging →</Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section title="Upcoming">
            {upcoming.map(b => (
              <StayCard key={b.id} booking={b} lodgings={lodgings}
                onCancel={() => cancelMutation.mutate(b.id)} canceling={cancelMutation.isPending} />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Past">
            {past.map(b => (
              <StayCard key={b.id} booking={b} lodgings={lodgings} isPast />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StayCard({ booking, lodgings, onCancel, canceling, isPast }) {
  const lodging = lodgings.find(l => l.id === booking.lodging_id);
  const image = lodging?.images?.[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=70';

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="flex gap-3 p-3">
        <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
              {lodging?.title || 'Lodging'}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {format(new Date(booking.check_in), 'MMM d')} – {format(new Date(booking.check_out), 'MMM d, yyyy')}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${SOURCE_COLORS[booking.source] || 'bg-secondary text-foreground'}`}>
              {booking.source}
            </span>
            <span className="text-xs font-bold text-foreground">${booking.total_price}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{booking.booking_ref}</p>
        </div>
      </div>
      {!isPast && booking.status === 'confirmed' && (
        <div className="border-t px-3 py-2 flex justify-between items-center">
          <Link to={`/lodging/${booking.lodging_id}`} className="text-xs text-accent font-semibold hover:underline">View Listing</Link>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={canceling}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}