import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight } from 'lucide-react';

export default function SponsoredBanner({ deals }) {
  const [bannerIdx, setBannerIdx] = useState(0);

  const sponsored = deals?.filter(d => d.deal_type === 'sponsored' && d.is_active) || [];

  useEffect(() => {
    if (sponsored.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx(i => (i + 1) % sponsored.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sponsored.length]);

  useEffect(() => {
    if (sponsored[bannerIdx]) {
      base44.entities.PromoDeal.update(sponsored[bannerIdx].id, {
        impressions: (sponsored[bannerIdx].impressions || 0) + 1,
      }).catch(() => {});
    }
  }, [bannerIdx, sponsored.length]);

  if (!sponsored.length) return null;
  const banner = sponsored[bannerIdx];

  const handleClick = () => {
    base44.entities.PromoDeal.update(banner.id, {
      clicks: (banner.clicks || 0) + 1,
    }).catch(() => {});
  };

  const Inner = (
    <div className="mx-4 mt-8 rounded-2xl overflow-hidden border border-driftwood/30 bg-sand/60 backdrop-blur-sm flex items-center gap-4 px-5 py-4 shadow-[0_4px_16px_-12px_rgba(31,45,61,0.18)]">
      {banner.sponsor_logo_url && (
        <img src={banner.sponsor_logo_url} alt={banner.sponsor_name} className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-border/60" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-body tracking-luxe uppercase text-driftwood">Partner</p>
        <p className="text-sm font-heading text-foreground truncate mt-0.5">{banner.title}</p>
        <p className="text-xs font-body text-muted-foreground truncate mt-0.5">{banner.description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-navy flex-shrink-0" strokeWidth={1.5} />
      {sponsored.length > 1 && (
        <div className="flex gap-1.5 flex-shrink-0 ml-1">
          {sponsored.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); setBannerIdx(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === bannerIdx ? 'bg-navy' : 'bg-driftwood/30'}`}
              aria-label={`Sponsored ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return banner.deep_link ? (
    <Link to={banner.deep_link} onClick={handleClick}>{Inner}</Link>
  ) : (
    <div onClick={handleClick}>{Inner}</div>
  );
}