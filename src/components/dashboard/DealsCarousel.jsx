import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const scrollByDir = (dir) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollBy({ left: dir * (el.offsetWidth - 40 + 16), behavior: 'smooth' });
  };

  if (!deals?.length) return null;

  const DEAL_TYPE_BADGE = {
    flash_sale: { label: 'Flash Sale', color: 'bg-warning text-white' },
    featured_deal: { label: 'Featured', color: 'bg-sea-glass text-white' },
    sponsored: { label: 'Sponsored', color: 'bg-ocean text-white' },
    event: { label: 'Event', color: 'bg-sea-glass-deep text-white' },
  };

  return (
    <section className="mt-10">
      <div className="px-5 flex items-baseline justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl text-foreground">Island offers</h2>
          <p className="text-xs font-body text-muted-foreground mt-0.5">Curated experiences from our partners</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-body tracking-luxe-xs uppercase text-muted-foreground/60">{current + 1} / {deals.length}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollByDir(-1)}
              disabled={current === 0}
              className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sand/50 transition-colors"
              aria-label="Previous offer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scrollByDir(1)}
              disabled={current >= deals.length - 1}
              className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sand/50 transition-colors"
              aria-label="Next offer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar snap-x snap-mandatory"
        onScroll={e => {
          const idx = Math.round(e.target.scrollLeft / (e.target.offsetWidth - 40 + 16));
          setCurrent(Math.min(idx, deals.length - 1));
        }}
      >
        {deals.map(deal => {
          const badge = DEAL_TYPE_BADGE[deal.deal_type] || DEAL_TYPE_BADGE.featured_deal;
          const card = (
            <div
              className="flex-shrink-0 w-[80vw] max-w-[340px] snap-start rounded-2xl overflow-hidden bg-card border border-border/30 shadow-luxe hover:shadow-luxe-lg transition-shadow duration-300"
              onClick={() => deal.deep_link && trackClick(deal)}
            >
              {deal.image_url ? (
                <div className="h-44 overflow-hidden relative">
                  <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-[9px] font-body font-medium tracking-luxe-xs uppercase px-2.5 py-1 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                  {deal.discount_pct && (
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-body font-semibold px-2.5 py-1 rounded-full">
                      −{deal.discount_pct}%
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-44 bg-sand flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-driftwood" strokeWidth={1.5} />
                </div>
              )}
              <div className="p-5">
                <p className="font-heading text-base text-foreground leading-snug">{deal.title}</p>
                <p className="text-xs font-body text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{deal.description}</p>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30">
                  <span className="text-[11px] font-body text-muted-foreground tracking-wide">{deal.sponsor_name}</span>
                  {deal.valid_until && (
                    <span className="text-[10px] font-body tracking-luxe-xs uppercase text-driftwood">
                      Through {new Date(deal.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    </section>
  );
}