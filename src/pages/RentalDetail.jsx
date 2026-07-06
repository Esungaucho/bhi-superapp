import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays, format } from 'date-fns';
import { Loader2, Star, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORY_META = {
  golf_cart: { emoji: '🛺', label: 'Golf Cart' },
  bike: { emoji: '🚲', label: 'Bike' },
  scooter: { emoji: '🛵', label: 'Scooter' },
  gear: { emoji: '🎒', label: 'Gear' },
};

function generateRef() {
  return 'BHI-R-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default function RentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['rentalItems'],
    queryFn: () => base44.entities.RentalItem.list(),
  });

  const item = items.find(i => i.id === id);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(0, differenceInDays(new Date(endDate), new Date(startDate)));
  }, [startDate, endDate]);

  // Pricing: weekly rate if ≥7 days and weekly price exists
  const pricingTier = useMemo(() => {
    if (!item) return 'daily';
    if (days >= 7 && item.price_per_week) return 'weekly';
    return 'daily';
  }, [item, days]);

  const rateApplied = useMemo(() => {
    if (!item || days === 0) return 0;
    if (pricingTier === 'weekly') {
      const weeks = Math.floor(days / 7);
      const extraDays = days % 7;
      return (weeks * item.price_per_week + extraDays * item.price_per_day);
    }
    return days * item.price_per_day;
  }, [item, days, pricingTier]);

  const commission = Math.round(rateApplied * (item?.commission_rate || 0.15) * 100) / 100;

  const bookMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('book-rental', {
        rental_item_id: id,
        start_date: startDate,
        end_date: endDate,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConfirmed(data);
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
      queryClient.invalidateQueries({ queryKey: ['myRentalBookings'] });
    },
    onError: (error) => {
      setBookingError(error?.response?.data?.error || error?.message || 'Booking failed');
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!item) return (
    <div className="px-4 py-12 text-center text-muted-foreground">
      <p className="text-4xl mb-2">🛺</p>
      <p className="font-medium">Item not found</p>
      <Link to="/equipment" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">← Back to Rentals</Link>
    </div>
  );

  const meta = CATEGORY_META[item.category] || { emoji: '📦', label: item.category };
  const images = item.images?.length ? item.images : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'];

  if (confirmed) {
    return (
      <div className="px-4 py-8">
        <div className="bg-card rounded-2xl border p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Rental Confirmed!</h2>
          <div className="bg-secondary rounded-xl p-4 space-y-1 text-sm text-muted-foreground">
            <p className="font-bold text-foreground text-base">{item.name}</p>
            <p>{format(new Date(confirmed.start_date), 'MMM d')} — {format(new Date(confirmed.end_date), 'MMM d, yyyy')}</p>
            <p>{confirmed.days} day{confirmed.days > 1 ? 's' : ''} · {pricingTier} rate</p>
            <p className="font-bold text-foreground text-lg">${confirmed.total_price}</p>
            <p className="text-[11px] font-mono">{confirmed.booking_ref}</p>
          </div>
          <Link to="/equipment/my-rentals" className="block text-accent font-semibold text-sm hover:underline">View My Rentals →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Image */}
      <div className="relative h-52 bg-muted overflow-hidden">
        <img src={images[imgIdx]} alt={item.name} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
        <button onClick={() => navigate(-1)}
          className="absolute top-3 left-3 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {meta.emoji} {meta.label}
        </span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold">{item.name}</h2>
          {item.vendor_name && <p className="text-sm text-muted-foreground mt-0.5">by {item.vendor_name}</p>}
          <div className="flex items-center gap-3 mt-2">
            {item.rating && (
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
                <span className="text-muted-foreground font-normal">({item.review_count})</span>
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              item.available_units > 2 ? 'bg-emerald-50 text-emerald-700' :
              item.available_units > 0 ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-700'
            }`}>
              {item.available_units > 0 ? `${item.available_units} unit${item.available_units > 1 ? 's' : ''} available` : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Pricing tiers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Daily Rate</p>
            <p className="text-lg font-bold text-foreground">${item.price_per_day}</p>
            <p className="text-[10px] text-muted-foreground">per day</p>
          </div>
          {item.price_per_week && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
              <p className="text-xs text-accent font-medium">Weekly Rate 🏷️</p>
              <p className="text-lg font-bold text-accent">${item.price_per_week}</p>
              <p className="text-[10px] text-muted-foreground">per week (save {Math.round(100 - (item.price_per_week / (item.price_per_day * 7)) * 100)}%)</p>
            </div>
          )}
        </div>

        {item.description && <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>}

        {item.amenities?.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2">Includes</p>
            <div className="flex flex-wrap gap-2">
              {item.amenities.map(a => (
                <span key={a} className="text-[11px] bg-secondary px-2.5 py-1 rounded-full">✓ {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Booking form */}
        <div className="bg-card border rounded-2xl p-4 space-y-4">
          <p className="font-semibold text-sm">Select Dates</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
            </div>
          </div>

          {bookingError && (
            <p className="text-xs text-destructive text-center bg-destructive/5 rounded-xl p-2.5">{bookingError}</p>
          )}

          {days > 0 && (
            <div className="text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>{days} day{days > 1 ? 's' : ''} · {pricingTier} pricing</span>
                <span className={pricingTier === 'weekly' ? 'text-accent font-semibold' : ''}>${rateApplied}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total</span><span>${rateApplied}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Platform earns ${commission} (15% commission)</p>
            </div>
          )}

          <Button
            onClick={() => bookMutation.mutate()}
            disabled={days === 0 || item.available_units === 0 || bookMutation.isPending}
            className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            {bookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
              item.available_units === 0 ? 'Unavailable' :
              days > 0 ? `Reserve — $${rateApplied}` : 'Select Dates'}
          </Button>
        </div>
      </div>
    </div>
  );
}