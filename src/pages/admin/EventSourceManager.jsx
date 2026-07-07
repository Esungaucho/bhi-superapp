import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle, Globe,
  Clock, ChevronDown, ChevronUp, Zap, ShieldCheck, FileWarning, ScrollText
} from 'lucide-react';
import { format } from 'date-fns';

const OFFICIAL_SOURCES = [
  { name: 'Bald Head Island Limited', url: 'https://www.baldheadisland.com/events-news', source: 'bhi_limited' },
  { name: 'Village of Bald Head Island — Calendar', url: 'https://villagebhi.org/residents-owners/view/village-calendar/', source: 'village_of_bhi' },
  { name: 'Village of Bald Head Island — Announcements', url: 'https://villagebhi.org/announcements/', source: 'village_of_bhi' },
  { name: 'BHI Conservancy', url: 'https://bhic.org/calendar/', source: 'bhi_conservancy' },
  { name: 'Bald Head Association', url: 'https://www.baldheadassociation.com/calendar-bha', source: 'bald_head_association' },
  { name: 'Old Baldy Foundation', url: 'https://www.oldbaldy.org/', source: 'old_baldy_foundation' },
];

const STATUS_META = {
  success: { label: 'Synced', color: 'text-emerald-600 bg-emerald-50', Icon: CheckCircle2 },
  partial: { label: 'Partial', color: 'text-amber-600 bg-amber-50', Icon: AlertCircle },
  failed: { label: 'Failed', color: 'text-destructive bg-destructive/5', Icon: AlertCircle },
  needs_manual_setup: { label: 'Needs Manual Setup', color: 'text-amber-700 bg-amber-100', Icon: FileWarning },
};

export default function EventSourceManager() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: syncLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list('-created_date', 50),
  });
  const { data: events = [] } = useQuery({
    queryKey: ['adminEventCount'],
    queryFn: () => base44.entities.IslandEvent.list('-created_date', 200),
  });

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('sync-island-events', {});
      setSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventCount'] });
      queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || err.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Clear all sync logs?')) return;
    for (const log of syncLogs) {
      await base44.entities.SyncLog.delete(log.id);
    }
    queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
  };

  // Group latest log per source
  const latestLogPerSource = {};
  for (const log of syncLogs) {
    if (!latestLogPerSource[log.source_url]) {
      latestLogPerSource[log.source_url] = log;
    }
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Event Source Manager</h2>
      <p className="text-xs text-muted-foreground mb-5">Real events imported from official Bald Head Island sources. No AI-generated events.</p>

      {/* Sync button */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Events Only
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{events.length} real events in database</p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? 'Syncing...' : 'Sync Events Now'}
          </button>
        </div>

        {/* Sync result summary */}
        {syncResult && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1.5">
            {syncResult.error ? (
              <p className="text-xs text-destructive">Error: {syncResult.error}</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  New: <span className="font-semibold text-emerald-600">{syncResult.newEvents}</span> ·
                  Updated: <span className="font-semibold text-foreground">{syncResult.updatedEvents}</span> ·
                  Duplicates: <span className="font-semibold">{syncResult.duplicates}</span> ·
                  Expired removed: <span className="font-semibold">{syncResult.expiredRemoved || 0}</span>
                </p>
                {syncResult.sourceResults?.map((sr, i) => {
                  const meta = STATUS_META[sr.status] || STATUS_META.failed;
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <meta.Icon className={`w-3 h-3 ${meta.color.split(' ')[0]}`} />
                      <span className="font-medium text-foreground">{sr.source}</span>
                      <span className="text-muted-foreground">— {meta.label}</span>
                      {sr.eventsFound > 0 && <span className="text-muted-foreground">({sr.eventsFound} found, {sr.eventsImported} imported)</span>}
                      {sr.notes && <span className="text-amber-600 italic">{sr.notes}</span>}
                      {sr.error && <span className="text-destructive">{sr.error}</span>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Official sources list */}
      <div className="space-y-2.5 mb-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-sm">Official Sources</p>
        {OFFICIAL_SOURCES.map(src => {
          const latestLog = latestLogPerSource[src.url];
          const status = latestLog?.status || 'pending';
          const meta = STATUS_META[status] || { label: 'Not Synced', color: 'text-muted-foreground bg-secondary', Icon: Clock };
          const Icon = meta.Icon;

          return (
            <div key={src.url} className="bg-card rounded-2xl border border-border p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{src.name}</h3>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent break-all hover:underline">{src.url}</a>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] rounded-full px-2 py-0.5 font-semibold ${meta.color}`}>
                      <Icon className="w-2.5 h-2.5" /> {meta.label}
                    </span>
                    {latestLog && (
                      <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                        {latestLog.events_imported || 0} imported
                      </span>
                    )}
                    {latestLog?.last_synced && (
                      <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                        {format(new Date(latestLog.created_date), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                  {latestLog?.notes && status === 'needs_manual_setup' && (
                    <p className="text-[10px] text-amber-700 mt-1.5 italic">{latestLog.notes}</p>
                  )}
                  {latestLog?.error_message && (
                    <p className="text-[10px] text-destructive mt-1.5">{latestLog.error_message}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync log */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-sm flex items-center gap-1">
            <ScrollText className="w-3 h-3" /> Sync Log
          </p>
          {syncLogs.length > 0 && (
            <button onClick={handleClearLogs} className="text-[10px] text-destructive hover:underline">Clear logs</button>
          )}
        </div>
        {logsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
        ) : syncLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">No sync attempts yet. Click "Sync Events Now" to start.</div>
        ) : (
          <div className="space-y-1.5">
            {syncLogs.slice(0, 20).map((log, i) => {
              const meta = STATUS_META[log.status] || STATUS_META.failed;
              const Icon = meta.Icon;
              const isExpanded = expandedLog === i;
              return (
                <div key={log.id} className="bg-card rounded-xl border border-border p-3">
                  <button onClick={() => setExpandedLog(isExpanded ? null : i)} className="w-full flex items-center gap-2 text-left">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${meta.color.split(' ')[0]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{log.source_name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {format(new Date(log.created_date), 'MMM d, h:mm a')} ·
                        Found: {log.events_found} · Imported: {log.events_imported}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-[11px]">
                      <p className="text-muted-foreground break-all">{log.source_url}</p>
                      <p className="text-muted-foreground">Status: <span className="font-semibold">{meta.label}</span></p>
                      <p className="text-muted-foreground">Updated: {log.events_updated} · Duplicates: {log.duplicates_skipped}</p>
                      {log.error_message && <p className="text-destructive">Error: {log.error_message}</p>}
                      {log.notes && <p className="text-amber-700 italic">{log.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}