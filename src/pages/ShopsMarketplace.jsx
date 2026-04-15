import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/shops/ProductCard';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$99/mo',
    color: 'border-slate-300 bg-slate-50',
    highlight: 'text-slate-700',
    features: ['Shop directory listing', 'Up to 10 products', 'Basic analytics'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$500–$1,500/mo',
    color: 'border-amber-300 bg-amber-50',
    highlight: 'text-amber-700',
    features: ['Featured placement', 'Unlimited products', 'Ad slot eligibility', 'Priority support', 'Commission: 6%'],
  },
  {
    id: 'conglomerate',
    name: 'Conglomerate',
    price: '$3,500/mo',
    color: 'border-purple-300 bg-purple-50',
    highlight: 'text-purple-700',
    features: ['Alliance partner badge', 'Cross-promotion network', 'Homepage banner', 'Dedicated account manager', 'Commission: 4%'],
    badge: 'Best Value',
  },
];

export default function ShopsMarketplace() {
  const [search, setSearch] = useState('');
  const [showTiers, setShowTiers] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => base44.entities.Product.filter({ is_available: true }),
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.filter({ is_active: true }),
  });

  const shopMap = useMemo(() => {
    return shops.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
  }, [shops]);

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const featured = filtered.filter(p => p.is_featured);
  const regular = filtered.filter(p => !p.is_featured);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-accent px-4 pt-5 pb-6 text-primary-foreground">
        <h2 className="font-bold text-xl">🛒 Island Marketplace</h2>
        <p className="text-white/70 text-sm mt-0.5 mb-4">Shop local products from BHI businesses</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10 h-10 rounded-xl bg-white/95 text-foreground" />
        </div>
      </div>

      {/* Partner CTA */}
      <button onClick={() => setShowTiers(!showTiers)}
        className="w-full bg-purple-50 border-b border-purple-200 px-4 py-3 flex items-center justify-between text-left">
        <div>
          <p className="text-xs font-bold text-purple-700">🤝 List your shop on BHI</p>
          <p className="text-xs text-muted-foreground">Plans from $99/month — tap to see options</p>
        </div>
        <span className="text-purple-600 text-xs font-semibold">{showTiers ? '▲' : '▼'}</span>
      </button>

      {/* Subscription tiers */}
      {showTiers && (
        <div className="px-4 py-4 space-y-3 bg-card border-b">
          <p className="text-sm font-bold text-center">Subscription Plans</p>
          {TIERS.map(tier => (
            <div key={tier.id} className={`border-2 rounded-2xl p-4 relative ${tier.color}`}>
              {tier.badge && (
                <span className="absolute -top-2.5 right-3 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {tier.badge}
                </span>
              )}
              <div className="flex justify-between items-start mb-2">
                <p className={`font-bold ${tier.highlight}`}>{tier.name}</p>
                <p className={`text-sm font-bold ${tier.highlight}`}>{tier.price}</p>
              </div>
              <ul className="space-y-1">
                {tier.features.map(f => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground text-center">Contact us to get your shop listed</p>
        </div>
      )}

      {/* Products */}
      <div className="px-4 py-4 pb-8 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🛒</p>
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Featured Products</p>
                <div className="grid grid-cols-2 gap-3">
                  {featured.map(p => (
                    <ProductCard key={p.id} product={p} shopName={shopMap[p.shop_id]?.name} />
                  ))}
                </div>
              </div>
            )}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">All Products</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {regular.map(p => (
                    <ProductCard key={p.id} product={p} shopName={shopMap[p.shop_id]?.name} />
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>
    </div>
  );
}