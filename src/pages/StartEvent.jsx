import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Check, ChevronRight, CalendarHeart, Users, DollarSign, MapPin, Home, Baby, Bus, UtensilsCrossed, Camera, Flower2, Tent, ConciergeBell, Loader2 } from 'lucide-react';
import { EVENT_TYPES, BUDGET_RANGES, PLANNING_HELP_OPTIONS, DEFAULT_WEDDING_TIMELINE, DEFAULT_EVENT_TIMELINE } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

const STEPS = ['Event Type', 'Date & Guests', 'Location & Lodging', 'Services Needed', 'Planning Support', 'Review'];

export default function StartEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({
    event_title: '',
    event_type: '',
    is_date_flexible: false,
    desired_date: '',
    date_range_start: '',
    date_range_end: '',
    estimated_guest_count: 50,
    budget_range: '',
    ceremony_location_preference: '',
    accommodation_needs: '',
    childcare_needs: '',
    transportation_needs: '',
    catering_needs: '',
    photography_videography_needs: '',
    floral_decor_needs: '',
    rental_equipment_needs: '',
    planning_help_type: 'compass_concierge',
    planner_name: '',
    planner_email: '',
    planner_phone: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validateStep = (s) => {
    if (s === 0) return form.event_type;
    if (s === 1) return form.estimated_guest_count > 0 && (form.desired_date || form.is_date_flexible);
    if (s === 2) return true;
    if (s === 3) return true;
    if (s === 4) return form.planning_help_type;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const eventPlan = await base44.entities.EventPlan.create({
        ...form,
        user_email: user.email,
        user_name: user.full_name || user.email,
        estimated_guest_count: Number(form.estimated_guest_count),
      });

      // Generate default timeline
      const template = form.event_type === 'wedding' ? DEFAULT_WEDDING_TIMELINE : DEFAULT_EVENT_TIMELINE;
      const timelineItems = template.map(item => ({
        ...item,
        event_plan_id: eventPlan.id,
      }));
      await base44.entities.EventTimelineItem.bulkCreate(timelineItems);

      queryClient.invalidateQueries(['myEventPlans']);
      toast({ title: 'Event plan created', description: 'Your planning dashboard is ready.' });
      navigate(`/events/dashboard/${eventPlan.id}`);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-base text-foreground">Start an Event Plan</h1>
        <GlobalMenu />
      </div>

      {/* Progress */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
      </div>

      <div className="px-4 py-4 pb-8">
        {/* Step 0: Event Type */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Event Name (optional)</label>
              <input
                type="text"
                value={form.event_title}
                onChange={e => set('event_title', e.target.value)}
                placeholder="e.g. Sarah & Mike's Wedding"
                className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">What are you planning? *</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => set('event_type', id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      form.event_type === id ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/30'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${form.event_type === id ? 'text-accent' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                    <span className="text-xs font-medium text-foreground text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Date & Guests */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Flexible date range?</p>
                <p className="text-xs text-muted-foreground">Toggle if your date is flexible</p>
              </div>
              <button onClick={() => set('is_date_flexible', !form.is_date_flexible)} className={`relative w-11 h-6 rounded-full transition-colors ${form.is_date_flexible ? 'bg-accent' : 'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.is_date_flexible ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {form.is_date_flexible ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Range Start *</label>
                  <input type="date" value={form.date_range_start} onChange={e => set('date_range_start', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Range End *</label>
                  <input type="date" value={form.date_range_end} onChange={e => set('date_range_end', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Desired Date *</label>
                <input type="date" value={form.desired_date} onChange={e => set('desired_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estimated Guest Count *</label>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <input type="number" min="1" value={form.estimated_guest_count} onChange={e => set('estimated_guest_count', e.target.value)} className="flex-1 bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Budget Range</label>
              <div className="grid grid-cols-1 gap-1.5">
                {BUDGET_RANGES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => set('budget_range', id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      form.budget_range === id ? 'border-accent bg-accent/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.budget_range === id ? 'border-accent bg-accent' : 'border-border'}`}>
                      {form.budget_range === id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Lodging */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <ServiceInput Icon={MapPin} label="Ceremony / Event Location Preference" value={form.ceremony_location_preference} onChange={v => set('ceremony_location_preference', v)} placeholder="e.g. Beach front at Cape Fear, private home, club pavilion" />
            <ServiceInput Icon={Home} label="Accommodation Needs" value={form.accommodation_needs} onChange={v => set('accommodation_needs', v)} placeholder="e.g. Need 3 rental homes for 20 guests, 3 nights" />
            <ServiceInput Icon={Bus} label="Transportation Needs" value={form.transportation_needs} onChange={v => set('transportation_needs', v)} placeholder="e.g. Ferry coordination, golf carts for guests" />
            <ServiceInput Icon={Baby} label="Childcare Needs" value={form.childcare_needs} onChange={v => set('childcare_needs', v)} placeholder="e.g. Need 2 sitters during reception" />
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <ServiceInput Icon={UtensilsCrossed} label="Catering Needs" value={form.catering_needs} onChange={v => set('catering_needs', v)} placeholder="e.g. Plated dinner for 80, gluten-free options" />
            <ServiceInput Icon={Camera} label="Photography / Videography" value={form.photography_videography_needs} onChange={v => set('photography_videography_needs', v)} placeholder="e.g. Full-day coverage, engagement shoot" />
            <ServiceInput Icon={Flower2} label="Floral / Decor Needs" value={form.floral_decor_needs} onChange={v => set('floral_decor_needs', v)} placeholder="e.g. Bridal bouquet, ceremony arch, centerpieces" />
            <ServiceInput Icon={Tent} label="Rental Equipment Needs" value={form.rental_equipment_needs} onChange={v => set('rental_equipment_needs', v)} placeholder="e.g. Tent for 80, chairs, tables, lighting" />
          </div>
        )}

        {/* Step 4: Planning Help */}
        {step === 4 && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Planning Support *</label>
            {PLANNING_HELP_OPTIONS.map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => set('planning_help_type', id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  form.planning_help_type === id ? 'border-accent bg-accent/5' : 'border-border bg-card'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.planning_help_type === id ? 'border-accent bg-accent' : 'border-border'}`}>
                  {form.planning_help_type === id && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </button>
            ))}

            {form.planning_help_type === 'have_planner' && (
              <div className="space-y-3 mt-3 animate-fade-in">
                <input type="text" value={form.planner_name} onChange={e => set('planner_name', e.target.value)} placeholder="Planner name" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                <input type="email" value={form.planner_email} onChange={e => set('planner_email', e.target.value)} placeholder="Planner email" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                <input type="tel" value={form.planner_phone} onChange={e => set('planner_phone', e.target.value)} placeholder="Planner phone" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Event Summary</p>
              <div className="space-y-2 text-sm">
                <SummaryRow label="Event" value={form.event_title || EVENT_TYPES.find(t => t.id === form.event_type)?.label} />
                <SummaryRow label="Date" value={form.is_date_flexible ? `${form.date_range_start} – ${form.date_range_end}` : form.desired_date} />
                <SummaryRow label="Guests" value={form.estimated_guest_count} />
                <SummaryRow label="Budget" value={BUDGET_RANGES.find(b => b.id === form.budget_range)?.label} />
                <SummaryRow label="Location" value={form.ceremony_location_preference} />
                <SummaryRow label="Planning" value={PLANNING_HELP_OPTIONS.find(p => p.id === form.planning_help_type)?.label} />
              </div>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
              <ConciergeBell className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">A Compass Concierge team member will review your plan and reach out within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 bg-sand text-foreground rounded-xl py-3 text-sm font-medium hover:bg-sand/70">Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => validateStep(step) && setStep(step + 1)}
              disabled={!validateStep(step)}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 flex items-center justify-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Check className="w-4 h-4" strokeWidth={1.5} /> Create Event Plan</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceInput({ Icon, label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} /> {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-xs font-medium text-right">{value}</span>
    </div>
  );
}