import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, CloudRain, Megaphone, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  on_time: {
    label: 'On Time',
    Icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  delayed: {
    label: 'Delayed',
    Icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelled',
    Icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
  weather_impacted: {
    label: 'Weather Impacted',
    Icon: CloudRain,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  special_announcement: {
    label: 'Special Announcement',
    Icon: Megaphone,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
};

export default function FerryStatusCard({ status, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Status Unavailable</p>
            <p className="text-xs text-muted-foreground mt-0.5">Unable to fetch live ferry status. Tap refresh or visit the official site.</p>
          </div>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[status.status] || STATUS_CONFIG.on_time;
  const Icon = config.Icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-5`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.color}`} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-luxe-sm ${config.color}`}>
              <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{status.message}</p>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
            <span>Last checked: {status.last_checked ? format(new Date(status.last_checked), 'MMM d, h:mm a') : '—'}</span>
            <a
              href={status.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Official Source →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}