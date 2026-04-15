import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

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
    <div className="mx-4 mt-4 rounded-xl overflow-hidden border bg-amber-50 border-amber-200 flex items-center gap-3 px-4 py-3">
      {banner.sponsor_logo_url && (
        <img src={banner.sponsor_logo_url} alt={banner.sponsor_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Sponsored</p>
        <p className="text-sm font-semibold text-foreground truncate">{banner.title}</p>
        <p className="text-xs text-muted-foreground truncate">{banner.description}</p>
      </div>
      {sponsored.length > 1 && (
        <div className="flex gap-1 flex-shrink-0">
          {sponsored.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); setBannerIdx(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === bannerIdx ? 'bg-amber-500' : 'bg-amber-200'}`}
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