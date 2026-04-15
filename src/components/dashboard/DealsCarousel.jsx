import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function DealsCarousel({ deals }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  const trackImpression = async (deal) => {
    try {
      await base44.entities.PromoDeal.update(deal.id, {
        impressions: (deal.impressions || 0) + 1,
      });
    } catch {}
  };

  const trackClick = async (deal) => {
    try {
      await base44.entities.PromoDeal.update(deal.id, {
        clicks: (deal.clicks || 0) + 1,
      });
    } catch {}
  };

  useEffect(() => {
    if (deals?.length > 0) {
      deals.forEach(d => trackImpression(d));
    }
  }, [deals]);

  if (!deals?.length) return null;

  const DEAL_TYPE_BADGE = {
    flash_sale: { label: '⚡ Flash Sale', color: 'bg-red-500' },
    featured_deal: { label: '🏷️ Deal', color: 'bg-accent' },
    sponsored: { label: '📢 Sponsored', color: 'bg-amber-500' },
    event: { label: '🎉 Event', color: 'bg-emerald-500' },
  };

  return (
    <div className="mt-5">
      <div className="px-4 flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-foreground">Island Deals</h3>
        <span className="text-xs text-muted-foreground">{current + 1}/{deals.length}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory"
        onScroll={e => {
          const idx = Math.round(e.target.scrollLeft / (e.target.offsetWidth - 32 + 12));
          setCurrent(Math.min(idx, deals.length - 1));
        }}
      >
        {deals.map(deal => {
          const badge = DEAL_TYPE_BADGE[deal.deal_type] || DEAL_TYPE_BADGE.featured_deal;
          const card = (
            <div
              className="flex-shrink-0 w-[calc(85vw)] max-w-[340px] snap-start rounded-2xl overflow-hidden border bg-card shadow-sm"
              onClick={() => deal.deep_link && trackClick(deal)}
            >
              {deal.image_url && (
                <div className="h-36 overflow-hidden relative">
                  <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                  {deal.discount_pct && (
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{deal.discount_pct}%
                    </span>
                  )}
                </div>
              )}
              <div className="p-3">
                <p className="font-bold text-sm text-foreground">{deal.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{deal.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] text-muted-foreground">by {deal.sponsor_name}</span>
                  {deal.valid_until && (
                    <span className="text-[10px] text-muted-foreground">
                      Until {new Date(deal.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );

          return deal.deep_link ? (
            <Link key={deal.id} to={deal.deep_link}>{card}</Link>
          ) : (
            <div key={deal.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}