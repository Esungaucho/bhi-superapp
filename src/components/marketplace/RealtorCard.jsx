import React from 'react';
import { Phone, Mail, Globe, Instagram, MapPin, Star, Award } from 'lucide-react';
import { LUXURY_LEVELS } from '@/lib/marketplaceConstants';

export default function RealtorCard({ agent }) {
  const luxury = LUXURY_LEVELS[agent.luxury_level] || LUXURY_LEVELS.premium;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-luxe transition-all">
      <div className="flex gap-3 p-4">
        <img
          src={agent.headshot_url || agent.large_photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format'}
          alt={agent.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
              <p className="text-xs text-muted-foreground truncate">{agent.brokerage}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${luxury.className}`}>
              {luxury.label}
            </span>
          </div>
          {agent.areas_served && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground truncate">{agent.areas_served}</p>
            </div>
          )}
          {agent.specialties && agent.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.specialties.slice(0, 3).map(s => (
                <span key={s} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-sand text-muted-foreground">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {(agent.is_sponsored || agent.concierge_recommendation || agent.is_featured_partner) && (
        <div className="flex gap-1.5 px-4 pb-2">
          {agent.is_sponsored && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Sponsored
            </span>
          )}
          {agent.concierge_recommendation && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              <Award className="w-2.5 h-2.5" /> Concierge Pick
            </span>
          )}
          {agent.is_featured_partner && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-ocean bg-ocean/10 px-2 py-0.5 rounded-full">
              <Award className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>
      )}

      <div className="flex border-t border-border/30">
        {agent.phone && (
          <a href={`tel:${agent.phone}`} className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors">
            <Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {agent.email && (
          <a href={`mailto:${agent.email}`} className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors border-l border-border/30">
            <Mail className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {agent.website && (
          <a href={agent.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors border-l border-border/30">
            <Globe className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {agent.instagram && (
          <a href={agent.instagram} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors border-l border-border/30">
            <Instagram className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  );
}