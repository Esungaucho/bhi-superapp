import React from 'react';
import { Wind, Compass, Waves, Users } from 'lucide-react';

// Bald Head Island has three main beach zones with different orientations.
// Wind direction determines which beach is sheltered (leeward) vs. windy (windward).
const BEACHES = [
  {
    id: 'south',
    name: 'South Beach',
    emoji: '🏖️',
    facing: 'South-facing · 14-mile strand',
    description: 'The iconic long, wide beach — best for shelling and long walks.',
    shelteredFrom: ['N', 'NE', 'NW'],  // wind from these directions = offshore/calm
    exposedTo: ['S', 'SE', 'SW'],
  },
  {
    id: 'east',
    name: 'East Beach',
    emoji: '🌅',
    facing: 'East-facing · Cape Fear point',
    description: 'Prime sunrise spot near Cape Fear — great surf when swells roll in.',
    shelteredFrom: ['W', 'NW', 'SW'],
    exposedTo: ['E', 'NE', 'SE'],
  },
  {
    id: 'west',
    name: 'West Beach',
    emoji: '🌊',
    facing: 'West-facing · Near marina',
    description: 'Calm inlet waters near the ferry — ideal for families with kids.',
    shelteredFrom: ['E', 'NE', 'SE'],
    exposedTo: ['W', 'NW', 'SW'],
  },
];

function normalizeDirection(dir) {
  if (!dir) return null;
  const d = dir.toUpperCase().replace(/[^A-Z]/g, '');
  return d;
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

export default function BeachFinder({ conditions }) {
  const windDir = conditions?.wind_direction;
  const windMph = conditions?.wind_mph || 0;
  const flag = conditions?.beach_flag;
  const crowd = conditions?.crowd_level;

  // Determine best beach — sheltered with lowest wind exposure
  const ranked = BEACHES.map(b => ({
    ...b,
    sheltered: isSheltered(b, windDir),
    exposed: isExposed(b, windDir),
  })).sort((a, b) => {
    // Sheltered first, then not-exposed, then exposed
    const aScore = a.sheltered ? 0 : a.exposed ? 2 : 1;
    const bScore = b.sheltered ? 0 : b.exposed ? 2 : 1;
    return aScore - bScore;
  });

  const best = ranked[0];

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
    <div className="bg-card rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-sea-glass/10 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-accent" strokeWidth={2} />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Beach Finder</p>
        </div>
        <p className="text-sm font-semibold text-foreground leading-relaxed">{RECOMMENDATION}</p>
      </div>

      {/* Best pick highlight */}
      <div className="mx-4 mb-3 rounded-xl bg-accent/8 border border-accent/20 p-3 flex items-center gap-3">
        <span className="text-3xl">{best.emoji}</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-accent uppercase tracking-luxe-sm">Recommended</p>
          <p className="text-sm font-bold text-foreground">{best.name}</p>
          <p className="text-xs text-muted-foreground">{best.description}</p>
        </div>
      </div>

      {/* All beaches with wind orientation */}
      <div className="px-4 pb-3 space-y-2">
        {BEACHES.map(beach => {
          const sheltered = isSheltered(beach, windDir);
          const exposed = isExposed(beach, windDir);
          const isBest = beach.id === best.id;
          return (
            <div
              key={beach.id}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                isBest ? 'border-accent/30 bg-accent/5' : 'border-border bg-background/50'
              }`}
            >
              <span className="text-xl flex-shrink-0">{beach.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{beach.name}</p>
                <p className="text-[11px] text-muted-foreground">{beach.facing}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {windDir ? (
                  sheltered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Wind className="w-3 h-3" /> Sheltered
                    </span>
                  ) : exposed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                      <Wind className="w-3 h-3" /> Onshore
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <Wind className="w-3 h-3" /> Cross-shore
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety notes */}
      <div className="px-4 pb-4 pt-1 border-t border-border/60 space-y-1.5">
        {flag && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Waves className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />
            {FLAG_NOTE[flag] || ''}
          </p>
        )}
        {crowd && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />
            Beach crowd level: <span className="font-medium text-foreground capitalize">{crowd.replace('_', ' ')}</span>
            {crowd === 'very_busy' && ' — try East Beach for more space.'}
          </p>
        )}
      </div>
    </div>
  );
}