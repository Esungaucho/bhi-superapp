import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ShopCard from '@/components/shops/ShopCard';

const CATEGORIES = [
  { value: 'all', label: '🏷️ All' },
  { value: 'boutique', label: '👗 Boutique' },
  { value: 'grocery', label: '🛒 Grocery' },
  { value: 'gear', label: '🎒 Gear' },
  { value: 'art', label: '🎨 Art' },
  { value: 'food_beverage', label: '🧃 Food & Drink' },
  { value: 'wellness', label: '💆 Wellness' },
  { value: 'home_decor', label: '🏠 Home' },
  { value: 'services', label: '🔧 Services' },
];

export default function ShopsDirectory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.filter({ is_active: true }),
  });

  const filtered = useMemo(() => {
    return shops.filter(s => {
      if (category !== 'all' && s.category !== category) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [shops, category, search]);

  const conglomerate = filtered.filter(s => s.is_conglomerate_partner);
  const featured = filtered.filter(s => s.is_featured && !s.is_conglomerate_partner);
  const regular = filtered.filter(s => !s.is_featured && !s.is_conglomerate_partner);

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary px-4 pt-5 pb-6">
        <h2 className="text-primary-foreground font-bold text-xl">🛍️ Island Shops</h2>
        <p className="text-primary-foreground/70 text-sm mt-0.5 mb-4">Discover local businesses on Bald Head Island</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search shops..."
            className="pl-10 h-10 rounded-xl bg-white/95" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              category === c.value
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-card text-foreground border-border hover:border-accent/50'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🛍️</p>
            <p className="font-medium">No shops found</p>
          </div>
        ) : (
          <>
            {/* Conglomerate partners */}
            {conglomerate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">BHI Alliance Partners</span>
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">CONGLOMERATE</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 space-y-2">
                  {conglomerate.map(s => <ShopCard key={s.id} shop={s} />)}
                </div>
              </div>
            )}

            {/* Featured */}
            {featured.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Featured</p>
                <div className="grid grid-cols-2 gap-3">
                  {featured.map(s => <ShopCard key={s.id} shop={s} />)}
                </div>
              </div>
            )}

            {/* Regular */}
            {regular.length > 0 && (
              <div>
                {(featured.length > 0 || conglomerate.length > 0) && (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">All Shops</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {regular.map(s => <ShopCard key={s.id} shop={s} />)}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">{filtered.length} shop{filtered.length !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>
    </div>
  );
}