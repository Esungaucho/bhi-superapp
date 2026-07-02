import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const CATEGORY_META = {
  restaurant: { emoji: '🍽️', label: 'Restaurant', base: '/food' },
  lodging: { emoji: '🏡', label: 'Lodging', base: '/lodging' },
  rental: { emoji: '🛺', label: 'Rental', base: '/equipment' },
  shop: { emoji: '🛍️', label: 'Shop', base: '/shops' },
};

export default function UniversalSearch() {
  const [query, setQuery] = useState('');

  const { data: restaurants = [], isLoading: lr } = useQuery({
    queryKey: ['searchRestaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: lodgings = [], isLoading: ll } = useQuery({
    queryKey: ['searchLodgings'],
    queryFn: () => base44.entities.Lodging.list(),
  });

  const { data: rentals = [], isLoading: lrt } = useQuery({
    queryKey: ['searchRentals'],
    queryFn: () => base44.entities.RentalItem.list(),
  });

  const { data: shops = [], isLoading: ls } = useQuery({
    queryKey: ['searchShops'],
    queryFn: () => base44.entities.Shop.filter({ is_active: true }),
  });

  const isLoading = lr || ll || lrt || ls;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...restaurants.filter(r => r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q))
        .map(r => ({ ...r, _type: 'restaurant', _link: `/food/${r.id}` })),
      ...lodgings.filter(l => l.title?.toLowerCase().includes(q) || l.neighborhood?.toLowerCase().includes(q))
        .map(l => ({ ...l, _type: 'lodging', _link: `/lodging/${l.id}` })),
      ...rentals.filter(r => r.name?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q))
        .map(r => ({ ...r, _type: 'rental', _link: `/rentals/${r.id}` })),
      ...shops.filter(s => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q))
        .map(s => ({ ...s, _type: 'shop', _link: `/shops/${s.id}` })),
    ].slice(0, 20);
  }, [query, restaurants, lodgings, rentals, shops]);

  return (
    <div className="px-4 pt-5 pb-6">
      <h2 className="text-xl font-bold mb-4">Search BHI</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Restaurants, shops, rentals, stays..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-card"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      )}

      {!isLoading && query.trim() && results.length === 0 && (
        <div className="text-center py-14 text-muted-foreground">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-medium">No results for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {!query.trim() && !isLoading && (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Browse Categories</p>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <Link key={key} to={meta.base} className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3 hover:border-accent/50 transition-colors">
              <span className="text-2xl">{meta.emoji}</span>
              <span className="text-sm font-semibold">{meta.label}</span>
            </Link>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map(item => {
            const meta = CATEGORY_META[item._type];
            const name = item.name || item.title;
            const sub = item.cuisine || item.category || item.neighborhood || '';
            return (
              <Link key={item.id} to={item._link} className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3 hover:border-accent/50 transition-colors">
                <span className="text-xl">{meta.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{meta.label}{sub ? ` · ${sub}` : ''}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}