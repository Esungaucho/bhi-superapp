import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isToday } from 'date-fns';
import { RefreshCw, Loader2, Ticket, Anchor, Megaphone, Map as MapIcon, Waves, ChevronDown, ChevronUp } from 'lucide-react';
import FerryStatusCard from '@/components/ferry/FerryStatusCard';
import FerryDepartureList from '@/components/ferry/FerryDepartureList';
import FerryAlerts from '@/components/ferry/FerryAlerts';
import FerryTrackerMap from '@/components/ferry/FerryTrackerMap';
import FerryQuickLinks from '@/components/ferry/FerryQuickLinks';

export default function FerryStatus() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [showAllSouthport, setShowAllSouthport] = useState(false);
  const [showAllBHI, setShowAllBHI] = useState(false);

  const { data: statusData = [], isLoading: statusLoading } = useQuery({
    queryKey: ['ferryStatus'],
    queryFn: () => base44.entities.FerryStatus.filter({ active: true }, '-last_checked', 1),
    refetchInterval: 60000,
  });
  const activeStatus = statusData[0];

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 200),
    refetchInterval: 60000,
  });

  const { data: announcements = [], isLoading: annLoading } = useQuery({
    queryKey: ['ferryAnnouncements'],
    queryFn: () => base44.entities.FerryAnnouncement.filter({ active: true }, '-date_published', 10),
    refetchInterval: 120000,
  });

  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ['ferryVessels'],
    queryFn: () => base44.entities.FerryVessel.list(),
  });

  const todaySchedules = schedules.filter(s => isToday(new Date(s.departure_time)));
  const southportDepartures = todaySchedules
    .filter(s => s.direction === 'to_island')
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
  const bhiDepartures = todaySchedules
    .filter(s => s.direction === 'to_mainland')
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

  const now = new Date();
  const nextDeparture = [...southportDepartures, ...bhiDepartures]
    .filter(s => new Date(s.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))[0];

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await base44.functions.invoke('sync-ferry-status', {});
      if (res.data?.error) setSyncError(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['ferryStatus'] });
      queryClient.invalidateQueries({ queryKey: ['ferrySchedules'] });
      queryClient.invalidateQueries({ queryKey: ['ferryAnnouncements'] });
      queryClient.invalidateQueries({ queryKey: ['ferryVessels'] });
    } catch (err) {
      setSyncError(err.response?.data?.error || err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl text-foreground flex items-center gap-2">
            <Anchor className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            Ferry Status
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live updates from the official BHI Ferry</p>
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

      {syncError && (
        <div className="mx-4 mb-3 bg-destructive/5 text-destructive text-xs rounded-lg px-3 py-2">
          {syncError}
        </div>
      )}

      <div className="px-4 space-y-5">
        {/* Today's Status */}
        <div>
          <SectionTitle icon={<Waves className="w-3.5 h-3.5" />} label="Today's Ferry Status" />
          <FerryStatusCard status={activeStatus} isLoading={statusLoading} />
        </div>

        {/* Next Departure */}
        {nextDeparture && (
          <div className="bg-gradient-to-br from-ocean/8 to-transparent rounded-2xl border border-ocean/15 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-ocean mb-1">Next Departure</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-heading font-semibold text-foreground">
                  {new Date(nextDeparture.departure_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nextDeparture.direction === 'to_island' ? 'Southport → BHI' : 'BHI → Southport'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">
                  {Math.round((new Date(nextDeparture.departure_time) - now) / 60000)} min
                </p>
                <p className="text-[10px] text-muted-foreground">until departure</p>
              </div>
            </div>
          </div>
        )}

        {/* Book Tickets Button */}
        <a
          href="https://www.baldheadislandferry.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-12 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-deep transition-colors"
        >
          <Ticket className="w-4 h-4" strokeWidth={1.5} />
          Book Ferry Tickets
        </a>

        {/* Southport Departures */}
        <div>
          <SectionTitle icon={<span className="text-sm">🚢</span>} label="Southport Departures" />
          <FerryDepartureList
            departures={showAllSouthport ? southportDepartures : southportDepartures}
            direction="to_island"
            title="Deep Point Marina → BHI"
            isLoading={schedulesLoading}
          />
          {southportDepartures.length > 4 && (
            <button
              onClick={() => setShowAllSouthport(!showAllSouthport)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAllSouthport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showAllSouthport ? 'Show Less' : `Show All (${southportDepartures.length})`}
            </button>
          )}
        </div>

        {/* BHI Departures */}
        <div>
          <SectionTitle icon={<span className="text-sm">🏝️</span>} label="BHI Departures" />
          <FerryDepartureList
            departures={bhiDepartures}
            direction="to_mainland"
            title="BHI → Deep Point Marina"
            isLoading={schedulesLoading}
          />
          {bhiDepartures.length > 4 && (
            <button
              onClick={() => setShowAllBHI(!showAllBHI)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAllBHI ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showAllBHI ? 'Show Less' : `Show All (${bhiDepartures.length})`}
            </button>
          )}
        </div>

        {/* Live Alerts / Announcements */}
        <div>
          <SectionTitle icon={<Megaphone className="w-3.5 h-3.5" />} label="Ferry Announcements" />
          <FerryAlerts announcements={announcements} isLoading={annLoading} />
        </div>

        {/* Ferry Tracker Map */}
        <div>
          <SectionTitle icon={<MapIcon className="w-3.5 h-3.5" />} label="Ferry Tracker" />
          <FerryTrackerMap vessels={vessels} />
        </div>

        {/* Quick Links */}
        <div>
          <SectionTitle icon={<span className="text-sm">🔗</span>} label="Ferry Tools & Info" />
          <FerryQuickLinks />
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[10px] text-muted-foreground">
            Data sourced from{' '}
            <a href="https://www.baldheadislandferry.com/status/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              baldheadislandferry.com
            </a>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Auto-refreshes every 60 seconds · Synced: {activeStatus?.last_checked ? new Date(activeStatus.last_checked).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}
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