import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Anchor, Ticket, Bus, RefreshCw, Loader2, ChevronRight, Clock,
  AlertTriangle, Megaphone, Ship, ExternalLink, MapPin, Calendar,
  ArrowRight, Info
} from 'lucide-react';
import FerryStatusCard from '@/components/ferry/FerryStatusCard';
import FerryAlerts from '@/components/ferry/FerryAlerts';
import TramInfo from '@/components/ferry/TramInfo';

const OFFICIAL_URLS = {
  tickets: 'https://www.baldheadislandferry.com/tickets/',
  tram: 'https://www.baldheadislandferry.com/tram/',
  schedule: 'https://www.baldheadislandferry.com/schedule/',
  status: 'https://www.baldheadislandferry.com/status/',
  main: 'https://www.baldheadislandferry.com/',
};

export default function FerryTramHub() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [direction, setDirection] = useState('to_island');
  const [scheduleType, setScheduleType] = useState('passenger');

  const { data: allStatuses = [], isLoading: statusLoading } = useQuery({
    queryKey: ['ferryStatus'],
    queryFn: () => base44.entities.FerryStatus.filter({ active: true }, '-last_checked', 10),
    refetchInterval: 60000,
  });
  const adminOverrides = allStatuses.filter(s => s.is_admin_override);
  const syncedStatus = allStatuses.find(s => !s.is_admin_override);

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 300),
    refetchInterval: 60000,
  });

  const { data: announcements = [], isLoading: annLoading } = useQuery({
    queryKey: ['ferryAnnouncements'],
    queryFn: () => base44.entities.FerryAnnouncement.filter({ active: true }, '-date_published', 10),
    refetchInterval: 120000,
  });

  const now = new Date();
  const todaySchedules = useMemo(() => schedules.filter(s => isToday(new Date(s.departure_time))), [schedules]);

  const nextToBHI = todaySchedules
    .filter(s => s.direction === 'to_island' && new Date(s.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  const nextToMainland = todaySchedules
    .filter(s => s.direction === 'to_mainland' && new Date(s.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  const filteredSchedule = todaySchedules
    .filter(s => s.direction === direction && (s.schedule_type || 'passenger') === scheduleType)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

  const lastSynced = syncedStatus?.last_checked
    || schedules[0]?.last_synced
    || null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('sync-ferry-status', {});
      queryClient.invalidateQueries({ queryKey: ['ferryStatus'] });
      queryClient.invalidateQueries({ queryKey: ['ferrySchedules'] });
      queryClient.invalidateQueries({ queryKey: ['ferryAnnouncements'] });
    } catch {}
    setSyncing(false);
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl text-foreground flex items-center gap-2">
            <Anchor className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            Ferry + Tram
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Official Bald Head Island Transportation</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-2 border border-border bg-card hover:bg-sand/30 disabled:opacity-40 transition-colors"
        >
          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />}
          {syncing ? 'Syncing' : 'Refresh'}
        </button>
      </div>

      <div className="px-4 space-y-5">
        {/* Admin Override Banner(s) */}
        {adminOverrides.map(o => (
          <div key={o.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Megaphone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-amber-700">Urgent Update</p>
                <p className="text-sm font-medium text-foreground mt-1">{o.message}</p>
                <p className="text-[10px] text-amber-600 mt-1.5 capitalize">{o.status.replace(/_/g, ' ')} · {o.severity}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Live Status Card */}
        <div>
          <SectionTitle icon={<Ship className="w-3.5 h-3.5" />} label="Live Ferry Status" />
          <FerryStatusCard status={syncedStatus} isLoading={statusLoading} />
        </div>

        {/* Next Departures */}
        <div className="bg-gradient-to-br from-ocean/8 to-transparent rounded-2xl border border-ocean/15 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-ocean mb-3">Next Departures</p>
          <div className="grid grid-cols-2 gap-4">
            <NextDepartureCell label="To BHI" sublabel="Southport → Island" departure={nextToBHI} now={now} />
            <NextDepartureCell label="To Southport" sublabel="Island → Southport" departure={nextToMainland} now={now} />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2.5">
          <ActionButton
            href={OFFICIAL_URLS.tickets}
            icon={<Ticket className="w-4 h-4 text-ocean" strokeWidth={1.5} />}
            title="Buy Ferry Tickets"
            description="Purchase tickets on the official ferry website"
          />
          <ActionButton
            href={OFFICIAL_URLS.tram}
            icon={<Bus className="w-4 h-4 text-ocean" strokeWidth={1.5} />}
            title="Book Ferry + Tram Reservation"
            description="Reserve ferry and tram service together"
          />
          <ActionButton
            href={OFFICIAL_URLS.main}
            icon={<Calendar className="w-4 h-4 text-ocean" strokeWidth={1.5} />}
            title="Manage Reservation"
            description="View or modify existing reservations"
          />
        </div>

        {/* Full Schedule */}
        <div>
          <SectionTitle icon={<Clock className="w-3.5 h-3.5" />} label="Today's Schedule" />

          {/* Direction Toggle */}
          <div className="flex gap-1 bg-secondary/60 rounded-full p-1 mb-3">
            <button
              onClick={() => setDirection('to_island')}
              className={`flex-1 text-xs font-medium py-2 rounded-full transition-colors ${direction === 'to_island' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Southport → BHI
            </button>
            <button
              onClick={() => setDirection('to_mainland')}
              className={`flex-1 text-xs font-medium py-2 rounded-full transition-colors ${direction === 'to_mainland' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              BHI → Southport
            </button>
          </div>

          {/* Schedule Type Filter */}
          <div className="flex gap-1.5 mb-3">
            <button
              onClick={() => setScheduleType('passenger')}
              className={`text-[11px] font-medium px-3 py-1 rounded-full transition-colors ${scheduleType === 'passenger' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
            >
              Passenger
            </button>
            <button
              onClick={() => setScheduleType('contractor')}
              className={`text-[11px] font-medium px-3 py-1 rounded-full transition-colors ${scheduleType === 'contractor' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
            >
              Contractor
            </button>
          </div>

          {/* Schedule List */}
          {schedulesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium">No {scheduleType} departures found</p>
              <a href={OFFICIAL_URLS.schedule} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block">
                View official schedule →
              </a>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredSchedule.map((s, i) => {
                const depTime = new Date(s.departure_time);
                const isPast = depTime < now;
                const isNext = (direction === 'to_island' && s.id === nextToBHI?.id) ||
                              (direction === 'to_mainland' && s.id === nextToMainland?.id);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                      isNext
                        ? 'bg-ocean/8 border-ocean/20'
                        : isPast
                          ? 'bg-card border-border/30 opacity-50'
                          : 'bg-card border-border/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isNext ? 'bg-ocean/15' : 'bg-sand/40'}`}>
                      <Clock className={`w-4 h-4 ${isNext ? 'text-ocean' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isPast && !isNext ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {depTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.departure_location}
                        {s.vessel_name && ` · ${s.vessel_name}`}
                      </p>
                    </div>
                    {isNext && (
                      <span className="text-[9px] font-bold text-ocean bg-ocean/10 rounded-full px-2 py-0.5">NEXT</span>
                    )}
                    {s.notes && (
                      <span className="text-[9px] text-amber-600">{s.notes}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div>
            <SectionTitle icon={<Megaphone className="w-3.5 h-3.5" />} label="Announcements" />
            <FerryAlerts announcements={announcements} isLoading={annLoading} />
          </div>
        )}

        {/* Tram Information */}
        <TramInfo />

        {/* Ferry Tools Links */}
        <div>
          <SectionTitle icon={<Info className="w-3.5 h-3.5" />} label="More Ferry Tools" />
          <div className="space-y-2">
            <ToolLink to="/ferry/status" title="Live Ferry Status" description="Full status, tracker map & fleet" />
            <ToolLink to="/ferry/map" title="Ferry Tracker Map" description="Track ferries crossing the Cape Fear" />
            <ToolLink to="/ferry/eta" title="AI Time Tracker" description="AI-powered arrival estimates" />
            <ToolLink to="/ferry/parking" title="Parking Information" description="Parking at Deep Point Marina" />
            <ToolLink to="/ferry/bookings" title="My Ferry Bookings" description="View your reservations" />
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-secondary/30 rounded-xl p-3.5 border border-border/30">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            Ferry times and tram availability are provided by Bald Head Island Transportation.
            Always confirm final reservations and tickets through the{' '}
            <a href={OFFICIAL_URLS.main} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              official ferry website
            </a>.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-1 pb-2">
          {lastSynced && (
            <p className="text-[10px] text-muted-foreground">
              Last synced: {new Date(lastSynced).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              {' · '}Auto-syncs every 15 min
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Data from{' '}
            <a href={OFFICIAL_URLS.main} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              baldheadislandferry.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-xs font-semibold text-foreground uppercase tracking-luxe-sm">{label}</h2>
    </div>
  );
}

function NextDepartureCell({ label, sublabel, departure, now }) {
  if (!departure) {
    return (
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/60">{sublabel}</p>
        <p className="text-sm font-medium text-muted-foreground mt-1">No more today</p>
      </div>
    );
  }
  const minsUntil = Math.round((new Date(departure.departure_time) - now) / 60000);
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[9px] text-muted-foreground/60">{sublabel}</p>
      <p className="text-lg font-heading font-semibold text-foreground mt-0.5">
        {new Date(departure.departure_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </p>
      <p className="text-[10px] text-ocean font-medium">
        {minsUntil <= 0 ? 'Boarding now' : minsUntil < 60 ? `in ${minsUntil} min` : `in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`}
      </p>
    </div>
  );
}

function ActionButton({ href, icon, title, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3.5 shadow-luxe-sm hover:shadow-luxe transition-all"
    >
      <span className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{description}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
    </a>
  );
}

function ToolLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 bg-card rounded-xl border border-border/50 p-3 hover:bg-sand/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
    </Link>
  );
}