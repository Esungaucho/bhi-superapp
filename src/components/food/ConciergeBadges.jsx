import React from 'react';
import { CONCIERGE_BADGES, getBadgeMeta } from '@/lib/diningConstants';

export default function ConciergeBadges({ badges = [] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(badgeId => {
        const meta = getBadgeMeta(badgeId);
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <span key={badgeId} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
            <Icon className="w-3 h-3" strokeWidth={1.5} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}