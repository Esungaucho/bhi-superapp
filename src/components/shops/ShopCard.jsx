import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const CATEGORY_EMOJI = {
  boutique: '👗', grocery: '🛒', gear: '🎒', art: '🎨',
  food_beverage: '🧃', wellness: '💆', home_decor: '🏠', services: '🔧',
};

const TIER_BADGE = {
  conglomerate: { label: 'Partner', color: 'bg-purple-100 text-purple-700' },
  premium: { label: 'Premium', color: 'bg-amber-100 text-amber-700' },
  basic: { label: null, color: '' },
};

export default function ShopCard({ shop }) {
  const emoji = CATEGORY_EMOJI[shop.category] || '🛍️';
  const tier = TIER_BADGE[shop.subscription_tier];

  return (
    <Link to={`/shops/${shop.id}`} className="block bg-card rounded-2xl border overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner / placeholder */}
      <div className="h-24 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
        {shop.banner_url
          ? <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">{emoji}</div>
        }
        {shop.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        {tier.label && (
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.color}`}>{tier.label}</span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm leading-tight">{shop.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{emoji} {shop.category?.replace('_', ' ')}</p>
          </div>
          {shop.rating && (
            <span className="flex items-center gap-0.5 text-xs font-semibold flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {shop.rating.toFixed(1)}
            </span>
          )}
        </div>
        {shop.hours && <p className="text-[11px] text-muted-foreground mt-1.5">🕐 {shop.hours}</p>}
      </div>
    </Link>
  );
}