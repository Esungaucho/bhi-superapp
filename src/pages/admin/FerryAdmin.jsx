import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  RefreshCw, Loader2, Ship, AlertTriangle, CheckCircle2, XCircle,
  Plus, Trash2, Settings, ExternalLink, Radio
} from 'lucide-react';

const VESSEL_STATUSES = ['active', 'inactive', 'maintenance', 'unknown'];

export default function FerryAdmin() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [tab, setTab] = useState('overview');

  const { data: statuses = [] } = useQuery({
    queryKey: ['ferryStatusAdmin'],
    queryFn: () => base44.entities.FerryStatus.list('-last_checked', 10),
  });
  const { data: vessels = [] } = useQuery({
    queryKey: ['ferryVesselsAdmin'],
    queryFn: () => base44.entities.FerryVessel.list(),
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ['ferryAnnouncementsAdmin'],
    queryFn: () => base44.entities.FerryAnnouncement.list('-date_published', 20),
  });

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('sync-ferry-status', {});
      setSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['ferryStatusAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ferryVesselsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ferryAnnouncementsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ferryStatus'] });
      queryClient.invalidateQueries({ queryKey: ['ferrySchedules'] });
      queryClient.invalidateQueries({ queryKey: ['ferryAnnouncements'] });
      queryClient.invalidateQueries({ queryKey: ['ferryVessels'] });
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || err.message });
    } finally {
      setSyncing(false);
    }
  };

  const updateVessel = async (id, data) => {
    await base44.entities.FerryVessel.update(id, data);
    queryClient.invalidateQueries({ queryKey: ['ferryVesselsAdmin'] });
    queryClient.invalidateQueries({ queryKey: ['ferryVessels'] });
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Ferry Management</h2>
      <p className="text-xs text-muted-foreground mb-4">Sync official ferry data and manage vessel tracking settings</p>

      {/* Sync */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Official Ferry Sync</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Fetches live status, schedule & announcements</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {syncResult && (
          <div className="mt-3 p-2.5 rounded-lg bg-secondary/30 text-[11px] space-y-1">
            {syncResult.error ? (
              <p className="text-destructive">Error: {syncResult.error}</p>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Status: <span className="font-semibold text-foreground">{syncResult.results?.status?.status || '—'}</span>
                  {' · '}Severity: <span className="font-semibold">{syncResult.results?.status?.severity || '—'}</span>
                </p>
                <p className="text-muted-foreground">
                  Schedule entries: <span className="font-semibold text-foreground">{syncResult.results?.schedule?.synced || 0}</span>
                  {' · '}Announcements: <span className="font-semibold text-foreground">{syncResult.results?.announcements?.new || 0} new</span>
                  {' · '}Vessels: <span className="font-semibold text-foreground">{syncResult.results?.vessels?.synced || 0}</span>
                </p>
                {syncResult.results?.errors?.length > 0 && (
                  <div className="text-destructive">
                    {syncResult.results.errors.map((e, i) => <p key={i}>{e}</p>)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {[
          { id: 'overview', label: 'Status History' },
          { id: 'vessels', label: 'Vessels' },
          { id: 'announcements', label: 'Announcements' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-2">
          {statuses.map(s => {
            const config = {
              on_time: { Icon: CheckCircle2, color: 'text-emerald-600' },
              delayed: { Icon: AlertTriangle, color: 'text-amber-600' },
              cancelled: { Icon: XCircle, color: 'text-red-600' },
              weather_impacted: { Icon: AlertTriangle, color: 'text-blue-600' },
              special_announcement: { Icon: AlertTriangle, color: 'text-purple-600' },
            }[s.status] || { Icon: AlertTriangle, color: 'text-muted-foreground' };
            const Icon = config.Icon;
            return (
              <div key={s.id} className="bg-card rounded-xl border border-border p-3 flex items-start gap-2.5">
                <Icon className={`w-4 h-4 ${config.color} mt-0.5 flex-shrink-0`} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground capitalize">{s.status.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {s.last_checked ? format(new Date(s.last_checked), 'MMM d, h:mm a') : '—'}
                    {s.active && <span className="ml-1.5 text-emerald-600 font-medium">· Active</span>}
                  </p>
                </div>
              </div>
            );
          })}
          {statuses.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No status records yet</p>}
        </div>
      )}

      {tab === 'vessels' && (
        <div className="space-y-2.5">
          {vessels.map(v => (
            <div key={v.id} className="bg-card rounded-xl border border-border p-3.5">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  v.gps_feed_enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  <Ship className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{v.vessel_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={v.status}
                      onChange={e => updateVessel(v.id, { status: e.target.value })}
                      className="text-[10px] border border-border rounded-md px-2 py-1 bg-background"
                    >
                      {VESSEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {v.source_url && (
                      <a href={v.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent flex items-center gap-0.5">
                        <ExternalLink className="w-2.5 h-2.5" /> Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                  <Radio className={`w-3 h-3 ${v.gps_feed_enabled ? 'text-emerald-500' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                  <span className="text-[10px] text-muted-foreground">GPS Feed: {v.gps_feed_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <button
                  onClick={() => updateVessel(v.id, { gps_feed_enabled: !v.gps_feed_enabled })}
                  className={`relative w-9 h-5 rounded-full transition-colors ${v.gps_feed_enabled ? 'bg-emerald-500' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${v.gps_feed_enabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          ))}
          {vessels.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No vessels synced yet. Run a sync to populate fleet data.</p>}
        </div>
      )}

      {tab === 'announcements' && (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  a.severity === 'critical' ? 'text-red-600' : a.severity === 'warning' ? 'text-amber-600' : 'text-muted-foreground'
                }`} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{a.title}</p>
                  {a.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    {a.date_published && <span>{format(new Date(a.date_published), 'MMM d, yyyy')}</span>}
                    {a.active && <span className="text-emerald-600">· Active</span>}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await base44.entities.FerryAnnouncement.update(a.id, { active: !a.active });
                    queryClient.invalidateQueries({ queryKey: ['ferryAnnouncementsAdmin'] });
                  }}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {a.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No announcements synced yet</p>}
        </div>
      )}
    </div>
  );
}