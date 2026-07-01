import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Check, X, Star, Trash2 } from 'lucide-react';
import { EVENT_CATEGORIES, SEASONS, getCategory } from '@/lib/calendarConstants';

const SOURCE_TYPES = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'conservancy', label: 'Conservancy' },
  { id: 'ferry', label: 'Ferry' },
  { id: 'weather', label: 'Weather' },
  { id: 'community', label: 'Community' },
  { id: 'business', label: 'Business' },
  { id: 'official', label: 'Official' },
  { id: 'organization', label: 'Organization' },
];

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'create', label: 'Create' },
];

export default function EventManagement() {
  const [tab, setTab] = useState('pending');
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.IslandEvent.filter({}, '-created_date', 100),
  });

  if (!user) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground mt-1">You need admin permissions to manage events.</p>
      </div>
    );
  }

  const pendingEvents = events.filter(e => e.status === 'pending');
  const approvedEvents = events.filter(e => e.status === 'approved');

  const handleAction = async (event, action) => {
    if (action === 'approve') await base44.entities.IslandEvent.update(event.id, { status: 'approved' });
    else if (action === 'reject') await base44.entities.IslandEvent.update(event.id, { status: 'rejected' });
    else if (action === 'feature') await base44.entities.IslandEvent.update(event.id, { is_featured: !event.is_featured });
    else if (action === 'delete') await base44.entities.IslandEvent.delete(event.id);
    queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Event Management</h2>
      <p className="text-xs text-muted-foreground mb-5">Approve, feature, and manage island events</p>

      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${tab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}>
            {t.label}{t.id === 'pending' && pendingEvents.length > 0 ? ` (${pendingEvents.length})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : tab === 'create' ? (
        <CreateEventForm onCreated={() => { refresh(); setTab('approved'); }} />
      ) : (
        <div className="space-y-3">
          {(tab === 'pending' ? pendingEvents : approvedEvents).map(event => (
            <AdminEventRow key={event.id} event={event} onAction={handleAction} />
          ))}
          {((tab === 'pending' ? pendingEvents : approvedEvents).length === 0) && (
            <div className="text-center py-12 text-muted-foreground text-sm">No {tab} events</div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminEventRow({ event, onAction }) {
  const cat = getCategory(event.category);
  return (
    <div className="bg-card rounded-2xl border border-border p-3.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-semibold">{cat.emoji} {cat.label}</span>
        {event.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5">{format(new Date(event.start_time), 'EEE, MMM d · h:mm a')}</p>
      {event.source_name && <p className="text-[10px] text-muted-foreground mt-0.5">By: {event.source_name}</p>}
      {event.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
        {event.status === 'pending' ? (
          <>
            <button onClick={() => onAction(event, 'approve')} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1.5">
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button onClick={() => onAction(event, 'reject')} className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onAction(event, 'feature')} className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1.5 ${event.is_featured ? 'bg-amber-50 text-amber-600' : 'bg-accent/10 text-accent'}`}>
              <Star className="w-3.5 h-3.5" /> {event.is_featured ? 'Unfeature' : 'Feature'}
            </button>
            <button onClick={() => onAction(event, 'delete')} className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CreateEventForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'community_events',
    start_time: '', end_time: '', location_name: '',
    image_url: '', source_name: '', source_type: 'community',
    is_seasonal: false, season_type: 'none', is_featured: false, is_all_day: false,
    price_note: '', tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.start_time) return;
    setSaving(true);
    try {
      await base44.entities.IslandEvent.create({
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: 'approved',
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Title</label>
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} placeholder="Event title" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputCls} placeholder="Event description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
            {EVENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Source Type</label>
          <select value={form.source_type} onChange={e => setForm({...form, source_type: e.target.value})} className={inputCls}>
            {SOURCE_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Start Time</label>
          <input type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>End Time</label>
          <input type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Location</label>
        <input value={form.location_name} onChange={e => setForm({...form, location_name: e.target.value})} className={inputCls} placeholder="Where on the island" />
      </div>
      <div>
        <label className={labelCls}>Source / Organization Name</label>
        <input value={form.source_name} onChange={e => setForm({...form, source_name: e.target.value})} className={inputCls} placeholder="e.g. BHI Conservancy" />
      </div>
      <div>
        <label className={labelCls}>Image URL (optional)</label>
        <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className={inputCls} placeholder="https://..." />
      </div>
      <div>
        <label className={labelCls}>Price Note (optional)</label>
        <input value={form.price_note} onChange={e => setForm({...form, price_note: e.target.value})} className={inputCls} placeholder="e.g. Free, $25/person" />
      </div>
      <div>
        <label className={labelCls}>Tags (comma separated)</label>
        <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className={inputCls} placeholder="sunset, music, family" />
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.is_all_day} onChange={e => setForm({...form, is_all_day: e.target.checked})} /> All Day
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} /> Featured
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.is_seasonal} onChange={e => setForm({...form, is_seasonal: e.target.checked})} /> Seasonal
        </label>
      </div>
      {form.is_seasonal && (
        <div>
          <label className={labelCls}>Season Type</label>
          <select value={form.season_type} onChange={e => setForm({...form, season_type: e.target.value})} className={inputCls}>
            {SEASONS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>
        </div>
      )}
      <button onClick={handleSubmit} disabled={!form.title || !form.start_time || saving} className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-40">
        {saving ? 'Creating...' : 'Create Event'}
      </button>
    </div>
  );
}