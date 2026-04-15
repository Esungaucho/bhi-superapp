import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, MapPin, Clock, Phone, Globe } from 'lucide-react';
import ProductCard from '@/components/shops/ProductCard';

const CATEGORY_EMOJI = {
  boutique: '👗', grocery: '🛒', gear: '🎒', art: '🎨',
  food_beverage: '🧃', wellness: '💆', home_decor: '🏠', services: '🔧',
};

const TIER_INFO = {
  basic:        { label: 'Basic Member', color: 'text-muted-foreground bg-muted' },
  premium:      { label: 'Premium Partner', color: 'text-amber-700 bg-amber-50' },
  conglomerate: { label: 'Alliance Partner', color: 'text-purple-700 bg-purple-50' },
};

export default function ShopDetail() {
  const { id } = useParams();

  const { data: shops = [], isLoading: loadingShop } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.filter({ is_active: true }),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shopProducts', id],
    queryFn: () => base44.entities.Product.filter({ shop_id: id }),
    enabled: !!id,
  });

  const shop = shops.find(s => s.id === id);
  const isLoading = loadingShop || loadingProducts;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!shop) return (
    <div className="px-4 py-12 text-center text-muted-foreground">
      <p className="text-4xl mb-2">🛍️</p>
      <p className="font-medium">Shop not found</p>
      <Link to="/shops" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">← Back to Directory</Link>
    </div>
  );

  const emoji = CATEGORY_EMOJI[shop.category] || '🛍️';
  const tierInfo = TIER_INFO[shop.subscription_tier] || TIER_INFO.basic;
  const productsByCategory = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-primary/30 to-accent/20 overflow-hidden">
        {shop.banner_url
          ? <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">{emoji}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {shop.is_conglomerate_partner && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            🤝 Alliance Partner
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Shop header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{shop.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{emoji} {shop.category?.replace('_', ' ')}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {shop.rating && (
                <span className="flex items-center gap-0.5 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {shop.rating.toFixed(1)}
                  <span className="text-muted-foreground font-normal">({shop.review_count})</span>
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierInfo.color}`}>{tierInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {shop.description && <p className="text-sm text-muted-foreground leading-relaxed">{shop.description}</p>}

        {/* Info grid */}
        <div className="bg-card border rounded-2xl p-4 space-y-2.5">
          {shop.address && <InfoRow icon={<MapPin className="w-4 h-4 text-accent" />} text={shop.address} />}
          {shop.hours && <InfoRow icon={<Clock className="w-4 h-4 text-accent" />} text={shop.hours} />}
          {shop.phone && <InfoRow icon={<Phone className="w-4 h-4 text-accent" />} text={shop.phone} />}
          {shop.website && (
            <InfoRow icon={<Globe className="w-4 h-4 text-accent" />}
              text={<a href={shop.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">{shop.website}</a>} />
          )}
        </div>

        {/* Tags */}
        {shop.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shop.tags.map(t => (
              <span key={t} className="text-[11px] bg-secondary px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base">Products</h3>
            {Object.entries(productsByCategory).map(([cat, prods]) => (
              <div key={cat}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{cat}</p>
                <div className="grid grid-cols-2 gap-3">
                  {prods.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground bg-secondary rounded-2xl">
            <p className="text-2xl mb-1">📦</p>
            <p className="text-sm">No products listed yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}