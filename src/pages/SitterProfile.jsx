import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, Star, MapPin, Clock, Heart, CheckCircle2, ShieldCheck,
  Baby, Utensils, Moon, Sparkles, MessageSquare, Calendar, Award, Lock
} from 'lucide-react';
import {
  AGE_RANGE_LABELS, COMFORT_LABELS, CERTIFICATIONS, SKILL_BADGES,
  BACKGROUND_CHECK_META, BOOKING_STATUS_META
} from '@/lib/babysittingConstants';
import ReviewCard from '@/components/babysitting/ReviewCard';
import SitterBookingForm from '@/components/babysitting/SitterBookingForm';

export default function SitterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sitter, isLoading } = useQuery({
    queryKey: ['babysitter', id],
    queryFn: () => base44.entities.Babysitter.get(id),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['sitterReviews', id],
    queryFn: () => base44.entities.BabysitterReview.filter({ sitter_id: id, is_visible: true }),
    enabled: !!id,
  });

  const { data: saved = [] } = useQuery({
    queryKey: ['savedBabysitters', user?.email],
    queryFn: () => base44.entities.SavedBabysitter.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const isSaved = saved.some((s) => s.sitter_id === id);

  const toggleSave = async () => {
    const existing = saved.find((s) => s.sitter_id === id);
    try {
      if (existing) {
        await base44.entities.SavedBabysitter.delete(existing.id);
      } else {
        await base44.entities.SavedBabysitter.create({
          user_email: user.email,
          sitter_id: id,
          sitter_name: `${sitter.first_name} ${sitter.last_initial}`,
          sitter_photo_url: sitter.profile_photo_url,
          sitter_hourly_rate: sitter.hourly_rate,
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!sitter) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Sitter not found.</p>
        <Link to="/babysitting" className="text-sm text-primary mt-2 inline-block">Back to Browse</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60 transition-colors">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <button onClick={toggleSave} className="p-1.5 rounded-full hover:bg-sand/60 transition-colors">
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-6 pb-4 text-center">
        {sitter.profile_photo_url && !imgError ? (
          <img
            src={sitter.profile_photo_url}
            alt={sitter.first_name}
            onError={() => setImgError(true)}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 shadow-luxe"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-sand flex items-center justify-center mx-auto mb-3">
            <span className="font-heading text-3xl text-navy">{sitter.first_name?.charAt(0)?.toUpperCase()}</span>
          </div>
        )}
        <h1 className="font-heading text-xl text-foreground">{sitter.first_name} {sitter.last_initial}</h1>
        <p className="text-xs text-muted-foreground mt-1">{AGE_RANGE_LABELS[sitter.age_range]}</p>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{sitter.rating > 0 ? sitter.rating.toFixed(1) : 'New'}</span>
          {sitter.review_count > 0 && <span className="text-xs text-muted-foreground">({sitter.review_count} reviews)</span>}
          {sitter.completed_bookings > 0 && (
            <span className="text-xs text-muted-foreground">· {sitter.completed_bookings} bookings</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs text-muted-foreground">
            {sitter.on_island ? 'Lives on Bald Head Island' : 'Off Island'}
            {sitter.travel_time_to_ferry ? ` · ${sitter.travel_time_to_ferry} to ferry` : ''}
          </span>
        </div>
      </div>

      {/* Rate card */}
      <div className="mx-4 bg-card border border-border/50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-heading text-foreground">${sitter.hourly_rate}<span className="text-sm text-muted-foreground">/hr</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Minimum {sitter.min_booking_hours} hour booking</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Experience</p>
            <p className="text-sm font-medium text-foreground">{sitter.years_experience} years</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {sitter.bio && (
        <div className="mx-4 mb-4">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">About</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{sitter.bio}</p>
        </div>
      )}

      {/* Certifications */}
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Certifications</p>
        <div className="grid grid-cols-2 gap-2">
          {CERTIFICATIONS.map((c) => (
            <div
              key={c.key}
              className={`flex items-center gap-2 rounded-lg p-2.5 ${
                sitter[c.key] ? 'bg-emerald-50' : 'bg-sand/40'
              }`}
            >
              <c.Icon className={`w-4 h-4 ${sitter[c.key] ? 'text-emerald-600' : 'text-muted-foreground/40'}`} strokeWidth={1.5} />
              <span className={`text-xs ${sitter[c.key] ? 'text-emerald-700 font-medium' : 'text-muted-foreground/50'}`}>
                {c.label}
              </span>
              {sitter[c.key] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" strokeWidth={1.5} />}
            </div>
          ))}
        </div>
      </div>

      {/* Experience & Skills */}
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Experience & Skills</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_BADGES.filter((s) => sitter[s.key]).map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1 text-xs font-medium text-navy bg-accent/10 rounded-full px-2.5 py-1">
              <s.Icon className="w-3 h-3" strokeWidth={1.5} />
              {s.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-sand rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3" strokeWidth={1.5} />
            Beach/Pool: {COMFORT_LABELS[sitter.beach_pool_comfort]}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-sand rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3" strokeWidth={1.5} />
            Golf Cart: {COMFORT_LABELS[sitter.golf_cart_comfort]}
          </span>
        </div>
      </div>

      {/* Verification status */}
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Verification</p>
        <div className="bg-card border border-border/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${sitter.background_check_status === 'passed' ? 'text-emerald-600' : 'text-amber-500'}`} strokeWidth={1.5} />
            <span className="text-xs text-foreground">{BACKGROUND_CHECK_META[sitter.background_check_status]?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${sitter.references_verified ? 'text-emerald-600' : 'text-muted-foreground/40'}`} strokeWidth={1.5} />
            <span className="text-xs text-foreground">
              References {sitter.references_verified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[10px] text-muted-foreground leading-tight">
              Full verification details (ID, license, emergency contact) are shared only after a booking is accepted.
            </span>
          </div>
        </div>
      </div>

      {/* Availability */}
      {sitter.availability && sitter.availability.length > 0 && (
        <div className="mx-4 mb-4">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Upcoming Availability</p>
          <div className="bg-card border border-border/50 rounded-xl p-3 space-y-1.5">
            {sitter.availability.filter((a) => a.is_available).slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-xs text-foreground">{a.date} · {a.start_time}–{a.end_time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mx-4 mb-4">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Reviews</p>
          <div className="space-y-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 flex gap-2 z-20">
        <button
          onClick={() => navigate(`/babysitting/message/${id}`)}
          className="flex items-center justify-center gap-1.5 flex-1 bg-sand text-foreground rounded-xl py-3 text-sm font-medium hover:bg-sand/70 transition-colors"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          Message
        </button>
        <button
          onClick={() => setShowBooking(true)}
          className="flex items-center justify-center gap-1.5 flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Calendar className="w-4 h-4" strokeWidth={1.5} />
          Request Booking
        </button>
      </div>

      {showBooking && (
        <SitterBookingForm sitter={sitter} user={user} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}