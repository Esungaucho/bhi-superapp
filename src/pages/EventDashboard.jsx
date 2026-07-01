import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ChevronLeft, Users, FileText, ListChecks, ConciergeBell, CalendarHeart,
  DollarSign, Home, Bus, Baby, UtensilsCrossed, Camera, Flower2, Tent,
  CloudRain, CheckCircle2, Clock, CreditCard, Sparkles, MapPin, Bell
} from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_STATUS_META, BUDGET_LABELS, VENDOR_CATEGORIES } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: event, isLoading } = useQuery({
    queryKey: ['eventPlan', id],
    queryFn: () => base44.entities.EventPlan.get(id),
    enabled: !!id,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['eventGuests', id],
    queryFn: () => base44.entities.EventGuest.filter({ event_plan_id: id }),
    enabled: !!id,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['eventQuotes', id],
    queryFn: () => base44.entities.EventQuoteRequest.filter({ event_plan_id: id }),
    enabled: !!id,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['eventTimeline', id],
    queryFn: () => base44.entities.EventTimelineItem.filter({ event_plan_id: id }),
    enabled: !!id,
  });

  const { data: conciergeReqs = [] } = useQuery({
    queryKey: ['eventConciergeReqs', id],
    queryFn: () => base44.entities.EventConciergeRequest.filter({ event_plan_id: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!event) {
    return <div className="px-4 py-12 text-center text-sm text-muted-foreground">Event not found. <Link to="/events" className="text-accent">Back to Events</Link></div>;
  }

  const statusMeta = EVENT_STATUS_META[event.status] || EVENT_STATUS_META.planning;
  const dateStr = event.desired_date || event.date_range_start;
  const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const openQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'quoted').length;
  const bookedVendors = quotes.filter(q => q.status === 'booked' || q.status === 'accepted').length;
  const completedTasks = timeline.filter(t => t.is_completed).length;
  const paymentsDue = quotes.filter(q => q.status === 'accepted' && (q.payment_status === 'pending' || q.payment_status === 'deposit_paid')).length;
  const openConcierge = conciergeReqs.filter(r => r.status === 'open' || r.status === 'in_progress').length;

  // Vendor checklist
  const bookedCategories = new Set(quotes.filter(q => q.status === 'booked' || q.status === 'accepted').map(q => q.vendor_category));
  const requestedCategories = new Set(quotes.filter(q => q.status === 'pending' || q.status === 'quoted').map(q => q.vendor_category));

  const SUB_NAV = [
    { label: 'Guests', path: `/events/${id}/guests`, Icon: Users, count: guests.length },
    { label: 'Timeline', path: `/events/${id}/timeline`, Icon: ListChecks, count: timeline.length },
    { label: 'Quotes', path: `/events/${id}/requests`, Icon: FileText, count: quotes.length },
    { label: 'Concierge', path: `/events/${id}/concierge`, Icon: ConciergeBell, count: openConcierge },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate('/events')} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground truncate">{event.event_title || EVENT_TYPE_LABELS[event.event_type]}</h1>
        <GlobalMenu />
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Status banner */}
        <div className={`rounded-xl p-3 flex items-center justify-between ${statusMeta.color}`}>
          <p className="text-sm font-medium">{statusMeta.label}</p>
          <span className="text-[10px] uppercase tracking-luxe-sm">{EVENT_TYPE_LABELS[event.event_type]}</span>
        </div>

        {/* Sub-navigation */}
        <div className="grid grid-cols-4 gap-2">
          {SUB_NAV.map(({ label, path, Icon, count }) => (
            <Link key={path} to={path} className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-accent/40 transition-colors">
              <div className="relative">
                <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                {count > 0 && <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{count}</span>}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>

        {/* Event Overview */}
        <Card title="Event Overview" Icon={CalendarHeart}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Info label="Date" value={dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} />
            <Info label="Guests" value={`${event.estimated_guest_count} estimated`} />
            <Info label="Budget" value={BUDGET_LABELS[event.budget_range] || 'Not set'} />
            <Info label="Planning" value={event.planning_help_type === 'have_planner' ? event.planner_name || 'Has planner' : event.planning_help_type === 'need_planner' ? 'Needs planner' : 'Compass Concierge'} />
          </div>
          {event.ceremony_location_preference && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" strokeWidth={1.5} /> {event.ceremony_location_preference}
            </div>
          )}
        </Card>

        {/* Concierge Help CTA */}
        <Link to={`/events/${id}/concierge`} className="block bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/90 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <ConciergeBell className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ask Compass Concierge</p>
            <p className="text-[11px] text-primary-foreground/70">Get help with vendors, logistics, or anything else</p>
          </div>
          <ChevronLeft className="w-4 h-4 rotate-180" strokeWidth={1.5} />
        </Link>

        {/* Budget & Guest Count */}
        <div className="grid grid-cols-2 gap-3">
          <Card title="Budget" Icon={DollarSign} compact>
            <p className="text-xl font-bold text-foreground">{BUDGET_LABELS[event.budget_range]?.split('–')[0] || 'TBD'}</p>
            <p className="text-[10px] text-muted-foreground">{BUDGET_LABELS[event.budget_range] || 'Set a budget range'}</p>
          </Card>
          <Card title="Guest Count" Icon={Users} compact>
            <p className="text-xl font-bold text-foreground">{confirmedGuests}/{guests.length || event.estimated_guest_count}</p>
            <p className="text-[10px] text-muted-foreground">{confirmedGuests} confirmed RSVPs</p>
          </Card>
        </div>

        {/* Vendor Checklist */}
        <Card title="Vendor Checklist" Icon={CheckCircle2}>
          <div className="grid grid-cols-2 gap-1.5">
            {VENDOR_CATEGORIES.slice(0, 10).map(({ id: catId, label }) => {
              const isBooked = bookedCategories.has(catId);
              const isRequested = requestedCategories.has(catId);
              return (
                <Link key={catId} to="/events/vendors" className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-full ${isBooked ? 'bg-emerald-500' : isRequested ? 'bg-amber-400' : 'bg-border'}`} />
                  <span className={isBooked ? 'text-foreground font-medium' : 'text-muted-foreground'}>{label.split(' ')[0]}</span>
                </Link>
              );
            })}
            <Link to="/events/vendors" className="text-[10px] text-accent font-medium">Browse all →</Link>
          </div>
        </Card>

        {/* Logistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MiniCard Icon={Home} label="Housing" value={event.accommodation_needs} />
          <MiniCard Icon={Bus} label="Ferry & Transport" value={event.transportation_needs} />
          <MiniCard Icon={Baby} label="Childcare" value={event.childcare_needs} />
          <MiniCard Icon={CloudRain} label="Weather Backup" value={event.weather_backup_plan || 'Not set'} />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MiniCard Icon={UtensilsCrossed} label="Catering" value={event.catering_needs} />
          <MiniCard Icon={Camera} label="Photography" value={event.photography_videography_needs} />
          <MiniCard Icon={Flower2} label="Florals & Decor" value={event.floral_decor_needs} />
          <MiniCard Icon={Tent} label="Rentals" value={event.rental_equipment_needs} />
        </div>

        {/* Open Requests */}
        <Card title="Open Requests" Icon={Clock}>
          {openQuotes > 0 ? (
            <div className="space-y-1.5">
              {quotes.filter(q => q.status === 'pending' || q.status === 'quoted').slice(0, 3).map(q => (
                <Link key={q.id} to={`/events/${id}/requests`} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{q.vendor_name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${q.status === 'quoted' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {q.status === 'quoted' ? 'Quote received' : 'Awaiting'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No open requests. <Link to="/events/vendors" className="text-accent">Browse vendors →</Link></p>
          )}
        </Card>

        {/* Confirmed Bookings */}
        <Card title="Confirmed Bookings" Icon={CheckCircle2}>
          {bookedVendors > 0 ? (
            <p className="text-xs text-muted-foreground">{bookedVendors} vendor{bookedVendors !== 1 ? 's' : ''} confirmed</p>
          ) : (
            <p className="text-xs text-muted-foreground">No confirmed bookings yet</p>
          )}
        </Card>

        {/* Payments Due */}
        <Card title="Payments Due" Icon={CreditCard}>
          {paymentsDue > 0 ? (
            <p className="text-xs text-muted-foreground">{paymentsDue} payment{paymentsDue !== 1 ? 's' : ''} pending</p>
          ) : (
            <p className="text-xs text-muted-foreground">No payments due</p>
          )}
        </Card>

        {/* Concierge Notes */}
        {event.concierge_notes && (
          <Card title="Concierge Notes" Icon={Sparkles}>
            <p className="text-xs text-muted-foreground leading-relaxed">{event.concierge_notes}</p>
          </Card>
        )}

        {/* Admin notes (only for admins) */}
        {user?.role === 'admin' && event.admin_notes && (
          <Card title="Admin Notes" Icon={Bell}>
            <p className="text-xs text-muted-foreground leading-relaxed">{event.admin_notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, Icon, children, compact }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4">
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-navy" strokeWidth={1.5} />
          <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground">{title}</p>
        </div>
      )}
      {compact && (
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5 text-navy" strokeWidth={1.5} />
          <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">{title}</p>
        </div>
      )}
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function MiniCard({ Icon, label, value }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-navy" strokeWidth={1.5} />
        <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{value || 'Not specified'}</p>
    </div>
  );
}