import React from 'react';
import { Megaphone, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

const SEVERITY_CONFIG = {
  info: { Icon: Info, badge: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
  warning: { Icon: AlertCircle, badge: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  critical: { Icon: AlertCircle, badge: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
};

export default function FerryAlerts({ announcements, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-3.5 animate-pulse">
            <div className="h-4 w-40 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <Megaphone className="w-5 h-5 text-muted-foreground mx-auto mb-1.5 opacity-40" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground">No active announcements</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {announcements.map(ann => {
        const config = SEVERITY_CONFIG[ann.severity] || SEVERITY_CONFIG.info;
        const Icon = config.Icon;

        return (
          <div key={ann.id} className="bg-card rounded-xl border border-border p-3.5">
            <div className="flex items-start gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.badge}`}>
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground leading-snug">{ann.title}</h4>
                {ann.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{ann.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  {ann.date_published && (
                    <span>{format(new Date(ann.date_published), 'MMM d, yyyy')}</span>
                  )}
                  {ann.source_url && (
                    <a
                      href={ann.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-0.5"
                    >
                      Read more <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}