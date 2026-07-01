import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, CreditCard, MessageSquare, Star, MapPin, Clock, Baby,
  Phone, Shield, AlertTriangle, CheckCircle2, Lock, Users, FileText, DollarSign
} from 'lucide-react';
import BookingTimeline from '@/components/babysitting/BookingTimeline';
import SafetyCheckinPanel from '@/components/babysitting/SafetyCheckinPanel';
import ReviewCard from '@/components/babysitting/ReviewCard';
import { BOOKING_STATUS_META, CANCELLATION_POLICY } from '@/lib/babysittingConstants';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: booking, isLoading } = useQuery({
    queryKey: ['babysitterBooking', id],
    queryFn: () => base44.entities.BabysitterBooking.get(id),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['bookingReviews', id],
    queryFn: () => base44.entities.BabysitterReview.filter({ booking_id: id }),
    enabled: !!id,
  });

  const { data: checkins = [] } = useQuery({
    queryKey: ['safetyCheckins', id],
    queryFn: () => base44.entities.BabysitterSafetyCheckin.filter({ booking_id: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!booking) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Booking not found.</p>
        <Link to="/babysitting" className="text-sm text-primary mt-2 inline-block">Back to Babysitting</Link>
      </div>
    );
  }

  const statusMeta = BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending;
  const isParent = booking.parent_email === user?.email;
  const isSitter = booking.sitter_owner_email === user?.email;

  const handlePayment = async () => {
    setPaying(true);
    try {
      const response = await base44.functions.invoke('create-checkout', {
        items: [
          { name: `Babysitting — ${booking.date} ${booking.start_time}–${booking.end_time}`, quantity: 1, price: booking.estimated_total?.toFixed(2) },
          { name: 'Booking Fee', quantity: 1, price: booking.booking_fee?.toFixed(2) },
          ...(booking.tip > 0 ? [{ name: 'Tip', quantity: 1, price: booking.tip?.toFixed(2) }] : []),
        ],
        customer_info: { email: user.email },
        reference_type: 'babysitter_booking',
        reference_id: booking.id,
      });

      const data = response.data || response;
      if (data.redirect_url) {
        await base44.entities.BabysitterBooking.update(booking.id, { payment_id: data.checkout_session_id });
        window.location.href = data.redirect_url;
      } else {
        toast({ title: 'Payment error', description: data.error || 'Could not start checkout', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Payment failed', description: err.message, variant: 'destructive' });
    }
    setPaying(false);
  };

  const handleSitterAction = async (action) => {
    try {
      const updates = {};
      if (action === 'accept') {
        updates.status = 'accepted';
        updates.sitter_accepted_at = new Date().toISOString();
        updates.info_shared = true;
      } else if (action === 'decline') {
        updates.status = 'declined';
      } else if (action === 'start') {
        updates.status = 'in_progress';
      } else if (action === 'complete') {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }
      await base44.entities.BabysitterBooking.update(booking.id, updates);
      queryClient.invalidateQueries(['babysitterBooking', id]);
      toast({ title: 'Booking updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const canReview = booking.status === 'completed' && !reviews.some((r) => r.reviewer_email === user?.email);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-base text-foreground">Booking Details</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Status banner */}
        <div className={`rounded-xl p-3 ${statusMeta.color}`}>
          <p className="text-sm font-medium">{statusMeta.label}</p>
        </div>

        {/* Sitter info */}
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {booking.sitter_photo_url ? (
              <img src={booking.sitter_photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
                <Baby className="w-5 h-5 text-navy" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{booking.sitter_name}</p>
              <p className="text-xs text-muted-foreground">{booking.date} · {booking.start_time}–{booking.end_time}</p>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground">Details</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} /><span className="text-muted-foreground">Children:</span> <span className="font-medium text-foreground">{booking.num_children}</span></div>
            {booking.children_ages && <div className="text-muted-foreground">Ages: <span className="font-medium text-foreground">{booking.children_ages}</span></div>}
            <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} /><span className="text-muted-foreground">{booking.island_address}</span></div>
            {booking.parent_phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} /><span className="text-muted-foreground">{booking.parent_phone}</span></div>}
            {booking.emergency_contact_name && <div className="text-muted-foreground">Emergency: <span className="font-medium text-foreground">{booking.emergency_contact_name} ({booking.emergency_contact_phone})</span></div>}
          </div>

          {(booking.special_needs || booking.bedtime_instructions || booking.food_instructions || booking.notes) && (
            <div className="border-t border-border/30 pt-3 space-y-2">
              {booking.special_needs && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Special Needs:</span> {booking.special_needs}</p>}
              {booking.bedtime_instructions && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Bedtime:</span> {booking.bedtime_instructions}</p>}
              {booking.food_instructions && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Food:</span> {booking.food_instructions}</p>}
              {booking.notes && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Notes:</span> {booking.notes}</p>}
            </div>
          )}
        </div>

        {/* Safety permissions */}
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-navy" strokeWidth={1.5} />
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground">Safety Permissions</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <PermRow label="Beach/Pool" granted={booking.allow_beach_pool} denied={booking.no_water_activities} />
            <PermRow label="Golf Cart" granted={booking.allow_golf_cart} denied={booking.no_golf_cart} />
            <PermRow label="Water Photo Check-Ins" granted={booking.require_water_photo_checkins} />
            <PermRow label="Cart Photo Check-Ins" granted={booking.require_cart_photo_checkins} />
            <PermRow label="Light Housework" granted={booking.light_housework_requested} />
          </div>
        </div>

        {/* Timeline */}
        <BookingTimeline currentStatus={booking.status} />

        {/* Sitter private info — revealed after booking accepted */}
        {booking.info_shared && booking.status !== 'pending' && isParent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              <p className="text-xs font-medium text-emerald-700">Sitter Verification (Shared)</p>
            </div>
            <p className="text-xs text-emerald-800">Contact and safety details have been shared for this confirmed booking. Message your sitter below for specifics.</p>
          </div>
        )}

        {/* Sitter actions */}
        {isSitter && booking.status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => handleSitterAction('decline')} className="flex-1 bg-sand text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-sand/70">Decline</button>
            <button onClick={() => handleSitterAction('accept')} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-emerald-700">Accept Booking</button>
          </div>
        )}
        {isSitter && booking.status === 'accepted' && (
          <button onClick={() => handleSitterAction('start')} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90">Start Sitting Session</button>
        )}
        {isSitter && booking.status === 'in_progress' && (
          <button onClick={() => handleSitterAction('complete')} className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-emerald-700">Mark Complete</button>
        )}

        {/* Payment */}
        {isParent && booking.payment_status === 'unpaid' && booking.status === 'accepted' && (
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-primary/90"
          >
            <CreditCard className="w-4 h-4" strokeWidth={1.5} />
            {paying ? 'Processing...' : `Pay $${booking.total_cost?.toFixed(2)}`}
          </button>
        )}
        {booking.payment_status === 'paid' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
            <span className="text-xs text-emerald-700 font-medium">Payment Confirmed</span>
          </div>
        )}

        {/* Safety check-ins (sitter) */}
        {isSitter && ['accepted', 'in_progress'].includes(booking.status) && (
          <SafetyCheckinPanel booking={booking} />
        )}

        {/* Check-in history */}
        {checkins.length > 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Safety Check-In History</p>
            <div className="space-y-2">
              {checkins.map((ci) => (
                <div key={ci.id} className="flex items-start gap-3">
                  {ci.photo_url && <img src={ci.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground capitalize">{ci.checkin_type.replace(/_/g, ' ')}</p>
                    {ci.children_status && <p className="text-xs text-muted-foreground">{ci.children_status}</p>}
                    {ci.location && <p className="text-xs text-muted-foreground">{ci.location}</p>}
                    <p className="text-[10px] text-muted-foreground">{new Date(ci.created_date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message button */}
        <Link
          to={`/babysitting/message/${booking.sitter_id}?booking=${booking.id}`}
          className="w-full flex items-center justify-center gap-2 bg-sand text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-sand/70"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          Message {isParent ? 'Sitter' : 'Family'}
        </Link>

        {/* Reviews */}
        {booking.status === 'completed' && (
          <>
            {reviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground">Reviews</p>
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
            {canReview && <ReviewForm booking={booking} user={user} onDone={() => queryClient.invalidateQueries(['bookingReviews', id])} />}
          </>
        )}
      </div>
    </div>
  );
}

function PermRow({ label, granted, denied }) {
  if (denied) return <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /><span className="text-muted-foreground">{label}: Not Allowed</span></div>;
  if (granted) return <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={1.5} /><span className="text-muted-foreground">{label}: Yes</span></div>;
  return <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /><span className="text-muted-foreground">{label}: No</span></div>;
}

function ReviewForm({ booking, user, onDone }) {
  const [rating, setRating] = useState(5);
  const [writtenReview, setWrittenReview] = useState('');
  const [wouldBookAgain, setWouldBookAgain] = useState(true);
  const [safetyRating, setSafetyRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const isParent = booking.parent_email === user?.email;
  const revieweeEmail = isParent ? booking.sitter_owner_email : booking.parent_email;
  const revieweeName = isParent ? booking.sitter_name : booking.parent_name;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.BabysitterReview.create({
        booking_id: booking.id,
        reviewer_email: user.email,
        reviewer_name: user.full_name || user.email,
        reviewer_role: isParent ? 'parent' : 'sitter',
        reviewee_email: revieweeEmail,
        reviewee_name: revieweeName,
        reviewee_role: isParent ? 'sitter' : 'parent',
        sitter_id: isParent ? booking.sitter_id : undefined,
        rating,
        written_review: writtenReview || undefined,
        would_book_again: wouldBookAgain,
        safety_rating: safetyRating,
        communication_rating: communicationRating,
        ai_moderation_status: 'pending',
      });

      // AI moderation via InvokeLLM
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Review this babysitting review for professionalism and safety. Flag if it contains: harassment, gossip, personal attacks, profanity, discrimination, unsafe behavior claims, or serious complaints. Serious safety concerns should be escalated, not hidden.\n\nRating: ${rating}/5\nSafety: ${safetyRating}/5\nCommunication: ${communicationRating}/5\nWould book again: ${wouldBookAgain}\nReview: ${writtenReview}\n\nRespond with JSON: {"status": "approved"|"flagged"|"escalated", "reason": "explanation"}`,
          response_json_schema: { type: 'object', properties: { status: { type: 'string' }, reason: { type: 'string' } } },
        });

        if (result && result.status) {
          // Update the review
          const reviews = await base44.entities.BabysitterReview.filter({ booking_id: booking.id, reviewer_email: user.email });
          if (reviews.length > 0) {
            await base44.entities.BabysitterReview.update(reviews[0].id, {
              ai_moderation_status: result.status,
              ai_flag_reason: result.reason || undefined,
              is_visible: result.status === 'approved',
              admin_review_status: result.status === 'escalated' ? 'under_review' : 'none',
            });
          }
        }
      } catch (aiErr) {
        console.error('AI moderation failed:', aiErr.message);
      }

      toast({ title: 'Review submitted', description: 'It will appear after moderation.' });
      onDone();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Leave a Review</p>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Overall Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Safety Rating</label>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setSafetyRating(n)}>
                <Star className={`w-4 h-4 ${n <= safetyRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Communication</label>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setCommunicationRating(n)}>
                <Star className={`w-4 h-4 ${n <= communicationRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Written Review</label>
        <textarea value={writtenReview} onChange={(e) => setWrittenReview(e.target.value)} rows={3} placeholder="Share your experience..." className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={wouldBookAgain} onChange={(e) => setWouldBookAgain(e.target.checked)} className="w-4 h-4 accent-primary" />
        <span className="text-xs text-muted-foreground">Would book again</span>
      </label>
      <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-40">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}