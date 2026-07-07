import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Plus, Globe, RefreshCw, Trash2, CheckCircle2, AlertCircle,
  Rss, Code2, Brain, CalendarClock, ChevronDown, ChevronUp, Zap, Power
} from 'lucide-react';
import { EVENT_ORGANIZATIONS } from '@/lib/calendarConstants';

const STRATEGY_META = {
  json_ld: { label: 'JSON-LD Schema', Icon: Code2, color: 'text-emerald-600 bg-emerald-50' },
  ical: { label: 'iCal Feed', Icon: CalendarClock, color: 'text-blue-600 bg-blue-50' },
  rss: { label: 'RSS/Atom', Icon: Rss, color: 'text-purple-600 bg-purple-50' },
  html_llm: { label: 'AI Extraction', Icon: Brain, color: 'text-accent bg-accent/10' },
  auto: { label: 'Auto-Detect', Icon: Zap, color: 'text-amber-600 bg-amber-50' },
};

export default function EventSourceManager() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [syncResults, setSyncResults] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['eventSources'],
    queryFn: () => base44.entities.EventSource.filter({}, '-created_date', 100),
  });

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await base44.functions.invoke('analyze-event-source', { url: url.trim() });
      setAnalyzeResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['eventSources'] });
      if (res.data?.source?.id) setUrl('');
    } catch (err) {
      setAnalyzeResult({ error: err.response?.data?.error || err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSync = async (sourceId) => {
    setSyncingId(sourceId);
    try {
      const res = await base44.functions.invoke('sync-event-source', { source_id: sourceId });
      setSyncResults(prev => ({ ...prev, [sourceId]: res.data }));
      queryClient.invalidateQueries({ queryKey: ['eventSources'] });
    } catch (err) {
      setSyncResults(prev => ({ ...prev, [sourceId]: { error: err.response?.data?.error || err.message } }));
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggle = async (source) => {
    await base44.entities.EventSource.update(source.id, { is_active: !source.is_active, status: !source.is_active ? 'active' : 'disabled' });
    queryClient.invalidateQueries({ queryKey: ['eventSources'] });
  };

  const handleDelete = async (source) => {
    if (!confirm(`Delete "${source.name}"? This won't remove already-synced events.`)) return;
    await base44.entities.EventSource.delete(source.id);
    queryClient.invalidateQueries({ queryKey: ['eventSources'] });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-1">Event Source Manager</h2>
      <p className="text-xs text-muted-foreground mb-5">Paste any event page URL — the system auto-detects the best extraction method and syncs events into your calendar.</p>

      {/* Add URL input */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Add New Source</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://example.com/events"
              className="w-full bg-secondary/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || analyzing}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-40"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" strokeWidth={1.5} />}
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Analysis result */}
        {analyzeResult && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
            {analyzeResult.error ? (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="w-4 h-4" /> {analyzeResult.error}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-foreground">{analyzeResult.source?.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analyzeResult.source && (() => {
                    const meta = STRATEGY_META[analyzeResult.source.extraction_strategy] || STRATEGY_META.auto;
                    return (
                      <span className={`inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-semibold ${meta.color}`}>
                        <meta.Icon className="w-3 h-3" /> {meta.label}
                      </span>
                    );
                  })()}
                  {analyzeResult.source?.organization && (
                    <span className="text-[10px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5">{analyzeResult.source.organization}</span>
                  )}
                  {analyzeResult.detected?.feedUrl && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">Feed detected</span>
                  )}
                </div>
                {analyzeResult.source?.analysis_notes && (
                  <p className="text-[11px] text-muted-foreground">{analyzeResult.source.analysis_notes}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Estimated events: <span className="font-semibold text-foreground">{analyzeResult.source?.detected_event_count || 0}</span>
                </p>
                {analyzeResult.source?.id && (
                  <button
                    onClick={() => handleSync(analyzeResult.source.id)}
                    className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Sync now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sources list */}
      <div className="space-y-2.5">
        {sources.length === 0 && !analyzing && (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
            <p className="text-sm">No sources yet. Paste a URL above to get started.</p>
          </div>
        )}
        {sources.map(source => {
          const meta = STRATEGY_META[source.extraction_strategy] || STRATEGY_META.auto;
          const isExpanded = expandedId === source.id;
          const syncResult = syncResults[source.id];
          const lastResult = source.last_sync_result ? JSON.parse(source.last_sync_result) : null;
          const Icon = meta.Icon;

          return (
            <div key={source.id} className={`bg-card rounded-2xl border transition-all ${source.status === 'error' ? 'border-destructive/30' : 'border-border'} ${!source.is_active ? 'opacity-50' : ''}`}>
              <div className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground truncate">{source.name}</h3>
                      {source.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                      {source.status === 'active' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{source.url}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] rounded-full px-1.5 py-0.5 font-semibold ${meta.color}`}>
                        <Icon className="w-2.5 h-2.5" /> {meta.label}
                      </span>
                      {source.organization && (
                        <span className="text-[9px] bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5">{source.organization}</span>
                      )}
                      <span className="text-[9px] bg-foreground/5 text-muted-foreground rounded-full px-1.5 py-0.5">{source.sync_interval_hours}h</span>
                    </div>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : source.id)} className="p-1 rounded-lg hover:bg-sand/50">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-2.5 border-t border-border/50">
                  <button
                    onClick={() => handleSync(source.id)}
                    disabled={syncingId === source.id}
                    className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/5 rounded-full px-2.5 py-1.5 disabled:opacity-40"
                  >
                    {syncingId === source.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {syncingId === source.id ? 'Syncing...' : 'Sync'}
                  </button>
                  <button
                    onClick={() => handleToggle(source)}
                    className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1.5 ${source.is_active ? 'text-muted-foreground bg-secondary' : 'text-emerald-600 bg-emerald-50'}`}
                  >
                    <Power className="w-3.5 h-3.5" /> {source.is_active ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => handleDelete(source)}
                    className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sync result */}
                {syncResult && (
                  <div className="mt-2 p-2 rounded-lg bg-secondary/30">
                    {syncResult.error ? (
                      <p className="text-[11px] text-destructive">Error: {syncResult.error}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        New: <span className="font-semibold text-emerald-600">{syncResult.newEvents}</span> · Updated: <span className="font-semibold text-foreground">{syncResult.updatedEvents}</span> · Duplicates: <span className="font-semibold">{syncResult.duplicates}</span>
                        {syncResult.errors?.length > 0 && <span className="text-destructive"> · {syncResult.errors.length} errors</span>}
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
                    {source.feed_url && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Feed URL</p>
                        <p className="text-[11px] text-foreground break-all">{source.feed_url}</p>
                      </div>
                    )}
                    {source.analysis_notes && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Analysis Notes</p>
                        <p className="text-[11px] text-muted-foreground">{source.analysis_notes}</p>
                      </div>
                    )}
                    {source.sync_error && (
                      <div>
                        <p className="text-[10px] font-semibold text-destructive uppercase">Last Error</p>
                        <p className="text-[11px] text-destructive">{source.sync_error}</p>
                      </div>
                    )}
                    {lastResult && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Last Sync</p>
                        <p className="text-[11px] text-muted-foreground">
                          {source.last_synced ? new Date(source.last_synced).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Never'} ·
                          New: {lastResult.newEvents || 0} · Updated: {lastResult.updatedEvents || 0} · Total: {source.total_synced || 0}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Interval (hrs)</label>
                      <input
                        type="number"
                        defaultValue={source.sync_interval_hours}
                        min={1}
                        max={168}
                        className="w-16 bg-secondary/50 rounded-lg px-2 py-1 text-xs text-foreground"
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value);
                          if (val && val !== source.sync_interval_hours) {
                            await base44.entities.EventSource.update(source.id, { sync_interval_hours: val });
                            queryClient.invalidateQueries({ queryKey: ['eventSources'] });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}