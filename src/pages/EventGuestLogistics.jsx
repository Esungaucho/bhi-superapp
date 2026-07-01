import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft, Plus, X, Users, Phone, Mail, CalendarHeart, Home, Bus, Baby,
  Gift, UtensilsCrossed, Accessibility, Trash2, Loader2
} from 'lucide-react';
import { RSVP_STATUS_META } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventGuestLogistics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editGuest, setEditGuest] = useState(null);

  const { data: event } = useQuery({
    queryKey: ['eventPlan', id],
    queryFn: () => base44.entities.EventPlan.get(id),
    enabled: !!id,
  });

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['eventGuests', id],
    queryFn: () => base44.entities.EventGuest.filter({ event_plan_id: id }),
    enabled: !!id,
  });

  const handleDelete = async (guestId) => {
    try {
      await base44.entities.EventGuest.delete(guestId);
      queryClient.invalidateQueries(['eventGuests', id]);
      toast({ title: 'Guest removed' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(`/events/dashboard/${id}`)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground">Guest Logistics</h1>
        <GlobalMenu />
      </div>

      {/* Summary bar */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-foreground">{guests.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Guests</p>
        </div>
        <div className="flex-1 bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-[10px] text-muted-foreground">Confirmed</p>
        </div>
        <div className="flex-1 bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-foreground">{guests.reduce((sum, g) => sum + (g.plus_ones || 0), 0)}</p>
          <p className="text-[10px] text-muted-foreground">Plus Ones</p>
        </div>
      </div>

      {/* Add guest button */}
      <div className="px-4 pb-3">
        <button
          onClick={() => { setEditGuest(null); setShowForm(true); }}
          className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Guest
        </button>
      </div>

      {/* Guest list */}
      <div className="px-4 pb-8 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : guests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">No guests added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add guests to manage logistics</p>
          </div>
        ) : (
          guests.map(guest => {
            const rsvpMeta = RSVP_STATUS_META[guest.rsvp_status] || RSVP_STATUS_META.invited;
            return (
              <div key={guest.id} className="bg-card border border-border/50 rounded-2xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{guest.guest_name}</p>
                    {guest.guest_email && <p className="text-[11px] text-muted-foreground">{guest.guest_email}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${rsvpMeta.color}`}>{rsvpMeta.label}</span>
                    <button onClick={() => { setEditGuest(guest); setShowForm(true); }} className="p-1 rounded-full hover:bg-sand/60">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleDelete(guest.id)} className="p-1 rounded-full hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                  {guest.arrival_date && <div className="flex items-center gap-1"><CalendarHeart className="w-3 h-3" strokeWidth={1.5} /> Arr: {new Date(guest.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                  {guest.departure_date && <div className="flex items-center gap-1"><CalendarHeart className="w-3 h-3" strokeWidth={1.5} /> Dep: {new Date(guest.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                  {guest.ferry_needs && <div className="flex items-center gap-1"><Bus className="w-3 h-3" strokeWidth={1.5} /> Ferry: {guest.ferry_needs}</div>}
                  {guest.rental_home_assignment && <div className="flex items-center gap-1"><Home className="w-3 h-3" strokeWidth={1.5} /> {guest.rental_home_assignment}</div>}
                  {guest.golf_cart_needs && <div className="flex items-center gap-1"><Bus className="w-3 h-3" strokeWidth={1.5} /> Cart: {guest.golf_cart_needs}</div>}
                  {guest.childcare_needs && <div className="flex items-center gap-1"><Baby className="w-3 h-3" strokeWidth={1.5} /> {guest.childcare_needs}</div>}
                  {guest.welcome_bag && <div className="flex items-center gap-1"><Gift className="w-3 h-3 text-accent" strokeWidth={1.5} /> Welcome bag</div>}
                  {guest.dietary_restrictions && <div className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" strokeWidth={1.5} /> {guest.dietary_restrictions}</div>}
                  {guest.accessibility_notes && <div className="flex items-center gap-1"><Accessibility className="w-3 h-3" strokeWidth={1.5} /> {guest.accessibility_notes}</div>}
                  {guest.guest_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" strokeWidth={1.5} /> {guest.guest_phone}</div>}
                </div>
                {guest.notes && <p className="text-[11px] text-muted-foreground mt-2 italic">{guest.notes}</p>}
              </div>
            );
          })
        )}
      </div>

      {/* Guest form modal */}
      {showForm && (
        <GuestForm
          eventId={id}
          guest={editGuest}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries(['eventGuests', id]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function GuestForm({ eventId, guest, onClose, onSaved }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    guest_name: guest?.guest_name || '',
    guest_email: guest?.guest_email || '',
    guest_phone: guest?.guest_phone || '',
    arrival_date: guest?.arrival_date || '',
    departure_date: guest?.departure_date || '',
    ferry_needs: guest?.ferry_needs || '',
    rental_home_assignment: guest?.rental_home_assignment || '',
    golf_cart_needs: guest?.golf_cart_needs || '',
    childcare_needs: guest?.childcare_needs || '',
    welcome_bag: guest?.welcome_bag || false,
    dietary_restrictions: guest?.dietary_restrictions || '',
    accessibility_notes: guest?.accessibility_notes || '',
    rsvp_status: guest?.rsvp_status || 'invited',
    plus_ones: guest?.plus_ones || 0,
    notes: guest?.notes || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.guest_name) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const data = { ...form, plus_ones: Number(form.plus_ones), event_plan_id: eventId };
      if (guest?.id) {
        await base44.entities.EventGuest.update(guest.id, data);
      } else {
        await base44.entities.EventGuest.create(data);
      }
      toast({ title: guest?.id ? 'Guest updated' : 'Guest added' });
      onSaved();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="font-heading text-base text-foreground">{guest?.id ? 'Edit Guest' : 'Add Guest'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Guest Name *</label>
            <input type="text" value={form.guest_name} onChange={e => set('guest_name', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={form.guest_email} onChange={e => set('guest_email', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <input type="tel" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Arrival Date</label>
              <input type="date" value={form.arrival_date} onChange={e => set('arrival_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Departure Date</label>
              <input type="date" value={form.departure_date} onChange={e => set('departure_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ferry Needs</label>
            <input type="text" value={form.ferry_needs} onChange={e => set('ferry_needs', e.target.value)} placeholder="e.g. Friday 2pm ferry" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Rental Home Assignment</label>
            <input type="text" value={form.rental_home_assignment} onChange={e => set('rental_home_assignment', e.target.value)} placeholder="e.g. 123 Cape Creek Rd" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Golf Cart Needs</label>
            <input type="text" value={form.golf_cart_needs} onChange={e => set('golf_cart_needs', e.target.value)} placeholder="e.g. Needs 4-seat cart" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Childcare Needs</label>
            <input type="text" value={form.childcare_needs} onChange={e => set('childcare_needs', e.target.value)} placeholder="e.g. 2 children ages 3 & 5" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Dietary Restrictions</label>
            <input type="text" value={form.dietary_restrictions} onChange={e => set('dietary_restrictions', e.target.value)} placeholder="e.g. Vegetarian, nut allergy" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Accessibility Notes</label>
            <input type="text" value={form.accessibility_notes} onChange={e => set('accessibility_notes', e.target.value)} placeholder="e.g. Wheelchair access needed" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Plus Ones</label>
              <input type="number" min="0" value={form.plus_ones} onChange={e => set('plus_ones', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">RSVP Status</label>
              <select value={form.rsvp_status} onChange={e => set('rsvp_status', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
                {['invited', 'confirmed', 'declined', 'maybe'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.welcome_bag} onChange={e => set('welcome_bag', e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-xs text-muted-foreground">Prepare welcome bag</span>
          </label>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : guest?.id ? 'Update Guest' : 'Add Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}