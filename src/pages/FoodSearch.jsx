import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import RestaurantCard from '@/components/food/RestaurantCard';

const CUISINES = ['All', 'Seafood', 'American', 'Pizza', 'Sandwiches', 'Breakfast', 'Drinks'];

export default function FoodSearch() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [fulfillment, setFulfillment] = useState('all');

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-is_featured', 100),
  });

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
          !r.cuisine.toLowerCase().includes(search.toLowerCase())) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (fulfillment !== 'all' && !r.fulfillment_types?.includes(fulfillment)) return false;
      return true;
    });
  }, [restaurants, search, cuisine, fulfillment]);

  const featured = filtered.filter(r => r.is_featured);
  const regular = filtered.filter(r => !r.is_featured);

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary px-4 pt-4 pb-5">
        <h2 className="text-primary-foreground font-bold text-lg">🍽️ Island Eats</h2>
        <p className="text-primary-foreground/70 text-sm mt-0.5">Order from BHI restaurants</p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants or cuisine…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50 text-sm border border-white/20 focus:outline-none focus:bg-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Cuisine pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {CUISINES.map(c => (
          <button key={c} onClick={() => setCuisine(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              cuisine === c
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-card text-foreground border-border hover:border-accent/50'
            }`}>{c}</button>
        ))}
      </div>

      {/* Fulfillment toggle */}
      <div className="flex gap-2 px-4 pb-3">
        {[['all', '🍽️ All'], ['delivery', '🛵 Delivery'], ['pickup', '🥡 Pickup'], ['dine_in', '🪑 Dine In']].map(([v, l]) => (
          <button key={v} onClick={() => setFulfillment(v)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              fulfillment === v
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border'
            }`}>{l}</button>
        ))}
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="font-medium">No restaurants found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-5">
            {featured.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Featured</p>
                <div className="space-y-3">
                  {featured.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
              </div>
            )}
            <div>
              {featured.length > 0 && regular.length > 0 && (
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">All Restaurants</p>
              )}
              <div className="space-y-3">
                {regular.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}