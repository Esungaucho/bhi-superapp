import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle, Globe,
  Clock, ChevronDown, ChevronUp, ShieldCheck, FileWarning, ScrollText,
  FileText, Plus, X, CalendarPlus, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import ManualEventForm from '@/components/admin/ManualEventForm';
import SyncLogList from '@/components/admin/SyncLogList';

export const OFFICIAL_SOURCES = [
  { key: 'old_baldy_foundation', name: 'Old Baldy Foundation', url: 'https://www.oldbaldy.org/events', type: 'html', automated: true },
  { key: 'bhi_conservancy', name: 'BHI Conservancy', url: 'https://bhic.org/calendar/', type: 'html', automated: true },
  { key: 'village_of_bhi', name: 'Village of Bald Head Island', url: 'https://villagebhi.org/residents-owners/view/village-calendar/', type: 'html', automated: true },
  { key: 'bald_head_association', name: 'Bald Head Association', url: 'https://www.baldheadassociation.com/calendar-bha', type: 'html', automated: true },
  { key: 'village_chapel', name: 'Village Chapel of BHI', url: 'https://www.villagechapelofbaldheadisland.com/calendars.html', type: 'html', automated: true },
  { key: 'shoals_club', name: 'Shoals Club', url: 'https://www.shoalsclub.com/events', type: 'html', automated: true },
  { key: 'bhi_club', name: 'Bald Head Island Club', url: 'https://www.bhiclub.net/', type: 'html', automated: true },
  { key: 'bhi_marina', name: 'Bald Head Island Marina', url: 'https://www.baldheadisland.com/marina', type: 'html', automated: true },
  { key: 'maritime_market', name: 'Maritime Market', url: 'https://www.maritimemarket.net/', type: 'html', automated: true },
  { key: 'bhi_limited', name: 'Bald Head Island Limited', url: 'https://www.baldheadisland.com/events-news', type: 'html', automated: true },
];

