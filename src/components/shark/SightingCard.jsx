import React from 'react';
import { Clock, Ruler, User } from 'lucide-react';
import { STATUS_META, OBSERVER_TYPES, isSightingActive } from '@/lib/sharkConstants';

export default function SightingCard({ sighting }) {
  const meta = STATUS_META[sighting.status] || STATUS_META.unconfirmed;
  const observer = OBSERVER_TYPES.find(o => o.value === sighting.observer_type);
  const active = isSightingActive(sighting);

  return (
    <div className={`bg-card border border-border/50 rounded-2xl p-4 shadow-luxe-sm ${active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
          <h3 className="font-heading text-sm font-semibold text-foreground truncate">{sighting.location_name}</h3>
        </div>
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${meta.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {sighting.sighting_date && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {new Date(sighting.sighting_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        {sighting.distance_from_shore && (
          <span className="flex items-center gap-1">
            <Ruler className="w-3 h-3" strokeWidth={1.5} />
            {sighting.distance_from_shore}
          </span>
        )}
        {sighting.observer_type && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" strokeWidth={1.5} />
            {observer?.label || sighting.observer_type}
          </span>
        )}
      </div>

      {sighting.description && (
        <p className="text-xs text-foreground/70 leading-relaxed mt-2.5">{sighting.description}</p>
      )}

      {sighting.photo_url && (
        <img src={sighting.photo_url} alt="Sighting" className="w-full h-40 object-cover rounded-xl mt-3 border border-border/30" />
      )}
    </div>
  );
}