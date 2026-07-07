import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Ship, Ticket, ParkingSquare, Clock, Bus, Car, Bike, Anchor,
  Navigation, Share2, MapPin, Sparkles, Loader2, Check, ChevronRight
} from 'lucide-react';

const SECTIONS = [
  { label: 'Ferry Schedule', path: '/ferry', Icon: Ship },
  { label: 'Ferry Ticket Reservations', path: '/ferry/book', Icon: Ticket },
  { label: 'Ferry Parking Information', path: '/ferry/parking', Icon: ParkingSquare },
  { label: 'Long-Term Parking', path: '/ferry/parking', Icon: Clock },
  { label: 'Tram Information', path: '/ferry/parking', Icon: Bus },
  { label: 'Golf Cart Transportation', path: '/equipment', Icon: Car },
  { label: 'Bike Rentals', path: '/equipment', Icon: Bike },
  { label: 'Marina Transportation', path: '/experiences', Icon: Anchor },
  { label: 'Taxi / Shuttle Services', path: '/experiences', Icon: Navigation },
  { label: 'Ride Share Information', path: '/experiences', Icon: Share2 },
  { label: 'Car Locator', path: '/car-locator', Icon: MapPin },
];

export default function TransportationParking() {
  const [valetOpen, setValetOpen] = useState(false);

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="font-heading text-xl text-foreground mb-1">Transportation & Parking</h1>
      <p className="text-xs text-muted-foreground mb-5">Everything you need to get to, from, and around the island</p>

      <div className="space-y-2.5 mb-6">
        {SECTIONS.map(({ label, path, Icon }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3.5 shadow-luxe-sm hover:shadow-luxe transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </Link>
        ))}
      </div>

      <ValetCard onJoin={() => setValetOpen(true)} />
      {valetOpen && <ValetForm onClose={() => setValetOpen(false)} />}
    </div>
  );
}

function ValetCard({ onJoin }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean to-ocean-deep p-5 text-primary-foreground">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold uppercase tracking-luxe-xs">Coming Soon</span>
        </div>
        <h3 className="font-heading text-lg mb-1">Premium Valet Service</h3>
        <p className="text-xs text-primary-foreground/80 leading-relaxed mb-4">
          We are exploring valet options to make arrival and departure even easier.
        </p>
        <button
          onClick={onJoin}
          className="bg-primary-foreground text-ocean rounded-full px-5 py-2.5 text-xs font-semibold tracking-luxe-xs"
        >
          Join Valet Waitlist
        </button>
      </div>
    </div>
  );
}

function ValetForm({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', arrival_date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) return;
    setSaving(true);
    try {
      await base44.entities.ValetWaitlist.create({ user_email: '', ...form });
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ['valetWaitlist'] });
    } catch {
      alert('Failed to join waitlist.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-6" onClick={onClose}>
        <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-600" strokeWidth={1.5} />
          </div>
          <h3 className="font-heading text-lg text-foreground mb-1">You're on the list!</h3>
          <p className="text-xs text-muted-foreground mb-4">We'll contact you when valet service launches.</p>
          <button onClick={onClose} className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading text-lg text-foreground mb-4">Join Valet Waitlist</h3>
        <div className="space-y-3">
          <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Input label="Phone" type="tel" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Expected Arrival Date" type="date" value={form.arrival_date} onChange={v => setForm({ ...form, arrival_date: v })} />
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={2}
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name || !form.email || !form.phone}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Waitlist'}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}