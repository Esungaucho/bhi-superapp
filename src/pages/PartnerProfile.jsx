import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, BadgeCheck, Star, Phone, Mail, Globe, ExternalLink, Tag,
  FileText, CalendarCheck, X, Loader2, MapPin, Shield, Send, Heart, Share2
} from 'lucide-react';
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS, PARTNER_SUBCATEGORY_LABELS } from '@/lib/conciergeMarketplaceConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function PartnerProfile() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQuote, setShowQuote] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: partner, isLoading } = useQuery({
    queryKey: ['preferredPartner', partnerId],
    queryFn: () => base44.entities.PreferredPartner.get(partnerId),
    enabled: !!partnerId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['partnerReviews', partnerId],
    queryFn: () => base44.entities.PartnerReview.filter({ partner_id: partnerId, is_visible: true }),
    enabled: !!partnerId,
  });

  const trackClick = async (eventType) => {
    try {
      await base44.entities.PartnerReferralEvent.create({
        partner_id: partnerId,
        event_type: eventType,
        referral_source: 'partner_profile',
      });
    } catch (e) { /* silent */ }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!partner) {
    return <div className="px-4 py-12 text-center text-sm text-muted-foreground">Partner not found. <Link to="/concierge/partners" className="text-accent">Back</Link></div>;
  }

  const catMeta = PARTNER_CATEGORIES.find(c => c.id === partner.category);
  const CatIcon = catMeta?.Icon;

  const handleWebsiteClick = () => {
    trackClick('website_click');
    if (partner.referral_link) trackClick('referral_click');
  };

  const handleBookingClick = () => {
    trackClick('button_click');
    if (partner.is_bookable_through_app) {
      trackClick('booking_request');
      setShowQuote(true);
    } else if (partner.booking_link) {
      window.open(partner.booking_link, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground truncate">{partner.name}</h1>
        <GlobalMenu />
      </div>

      {/* Cover image */}
      <div className="aspect-[3/1] relative bg-sand">
        {partner.cover_image_url ? (
          <img src={partner.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {CatIcon && <CatIcon className="w-12 h-12 text-muted-foreground/20" strokeWidth={1} />}
          </div>
        )}
        {partner.is_verified && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-luxe-sm">
            <BadgeCheck className="w-4 h-4 text-accent" strokeWidth={2} />
            <span className="text-[11px] font-medium text-foreground">Verified Partner</span>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Title + logo */}
        <div className="flex items-start gap-3">
          {partner.logo_url && (
            <img src={partner.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-border/50" />
          )}
          <div className="flex-1">
            <h2 className="font-heading text-xl text-foreground">{partner.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{PARTNER_SUBCATEGORY_LABELS[partner.subcategory] || PARTNER_CATEGORY_LABELS[partner.category]}</p>
            {partner.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">{partner.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({partner.review_count} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { trackClick('button_click'); setShowQuote(true); }}
            className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 hover:bg-primary/90"
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Request Quote</span>
          </button>
          {partner.is_bookable_through_app ? (
            <button
              onClick={handleBookingClick}
              className="flex flex-col items-center gap-1 bg-accent text-white rounded-xl py-3 hover:bg-accent/90"
            >
              <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Book Through App</span>
            </button>
          ) : partner.booking_link ? (
            <a
              href={partner.booking_link}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackClick('button_click')}
              className="flex flex-col items-center gap-1 bg-accent text-white rounded-xl py-3 hover:bg-accent/90"
            >
              <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Book Now</span>
            </a>
          ) : (
            <button
              onClick={() => { setSaved(!saved); toast({ title: saved ? 'Removed from saved' : 'Saved to favorites' }); }}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 border ${saved ? 'bg-accent/10 border-accent text-accent' : 'bg-card border-border/50 text-muted-foreground'}`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{saved ? 'Saved' : 'Save'}</span>
            </button>
          )}
          {partner.website && (
            <a
              href={partner.referral_link || partner.website}
              target="_blank"
              rel="noreferrer"
              onClick={handleWebsiteClick}
              className="flex flex-col items-center gap-1 bg-card border border-border/50 rounded-xl py-3 hover:border-accent/40"
            >
              <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-foreground">Visit Website</span>
            </a>
          )}
        </div>

        {/* Promo code */}
        {partner.promo_code && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Use promo code</p>
              <p className="text-sm font-medium text-foreground">{partner.promo_code}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(partner.promo_code); trackClick('promo_code_usage'); toast({ title: 'Promo code copied' }); }}
              className="text-[10px] bg-accent text-white rounded-full px-2 py-1 font-medium"
            >
              Copy
            </button>
          </div>
        )}

        {/* Description */}
        {partner.description && (
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">About</p>
            <p className="text-sm text-foreground leading-relaxed">{partner.description}</p>
          </div>
        )}

        {/* Gallery */}
        {partner.photo_gallery?.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {partner.photo_gallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-sand">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1">Contact</p>
          {partner.service_area && <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> {partner.service_area}</div>}
          {partner.phone && <a href={`tel:${partner.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> {partner.phone}</a>}
          {partner.email && <a href={`mailto:${partner.email}`} className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> {partner.email}</a>}
          {partner.website && <a href={partner.referral_link || partner.website} target="_blank" rel="noreferrer" onClick={handleWebsiteClick} className="flex items-center gap-2 text-xs text-accent"><ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} /> {partner.website}</a>}
          {partner.pricing_guide && <div className="text-xs text-muted-foreground mt-2 bg-sand/30 rounded-lg p-2">{partner.pricing_guide}</div>}
        </div>

        {/* Tags */}
        {partner.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {partner.tags.map((tag, i) => (
              <span key={i} className="text-[11px] bg-sand/60 text-muted-foreground rounded-full px-2.5 py-1">{tag}</span>
            ))}
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Reviews</p>
            <div className="space-y-2">
              {reviews.map(review => (
                <div key={review.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground">{review.reviewer_name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />)}
                    </div>
                  </div>
                  {review.written_review && <p className="text-xs text-muted-foreground">{review.written_review}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote form */}
      {showQuote && (
        <PartnerQuoteForm partner={partner} user={user} onClose={() => setShowQuote(false)} onTracked={() => trackClick('quote_request')} />
      )}
    </div>
  );
}

function PartnerQuoteForm({ partner, user, onClose, onTracked }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ event_date: '', guest_count: '', service_details: '', special_requests: '', budget: '' });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.service_details) { toast({ title: 'Please add service details', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      onTracked();
      // Reuse ConciergeRequest for quote requests
      await base44.entities.ConciergeRequest.create({
        user_name: user?.full_name || user?.email || 'Guest',
        user_email: user?.email || 'guest@bhi.com',
        category: 'special_requests',
        subcategory: `partner_quote:${partner.name}`,
        item_requested: `Quote request from ${partner.name}`,
        notes: `${form.service_details}${form.special_requests ? '\n\nSpecial: ' + form.special_requests : ''}${form.budget ? '\nBudget: ' + form.budget : ''}${form.event_date ? '\nDate: ' + form.event_date : ''}${form.guest_count ? '\nGuests: ' + form.guest_count : ''}`,
        timing: form.event_date ? 'scheduled' : 'asap',
        scheduled_for: form.event_date ? `${form.event_date}T10:00:00` : undefined,
        delivery_preference: 'home_delivery',
        status: 'request_submitted',
      });
      toast({ title: 'Quote request sent', description: `${partner.name} will respond soon.` });
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-muted-foreground">Requesting quote from</p>
            <h3 className="font-heading text-base text-foreground">{partner.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Event Date</label>
              <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Guest Count</label>
              <input type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Budget Range</label>
            <input type="text" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. $500-$1000" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Service Details *</label>
            <textarea value={form.service_details} onChange={e => set('service_details', e.target.value)} rows={3} placeholder="Describe what you need..." className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Special Requests</label>
            <textarea value={form.special_requests} onChange={e => set('special_requests', e.target.value)} rows={2} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.5} />} Send Request
          </button>
        </div>
      </div>
    </div>
  );
}