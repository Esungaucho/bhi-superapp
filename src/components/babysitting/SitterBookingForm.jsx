import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, Phone, AlertTriangle, ShieldCheck, Car, Waves, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { PARENT_SAFETY_CHECKBOXES, calculateBookingCost, CANCELLATION_POLICY } from '@/lib/babysittingConstants';

export default function SitterBookingForm({ sitter, user, onClose }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    num_children: 1,
    children_ages: '',
    island_address: '',
    parent_phone: '',
    special_needs: '',
    bedtime_instructions: '',
    food_instructions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    allow_beach_pool: false,
    allow_golf_cart: false,
    require_water_photo_checkins: false,
    require_cart_photo_checkins: false,
    no_water_activities: false,
    no_golf_cart: false,
    light_housework_requested: false,
    tip: 0,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const cost = form.start_time && form.end_time
    ? calculateBookingCost(sitter.hourly_rate, form.start_time, form.end_time, form.tip)
    : null;

  const validateStep = (s) => {
    if (s === 1) return form.date && form.start_time && form.end_time && form.island_address;
    if (s === 2) return form.parent_phone && form.emergency_contact_name && form.emergency_contact_phone;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const booking = await base44.entities.BabysitterBooking.create({
        parent_email: user.email,
        parent_name: user.full_name || user.email,
        parent_phone: form.parent_phone,
        sitter_id: sitter.id,
        sitter_name: `${sitter.first_name} ${sitter.last_initial}`,
        sitter_photo_url: sitter.profile_photo_url,
        sitter_owner_email: sitter.owner_email,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        num_children: form.num_children,
        children_ages: form.children_ages,
        island_address: form.island_address,
        special_needs: form.special_needs || undefined,
        bedtime_instructions: form.bedtime_instructions || undefined,
        food_instructions: form.food_instructions || undefined,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        notes: form.notes || undefined,
        allow_beach_pool: form.allow_beach_pool,
        allow_golf_cart: form.allow_golf_cart,
        require_water_photo_checkins: form.require_water_photo_checkins,
        require_cart_photo_checkins: form.require_cart_photo_checkins,
        no_water_activities: form.no_water_activities,
        no_golf_cart: form.no_golf_cart,
        light_housework_requested: form.light_housework_requested,
        hourly_rate: sitter.hourly_rate,
        estimated_hours: cost?.hours,
        estimated_total: cost?.serviceTotal,
        booking_fee: cost?.bookingFee,
        tip: cost?.tip,
        total_cost: cost?.total,
        status: 'pending',
        payment_status: 'unpaid',
      });
      toast({ title: 'Booking requested', description: `${sitter.first_name} will be notified.` });
      onClose();
    } catch (err) {
      toast({ title: 'Booking failed', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-muted-foreground">Booking with</p>
            <h3 className="font-heading text-base text-foreground">{sitter.first_name} {sitter.last_initial}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60 transition-colors">
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-4 pt-3">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Details */}
          {step === 1 && (
            <>
              <h4 className="text-sm font-medium text-foreground">Booking Details</h4>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date *</label>
                <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Time *</label>
                  <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Time *</label>
                  <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Number of Children *</label>
                  <input type="number" min="1" value={form.num_children} onChange={(e) => set('num_children', parseInt(e.target.value) || 1)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Children's Ages</label>
                  <input type="text" value={form.children_ages} onChange={(e) => set('children_ages', e.target.value)} placeholder="e.g. 3, 5, 8" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Island Address / Rental Location *</label>
                <input type="text" value={form.island_address} onChange={(e) => set('island_address', e.target.value)} placeholder="e.g. 123 Cape Creek Rd" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
            </>
          )}

          {/* Step 2: Instructions */}
          {step === 2 && (
            <>
              <h4 className="text-sm font-medium text-foreground">Instructions & Contact</h4>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Parent Phone *</label>
                <input type="tel" value={form.parent_phone} onChange={(e) => set('parent_phone', e.target.value)} placeholder="(910) 555-0000" className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Special Needs / Allergies</label>
                <textarea value={form.special_needs} onChange={(e) => set('special_needs', e.target.value)} rows={2} placeholder="e.g. Peanut allergy, uses inhaler" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bedtime Instructions</label>
                <textarea value={form.bedtime_instructions} onChange={(e) => set('bedtime_instructions', e.target.value)} rows={2} placeholder="e.g. 8pm bedtime, reads 2 stories" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Food Instructions</label>
                <textarea value={form.food_instructions} onChange={(e) => set('food_instructions', e.target.value)} rows={2} placeholder="e.g. Dinner at 6, snacks in pantry" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Contact Name *</label>
                  <input type="text" value={form.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Contact Phone *</label>
                  <input type="tel" value={form.emergency_contact_phone} onChange={(e) => set('emergency_contact_phone', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Additional Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>
            </>
          )}

          {/* Step 3: Safety Permissions */}
          {step === 3 && (
            <>
              <h4 className="text-sm font-medium text-foreground">Safety Permissions</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-amber-800 leading-relaxed">Please review each permission carefully. These settings determine what activities your sitter may perform with your children.</p>
              </div>
              <div className="space-y-2">
                {PARENT_SAFETY_CHECKBOXES.map((cb) => (
                  <label key={cb.key} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[cb.key]}
                      onChange={(e) => set(cb.key, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">{cb.label}</span>
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.light_housework_requested}
                  onChange={(e) => set('light_housework_requested', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">I request light child-related housework (tidying, dishes, etc.)</span>
              </label>
            </>
          )}

          {/* Step 4: Review & Payment */}
          {step === 4 && (
            <>
              <h4 className="text-sm font-medium text-foreground">Review & Payment</h4>
              {cost && (
                <div className="bg-card border border-border/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{sitter.hourly_rate}/hr × {cost.hours} hrs</span>
                    <span className="font-medium">${cost.serviceTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Booking Fee</span>
                    <span className="font-medium">${cost.bookingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tip</span>
                    <div className="flex gap-1.5">
                      {[0, 5, 10, 15].map((t) => (
                        <button
                          key={t}
                          onClick={() => set('tip', t)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${form.tip === t ? 'bg-primary text-primary-foreground' : 'bg-sand text-muted-foreground'}`}
                        >
                          ${t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2 flex justify-between">
                    <span className="text-sm font-medium text-foreground">Total</span>
                    <span className="text-sm font-bold text-foreground">${cost.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="bg-sand/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground leading-relaxed">{CANCELLATION_POLICY.text}</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-3">
                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-emerald-700">Payment is processed securely through the app after the sitter accepts your booking.</p>
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div className="flex gap-2 pt-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-sand text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-sand/70 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => validateStep(step) && setStep(step + 1)}
                disabled={!validateStep(step)}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                {submitting ? 'Sending...' : 'Request Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}