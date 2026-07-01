import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Search, BadgeCheck, Star, ChevronRight, Heart } from 'lucide-react';
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS } from '@/lib/conciergeMarketplaceConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function PreferredPartners() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['approvedPartners'],
    queryFn: () => base44.entities.PreferredPartner.filter({ approval_status: 'approved' }, '-is_featured', 100),
  });

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [partners, category, search]);

  const trackView = async (partnerId) => {
    try {
      await base44.entities.PartnerReferralEvent.create({
        partner_id: partnerId,
        event_type: 'profile_view',
        referral_source: 'concierge_partners_page',
      });
    } catch (e) { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate('/concierge')} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-base text-foreground">Preferred Partners</h1>
        <GlobalMenu />
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trusted partners..."
            className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-3">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'}`}
        >
          All
        </button>
        {PARTNER_CATEGORIES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'}`}
          >
            <Icon className="w-3 h-3" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Partner list */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No partners found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(partner => (
              <Link
                key={partner.id}
                to={`/concierge/partners/${partner.id}`}
                onClick={() => trackView(partner.id)}
                className="block bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/40 transition-colors"
              >
                <div className="flex gap-3 p-3">
                  {/* Logo or cover */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand flex-shrink-0">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : partner.cover_image_url ? (
                      <img src={partner.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{partner.name}</p>
                      {partner.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />}
                      {partner.is_featured && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">Featured</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{PARTNER_CATEGORY_LABELS[partner.category]}</p>
                    {partner.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">{partner.description}</p>}
                    {partner.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-medium text-foreground">{partner.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">({partner.review_count})</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" strokeWidth={1.5} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Wedding inquiry CTA */}
      <div className="px-4 pb-8">
        <Link
          to="/concierge/wedding-inquiry"
          className="block bg-gradient-to-br from-primary to-ocean-deep text-primary-foreground rounded-2xl p-4 text-center"
        >
          <p className="font-heading text-sm">Planning a Wedding or Event?</p>
          <p className="text-[11px] text-primary-foreground/70 mt-1">Request a complete package through the app</p>
        </Link>
      </div>
    </div>
  );
}