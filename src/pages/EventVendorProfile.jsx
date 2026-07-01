import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, BadgeCheck, Star, Phone, Mail, Globe, MapPin, MessageSquare,
  FileText, X, Users, CalendarHeart, DollarSign, Paperclip, Loader2, Send
} from 'lucide-react';
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, PRICE_RANGE_LABELS, BUDGET_RANGES, EVENT_TYPES } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventVendorProfile() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['eventVendor', vendorId],
    queryFn: () => base44.entities.EventVendor.get(vendorId),
    enabled: !!vendorId,
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ['myEventPlans'],
    queryFn: () => base44.entities.EventPlan.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!vendor) {
    return <div className="px-4 py-12 text-center text-sm text-muted-foreground">Vendor not found. <Link to="/events/vendors" className="text-accent">Back to vendors</Link></div>;
  }

  const catMeta = VENDOR_CATEGORIES.find(c => c.id === vendor.category);
  const CatIcon = catMeta?.Icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground truncate">{vendor.name}</h1>
        <GlobalMenu />
      </div>

      {/* Hero photo */}
      <div className="aspect-[4/3] relative bg-sand">
        {vendor.photos?.[0] ? (
          <img src={vendor.photos[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {CatIcon && <CatIcon className="w-16 h-16 text-muted-foreground/20" strokeWidth={1} />}
          </div>
        )}
        {vendor.is_verified && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-luxe-sm">
            <BadgeCheck className="w-4 h-4 text-accent" strokeWidth={2} />
            <span className="text-[11px] font-medium text-foreground">Verified Local Partner</span>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Title */}
        <div>
          <h2 className="font-heading text-xl text-foreground">{vendor.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{VENDOR_CATEGORY_LABELS[vendor.category]}</p>
          <div className="flex items-center gap-3 mt-2">
            {vendor.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">{vendor.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({vendor.review_count})</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">{PRICE_RANGE_LABELS[vendor.price_range]}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowQuoteForm(true)}
            className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 hover:bg-primary/90"
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Request Quote</span>
          </button>
          <button
            onClick={() => setShowQuoteForm(true)}
            className="flex flex-col items-center gap-1 bg-card border border-border/50 rounded-xl py-3 hover:border-accent/40"
          >
            <CalendarHeart className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-foreground">Check Availability</span>
          </button>
          <a
            href={vendor.phone ? `tel:${vendor.phone}` : vendor.email ? `mailto:${vendor.email}` : '#'}
            className="flex flex-col items-center gap-1 bg-card border border-border/50 rounded-xl py-3 hover:border-accent/40"
          >
            <MessageSquare className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-foreground">Contact</span>
          </a>
        </div>

        {/* Description */}
        {vendor.description && (
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">About</p>
            <p className="text-sm text-foreground leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {/* Photo gallery */}
        {vendor.photos?.length > 1 && (
          <div>
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {vendor.photos.slice(1).map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-sand">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {vendor.specialties?.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1.5">
              {vendor.specialties.map((s, i) => (
                <span key={i} className="text-[11px] bg-sand/60 text-muted-foreground rounded-full px-2.5 py-1">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1">Contact</p>
          {vendor.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.phone}</div>}
          {vendor.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.email}</div>}
          {vendor.website && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> <a href={vendor.website} target="_blank" rel="noreferrer" className="text-accent">{vendor.website}</a></div>}
          {vendor.service_area && <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.service_area}</div>}
        </div>

        {/* Admin notes */}
        {user?.role === 'admin' && vendor.admin_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-medium text-amber-700 mb-1">Admin Notes</p>
            <p className="text-xs text-amber-800">{vendor.admin_notes}</p>
          </div>
        )}
      </div>

      {/* Quote Request Form */}
      {showQuoteForm && (
        <QuoteRequestForm
          vendor={vendor}
          user={user}
          events={myEvents}
          onClose={() => setShowQuoteForm(false)}
          onSubmitted={() => {
            queryClient.invalidateQueries(['eventQuotes']);
            setShowQuoteForm(false);
          }}
        />
      )}
    </div>
  );
}

function QuoteRequestForm({ vendor, user, events, onClose, onSubmitted }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    event_plan_id: events.length === 1 ? events[0].id : '',
    event_date: '',
    guest_count: 50,
    budget: '',
    service_details: '',
    special_requests: '',
    preferred_response_deadline: '',
  });
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const selectedEvent = events.find(e => e.id === form.event_plan_id);

  const handleUpload = async (files) => {
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      setPhotoUrls(prev => [...prev, ...uploaded]);
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.event_plan_id) {
      toast({ title: 'Select an event', description: 'Please choose which event this quote is for.', variant: 'destructive' });
      return;
    }
    if (!form.service_details) {
      toast({ title: 'Add details', description: 'Please describe the services you need.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.EventQuoteRequest.create({
        ...form,
        guest_count: Number(form.guest_count),
        user_email: user.email,
        user_name: user.full_name || user.email,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        vendor_category: vendor.category,
        inspiration_photo_urls: photoUrls,
        event_date: form.event_date || selectedEvent?.desired_date || selectedEvent?.date_range_start,
        status: 'pending',
      });
      toast({ title: 'Quote request sent', description: `${vendor.name} will respond soon.` });
      onSubmitted();
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
            <h3 className="font-heading text-base text-foreground">{vendor.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>

        <div className="p-4 space-y-4">
          {events.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-700">You need an event plan first.</p>
              <Link to="/events/start" className="text-sm text-accent font-medium mt-2 inline-block">Start an Event →</Link>
            </div>
          ) : (
            <>
              {/* Event selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Which event is this for? *</label>
                <select value={form.event_plan_id} onChange={e => set('event_plan_id', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent">
                  <option value="">Select an event...</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.event_title || e.event_type} — {e.desired_date || e.date_range_start || 'TBD'}</option>)}
                </select>
              </div>

              {/* Event date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Event Date</label>
                <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Guest Count</label>
                  <input type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Budget</label>
                  <select value={form.budget} onChange={e => set('budget', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent">
                    <option value="">Select...</option>
                    {BUDGET_RANGES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Service details */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Service Details *</label>
                <textarea value={form.service_details} onChange={e => set('service_details', e.target.value)} rows={3} placeholder={`Describe what you need from ${vendor.name}...`} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>

              {/* Special requests */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Special Requests</label>
                <textarea value={form.special_requests} onChange={e => set('special_requests', e.target.value)} rows={2} placeholder="Any specific requirements or preferences..." className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>

              {/* Inspiration photos */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Inspiration Photos (optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setPhotoUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5">
                        <X className="w-3 h-3 text-white" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-sand/40 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-sand/60">
                  <Paperclip className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {uploading ? 'Uploading...' : 'Attach photos'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files.length > 0 && handleUpload(e.target.files)} />
                </label>
              </div>

              {/* Response deadline */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Preferred Response By</label>
                <input type="date" value={form.preferred_response_deadline} onChange={e => set('preferred_response_deadline', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-primary/90"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" strokeWidth={1.5} /> Send Request</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}