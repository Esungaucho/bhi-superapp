import React from 'react';
import { Wind, Compass, Waves, Users, Sun, Anchor } from 'lucide-react';

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

export default function BeachFinder({ conditions }) {
  const windDir = conditions?.wind_direction;
  const windMph = conditions?.wind_mph || 0;
  const flag = conditions?.beach_flag;
  const crowd = conditions?.crowd_level;

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
    <div className="bg-white/25 backdrop-blur-xl border border-white/35 rounded-2xl overflow-hidden shadow-luxe-sm">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-white/10 border-b border-white/15">
        <div className="flex items-center gap-2 mb-1.5">
          <Compass className="w-4 h-4 text-[#3F6D80]" strokeWidth={1.5} />
          <p className="text-[10px] font-medium tracking-luxe-sm uppercase text-[#1E3A45]/50">Beach Finder</p>
        </div>
        <p className="text-sm font-medium text-[#1E3A45] leading-relaxed">{RECOMMENDATION}</p>
      </div>

      {/* Best pick highlight */}
      <div className="mx-4 my-3 rounded-xl bg-white/20 border border-white/25 p-3 flex items-center gap-3">
        <span className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
          <BestIcon className="w-5 h-5 text-[#3F6D80]" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <p className="text-[9px] font-medium tracking-luxe-sm uppercase text-[#3F6D80]">Recommended</p>
          <p className="text-sm font-heading text-[#1E3A45]">{best.name}</p>
          <p className="text-[11px] text-[#1E3A45]/55">{best.description}</p>
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
                isBest ? 'border-white/40 bg-white/20' : 'border-white/15 bg-white/5'
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/15">
                <BeachIcon className="w-4 h-4 text-[#3F6D80]" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1E3A45]">{beach.name}</p>
                <p className="text-[11px] text-[#1E3A45]/50">{beach.facing}</p>
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A45]/50">
                      <Wind className="w-3 h-3" /> Cross-shore
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-[#1E3A45]/40">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety notes */}
      <div className="px-5 pb-4 pt-2 border-t border-white/15 space-y-1.5">
        {flag && (
          <p className="text-xs text-[#1E3A45]/55 flex items-start gap-1.5">
            <Waves className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#3F6D80]" strokeWidth={1.5} />
            {FLAG_NOTE[flag] || ''}
          </p>
        )}
        {crowd && (
          <p className="text-xs text-[#1E3A45]/55 flex items-start gap-1.5">
            <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#3F6D80]" strokeWidth={1.5} />
            Beach crowd level: <span className="font-medium text-[#1E3A45] capitalize">{crowd.replace('_', ' ')}</span>
            {crowd === 'very_busy' && ' — try East Beach for more space.'}
          </p>
        )}
      </div>
    </div>
  );
}