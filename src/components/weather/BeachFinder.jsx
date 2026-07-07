import React from 'react';
import { Wind, Compass, Waves, Users, Sun, Anchor, LifeBuoy, ShieldCheck, AlertTriangle } from 'lucide-react';

const BEACHES = [
  {
    id: 'south',
    name: 'South Beach',
    Icon: Waves,
    facing: 'South-facing · 14-mile strand',
    description: 'The iconic long, wide beach — best for shelling and long walks.',
    shelteredFrom: ['N', 'NE', 'NW'],
    exposedTo: ['S', 'SE', 'SW'],
  },
  {
    id: 'east',
    name: 'East Beach',
    Icon: Sun,
    facing: 'East-facing · Cape Fear point',
    description: 'Prime sunrise spot near Cape Fear — great surf when swells roll in.',
    shelteredFrom: ['W', 'NW', 'SW'],
    exposedTo: ['E', 'NE', 'SE'],
  },
  {
    id: 'west',
    name: 'West Beach',
    Icon: Anchor,
    facing: 'West-facing · Near marina',
    description: 'Calm inlet waters near the ferry — ideal for families with kids.',
    shelteredFrom: ['E', 'NE', 'SE'],
    exposedTo: ['W', 'NW', 'SW'],
  },
];

function normalizeDirection(dir) {
  if (!dir) return null;
  return dir.toUpperCase().replace(/[^A-Z]/g, '');
}

function isSheltered(beach, windDir) {
  const dir = normalizeDirection(windDir);
  if (!dir) return false;
  return beach.shelteredFrom.some(d => dir.includes(d));
}

function isExposed(beach, windDir) {
  const dir = normalizeDirection(windDir);
  if (!dir) return false;
  return beach.exposedTo.some(d => dir.includes(d));
}

// Wave height → recommended minimum age for swimming/surfing
function surfAgeRecommendation(waveFt) {
  if (waveFt == null) return { label: 'Check conditions before entering the water', tone: 'unknown' };
  if (waveFt < 1)   return { label: 'All ages — calm surf, safe for little ones', tone: 'great', minAge: 0 };
  if (waveFt < 2)   return { label: 'Age 4+ — gentle surf for young swimmers', tone: 'great', minAge: 4 };
  if (waveFt < 3)   return { label: 'Age 8+ — moderate surf, supervise children closely', tone: 'okay', minAge: 8 };
  if (waveFt < 4)   return { label: 'Age 12+ — heavier surf, experienced young swimmers only', tone: 'caution', minAge: 12 };
  return { label: 'Age 16+ — rough surf, experienced swimmers only', tone: 'avoid', minAge: 16 };
}

// Rip current risk based on wave height, wind speed, and beach flag
function ripCurrentRisk(waveFt, windMph, flag) {
  let score = 0;
  let factors = [];

  if (waveFt != null) {
    if (waveFt >= 4) { score += 3; factors.push('large surf'); }
    else if (waveFt >= 2.5) { score += 2; factors.push('moderate surf'); }
    else if (waveFt >= 1.5) { score += 1; }
  }

  if (windMph != null) {
    if (windMph >= 25) { score += 3; factors.push('strong onshore winds'); }
    else if (windMph >= 15) { score += 1; }
  }

  if (flag === 'red') { score += 3; factors.push('red flag posted'); }
  else if (flag === 'yellow') { score += 1; factors.push('yellow flag posted'); }

  if (score >= 5) return {
    label: 'High Risk',
    tone: 'avoid',
    advice: 'Rip currents are likely. Stay out of the water. If caught, don\'t fight the current — swim parallel to shore until free, then head in.',
    factors,
  };
  if (score >= 2) return {
    label: 'Moderate Risk',
    tone: 'caution',
    advice: 'Rip currents are possible. Swim near a lifeguard if available, and never swim alone. Know how to escape a rip: swim parallel to shore.',
    factors,
  };
  return {
    label: 'Low Risk',
    tone: 'great',
    advice: 'Rip current risk is low, but always stay aware. If you see a channel of choppy, discolored water heading out to sea, avoid that area.',
    factors,
  };
}

