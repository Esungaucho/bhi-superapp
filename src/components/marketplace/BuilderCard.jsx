import React from 'react';
import { Phone, Mail, Globe, MapPin, Award, Star } from 'lucide-react';
import { LUXURY_LEVELS, BUILDER_CATEGORIES } from '@/lib/marketplaceConstants';

export default function BuilderCard({ business }) {
  const luxury = LUXURY_LEVELS[business.luxury_rating] || LUXURY_LEVELS.premium;
  const categoryMeta = BUILDER_CATEGORIES.find(c => c.id === business.category);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-luxe transition-all">
      <div className="flex gap-3 p-4">
        <div className="w-14 h-14 rounded-xl bg-sand flex items-center justify-center flex-shrink-0 overflow-hidden">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading text-lg text-ocean">{business.name?.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{business.name}</p>
          {business.owner && <p className="text-xs text-muted-foreground truncate">Owner: {business.owner}</p>}
          {categoryMeta && <p className="text-[11px] text-accent font-medium mt-0.5">{categoryMeta.label}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${luxury.className}`}>{luxury.label}</span>
            {business.concierge_recommendation && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                <Award className="w-2.5 h-2.5" /> Concierge
              </span>
            )}
            {business.is_featured_partner && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {business.description && (
        <p className="text-xs text-muted-foreground px-4 pb-3 line-clamp-2">{business.description}</p>
      )}

      {business.service_area && (
        <div className="flex items-center gap-1 px-4 pb-2">
          <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={1.5} />
          <p className="text-[11px] text-muted-foreground">{business.service_area}</p>
        </div>
      )}

      <div className="flex border-t border-border/30">
        {business.phone && (
          <a href={`tel:${business.phone}`} className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors">
            <Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {business.email && (
          <a href={`mailto:${business.email}`} className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors border-l border-border/30">
            <Mail className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 hover:bg-sand/40 transition-colors border-l border-border/30">
            <Globe className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  );
}