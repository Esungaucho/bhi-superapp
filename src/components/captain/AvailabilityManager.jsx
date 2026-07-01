import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STATUS_META = {
  available: { label: 'Available', color: 'text-emerald-600 bg-emerald-50' },
  last_minute: { label: 'Last Minute', color: 'text-amber-600 bg-amber-50' },
  full: { label: 'Full', color: 'text-red-600 bg-red-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500 bg-gray-100' },
};

export default function AvailabilityManager({ charter }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['captainAvailability', charter.id],
    queryFn: () => base44.entities.CaptainAvailability.filter({ charter_id: charter.id }, 'trip_date'),
  });

  const [form, setForm] = useState({
    trip_date: '',
    trip_label: '',
    max_passengers: charter.max_passengers || 6,
    price: charter.price_from || 0,
    is_last_minute: false,
    notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.trip_date || !form.trip_label) {
      toast({ title: 'Trip date and label are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CaptainAvailability.create({
        ...form,
        charter_id: charter.id,
        captain_name: charter.captain_name,
        owner_email: charter.owner_email,
        status: form.is_last_minute ? 'last_minute' : 'available',
        booked_passengers: 0,
      });
      // Notify saved users
      try {
        await base44.functions.invoke('notifyCaptainAvailability', {
          charter_id: charter.id,
          captain_name: charter.captain_name,
        });
      } catch (e) { /* notification is best-effort */ }
      toast({ title: 'Availability posted — saved captains notified!' });
      setForm({ trip_date: '', trip_label: '', max_passengers: charter.max_passengers || 6, price: charter.price_from || 0, is_last_minute: false, notes: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['captainAvailability', charter.id] });
    } catch (e) {
      toast({ title: 'Failed to post availability', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    await base44.entities.CaptainAvailability.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['captainAvailability', charter.id] });
    toast({ title: `Marked as ${STATUS_META[status].label}` });
  };

  const handleDelete = async (id) => {
    await base44.entities.CaptainAvailability.delete(id);
    queryClient.invalidateQueries({ queryKey: ['captainAvailability', charter.id] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">Trip Availability</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs font-medium text-accent">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Close' : 'Add Trip'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Trip Date & Time</label>
            <input type="datetime-local" value={form.trip_date} onChange={e => set('trip_date', e.target.value)}
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Trip Label</label>
            <input value={form.trip_label} onChange={e => set('trip_label', e.target.value)} placeholder="e.g. 4hr Inshore Morning"
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Max Passengers</label>
              <input type="number" value={form.max_passengers} onChange={e => set('max_passengers', +e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Price ($)</label>
              <input type="number" value={form.price} onChange={e => set('price', +e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional details..."
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_last_minute} onChange={e => set('is_last_minute', e.target.checked)} className="rounded" />
            <span className="text-sm">⚡ Last-minute opening</span>
          </label>
          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Post & Notify
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : availability.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No trips posted yet. Add one to notify your saved anglers.</p>
      ) : (
        <div className="space-y-2">
          {availability.map(a => {
            const meta = STATUS_META[a.status] || STATUS_META.available;
            const spotsLeft = a.max_passengers - (a.booked_passengers || 0);
            return (
              <div key={a.id} className="bg-card rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.trip_label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(a.trip_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                      {new Date(a.trip_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {spotsLeft} / {a.max_passengers} spots</span>
                  {a.price > 0 && <span>${a.price}</span>}
                </div>
                <div className="flex gap-1.5 mt-2">
                  {a.status !== 'full' && (
                    <button onClick={() => updateStatus(a.id, 'full')} className="text-[10px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">Mark Full</button>
                  )}
                  {a.status === 'full' && (
                    <button onClick={() => updateStatus(a.id, 'available')} className="text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Reopen</button>
                  )}
                  {a.status !== 'last_minute' && a.status !== 'full' && (
                    <button onClick={() => updateStatus(a.id, 'last_minute')} className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">⚡ Last Minute</button>
                  )}
                  {a.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(a.id, 'cancelled')} className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">Cancel</button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-red-500 ml-auto flex items-center gap-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}