const TONE_STYLES = {
  great:   { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500' },
  okay:    { bg: 'bg-sky-50',      text: 'text-sky-700',     dot: 'bg-sky-500' },
  caution: { bg: 'bg-amber-50',   text: 'text-amber-700',    dot: 'bg-amber-500' },
  avoid:   { bg: 'bg-red-50',      text: 'text-red-700',      dot: 'bg-red-500' },
  unknown: { bg: 'bg-sand/50',    text: 'text-foreground',    dot: 'bg-muted-foreground/40' },
};

export default function BeachFinder({ conditions, waveHeightFt }) {
  const windDir = conditions?.wind_direction;
  const windMph = conditions?.wind_mph || 0;
  const flag = conditions?.beach_flag;
  const crowd = conditions?.crowd_level;

  const waveFt = waveHeightFt ?? conditions?.wave_height_ft;
  const surfAge = surfAgeRecommendation(waveFt);
  const ripRisk = ripCurrentRisk(waveFt, windMph, flag);

  const ranked = BEACHES.map(b => ({
    ...b,
    sheltered: isSheltered(b, windDir),
    exposed: isExposed(b, windDir),
  })).sort((a, b) => {
    const aScore = a.sheltered ? 0 : a.exposed ? 2 : 1;
    const bScore = b.sheltered ? 0 : b.exposed ? 2 : 1;
    return aScore - bScore;
  });

  const best = ranked[0];
  const BestIcon = best.Icon;

  const RECOMMENDATION = (() => {
    if (!windDir) return 'Check current wind direction for the best beach pick today.';
    if (windMph >= 25) return `Strong winds (${windMph} mph) from ${windDir} — ${best.name} is the most sheltered option.`;
    if (best.sheltered) return `Winds from ${windDir} make ${best.name} the calmest, most sheltered beach today.`;
    if (best.exposed) return `Winds from ${windDir} are onshore at ${best.name}, but it offers the most manageable conditions.`;
    return `Winds from ${windDir} are cross-shore at ${best.name} — a solid all-around pick.`;
  })();

  const FLAG_NOTE = {
    green: 'Safe to swim at all beaches.',
    yellow: 'Use caution — moderate surf or currents.',
    red: 'Dangerous surf — stay out of the water.',
    purple: 'Dangerous marine life present — heed posted warnings.',
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-luxe-sm">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-sand/30 border-b border-border/40">
        <div className="flex items-center gap-2 mb-1.5">
          <Compass className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">Beach Finder</p>
        </div>
        <p className="text-sm font-medium text-foreground leading-relaxed">{RECOMMENDATION}</p>
      </div>

      {/* Best pick highlight */}
      <div className="mx-4 my-3 rounded-xl bg-sand/30 border border-border/40 p-3 flex items-center gap-3">
        <span className="w-11 h-11 rounded-full bg-card flex items-center justify-center border border-border/40 flex-shrink-0">
          <BestIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <p className="text-[9px] font-medium tracking-luxe-sm uppercase text-primary">Recommended</p>
          <p className="text-sm font-heading text-foreground">{best.name}</p>
          <p className="text-[11px] text-muted-foreground">{best.description}</p>
        </div>
      </div>

      {/* All beaches with wind orientation */}
      <div className="px-4 pb-3 space-y-2">
        {BEACHES.map(beach => {
          const sheltered = isSheltered(beach, windDir);
          const exposed = isExposed(beach, windDir);
          const isBest = beach.id === best.id;
          const BeachIcon = beach.Icon;
          return (
            <div
              key={beach.id}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                isBest ? 'border-primary/30 bg-sand/30' : 'border-border/30 bg-background'
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center flex-shrink-0 border border-border/30">
                <BeachIcon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{beach.name}</p>
                <p className="text-[11px] text-muted-foreground">{beach.facing}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {windDir ? (
                  sheltered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Wind className="w-3 h-3" /> Sheltered
                    </span>
                  ) : exposed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                      <Wind className="w-3 h-3" /> Onshore
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Wind className="w-3 h-3" /> Cross-shore
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Surf & Safety — wave age guidance + rip current risk */}
      <div className="px-4 pb-3 space-y-2">
        {/* Wave height + age recommendation */}
        <div className="rounded-xl bg-sand/20 border border-border/30 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">Surf Conditions</p>
            </div>
            {waveFt != null && (
              <span className="text-sm font-heading text-foreground">{waveFt} ft</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${TONE_STYLES[surfAge.tone].bg} ${TONE_STYLES[surfAge.tone].text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${TONE_STYLES[surfAge.tone].dot}`} />
              {surfAge.tone !== 'unknown' && surfAge.minAge > 0 ? `Age ${surfAge.minAge}+` : 'All Ages'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-primary/60" strokeWidth={1.5} />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{surfAge.label}</p>
        </div>

        {/* Rip current risk */}
        <div className="rounded-xl bg-sand/20 border border-border/30 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-muted-foreground">Rip Current Risk</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${TONE_STYLES[ripRisk.tone].bg} ${TONE_STYLES[ripRisk.tone].text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${TONE_STYLES[ripRisk.tone].dot}`} />
              {ripRisk.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{ripRisk.advice}</p>
          {ripRisk.factors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ripRisk.factors.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-sand/40 rounded-full px-2 py-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" strokeWidth={1.5} />
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Safety notes */}
      <div className="px-5 pb-4 pt-2 border-t border-border/40 space-y-1.5">
        {flag && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Waves className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" strokeWidth={1.5} />
            {FLAG_NOTE[flag] || ''}
          </p>
        )}
        {crowd && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" strokeWidth={1.5} />
            Beach crowd level: <span className="font-medium text-foreground capitalize">{crowd.replace('_', ' ')}</span>
            {crowd === 'very_busy' && ' — try East Beach for more space.'}
          </p>
        )}
      </div>
    </div>
  );
}