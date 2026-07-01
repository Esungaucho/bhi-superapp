import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, LayoutDashboard, Compass, Users, ListChecks, FileText, ConciergeBell, CalendarHeart, Sparkles } from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_STATUS_META, BUDGET_LABELS } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

const NAV_CARDS = [
  { label: 'Start an Event', path: '/events/start', Icon: Plus, desc: 'Begin planning a new celebration' },
  { label: 'My Event Dashboard', path: '/events', Icon: LayoutDashboard, desc: 'Manage your active event plans', scroll: true },
  { label: 'Vendors & Services', path: '/events/vendors', Icon: Compass, desc: 'Browse curated local partners' },
  { label: 'Concierge Help', path: '/events/concierge', Icon: ConciergeBell, desc: 'Ask our team for personalized help' },
];

export default function EventsHub() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['myEventPlans'],
    queryFn: () => base44.entities.EventPlan.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <Link to="/dashboard" className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </Link>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-6">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Bald Head Island</p>
          <h1 className="font-heading text-2xl text-white mt-1">Events & Weddings</h1>
          <p className="text-xs text-white/70 mt-1">Your concierge for destination celebrations</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8 space-y-6">
        {/* Concierge banner */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 shadow-luxe">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Planning a destination event?</p>
            <p className="text-[11px] text-primary-foreground/70 mt-0.5">Our concierge team reduces complexity and coordinates the island's trusted network for you.</p>
          </div>
          <Link to="/events/concierge" className="text-[11px] font-medium bg-white/15 rounded-full px-3 py-1.5 whitespace-nowrap">Get Help</Link>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-3">
          {NAV_CARDS.map(({ label, path, Icon, desc }) => (
            <Link
              key={label}
              to={path}
              className="bg-card border border-border/50 rounded-2xl p-4 hover:border-accent/40 transition-colors group"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent mb-3 group-hover:bg-accent group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
            </Link>
          ))}
        </div>

        {/* My Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg text-foreground">My Event Plans</h2>
            <Link to="/events/start" className="text-xs font-medium text-accent flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> New
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : events.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
              <CalendarHeart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">No event plans yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start planning your celebration on Bald Head Island</p>
              <Link to="/events/start" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-accent">
                <Plus className="w-4 h-4" strokeWidth={1.5} /> Start an Event
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => {
                const statusMeta = EVENT_STATUS_META[evt.status] || EVENT_STATUS_META.planning;
                const dateStr = evt.desired_date || evt.date_range_start;
                return (
                  <Link
                    key={evt.id}
                    to={`/events/dashboard/${evt.id}`}
                    className="block bg-card border border-border/50 rounded-2xl p-4 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-foreground">{evt.event_title || EVENT_TYPE_LABELS[evt.event_type]}</p>
                        <p className="text-[11px] text-muted-foreground">{EVENT_TYPE_LABELS[evt.event_type]}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusMeta.color}`}>{statusMeta.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      {dateStr && <span className="flex items-center gap-1"><CalendarHeart className="w-3 h-3" strokeWidth={1.5} />{new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" strokeWidth={1.5} />{evt.estimated_guest_count} guests</span>
                      {evt.budget_range && <span>{BUDGET_LABELS[evt.budget_range]}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}