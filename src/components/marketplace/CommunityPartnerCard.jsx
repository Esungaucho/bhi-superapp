import React from 'react';
import { Globe, Mail, Phone, CalendarClock } from 'lucide-react';
import { COMMUNITY_PARTNER_TYPES } from '@/lib/marketplaceConstants';
import { format } from 'date-fns';

export default function CommunityPartnerCard({ partner }) {
  const typeMeta = COMMUNITY_PARTNER_TYPES[partner.type] || COMMUNITY_PARTNER_TYPES.community_association;
  const Icon = typeMeta.Icon;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 hover:shadow-luxe transition-all">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/8 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {partner.logo_url ? (
            <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
          ) : (
            <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{partner.name}</p>
          <p className="text-[11px] text-accent font-medium">{typeMeta.label}</p>
        </div>
      </div>

      {partner.description && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{partner.description}</p>
      )}

      {partner.contact_person && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
          <p className="text-xs font-medium text-foreground">{partner.contact_person}</p>
          {partner.position && <p className="text-[11px] text-muted-foreground">{partner.position}</p>}
        </div>
      )}

      {partner.follow_up_reminder && (
        <div className="flex items-center gap-1.5 mt-2">
          <CalendarClock className="w-3 h-3 text-amber-600" strokeWidth={1.5} />
          <p className="text-[11px] text-amber-600">
            Follow up: {format(new Date(partner.follow_up_reminder), 'MMM d, yyyy')}
          </p>
        </div>
      )}

      <div className="flex gap-1 mt-3">
        {partner.phone && (
          <a href={`tel:${partner.phone}`} className="flex items-center justify-center w-9 h-9 rounded-lg bg-sand hover:bg-sand-deep transition-colors">
            <Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {partner.email && (
          <a href={`mailto:${partner.email}`} className="flex items-center justify-center w-9 h-9 rounded-lg bg-sand hover:bg-sand-deep transition-colors">
            <Mail className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
        {partner.website && (
          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg bg-sand hover:bg-sand-deep transition-colors">
            <Globe className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  );
}