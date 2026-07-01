import React from 'react';
import { getActiveSeasons, getSeason } from '@/lib/calendarConstants';

export default function SeasonalBanner() {
  const activeSeasonIds = getActiveSeasons();
  if (activeSeasonIds.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-sea-glass/15 to-navy/5 rounded-2xl p-4 border border-accent/20">
      <p className="text-[10px] font-semibold uppercase tracking-luxe-xs text-ocean mb-2">Active Island Seasons</p>
      <div className="flex flex-wrap gap-2">
        {activeSeasonIds.map(id => {
          const season = getSeason(id);
          return (
            <span key={id} className="text-xs bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-border">
              {season.Icon && <season.Icon className="w-3 h-3 text-ocean" strokeWidth={1.5} />}
              <span className="font-medium text-foreground">{season.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}