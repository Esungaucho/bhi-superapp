import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Thermometer, Wind, Gauge, Compass, CloudRain, Waves,
  Ship, Sun, Anchor, Loader2, AlertCircle,
} from 'lucide-react';

const TONE_STYLES = {
  great:    { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500' },
  okay:     { bg: 'bg-sky-50',      text: 'text-sky-700',      dot: 'bg-sky-500' },
  caution:  { bg: 'bg-amber-50',   text: 'text-amber-700',    dot: 'bg-amber-500' },
  avoid:    { bg: 'bg-red-50',      text: 'text-red-700',      dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
  if (!status) return null;
  const s = TONE_STYLES[status.tone] || TONE_STYLES.okay;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.label}
    </span>
  );
}

function StatRow({ Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// Fallback static card
function FallbackCard() {
  return (
    <div className="bg-gradient-to-br from-navy/5 to-sea-glass/5 rounded-2xl border border-border/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-4 h-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
          Island Weather
        </h3>
      </div>
      <p className="font-heading text-base text-foreground leading-snug mb-4">
        Bald Head Island enjoys a coastal climate with warm summers and mild winters.
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Typical Summer</p>
          <p className="font-semibold text-foreground">85°F — 90°F</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prevailing Wind</p>
          <p className="font-semibold text-foreground">SW 8—15 mph</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Live forecast temporarily unavailable.
      </p>
    </div>
  );
}

export default function WeatherMarineModule() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['bhiWeatherMarine'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getBHIWeatherMarineStatus', {});
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-accent" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground italic">Checking island conditions…</p>
      </div>
    );
  }

  // ── Error / fallback ──
  if (isError || !data || data.error) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="text-[11px] text-muted-foreground">Weather is temporarily unavailable.</p>
        </div>
        <FallbackCard />
      </div>
    );
  }

  const { summary, current, statuses } = data;

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-luxe-sm">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy/6 to-sea-glass/6 px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-2">
          <Anchor className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
            Island Conditions
          </h3>
        </div>
        <p className="font-heading text-base text-foreground leading-snug">
          {summary}
        </p>
      </div>

      {/* Current stats */}
      <div className="px-5 py-3">
        <StatRow Icon={Thermometer} label="Temperature" value={current.temp_f != null ? `${current.temp_f}°F` : '—'} />
        <StatRow Icon={Wind} label="Wind" value={current.wind_mph != null ? `${current.wind_mph} mph` : '—'} />
        <StatRow Icon={Gauge} label="Gusts" value={current.wind_gust_mph != null ? `${current.wind_gust_mph} mph` : '—'} />
        <StatRow Icon={Compass} label="Direction" value={current.wind_direction || '—'} />
        <StatRow
          Icon={CloudRain}
          label="Rain (next 12 hrs)"
          value={current.rain_in_next_12h != null ? `${current.rain_in_next_12h}"` : '—'}
        />
        {current.wave_height_ft != null && (
          <StatRow Icon={Waves} label="Wave Height" value={`${current.wave_height_ft} ft`} />
        )}
      </div>

      {/* Status badges */}
      <div className="px-5 pb-5 pt-1 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-foreground font-medium">Ferry Comfort</span>
          </div>
          <StatusBadge status={statuses?.ferry} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-foreground font-medium">Beach Day</span>
          </div>
          <StatusBadge status={statuses?.beach} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-foreground font-medium">Boating</span>
          </div>
          <StatusBadge status={statuses?.boating} />
        </div>
      </div>
    </div>
  );
}