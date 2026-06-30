import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Wind, Droplets, Thermometer, Eye, Waves, Sun, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContextualAd, { getTriggeredAds } from '@/components/weather/ContextualAd';
import BeachFinder from '@/components/weather/BeachFinder';

const CONDITION_EMOJI = {
  sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️',
  rain: '🌧️', storm: '⛈️', foggy: '🌫️',
};

const CONDITION_BG = {
  sunny: 'from-amber-400 to-orange-500',
  partly_cloudy: 'from-sky-400 to-blue-500',
  cloudy: 'from-slate-400 to-slate-600',
  rain: 'from-slate-500 to-blue-700',
  storm: 'from-slate-700 to-slate-900',
  foggy: 'from-slate-300 to-slate-500',
};

const FLAG_INFO = {
  green:  { color: 'bg-emerald-500', label: 'Green Flag — Safe swimming conditions' },
  yellow: { color: 'bg-yellow-400', label: 'Yellow Flag — Moderate surf or currents' },
  red:    { color: 'bg-red-500', label: 'Red Flag — Dangerous surf or currents' },
  purple: { color: 'bg-purple-500', label: 'Purple Flag — Dangerous marine life present' },
};

const CROWD_META = {
  quiet:    { color: 'text-emerald-600 bg-emerald-50', label: '😌 Quiet' },
  moderate: { color: 'text-blue-600 bg-blue-50', label: '🙂 Moderate' },
  busy:     { color: 'text-amber-600 bg-amber-50', label: '😅 Busy' },
  very_busy:{ color: 'text-red-600 bg-red-50', label: '😬 Very Busy' },
};

const UV_META = (uv) => {
  if (uv <= 2)  return { label: 'Low', color: 'text-emerald-600' };
  if (uv <= 5)  return { label: 'Moderate', color: 'text-yellow-600' };
  if (uv <= 7)  return { label: 'High', color: 'text-orange-600' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-600' };
  return { label: 'Extreme', color: 'text-purple-700' };
};

const TIDE_EMOJI = { low: '🌊↓', rising: '🌊↑', high: '🌊⬆', falling: '🌊↘' };

export default function WeatherDashboard() {
  const { data: conditionsAll = [], isLoading } = useQuery({
    queryKey: ['islandConditions'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });

  const { data: pins = [] } = useQuery({
    queryKey: ['businessPins'],
    queryFn: () => base44.entities.BusinessPin.filter({ is_sponsored: true, is_active: true }),
  });

  const conditions = conditionsAll[0];
  const triggeredAds = useMemo(() => getTriggeredAds(pins, conditions).slice(0, 2), [pins, conditions]);

  const bg = CONDITION_BG[conditions?.condition] || 'from-sky-400 to-blue-600';
  const emoji = CONDITION_EMOJI[conditions?.condition] || '🌤️';
  const uvMeta = conditions ? UV_META(conditions.uv_index || 0) : null;
  const flagInfo = FLAG_INFO[conditions?.beach_flag] || FLAG_INFO.green;
  const crowdMeta = CROWD_META[conditions?.crowd_level] || CROWD_META.moderate;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (!conditions) return (
    <div className="px-4 py-12 text-center text-muted-foreground">
      <p className="text-4xl mb-2">🌤️</p>
      <p className="font-medium">No conditions data yet</p>
      <p className="text-sm">Check back soon</p>
    </div>
  );

  return (
    <div>
      {/* Hero card */}
      <div className={`bg-gradient-to-br ${bg} px-5 pt-6 pb-8 text-white`}>
        <p className="text-sm font-medium text-white/70 mb-1">Bald Head Island</p>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-6xl">{emoji}</span>
              <div>
                <p className="text-5xl font-bold leading-none">{conditions.temp_f}°</p>
                <p className="text-sm text-white/70 mt-1 capitalize">{conditions.condition?.replace('_', ' ')}</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">Feels like {conditions.feels_like_f || conditions.temp_f}°F</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <div className={`w-3 h-3 rounded-full ${flagInfo.color}`} />
              <span className="text-xs font-semibold capitalize">{conditions.beach_flag} Flag</span>
            </div>
            <p className="text-[10px] text-white/60 max-w-[120px] text-right leading-tight">{flagInfo.label}</p>
          </div>
        </div>
      </div>

      {/* Contextual ads */}
      {triggeredAds.length > 0 && (
        <div className="pt-3">
          {triggeredAds.map(pin => <ContextualAd key={pin.id} pin={pin} conditions={conditions} />)}
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Wind className="w-4 h-4 text-sky-500" />} label="Wind"
            value={`${conditions.wind_mph} mph ${conditions.wind_direction || ''}`} />
          <StatCard icon={<Droplets className="w-4 h-4 text-blue-500" />} label="Humidity"
            value={`${conditions.humidity_pct || '--'}%`} />
          <StatCard icon={<Waves className="w-4 h-4 text-cyan-500" />} label="Waves"
            value={`${conditions.wave_height_ft || '--'} ft`}
            sub={conditions.water_temp_f ? `Water ${conditions.water_temp_f}°F` : null} />
          <StatCard icon={<Thermometer className="w-4 h-4 text-orange-500" />} label="UV Index"
            value={<span className={uvMeta?.color}>{conditions.uv_index ?? '--'} — {uvMeta?.label}</span>} />
        </div>

        {/* Beach Finder */}
        <BeachFinder conditions={conditions} />

        {/* Tide */}
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">🌊 Tide Status</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold capitalize flex items-center gap-2">
                {TIDE_EMOJI[conditions.tide_status] || '🌊'} {conditions.tide_status?.replace('_', ' ') || '--'}
              </p>
              {conditions.tide_next_event && (
                <p className="text-sm text-muted-foreground mt-1">{conditions.tide_next_event}</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              {['high','falling','low','rising'].map(s => (
                <div key={s} className={`w-3 h-3 rounded-full ${conditions.tide_status === s ? 'bg-accent scale-125' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Crowd */}
        <div className="bg-card rounded-2xl border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">👥 Beach Crowd</p>
            <p className="text-lg font-bold">{crowdMeta.label}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${crowdMeta.color}`}>
            {conditions.crowd_level?.replace('_', ' ')}
          </span>
        </div>

        {/* Beach flag detail */}
        <div className="bg-card rounded-2xl border p-4 flex items-center gap-3">
          <div className={`w-6 h-10 rounded-sm ${flagInfo.color} flex-shrink-0`} />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Beach Flag</p>
            <p className="text-sm font-semibold mt-0.5">{flagInfo.label}</p>
          </div>
        </div>

        {/* Map link */}
        <Link to="/map" className="block bg-primary text-primary-foreground rounded-2xl p-4 text-center font-semibold">
          🗺️ View Business Map →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-card rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-1.5">{icon}<p className="text-xs text-muted-foreground font-medium">{label}</p></div>
      <p className="text-base font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}