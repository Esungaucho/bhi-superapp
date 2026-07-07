import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Check, X, Star, Trash2, RefreshCw, MapPin, ExternalLink, Clock } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_ORGANIZATIONS, SEASONS, getCategory, getOrganization } from '@/lib/calendarConstants';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'synced', label: 'Synced' },
  { id: 'approved', label: 'Approved' },
  { id: 'create', label: 'Create' },
];

export default function EventManagement() {
  const [tab, setTab] = useState('pending');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.IslandEvent.filter({}, '-created_date', 200),
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
  const syncedEvents = events.filter(e => e.status === 'synced');
  const approvedEvents = events.filter(e => e.status === 'approved');

  const handleAction = async (event, action) => {
    if (action === 'approve') await base44.entities.IslandEvent.update(event.id, { status: 'approved' });
    else if (action === 'reject') await base44.entities.IslandEvent.update(event.id, { status: 'rejected' });
    else if (action === 'feature') await base44.entities.IslandEvent.update(event.id, { featured: !event.featured, is_featured: !event.featured });
    else if (action === 'delete') await base44.entities.IslandEvent.delete(event.id);
    else if (action === 'override') await base44.entities.IslandEvent.update(event.id, { admin_override: !event.admin_override });
    queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('sync-island-events', {});
      setSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
    } catch (err) {
      setSyncResult({ error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const currentEvents = tab === 'pending' ? pendingEvents : tab === 'synced' ? syncedEvents : tab === 'approved' ? approvedEvents : [];

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Event Management</h2>
      <p className="text-xs text-muted-foreground mb-5">Approve, feature, and manage island events</p>

      {/* Sync section */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Auto-Sync Sources</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Aggregates events from 7+ island organizations</p>
          </div>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full px-3 py-1.5 disabled:opacity-40">
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {syncResult && (
          <div className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
            {syncResult.error ? (
              <p className="text-destructive">Error: {syncResult.error}</p>
            ) : (
              <p>New: {syncResult.newEvents || 0} · Updated: {syncResult.updatedEvents || 0} · Duplicates: {syncResult.duplicates || 0} · Expired removed: {syncResult.expiredRemoved || 0}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${tab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}>
            {t.label}
            {t.id === 'pending' && pendingEvents.length > 0 ? ` (${pendingEvents.length})` : ''}
            {t.id === 'synced' && syncedEvents.length > 0 ? ` (${syncedEvents.length})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : tab === 'create' ? (
        <CreateEventForm onCreated={() => { queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); queryClient.invalidateQueries({ queryKey: ['islandEvents'] }); setTab('approved'); }} />
      ) : (
        <div className="space-y-3">
          {currentEvents.map(event => (
            <AdminEventRow key={event.id} event={event} onAction={handleAction} />
          ))}
          {currentEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No {tab} events</div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminEventRow({ event, onAction }) {
  const cat = getCategory(event.category);
  const org = event.organization ? getOrganization(event.organization) : null;
  return (
    <div className="bg-card rounded-2xl border border-border p-3.5">
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-semibold">
          {cat.Icon && <cat.Icon className="w-3 h-3" strokeWidth={1.5} />} {cat.label}
        </span>
        {event.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        {event.admin_override && <span className="text-[9px] bg-ocean/10 text-ocean rounded-full px-1.5 py-0.5 font-semibold">Override</span>}
        {event.member_only && <span className="text-[9px] bg-foreground/10 text-foreground rounded-full px-1.5 py-0.5 font-semibold">Members</span>}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        <Clock className="w-2.5 h-2.5 inline mr-1" />
        {format(new Date(event.start_time), 'EEE, MMM d · h:mm a')}
      </p>
      {event.location_name && <p className="text-[10px] text-muted-foreground mt-0.5"><MapPin className="w-2.5 h-2.5 inline mr-1" />{event.location_name}</p>}
      {org && org.label !== 'Unknown' && org.label !== 'Admin (Manual)' && (
        <p className="text-[10px] text-muted-foreground mt-0.5">By: {org.label}</p>
      )}
      {event.source_url && (
        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
          <ExternalLink className="w-2.5 h-2.5" /> Source
        </a>
      )}
      {event.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
        {event.status !== 'approved' ? (
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
            <button onClick={() => onAction(event, 'feature')} className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1.5 ${event.featured ? 'bg-amber-50 text-amber-600' : 'bg-accent/10 text-accent'}`}>
              <Star className="w-3.5 h-3.5" /> {event.featured ? 'Unfeature' : 'Feature'}
            </button>
            <button onClick={() => onAction(event, 'override')} className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1.5 ${event.admin_override ? 'bg-ocean/10 text-ocean' : 'bg-secondary text-muted-foreground'}`}>
              {event.admin_override ? 'Unlocked' : 'Lock Edit'}
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
    title: '', description: '', short_description: '', category: 'community',
    start_time: '', end_time: '', location_name: '', address: '',
    latitude: '', longitude: '', featured_image: '',
    organization: 'admin_manual', registration_required: false, registration_url: '',
    member_only: false, featured: false, all_day: false, recurring: false, recurrence_note: '',
    is_seasonal: false, season_type: 'none', price_note: '', tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.start_time) return;
    setSaving(true);
    try {
      const lat = form.latitude ? parseFloat(form.latitude) : undefined;
      const lng = form.longitude ? parseFloat(form.longitude) : undefined;
      await base44.entities.IslandEvent.create({
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
        latitude: lat,
        longitude: lng,
        is_all_day: form.all_day,
        is_featured: form.featured,
        is_recurring: form.recurring,
        source: form.organization,
        source_name: getOrganization(form.organization).label,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: 'approved',
        admin_override: true,
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
        <label className={labelCls}>Short Description</label>
        <input value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} className={inputCls} placeholder="One sentence teaser" />
      </div>
      <div>
        <label className={labelCls}>Full Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputCls} placeholder="Full event description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
            {EVENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Organization</label>
          <select value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} className={inputCls}>
            {EVENT_ORGANIZATIONS.map(o => <option key={o.id} value={o.source}>{o.label}</option>)}
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
        <label className={labelCls}>Location Name</label>
        <input value={form.location_name} onChange={e => setForm({...form, location_name: e.target.value})} className={inputCls} placeholder="Venue or location" />
      </div>
      <div>
        <label className={labelCls}>Address</label>
        <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputCls} placeholder="Street address" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Latitude</label>
          <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className={inputCls} placeholder="33.8676" />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className={inputCls} placeholder="-78.0056" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Featured Image URL</label>
        <input value={form.featured_image} onChange={e => setForm({...form, featured_image: e.target.value})} className={inputCls} placeholder="https://..." />
      </div>
      <div>
        <label className={labelCls}>Price Note</label>
        <input value={form.price_note} onChange={e => setForm({...form, price_note: e.target.value})} className={inputCls} placeholder="e.g. Free, $25/person" />
      </div>
      <div>
        <label className={labelCls}>Tags (comma separated)</label>
        <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className={inputCls} placeholder="sunset, music, family" />
      </div>
      {form.registration_required && (
        <div>
          <label className={labelCls}>Registration URL</label>
          <input value={form.registration_url} onChange={e => setForm({...form, registration_url: e.target.value})} className={inputCls} placeholder="https://..." />
        </div>
      )}
      {form.recurring && (
        <div>
          <label className={labelCls}>Recurrence Note</label>
          <input value={form.recurrence_note} onChange={e => setForm({...form, recurrence_note: e.target.value})} className={inputCls} placeholder="e.g. Every Tuesday" />
        </div>
      )}
      {form.is_seasonal && (
        <div>
          <label className={labelCls}>Season Type</label>
          <select value={form.season_type} onChange={e => setForm({...form, season_type: e.target.value})} className={inputCls}>
            {SEASONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.all_day} onChange={e => setForm({...form, all_day: e.target.checked})} /> All Day
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Featured
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.member_only} onChange={e => setForm({...form, member_only: e.target.checked})} /> Members Only
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.registration_required} onChange={e => setForm({...form, registration_required: e.target.checked})} /> Registration Required
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.recurring} onChange={e => setForm({...form, recurring: e.target.checked})} /> Recurring
        </label>
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked={form.is_seasonal} onChange={e => setForm({...form, is_seasonal: e.target.checked})} /> Seasonal
        </label>
      </div>
      <button onClick={handleSubmit} disabled={!form.title || !form.start_time || saving} className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-40">
        {saving ? 'Creating...' : 'Create Event'}
      </button>
    </div>
  );
}