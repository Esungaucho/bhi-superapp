import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, Users } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import CommunityPartnerCard from '@/components/marketplace/CommunityPartnerCard';
import { COMMUNITY_PARTNER_TYPES } from '@/lib/marketplaceConstants';

export default function CommunityPartners() {
  const [selectedType, setSelectedType] = useState(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['communityPartners'],
    queryFn: () => base44.entities.CommunityPartner.list('-created_date', 100),
  });

  const approved = useMemo(() => partners.filter(p => p.approval_status === 'approved' && p.is_active !== false), [partners]);

  const filtered = useMemo(() => {
    if (!selectedType) return approved;
    return approved.filter(p => p.type === selectedType);
  }, [approved, selectedType]);

  const typeKeys = Object.keys(COMMUNITY_PARTNER_TYPES);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <a href="/concierge" className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-2">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Coastal Community</p>
          <h1 className="font-heading text-2xl text-white mt-1">Community Partners</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : (
          <>
            {/* Type filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
              <button
                onClick={() => setSelectedType(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedType ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                All
              </button>
              {typeKeys.map(key => {
                const meta = COMMUNITY_PARTNER_TYPES[key];
                const Icon = meta.Icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedType(selectedType === key ? null : key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedType === key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Directory */}
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(p => <CommunityPartnerCard key={p.id} partner={p} />)}
            </div>
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
                <p className="text-sm">No community partners found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}