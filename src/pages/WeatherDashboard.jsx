import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wind, Droplets, Waves, Thermometer, Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudFog, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContextualAd, { getTriggeredAds } from '@/components/weather/ContextualAd';
import BeachFinder from '@/components/weather/BeachFinder';
import SharkTrackerCard from '@/components/shark/SharkTrackerCard';
import WeatherMarineModule from '@/components/dashboard/WeatherMarineModule';

const CONDITION_ICON = {
  sunny: Sun, partly_cloudy: CloudSun, cloudy: Cloud,
  rain: CloudRain, storm: CloudLightning, foggy: CloudFog,
};

const FLAG_INFO = {
  green:  { color: 'bg-emerald-500', label: 'Green Flag — Safe swimming conditions' },
  yellow: { color: 'bg-yellow-400', label: 'Yellow Flag — Moderate surf or currents' },
  red:    { color: 'bg-red-500', label: 'Red Flag — Dangerous surf or currents' },
  purple: { color: 'bg-purple-500', label: 'Purple Flag — Dangerous marine life present' },
};

const CROWD_META = {
  quiet:     { dot: 'bg-emerald-400', label: 'Quiet' },
  moderate:  { dot: 'bg-sky-400', label: 'Moderate' },
  busy:       { dot: 'bg-amber-400', label: 'Busy' },
  very_busy:  { dot: 'bg-red-400', label: 'Very Busy' },
};

const UV_META = (uv) => {
  if (uv <= 2)  return { label: 'Low' };
  if (uv <= 5)  return { label: 'Moderate' };
  if (uv <= 7)  return { label: 'High' };
  if (uv <= 10) return { label: 'Very High' };
  return { label: 'Extreme' };
};

export default function WeatherDashboard() {
  const { data: conditionsAll = [], isLoading } = useQuery({
    queryKey: ['islandConditions'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });

  const { data: marineData } = useQuery({
    queryKey: ['bhiWeatherMarine'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getBHIWeatherMarineStatus', {});
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: pins = [] } = useQuery({
    queryKey: ['businessPins'],
    queryFn: () => base44.entities.BusinessPin.filter({ is_sponsored: true, is_active: true }),
  });

  const conditions = conditionsAll[0];
  const triggeredAds = useMemo(() => getTriggeredAds(pins, conditions).slice(0, 2), [pins, conditions]);

  const marine = marineData?.current;
  const displayTemp = marine?.temp_f ?? conditions?.temp_f;
  const displayWind = marine?.wind_mph ?? conditions?.wind_mph;
  const displayWindDir = marine?.wind_direction || conditions?.wind_direction || '';

  const ConditionIcon = CONDITION_ICON[conditions?.condition] || CloudSun;
  const uvMeta = conditions ? UV_META(conditions.uv_index || 0) : null;
  const flagInfo = FLAG_INFO[conditions?.beach_flag] || FLAG_INFO.green;
  const crowdMeta = CROWD_META[conditions?.crowd_level] || CROWD_META.moderate;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="font-heading text-sm text-muted-foreground tracking-luxe-sm">Loading Conditions</p>
    </div>
  );

  if (!conditions) return (
    <div className="flex flex-col items-center justify-center py-32 gap-2 text-center px-6">
      <p className="font-heading text-lg text-foreground">No Conditions Data Yet</p>
      <p className="text-sm text-muted-foreground">Check back soon</p>
    </div>
  );

  return (
    <div className="px-4 pt-5 pb-24 space-y-4 animate-fade-in">
      {/* Hero card */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-luxe">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Bald Head Island</p>
            <h1 className="font-heading text-4xl text-foreground leading-none">{displayTemp ?? '--'}°</h1>
            <p className="text-sm text-muted-foreground mt-1.5 capitalize">{conditions.condition?.replace('_', ' ')}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Feels like {conditions.feels_like_f || displayTemp || '--'}°F</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <span className="w-16 h-16 rounded-full bg-sand/50 flex items-center justify-center border border-border/40">
              <ConditionIcon className="w-8 h-8 text-primary" strokeWidth={1.25} />
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${flagInfo.color}`} />
              <span className="text-[9px] font-medium tracking-luxe-sm uppercase text-muted-foreground">{conditions.beach_flag}</span>
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{flagInfo.label}</p>
        </div>
      </div>

      {/* Weather & Marine Brief */}
      <WeatherMarineModule variant="card" />

      {/* Contextual ads */}
      {triggeredAds.length > 0 && (
        <div className="space-y-3">
          {triggeredAds.map(pin => <ContextualAd key={pin.id} pin={pin} conditions={conditions} />)}
        </div>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />} label="Wind"
          value={`${displayWind ?? '--'} mph`} sub={displayWindDir} />
        <StatCard icon={<Droplets className="w-4 h-4 text-primary" strokeWidth={1.5} />} label="Humidity"
          value={`${conditions.humidity_pct || '--'}%`} />
        <StatCard icon={<Waves className="w-4 h-4 text-primary" strokeWidth={1.5} />} label="Waves"
          value={`${marine?.wave_height_ft ?? conditions.wave_height_ft ?? '--'} ft`}
          sub={conditions.water_temp_f ? `Water ${conditions.water_temp_f}°F` : null} />
        <StatCard icon={<Thermometer className="w-4 h-4 text-primary" strokeWidth={1.5} />} label="UV Index"
          value={`${conditions.uv_index ?? '--'} · ${uvMeta?.label}`} />
      </div>

      {/* Beach Finder */}
      <BeachFinder conditions={conditions} waveHeightFt={marine?.wave_height_ft} />

      {/* Shark Tracker */}
      <SharkTrackerCard />

      {/* Tide */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-luxe-sm">
        <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Tide Status</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-sand/40 flex items-center justify-center border border-border/30">
              <Waves className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-base font-heading text-foreground capitalize">{conditions.tide_status?.replace('_', ' ') || '--'}</p>
              {conditions.tide_next_event && (
                <p className="text-xs text-muted-foreground mt-0.5">{conditions.tide_next_event}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            {['high','falling','low','rising'].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${conditions.tide_status === s ? 'bg-primary scale-125' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Crowd */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-between shadow-luxe-sm">
        <div>
          <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1">Beach Crowd</p>
          <p className="text-base font-heading text-foreground">{crowdMeta.label}</p>
        </div>
        <span className="flex items-center gap-2 text-xs font-medium text-foreground/70 bg-sand/40 px-3 py-1.5 rounded-full border border-border/30">
          <span className={`w-2 h-2 rounded-full ${crowdMeta.dot}`} />
          {conditions.crowd_level?.replace('_', ' ')}
        </span>
      </div>

      {/* Beach flag detail */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4 shadow-luxe-sm">
        <div className={`w-7 h-12 rounded-md ${flagInfo.color} flex-shrink-0 shadow-sm`} />
        <div>
          <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">Beach Flag</p>
          <p className="text-sm font-medium text-foreground mt-1">{flagInfo.label}</p>
        </div>
      </div>

      {/* Map link */}
      <Link
        to="/map"
        className="flex items-center justify-center gap-2 bg-card border border-border/50 rounded-2xl py-4 font-medium text-foreground hover:bg-sand/30 transition-colors shadow-luxe-sm"
      >
        <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <span className="text-sm tracking-luxe-sm uppercase">View Business Map</span>
        <ArrowRight className="w-4 h-4 text-primary" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-luxe-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-8 h-8 rounded-full bg-sand/40 flex items-center justify-center border border-border/30">
          {icon}
        </span>
        <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">{label}</p>
      </div>
      <p className="text-lg font-heading text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  );
}