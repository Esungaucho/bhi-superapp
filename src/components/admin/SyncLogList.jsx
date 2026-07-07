import React, { useState } from 'react';
import { Loader2, ChevronDown, ChevronUp, ScrollText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_META = {
  connected: { label: 'Connected', color: 'text-emerald-600', Icon: '✓' },
  failed: { label: 'Failed', color: 'text-destructive', Icon: '✕' },
  needs_manual_setup: { label: 'Needs Manual Setup', color: 'text-amber-700', Icon: '!' },
  requires_admin_review: { label: 'Requires Review', color: 'text-orange-600', Icon: '?' },
};

const METHOD_LABELS = {
  json_ld: 'JSON-LD',
  llm_html: 'LLM (HTML)',
  llm_pdf: 'LLM (PDF)',
  manual: 'Manual',
  auto: 'Auto',
};

export default function SyncLogList({ logs, isLoading, onClearLogs }) {
  const [expandedLog, setExpandedLog] = useState(null);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-sm flex items-center gap-1">
          <ScrollText className="w-3 h-3" /> Sync Log
        </p>
        {logs.length > 0 && (
          <button onClick={onClearLogs} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-xs">
          No sync attempts yet. Click "Sync" on any source to start.
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.slice(0, 30).map((log, i) => {
            const meta = STATUS_META[log.status] || STATUS_META.failed;
            const isExpanded = expandedLog === i;
            return (
              <div key={log.id} className="bg-card rounded-xl border border-border p-3">
                <button
                  onClick={() => setExpandedLog(isExpanded ? null : i)}
                  className="w-full flex items-center gap-2 text-left"
                >
                  <span className={`text-sm font-bold flex-shrink-0 ${meta.color}`}>{meta.Icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{log.source_name}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {format(new Date(log.created_date), 'MMM d, h:mm a')} ·
                      Found: {log.events_found} · Imported: {log.events_imported}
                      {log.events_failed > 0 && <span className="text-destructive"> · Failed: {log.events_failed}</span>}
                    </p>
                  </div>
                  <span className="text-[9px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5 flex-shrink-0">
                    {meta.label}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-[11px]">
                    <p className="text-muted-foreground break-all">URL: {log.source_url}</p>
                    <p className="text-muted-foreground">
                      Status: <span className="font-semibold">{meta.label}</span> ·
                      Method: <span className="font-semibold">{METHOD_LABELS[log.extraction_method] || log.extraction_method}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Updated: {log.events_updated} · Duplicates: {log.duplicates_skipped}
                    </p>
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
  );
}