const STATUS_META = {
  connected: { label: 'Connected', color: 'text-emerald-600 bg-emerald-50', Icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-destructive bg-destructive/5', Icon: AlertCircle },
  needs_manual_setup: { label: 'Needs Manual Setup', color: 'text-amber-700 bg-amber-100', Icon: FileWarning },
  requires_admin_review: { label: 'Requires Admin Review', color: 'text-orange-600 bg-orange-50', Icon: AlertCircle },
  pending: { label: 'Not Synced', color: 'text-muted-foreground bg-secondary', Icon: Clock },
};

export default function EventSourceManager() {
  const [syncingSource, setSyncingSource] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [manualFormSource, setManualFormSource] = useState(null);
  const queryClient = useQueryClient();

  const { data: syncLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list('-created_date', 100),
  });

  // Latest log per source
  const latestLogPerSource = {};
  for (const log of syncLogs) {
    if (!latestLogPerSource[log.source_key]) {
      latestLogPerSource[log.source_key] = log;
    }
  }

  const handleSyncSource = async (sourceKey) => {
    setSyncingSource(sourceKey);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('sync-all-island-events', { source_key: sourceKey });
      setSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
      queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || err.message });
    } finally {
      setSyncingSource(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('sync-all-island-events', {});
      setSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
      queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || err.message });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Clear all sync logs?')) return;
    for (const log of syncLogs) {
      await base44.entities.SyncLog.delete(log.id);
    }
    queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Event Source Manager</h2>
      <p className="text-xs text-muted-foreground mb-5">Real events imported from official Bald Head Island sources. No AI-generated events.</p>

      {/* Global sync */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Events Only
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sync all {OFFICIAL_SOURCES.length} official sources</p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncingAll || syncingSource !== null}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40"
          >
            {syncingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {syncingAll ? 'Syncing All...' : 'Sync All Sources'}
          </button>
        </div>

        {syncResult && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1.5">
            {syncResult.error ? (
              <p className="text-xs text-destructive">Error: {syncResult.error}</p>
            ) : syncResult.sourceResults ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Sources: <span className="font-semibold text-foreground">{syncResult.sourcesSynced}</span> ·
                  Found: <span className="font-semibold">{syncResult.totalFound}</span> ·
                  New: <span className="font-semibold text-emerald-600">{syncResult.totalImported}</span> ·
                  Updated: <span className="font-semibold text-foreground">{syncResult.totalUpdated}</span> ·
                  Archived: <span className="font-semibold text-amber-600">{syncResult.totalArchived}</span> ·
                  Failed: <span className="font-semibold text-destructive">{syncResult.totalFailed}</span>
                </p>
                {syncResult.sourceResults.map((sr, i) => {
                  const meta = STATUS_META[sr.status] || STATUS_META.failed;
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <meta.Icon className={`w-3 h-3 ${meta.color.split(' ')[0]}`} />
                      <span className="font-medium text-foreground">{sr.source}</span>
                      <span className="text-muted-foreground">— {meta.label}</span>
                      {sr.eventsFound > 0 && <span className="text-muted-foreground">({sr.eventsFound} found, {sr.eventsImported} new{sr.eventsUpdated > 0 ? `, ${sr.eventsUpdated} updated` : ''})</span>}
                      {sr.eventsArchived > 0 && <span className="text-amber-600">· {sr.eventsArchived} archived</span>}
                      {sr.errors?.length > 0 && <span className="text-destructive italic">{sr.errors[0]}</span>}
                    </div>
                  );
                })}
              </>
            ) : syncResult.source ? (
              <>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{syncResult.source}</span> —
                  Found: <span className="font-semibold">{syncResult.eventsFound}</span> ·
                  New: <span className="font-semibold text-emerald-600">{syncResult.eventsImported}</span> ·
                  Updated: <span className="font-semibold text-foreground">{syncResult.eventsUpdated}</span> ·
                  Archived: <span className="font-semibold text-amber-600">{syncResult.eventsArchived}</span> ·
                  Failed: <span className="font-semibold text-destructive">{syncResult.eventsFailed}</span>
                </p>
                {syncResult.errors?.length > 0 && (
                  <p className="text-[10px] text-destructive">{syncResult.errors.join('; ')}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  New: <span className="font-semibold text-emerald-600">{syncResult.newEvents}</span> ·
                  Updated: <span className="font-semibold text-foreground">{syncResult.updatedEvents}</span> ·
                  Duplicates: <span className="font-semibold">{syncResult.duplicates}</span> ·
                  Failed: <span className="font-semibold text-destructive">{syncResult.totalFailed}</span>
                </p>
                {syncResult.sourceResults?.map((sr, i) => {
                  const meta = STATUS_META[sr.status] || STATUS_META.failed;
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <meta.Icon className={`w-3 h-3 ${meta.color.split(' ')[0]}`} />
                      <span className="font-medium text-foreground">{sr.source}</span>
                      <span className="text-muted-foreground">— {meta.label}</span>
                      {sr.eventsFound > 0 && <span className="text-muted-foreground">({sr.eventsFound} found, {sr.eventsImported} imported{sr.eventsFailed > 0 ? `, ${sr.eventsFailed} failed` : ''})</span>}
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

      {/* Source list */}
      <div className="space-y-2.5 mb-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-sm">Official Sources ({OFFICIAL_SOURCES.length})</p>
        {OFFICIAL_SOURCES.map(src => {
          const latestLog = latestLogPerSource[src.key];
          const status = latestLog?.status || 'pending';
          const meta = STATUS_META[status] || STATUS_META.pending;
          const Icon = meta.Icon;
          const isSyncing = syncingSource === src.key;
          const needsManual = (status === 'needs_manual_setup' || status === 'failed') && !src.automated;

          return (
            <div key={src.key} className="bg-card rounded-2xl border border-border p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {src.type === 'pdf' ? (
                    <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{src.name}</h3>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent break-all hover:underline">{src.url}</a>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] rounded-full px-2 py-0.5 font-semibold ${meta.color}`}>
                      <Icon className="w-2.5 h-2.5" /> {meta.label}
                    </span>
                    {src.type === 'pdf' && (
                      <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">PDF</span>
                    )}
                    {src.automated && (
                      <span className="text-[9px] bg-primary/10 text-primary rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Auto · 6h
                      </span>
                    )}
                    {latestLog && (
                      <>
                        <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                          {latestLog.events_imported || 0} imported
                        </span>
                        {latestLog.events_failed > 0 && (
                          <span className="text-[9px] bg-destructive/5 text-destructive rounded-full px-2 py-0.5">
                            {latestLog.events_failed} failed
                          </span>
                        )}
                        <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                          {format(new Date(latestLog.created_date), 'MMM d, h:mm a')}
                        </span>
                      </>
                    )}
                  </div>
                  {latestLog?.notes && needsManual && (
                    <p className="text-[10px] text-amber-700 mt-1.5 italic">{latestLog.notes}</p>
                  )}
                  {latestLog?.error_message && (
                    <p className="text-[10px] text-destructive mt-1.5">{latestLog.error_message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleSyncSource(src.key)}
                    disabled={isSyncing || syncingAll}
                    className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 border border-border hover:bg-secondary/40 disabled:opacity-40 transition-colors"
                  >
                    {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {isSyncing ? '...' : 'Sync'}
                  </button>
                  {needsManual && (
                    <button
                      onClick={() => setManualFormSource(src)}
                      className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Manual
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync log */}
      <SyncLogList logs={syncLogs} isLoading={logsLoading} onClearLogs={handleClearLogs} />

      {/* Manual event form modal */}
      {manualFormSource && (
        <ManualEventForm
          source={manualFormSource}
          onClose={() => setManualFormSource(null)}
          onSaved={() => {
            setManualFormSource(null);
            queryClient.invalidateQueries({ queryKey: ['islandEvents'] });
          }}
        />
      )}
    </div>
  );
}