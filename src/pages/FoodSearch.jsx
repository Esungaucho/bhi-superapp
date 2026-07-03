import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Search, Waves, Baby, Heart, Sunrise, Sun, Moon, Coffee,
  Wine, Leaf, Wheat, Umbrella, UtensilsCrossed
} from 'lucide-react';
import RestaurantCard from '@/components/food/RestaurantCard';

const CUISINES = ['All', 'Seafood', 'American', 'Pizza', 'Sandwiches', 'Italian', 'Breakfast', 'Drinks', 'Coffee', 'Bakery'];

const FILTERS = [
  { id: 'waterfront', label: 'Waterfront', icon: Waves, check: r => r.is_waterfront },
  { id: 'family_friendly', label: 'Family Friendly', icon: Baby, check: r => r.is_kid_friendly },
  { id: 'date_night', label: 'Date Night', icon: Heart, check: r => r.dining_categories?.includes('date_night') },
  { id: 'breakfast', label: 'Breakfast', icon: Sunrise, check: r => r.dining_categories?.includes('breakfast') || r.cuisine?.toLowerCase() === 'breakfast' },
  { id: 'lunch', label: 'Lunch', icon: Sun, check: r => r.dining_categories?.includes('lunch') },
  { id: 'dinner', label: 'Dinner', icon: Moon, check: r => r.dining_categories?.includes('dinner') },
  { id: 'coffee', label: 'Coffee', icon: Coffee, check: r => r.dining_categories?.includes('coffee') || r.cuisine?.toLowerCase() === 'coffee' },
  { id: 'drinks', label: 'Drinks', icon: Wine, check: r => r.dining_categories?.includes('drinks') || r.cuisine?.toLowerCase() === 'drinks' },
  { id: 'vegan', label: 'Vegan', icon: Leaf, check: r => r.has_vegan_options },
  { id: 'gluten_free', label: 'Gluten-Free', icon: Wheat, check: r => r.has_gluten_free_options },
  { id: 'outdoor_seating', label: 'Outdoor Seating', icon: Umbrella, check: r => r.has_outdoor_seating },
];

export default function FoodSearch() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [activeFilters, setActiveFilters] = useState([]);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 100),
  });

  const toggleFilter = (id) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) &&
          !r.cuisine?.toLowerCase().includes(search.toLowerCase())) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (activeFilters.length > 0) {
        for (const filterId of activeFilters) {
          const filter = FILTERS.find(f => f.id === filterId);
          if (filter && !filter.check(r)) return false;
        }
      }
      return true;
    });
  }, [restaurants, search, cuisine, activeFilters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aFeatured = a.is_featured_partner ? 1 : 0;
      const bFeatured = b.is_featured_partner ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      if (aFeatured && bFeatured) return (a.sort_order ?? 999) - (b.sort_order ?? 999);
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [filtered]);

  const featured = sorted.filter(r => r.is_featured_partner);
  const regular = sorted.filter(r => !r.is_featured_partner);

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary px-4 pt-4 pb-5">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          <h2 className="text-primary-foreground font-heading text-xl">Island Dining</h2>
        </div>
        <p className="text-primary-foreground/70 text-sm mt-0.5">Discover Bald Head Island restaurants</p>
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

      {/* Filter toggles */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => {
          const Icon = f.icon;
          const active = activeFilters.includes(f.id);
          return (
            <button key={f.id} onClick={() => toggleFilter(f.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}>
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" strokeWidth={1.5} />
            <p className="font-medium">No restaurants found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-5">
            {featured.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-luxe-sm mb-3">Featured Partners</p>
                <div className="space-y-3">
                  {featured.map(r => <RestaurantCard key={r.id} restaurant={r} featured />)}
                </div>
              </div>
            )}
            <div>
              {featured.length > 0 && regular.length > 0 && (
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-luxe-sm mb-3">All Restaurants</p>
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