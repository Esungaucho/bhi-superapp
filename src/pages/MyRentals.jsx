import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  confirmed: 'text-emerald-600 bg-emerald-50',
  active: 'text-blue-600 bg-blue-50',
  completed: 'text-muted-foreground bg-muted',
  canceled: 'text-red-600 bg-red-50',
};

const CATEGORY_EMOJI = { golf_cart: '🛺', bike: '🚲', scooter: '🛵', gear: '🎒' };

export default function MyRentals() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myRentalBookings', user?.email],
    queryFn: () => base44.entities.RentalBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const cancelMutation = useMutation({
    mutationFn: async (booking) => {
      await base44.entities.RentalBooking.update(booking.id, { status: 'canceled' });
      // Restore available unit
      const items = await base44.entities.RentalItem.list();
      const item = items.find(i => i.id === booking.rental_item_id);
      if (item) {
        await base44.entities.RentalItem.update(item.id, {
          available_units: (item.available_units || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRentalBookings'] });
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });

  const now = new Date();
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.end_date) >= now);
  const past = bookings.filter(b => b.status !== 'confirmed' || new Date(b.end_date) < now);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div>
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-bold">My Rentals</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your equipment rental bookings</p>
      </div>

      <div className="px-4 pb-6 space-y-6">
        {bookings.length === 0 && (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🛺</p>
            <p className="font-medium">No rentals yet</p>
            <Link to="/rentals" className="text-accent font-semibold text-sm mt-3 inline-block hover:underline">Browse Rentals →</Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section title="Upcoming">
            {upcoming.map(b => (
              <RentalBookingCard key={b.id} booking={b}
                onCancel={() => cancelMutation.mutate(b)}
                canceling={cancelMutation.isPending} />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Past">
            {past.map(b => <RentalBookingCard key={b.id} booking={b} isPast />)}
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

function RentalBookingCard({ booking, onCancel, canceling, isPast }) {
  const emoji = CATEGORY_EMOJI[booking.item_category] || '📦';

  return (
    <div className="bg-card rounded-xl border p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold">{emoji} {booking.item_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(booking.start_date), 'MMM d')} — {format(new Date(booking.end_date), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">{booking.days} day{booking.days > 1 ? 's' : ''} · {booking.pricing_tier} rate</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">{booking.booking_ref}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[booking.status]}`}>
            {booking.status}
          </span>
          <span className="text-sm font-bold">${booking.total_price}</span>
        </div>
      </div>

      {!isPast && booking.status === 'confirmed' && (
        <div className="flex gap-2 pt-1">
          <Link to={`/rentals/${booking.rental_item_id}`}
            className="text-xs text-accent font-semibold hover:underline">View Item</Link>
          <span className="text-muted-foreground">·</span>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={canceling}
            className="text-xs text-red-600 hover:bg-red-50 h-auto p-0">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}