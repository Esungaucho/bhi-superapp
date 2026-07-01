import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, X, Loader2, Check, ChevronRight } from 'lucide-react';
import { CONCIERGE_SERVICE_CATEGORIES, SERVICE_LABELS } from '@/lib/conciergeMarketplaceConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function ConciergeServices() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate('/concierge')} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-base text-foreground">Concierge Services</h1>
        <GlobalMenu />
      </div>

      <div className="px-4 py-4 pb-8">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Request services through our Island Concierge team. Choose a category to get started.
        </p>

        <div className="space-y-4">
          {CONCIERGE_SERVICE_CATEGORIES.map(cat => {
            const CatIcon = cat.Icon;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <CatIcon className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <h2 className="font-heading text-sm text-foreground">{cat.label}</h2>
                </div>
                {cat.id === 'special_requests' ? (
                  <button
                    onClick={() => setSelectedService({ id: 'special_request', label: 'Special Request', category_id: 'special_requests' })}
                    className="w-full bg-card border border-border/50 rounded-xl p-3 text-left hover:border-accent/40 transition-colors flex items-center justify-between"
                  >
                    <p className="text-xs text-muted-foreground">Tell us what you need — we'll make it happen</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {cat.services.map(service => {
                      const ServiceIcon = service.Icon;
                      return (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService({ ...service, category_id: cat.id })}
                          className="flex flex-col items-start gap-1.5 p-3 bg-card border border-border/50 rounded-xl hover:border-accent/40 transition-colors text-left"
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                            <ServiceIcon className="w-4 h-4" strokeWidth={1.5} />
                          </span>
                          <span className="text-xs font-medium text-foreground">{service.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedService && (
        <ServiceRequestForm service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
}

function ServiceRequestForm({ service, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({
    service_date: '',
    service_time: '',
    notes: '',
    island_address: '',
    budget_range: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.ConciergeRequest.create({
        user_name: user?.full_name || user?.email || 'Guest',
        user_email: user?.email || 'guest@bhi.com',
        user_phone: '',
        island_address: form.island_address,
        category: service.category_id === 'special_requests' ? 'special_requests' : service.category_id,
        subcategory: service.id,
        item_requested: service.label,
        notes: form.notes,
        timing: form.service_date ? 'scheduled' : 'asap',
        scheduled_for: form.service_date ? `${form.service_date}T${form.service_time || '10:00'}:00` : undefined,
        delivery_preference: 'home_delivery',
        status: 'request_submitted',
      });
      toast({ title: 'Request submitted', description: 'An Island Concierge will contact you shortly.' });
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
            <p className="text-xs text-muted-foreground">Requesting</p>
            <h3 className="font-heading text-base text-foreground">{service.label}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60">
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={form.service_date} onChange={e => set('service_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Time</label>
              <input type="time" value={form.service_time} onChange={e => set('service_time', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Island Address</label>
            <input type="text" value={form.island_address} onChange={e => set('island_address', e.target.value)} placeholder="e.g. 123 Cape Creek Rd" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Budget Range (optional)</label>
            <input type="text" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. Flexible, $50-$100" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{service.id === 'special_request' ? 'Tell us what you need' : 'Details & Special Instructions'}</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} placeholder={service.id === 'special_request' ? 'Describe what you need...' : 'Any specific requirements...'} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" strokeWidth={1.5} /> Submit Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}