import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import {
  ChevronLeft, Plus, Clock, MapPin, Trash2, Search, Loader2,
  CalendarDays, UtensilsCrossed, CalendarPlus, Download, GripVertical,
  X, Utensils, Ship, Waves, Sun,
} from 'lucide-react';

/* ── helpers ── */

function formatDateForICS(date, time) {
  if (!time) return null;
  const [h, m] = time.split(':');
  const d = new Date(`${date}T${time}:00`);
  return format(d, "yyyyMMdd'T'HHmmss");
}

function buildGoogleCalLink(title, date, time, location, notes) {
  if (!time) return null;
  const start = formatDateForICS(date, time);
  const end = format(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000, "yyyyMMdd'T'HHmmss");
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'BHI Plan',
    dates: `${start}/${end}`,
    details: notes || '',
    location: location || '',
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function buildICSFile(items, date) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BHI SuperApp//Itinerary//EN'];
  for (const item of items) {
    if (!item.time) continue;
    const start = formatDateForICS(date, item.time);
    const end = format(new Date(`${date}T${item.time}:00`).getTime() + 60 * 60 * 1000, "yyyyMMdd'T'HHmmss");
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id || item.title}@bhisuperapp`);
    lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${(item.title || '').replace(/[\r\n,]/g, ' ')}`);
    if (item.location) lines.push(`LOCATION:${item.location.replace(/[\r\n,]/g, ' ')}`);
    if (item.notes) lines.push(`DESCRIPTION:${item.notes.replace(/[\r\n,]/g, ' ')}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(items, date) {
  const ics = buildICSFile(items, date);
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BHI-Itinerary-${date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── search component ── */

function ItemSearchPanel({ date, onAdd }) {
  const [tab, setTab] = useState('events');
  const [query, setQuery] = useState('');

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['itineraryEvents', date],
    queryFn: () => base44.entities.IslandEvent.filter({
      start_date: date,
    }),
    enabled: tab === 'events',
  });

  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.filter({ is_open: true }),
    enabled: tab === 'restaurants',
  });

  const filteredEvents = useMemo(() => {
    if (!query) return events;
    const q = query.toLowerCase();
    return events.filter(e => e.title?.toLowerCase().includes(q) || e.location_name?.toLowerCase().includes(q));
  }, [events, query]);

  const filteredRestaurants = useMemo(() => {
    if (!query) return restaurants;
    const q = query.toLowerCase();
    return restaurants.filter(r => r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q));
  }, [restaurants, query]);

  const handleAdd = (item, type) => {
    const planItem = {
      title: item.title || item.name,
      category: type === 'event' ? 'event' : 'dining',
      location: item.location_name || item.address || item.location || '',
      notes: type === 'event' ? item.short_description || item.description || '' : item.cuisine || '',
      time: '',
      entity_id: item.id,
    };
    onAdd(planItem);
  };

  const isLoading = tab === 'events' ? loadingEvents : loadingRestaurants;
  const list = tab === 'events' ? filteredEvents : filteredRestaurants;

  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-luxe-sm">
      <div className="flex border-b border-border/30">
        <button
          onClick={() => { setTab('events'); setQuery(''); }}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'events' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted-foreground'}`}
        >
          <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} /> Events
        </button>
        <button
          onClick={() => { setTab('restaurants'); setQuery(''); }}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'restaurants' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted-foreground'}`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} /> Dining
        </button>
      </div>

      <div className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === 'events' ? 'Search events…' : 'Search restaurants…'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">{tab === 'events' ? 'No events found for this date' : 'No restaurants found'}</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
            {list.slice(0, 20).map(item => (
              <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-sand/40 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title || item.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.location_name || item.cuisine || item.address || 'Island'}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(item, tab === 'events' ? 'event' : 'dining')}
                  className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main page ── */

export default function BirdieItinerary() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pendingItems, setPendingItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingItems = [], isLoading } = useQuery({
    queryKey: ['itineraryPlanItems', user?.email, selectedDate],
    queryFn: () => base44.entities.PlanItem.filter({ user_email: user.email, date: selectedDate }),
    enabled: !!user?.email,
  });

  const allItems = useMemo(() => {
    const merged = [...existingItems, ...pendingItems];
    return merged.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  }, [existingItems, pendingItems]);

  const addPendingItem = useCallback((item) => {
    setPendingItems(prev => [...prev, { ...item, _pending: true, id: `pending-${Date.now()}` }]);
  }, []);

  const updatePendingItem = useCallback((id, updates) => {
    setPendingItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const removePendingItem = useCallback((id) => {
    setPendingItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.PlanItem.bulkCreate(
        pendingItems.map(i => ({
          user_email: user.email,
          title: i.title,
          category: i.category || 'other',
          date: selectedDate,
          time: i.time || '',
          location: i.location || '',
          notes: i.notes || '',
        }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryPlanItems', user?.email, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['todayPlanItems', user?.email] });
      setPendingItems([]);
    },
  });

  const handleDeleteExisting = async (id) => {
    await base44.entities.PlanItem.delete(id);
    queryClient.invalidateQueries({ queryKey: ['itineraryPlanItems', user?.email, selectedDate] });
    queryClient.invalidateQueries({ queryKey: ['todayPlanItems', user?.email] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMutation.mutateAsync();
    } finally {
      setSaving(false);
    }
  };

  const hasExportableItems = allItems.some(i => i.time);
  const todayLabel = format(parseISO(selectedDate), 'EEEE, MMM d');

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-3 px-5 h-14">
          <button onClick={() => window.history.back()} className="p-1.5 -ml-1.5 rounded-full hover:bg-foreground/5">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-base text-foreground">Day Itinerary Builder</h1>
            <p className="text-[10px] text-muted-foreground tracking-luxe-xs uppercase">{todayLabel}</p>
          </div>
          {hasExportableItems && (
            <button
              onClick={() => downloadICS(allItems, selectedDate)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-accent px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/15"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              .ics
            </button>
          )}
        </div>
      </div>

      {/* Date picker */}
      <div className="px-5 pt-4">
        <input
          type="date"
          value={selectedDate}
          onChange={e => { setSelectedDate(e.target.value); setPendingItems([]); }}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Timeline */}
      <div className="px-5 mt-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-heading text-lg text-foreground">Timeline</h2>
          <span className="text-[11px] text-muted-foreground">{allItems.length} item{allItems.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="h-24 bg-card rounded-2xl border border-border/30 animate-pulse" />
        ) : allItems.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-2xl p-6 text-center shadow-luxe-sm">
            <Sun className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground mb-1">Your day is a blank canvas</p>
            <p className="text-xs text-muted-foreground/70">Add events and dining below to build your itinerary</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allItems.map((item, idx) => {
              const isPending = item._pending;
              return (
                <div key={item.id || idx} className="bg-card border border-border/40 rounded-2xl p-3.5 shadow-luxe-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                        <button
                          onClick={() => isPending ? removePendingItem(item.id) : handleDeleteExisting(item.id)}
                          className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-[11px] text-muted-foreground truncate">{item.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative">
                          <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                          <input
                            type="time"
                            value={item.time || ''}
                            onChange={e => {
                              if (isPending) updatePendingItem(item.id, { time: e.target.value });
                            }}
                            disabled={!isPending}
                            className="pl-7 pr-2 py-1 rounded-lg bg-secondary text-xs font-medium border-0 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                          />
                        </div>
                        {item.time && (
                          <a
                            href={buildGoogleCalLink(item.title, selectedDate, item.time, item.location, item.notes)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-semibold text-accent px-2 py-1 rounded-full bg-accent/10 hover:bg-accent/15"
                          >
                            <CalendarPlus className="w-3 h-3" strokeWidth={1.5} />
                            Google Cal
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pendingItems.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-4 bg-accent text-accent-foreground rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
            {saving ? 'Saving…' : `Save ${pendingItems.length} Item${pendingItems.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Search & Add */}
      <div className="px-5 mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-heading text-lg text-foreground">Add to Your Day</h2>
        </div>
        <ItemSearchPanel date={selectedDate} onAdd={addPendingItem} />
      </div>

      {/* Quick add manual item */}
      <div className="px-5 mt-4">
        <button
          onClick={() => addPendingItem({ title: 'Custom Activity', category: 'other', time: '', location: '', notes: '' })}
          className="w-full border border-dashed border-border rounded-2xl py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Custom Activity
        </button>
      </div>

      {/* Tip */}
      {hasExportableItems && (
        <div className="px-5 mt-6">
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
            <Download className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-foreground">Export to Calendar</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Download the .ics file to import into Google Calendar, Apple Calendar, or Outlook. Or tap "Google Cal" on any timed item to add it individually.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}