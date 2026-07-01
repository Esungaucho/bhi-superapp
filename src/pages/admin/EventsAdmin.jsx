import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  CalendarHeart, Users, ChevronLeft, Search, BadgeCheck, Star, ShieldCheck,
  Loader2, MessageSquare, X, FileText, DollarSign, ConciergeBell
} from 'lucide-react';
import {
  EVENT_TYPE_LABELS, EVENT_STATUS_META, BUDGET_LABELS, VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABELS, PRICE_RANGE_LABELS, QUOTE_STATUS_META, CONCIERGE_HELP_TYPES, URGENCY_LEVELS
} from '@/lib/eventConstants';
import { useUserAccess } from '@/hooks/useUserAccess';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventsAdmin() {
  const [tab, setTab] = useState('events');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showAdmin } = useUserAccess();

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['allEventPlans'],
    queryFn: () => base44.asServiceRole.entities.EventPlan.list('-created_date', 100),
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['allEventVendors'],
    queryFn: () => base44.asServiceRole.entities.EventVendor.list('-created_date', 100),
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['allEventQuotes'],
    queryFn: () => base44.asServiceRole.entities.EventQuoteRequest.list('-created_date', 200),
  });

  const { data: conciergeReqs = [] } = useQuery({
    queryKey: ['allConciergeReqs'],
    queryFn: () => base44.asServiceRole.entities.EventConciergeRequest.list('-created_date', 100),
  });

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.event_title?.toLowerCase().includes(q) || e.user_email?.toLowerCase().includes(q) || e.user_name?.toLowerCase().includes(q) || EVENT_TYPE_LABELS[e.event_type]?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, search, statusFilter]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (statusFilter !== 'all' && v.approval_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return v.name?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [vendors, search, statusFilter]);

  const updateEvent = async (eventId, data) => {
    try {
      await base44.asServiceRole.entities.EventPlan.update(eventId, data);
      queryClient.invalidateQueries(['allEventPlans']);
      toast({ title: 'Event updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateVendor = async (vendorId, data) => {
    try {
      await base44.asServiceRole.entities.EventVendor.update(vendorId, data);
      queryClient.invalidateQueries(['allEventVendors']);
      toast({ title: 'Vendor updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateConciergeReq = async (reqId, data) => {
    try {
      await base44.asServiceRole.entities.EventConciergeRequest.update(reqId, data);
      queryClient.invalidateQueries(['allConciergeReqs']);
      toast({ title: 'Request updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pendingVendors = vendors.filter(v => v.approval_status === 'pending');
  const openConcierge = conciergeReqs.filter(r => r.status === 'open' || r.status === 'in_progress');

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h1 className="font-heading text-lg text-foreground">Events Admin</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{events.length}</p>
          <p className="text-[10px] text-muted-foreground">Events</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{vendors.length}</p>
          <p className="text-[10px] text-muted-foreground">Vendors</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{pendingVendors.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-destructive">{openConcierge.length}</p>
          <p className="text-[10px] text-muted-foreground">Open Help</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/50">
        {[
          { key: 'events', label: 'Events', count: events.length },
          { key: 'vendors', label: 'Vendors', count: vendors.length },
          { key: 'quotes', label: 'Quotes', count: quotes.length },
          { key: 'concierge', label: 'Help', count: openConcierge.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter('all'); }}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === key ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'}`}
          >
            {label}
            {count > 0 && key === 'concierge' && <span className="ml-1 bg-destructive text-white text-[9px] rounded-full px-1.5">{count}</span>}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      {tab !== 'concierge' && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-card border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="all">All</option>
            {tab === 'events'
              ? ['planning', 'in_progress', 'confirmed', 'completed', 'archived'].map(s => <option key={s} value={s}>{s}</option>)
              : ['pending', 'approved', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)
            }
          </select>
        </div>
      )}

      {/* Events tab */}
      {tab === 'events' && (
        <div className="space-y-2">
          {eventsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No events found.</p>
          ) : (
            filteredEvents.map(evt => {
              const meta = EVENT_STATUS_META[evt.status] || EVENT_STATUS_META.planning;
              const dateStr = evt.desired_date || evt.date_range_start;
              return (
                <div key={evt.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{evt.event_title || EVENT_TYPE_LABELS[evt.event_type]}</p>
                      <p className="text-[11px] text-muted-foreground">{evt.user_name || evt.user_email}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    {dateStr && <span className="flex items-center gap-1"><CalendarHeart className="w-3 h-3" strokeWidth={1.5} />{new Date(dateStr).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" strokeWidth={1.5} />{evt.estimated_guest_count}</span>
                    {evt.budget_range && <span>{BUDGET_LABELS[evt.budget_range]}</span>}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setSelectedEvent(evt)} className="text-xs bg-sand text-foreground rounded-full px-2.5 py-1 font-medium">Details</button>
                    <select
                      value={evt.status}
                      onChange={e => updateEvent(evt.id, { status: e.target.value })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0"
                    >
                      {['planning', 'in_progress', 'confirmed', 'completed', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Assign concierge..."
                      defaultValue={evt.assigned_concierge || ''}
                      onBlur={e => e.target.value !== (evt.assigned_concierge || '') && updateEvent(evt.id, { assigned_concierge: e.target.value })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0 flex-1"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Vendors tab */}
      {tab === 'vendors' && (
        <div className="space-y-2">
          {vendorsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filteredVendors.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No vendors found.</p>
          ) : (
            filteredVendors.map(vendor => {
              const catMeta = VENDOR_CATEGORIES.find(c => c.id === vendor.category);
              const CatIcon = catMeta?.Icon;
              return (
                <div key={vendor.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    {vendor.photos?.[0] ? (
                      <img src={vendor.photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
                        {CatIcon && <CatIcon className="w-5 h-5 text-navy" strokeWidth={1.5} />}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        {vendor.name}
                        {vendor.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2} />}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{VENDOR_CATEGORY_LABELS[vendor.category]} · {PRICE_RANGE_LABELS[vendor.price_range]}</p>
                    </div>
                  </div>
                  {vendor.admin_notes && <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-1.5 mb-2">{vendor.admin_notes}</p>}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateVendor(vendor.id, { approval_status: 'approved', is_verified: true })}
                      className={`text-xs rounded-full px-2.5 py-1 font-medium ${vendor.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateVendor(vendor.id, { approval_status: 'suspended', is_verified: false })}
                      className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => updateVendor(vendor.id, { is_featured: !vendor.is_featured })}
                      className={`text-xs rounded-full px-2.5 py-1 font-medium ${vendor.is_featured ? 'bg-primary text-primary-foreground' : 'bg-sand text-muted-foreground'}`}
                    >
                      Featured
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Quotes tab */}
      {tab === 'quotes' && (
        <div className="space-y-2">
          {quotes.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No quote requests.</p>
          ) : (
            quotes.map(quote => {
              const meta = QUOTE_STATUS_META[quote.status] || QUOTE_STATUS_META.pending;
              return (
                <div key={quote.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{quote.vendor_name}</p>
                      <p className="text-[11px] text-muted-foreground">{quote.user_name} · {VENDOR_CATEGORY_LABELS[quote.vendor_category]}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  </div>
                  {quote.service_details && <p className="text-xs text-muted-foreground mt-1 bg-sand/30 rounded p-2">{quote.service_details}</p>}
                  {quote.quoted_price && <p className="text-sm font-medium text-emerald-600 mt-1">Quoted: ${quote.quoted_price.toLocaleString()}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={quote.status}
                      onChange={e => base44.asServiceRole.entities.EventQuoteRequest.update(quote.id, { status: e.target.value }).then(() => queryClient.invalidateQueries(['allEventQuotes']))}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0"
                    >
                      {['pending', 'quoted', 'accepted', 'declined', 'expired', 'booked'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      value={quote.payment_status || 'not_applicable'}
                      onChange={e => base44.asServiceRole.entities.EventQuoteRequest.update(quote.id, { payment_status: e.target.value }).then(() => queryClient.invalidateQueries(['allEventQuotes']))}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0"
                    >
                      {['not_applicable', 'pending', 'deposit_paid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Concierge requests tab */}
      {tab === 'concierge' && (
        <div className="space-y-2">
          {conciergeReqs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No concierge requests.</p>
          ) : (
            conciergeReqs.map(req => {
              const urgency = URGENCY_LEVELS.find(u => u.id === req.urgency);
              const helpType = CONCIERGE_HELP_TYPES.find(t => t.id === req.help_type);
              return (
                <div key={req.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{helpType?.label || req.help_type}</p>
                      <p className="text-[11px] text-muted-foreground">{req.user_name}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${urgency?.color}`}>{urgency?.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                  {req.admin_response && <div className="mt-2 bg-accent/5 rounded-lg p-2"><p className="text-[11px] text-accent font-medium">Response:</p><p className="text-xs text-muted-foreground">{req.admin_response}</p></div>}
                  <div className="flex gap-1.5 mt-2">
                    <select
                      value={req.status}
                      onChange={e => updateConciergeReq(req.id, { status: e.target.value, resolved_at: e.target.value === 'resolved' ? new Date().toISOString() : undefined })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0"
                    >
                      {['open', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Assign to..."
                      defaultValue={req.assigned_to || ''}
                      onBlur={e => e.target.value !== (req.assigned_to || '') && updateConciergeReq(req.id, { assigned_to: e.target.value })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0 flex-1"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} quotes={quotes.filter(q => q.event_plan_id === selectedEvent.id)} onClose={() => setSelectedEvent(null)} onUpdate={updateEvent} />
      )}
    </div>
  );
}

function EventDetailModal({ event, quotes, onClose, onUpdate }) {
  const [notes, setNotes] = useState(event.concierge_notes || '');
  const [adminNotes, setAdminNotes] = useState(event.admin_notes || '');

  const dateStr = event.desired_date || event.date_range_start;
  const statusMeta = EVENT_STATUS_META[event.status] || EVENT_STATUS_META.planning;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="font-heading text-base text-foreground">{event.event_title || EVENT_TYPE_LABELS[event.event_type]}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className={`rounded-xl p-3 ${statusMeta.color}`}>
            <p className="text-sm font-medium">{statusMeta.label} · {EVENT_TYPE_LABELS[event.event_type]}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-[10px] text-muted-foreground uppercase">Host</p><p className="font-medium text-foreground">{event.user_name}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Email</p><p className="font-medium text-foreground">{event.user_email}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Date</p><p className="font-medium text-foreground">{dateStr ? new Date(dateStr).toLocaleDateString() : 'TBD'}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Guests</p><p className="font-medium text-foreground">{event.estimated_guest_count}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Budget</p><p className="font-medium text-foreground">{BUDGET_LABELS[event.budget_range] || 'TBD'}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Planning</p><p className="font-medium text-foreground">{event.planning_help_type.replace(/_/g, ' ')}</p></div>
          </div>
          {event.ceremony_location_preference && <div className="bg-sand/30 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase mb-0.5">Location</p><p className="text-xs text-foreground">{event.ceremony_location_preference}</p></div>}
          {event.accommodation_needs && <div className="bg-sand/30 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase mb-0.5">Accommodation</p><p className="text-xs text-foreground">{event.accommodation_needs}</p></div>}
          {event.catering_needs && <div className="bg-sand/30 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase mb-0.5">Catering</p><p className="text-xs text-foreground">{event.catering_needs}</p></div>}
          {event.transportation_needs && <div className="bg-sand/30 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase mb-0.5">Transportation</p><p className="text-xs text-foreground">{event.transportation_needs}</p></div>}

          {/* Quotes summary */}
          {quotes.length > 0 && (
            <div>
              <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Quote Requests ({quotes.length})</p>
              <div className="space-y-1.5">
                {quotes.map(q => {
                  const meta = QUOTE_STATUS_META[q.status];
                  return (
                    <div key={q.id} className="flex items-center justify-between text-xs bg-card border border-border/50 rounded-lg p-2">
                      <span className="text-foreground">{q.vendor_name}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${meta?.color}`}>{meta?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Concierge notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Concierge Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} onBlur={() => notes !== (event.concierge_notes || '') && onUpdate(event.id, { concierge_notes: notes })} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Admin Notes</label>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} onBlur={() => adminNotes !== (event.admin_notes || '') && onUpdate(event.id, { admin_notes: adminNotes })} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}