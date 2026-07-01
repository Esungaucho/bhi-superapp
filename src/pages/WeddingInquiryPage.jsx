import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, X, Check, Loader2, Heart, CalendarHeart, Users, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { WEDDING_SERVICES, WEDDING_SERVICE_LABELS, WEDDING_BUDGET_RANGES } from '@/lib/conciergeMarketplaceConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function WeddingInquiryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: partners = [] } = useQuery({
    queryKey: ['weddingPartners'],
    queryFn: () => base44.entities.PreferredPartner.filter({ approval_status: 'approved', category: 'weddings_events' }, '-is_featured', 50),
  });

  const [form, setForm] = useState({
    wedding_date: '',
    guest_count: 50,
    venue_location: '',
    budget_range: '',
    style_vibe: '',
    notes: '',
    services_needed: [],
    selected_partner_ids: [],
    user_phone: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      services_needed: f.services_needed.includes(id) ? f.services_needed.filter(s => s !== id) : [...f.services_needed, id],
    }));
  };

  const togglePartner = (id) => {
    setForm(f => ({
      ...f,
      selected_partner_ids: f.selected_partner_ids.includes(id) ? f.selected_partner_ids.filter(p => p !== id) : [...f.selected_partner_ids, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.wedding_date || !form.guest_count) {
      toast({ title: 'Please fill in date and guest count', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.WeddingInquiry.create({
        user_email: user?.email || 'guest@bhi.com',
        user_name: user?.full_name || user?.email || 'Guest',
        user_phone: form.user_phone,
        wedding_date: form.wedding_date,
        guest_count: Number(form.guest_count),
        venue_location: form.venue_location,
        budget_range: form.budget_range,
        services_needed: form.services_needed,
        style_vibe: form.style_vibe,
        notes: form.notes,
        selected_partner_ids: form.selected_partner_ids,
        status: 'submitted',
      });
      toast({ title: 'Inquiry submitted', description: 'Our concierge team will craft a custom package for you.' });
      navigate('/concierge');
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-32 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <button onClick={() => navigate('/concierge')} className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-2">
          <h1 className="font-heading text-xl text-white">Weddings & Events Inquiry</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-8">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tell us about your celebration. Our concierge team will craft a custom package from our trusted network of wedding partners.
        </p>

        {/* Basic info */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><CalendarHeart className="w-3.5 h-3.5" /> Wedding / Event Date *</label>
            <input type="date" value={form.wedding_date} onChange={e => set('wedding_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Guest Count *</label>
              <input type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Budget</label>
              <select value={form.budget_range} onChange={e => set('budget_range', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent">
                <option value="">Select...</option>
                {WEDDING_BUDGET_RANGES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Venue / Location</label>
            <input type="text" value={form.venue_location} onChange={e => set('venue_location', e.target.value)} placeholder="e.g. Beachfront, private home, club pavilion" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Style / Vibe</label>
            <input type="text" value={form.style_vibe} onChange={e => set('style_vibe', e.target.value)} placeholder="e.g. Beachfront casual, black-tie formal, rustic chic" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Phone</label>
            <input type="tel" value={form.user_phone} onChange={e => set('user_phone', e.target.value)} placeholder="(910) 555-0000" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        {/* Services needed */}
        <div>
          <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Services Needed</label>
          <div className="grid grid-cols-2 gap-1.5">
            {WEDDING_SERVICES.map(svc => (
              <button
                key={svc}
                onClick={() => toggleService(svc)}
                className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${form.services_needed.includes(svc) ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
              >
                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${form.services_needed.includes(svc) ? 'border-accent bg-accent' : 'border-border'}`}>
                  {form.services_needed.includes(svc) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                </div>
                <span className="text-[11px] font-medium text-foreground">{WEDDING_SERVICE_LABELS[svc]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Partner selection */}
        {partners.length > 0 && (
          <div>
            <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Interested Partners (optional)</label>
            <div className="space-y-1.5">
              {partners.slice(0, 8).map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePartner(p.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${form.selected_partner_ids.includes(p.id) ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form.selected_partner_ids.includes(p.id) ? 'border-accent bg-accent' : 'border-border'}`}>
                    {form.selected_partner_ids.includes(p.id) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                  </div>
                  <span className="text-xs font-medium text-foreground flex-1">{p.name}</span>
                  {p.is_verified && <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">Verified</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Additional Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Tell us more about your vision..." className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" strokeWidth={1.5} />} Submit Wedding Inquiry
        </button>
      </div>
    </div>
  );
}