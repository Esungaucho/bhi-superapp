import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays } from 'date-fns';
import { Loader2, Star, ChevronLeft, Users, BedDouble, Bath, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SOURCE_META = {
  vrbo: { label: 'VRBO', commission: 0.06 },
  airbnb: { label: 'Airbnb', commission: 0.08 },
  intracoastal: { label: 'Intracoastal Realty', commission: 0.09 },
};

function generateRef() {
  return 'BHI-L-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default function LodgingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [confirmed, setConfirmed] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['lodgings'],
    queryFn: () => base44.entities.Lodging.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['lodgingReviews', id],
    queryFn: () => base44.entities.LodgingReview.filter({ lodging_id: id }),
    enabled: !!id,
  });

  const listing = listings.find(l => l.id === id);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)));
  }, [checkIn, checkOut]);

  const meta = SOURCE_META[listing?.source] || { label: listing?.source, commission: 0.06 };
  const subtotal = nights * (listing?.price_per_night || 0);
  const cleaningFee = listing?.cleaning_fee || 0;
  const commission = Math.round((subtotal + cleaningFee) * meta.commission * 100) / 100;
  const total = subtotal + cleaningFee;

  const bookMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.LodgingBooking.create({
        lodging_id: id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        nights,
        price_per_night: listing.price_per_night,
        cleaning_fee: cleaningFee,
        subtotal,
        commission_amount: commission,
        total_price: total,
        source: listing.source,
        status: 'confirmed',
        booking_ref: generateRef(),
      });
    },
    onSuccess: (data) => {
      setConfirmed(data);
      queryClient.invalidateQueries({ queryKey: ['myLodgingBookings'] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!listing) return (
    <div className="px-4 py-12 text-center text-muted-foreground">
      <p className="text-4xl mb-2">🏡</p>
      <p className="font-medium">Listing not found</p>
      <Link to="/lodging" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">← Back to Lodging</Link>
    </div>
  );

  const images = listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80'];

  if (confirmed) {
    return (
      <div className="px-4 py-8">
        <div className="bg-card rounded-2xl border p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Stay Requested!</h2>
          <div className="bg-secondary rounded-xl p-4 space-y-1 text-sm text-muted-foreground">
            <p className="font-bold text-foreground text-base">{listing.title}</p>
            <p>{format(new Date(confirmed.check_in), 'MMM d')} — {format(new Date(confirmed.check_out), 'MMM d, yyyy')}</p>
            <p>{confirmed.guests} guest{confirmed.guests > 1 ? 's' : ''} · {confirmed.nights} night{confirmed.nights > 1 ? 's' : ''}</p>
            <p className="font-bold text-foreground text-lg">${confirmed.total_price}</p>
            <p className="text-[11px] font-mono">{confirmed.booking_ref}</p>
          </div>
          {listing.external_url && (
            <a href={listing.external_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent font-semibold text-sm hover:underline">
              Complete on {meta.label} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link to="/lodging/my-stays" className="block text-sm text-muted-foreground hover:underline mt-1">View My Stays →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Image gallery */}
      <div className="relative h-56 bg-muted overflow-hidden">
        <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
        <button onClick={() => navigate(-1)}
          className="absolute top-3 left-3 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full ${
          listing.source === 'vrbo' ? 'bg-blue-600 text-white' :
          listing.source === 'airbnb' ? 'bg-rose-500 text-white' :
          'bg-emerald-600 text-white'
        }`}>{meta.label}</span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Title + rating */}
        <div>
          <h2 className="text-xl font-bold text-foreground">{listing.title}</h2>
          {listing.neighborhood && <p className="text-sm text-muted-foreground mt-0.5">📍 {listing.neighborhood}</p>}
          <div className="flex items-center gap-3 mt-2">
            {listing.rating && (
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {listing.rating.toFixed(1)}
                <span className="text-muted-foreground font-normal">({listing.review_count} reviews)</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <BedDouble className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-sm font-bold">{listing.bedrooms}</p>
            <p className="text-[10px] text-muted-foreground">Bedrooms</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Bath className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-sm font-bold">{listing.bathrooms}</p>
            <p className="text-[10px] text-muted-foreground">Bathrooms</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Users className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-sm font-bold">{listing.max_guests}</p>
            <p className="text-[10px] text-muted-foreground">Max Guests</p>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
        )}

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(a => (
                <span key={a} className="text-[11px] bg-secondary px-2.5 py-1 rounded-full text-foreground">✓ {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Booking form */}
        <div className="bg-card border rounded-2xl p-4 space-y-4">
          <div className="flex justify-between items-baseline">
            <p className="text-xl font-bold">${listing.price_per_night}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
            {listing.external_url && (
              <a href={listing.external_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-accent flex items-center gap-1 hover:underline">
                View on {meta.label} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Check-in</Label>
              <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Check-out</Label>
              <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Guests</Label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">−</button>
              <span className="font-bold w-4 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(listing.max_guests, guests + 1))}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">+</button>
              <span className="text-xs text-muted-foreground ml-1">max {listing.max_guests}</span>
            </div>
          </div>

          {nights > 0 && (
            <div className="text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between"><span className="text-muted-foreground">${listing.price_per_night} × {nights} nights</span><span>${subtotal}</span></div>
              {cleaningFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Cleaning fee</span><span>${cleaningFee}</span></div>}
              <div className="flex justify-between font-bold pt-1 border-t"><span>Total</span><span>${total}</span></div>
              <p className="text-[10px] text-muted-foreground">Platform earns ${commission} ({(meta.commission * 100).toFixed(0)}% of booking)</p>
            </div>
          )}

          <Button
            onClick={() => bookMutation.mutate()}
            disabled={nights === 0 || bookMutation.isPending}
            className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            {bookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Reserve — $${total || listing.price_per_night}`}
          </Button>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3">Reviews ({reviews.length})</p>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-secondary rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold">{r.user_name}</p>
                    <span className="flex items-center gap-0.5 text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}