import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Search, Waves, Baby, Heart, Sunrise, Sun, Moon, Coffee,
  Wine, Leaf, Wheat, Umbrella, UtensilsCrossed, X, Bird, IceCream,
  Fish, Flag, Crown, Clock, Pizza, Sparkles, ConciergeBell, ShoppingBag,
  IceCreamBowl
} from 'lucide-react';
import RestaurantCard from '@/components/food/RestaurantCard';
import BirdieRecommendations, { BIRDIE_CATEGORIES } from '@/components/food/BirdieRecommendations';
import AIDiningSearch from '@/components/food/AIDiningSearch';
import ConciergeCollections from '@/components/food/ConciergeCollections';
import { CONCIERGE_COLLECTIONS } from '@/lib/diningConstants';
import { DIETARY_FILTERS } from '@/lib/diningConstants';

const CUISINES = [
  { id: 'All', label: 'All', check: () => true },
  { id: 'Seafood', label: 'Seafood', icon: Fish, check: r => r.cuisine?.toLowerCase().includes('seafood') },
  { id: 'American', label: 'American', icon: Flag, check: r => r.cuisine?.toLowerCase().includes('american') },
  { id: 'Mexican', label: 'Mexican', icon: ConciergeBell, check: r => r.cuisine?.toLowerCase().includes('mexican') },
  { id: 'Pizza', label: 'Pizza', icon: Pizza, check: r => r.cuisine?.toLowerCase().includes('pizza') },
  { id: 'Coffee', label: 'Coffee', icon: Coffee, check: r => r.cuisine?.toLowerCase().includes('coffee') },
  { id: 'Ice Cream', label: 'Ice Cream', icon: IceCream, check: r => r.cuisine?.toLowerCase().includes('ice cream') },
  { id: 'Fine Dining', label: 'Fine Dining', icon: Crown, check: r => r.price_range === '$$$$' },
  { id: 'Casual', label: 'Casual', icon: UtensilsCrossed, check: r => r.price_range === '$' || r.price_range === '$$' },
];

const LIFESTYLE_FILTERS = [
  { id: 'breakfast', label: 'Breakfast', icon: Sunrise, check: r => r.dining_categories?.includes('breakfast') },
  { id: 'lunch', label: 'Lunch', icon: Sun, check: r => r.dining_categories?.includes('lunch') },
  { id: 'dinner', label: 'Dinner', icon: Moon, check: r => r.dining_categories?.includes('dinner') },
  { id: 'waterfront', label: 'Waterfront', icon: Waves, check: r => r.is_waterfront },
  { id: 'outdoor_seating', label: 'Outdoor', icon: Umbrella, check: r => r.has_outdoor_seating },
  { id: 'family_friendly', label: 'Family', icon: Baby, check: r => r.is_kid_friendly },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: Bird, check: r => r.is_dog_friendly },
  { id: 'member_only', label: 'Member Only', icon: Crown, check: r => r.member_only },
  { id: 'open_now', label: 'Open Now', icon: Clock, check: r => r.is_open },
  { id: 'date_night', label: 'Date Night', icon: Heart, check: r => r.dining_categories?.includes('date_night') },
];

export default function FoodSearch() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeDietary, setActiveDietary] = useState([]);
  const [birdieCategory, setBirdieCategory] = useState(null);
  const [activeCollection, setActiveCollection] = useState(null);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 100),
  });

  const toggleFilter = (id, list, setter) => {
    setter(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const activeBirdieCat = BIRDIE_CATEGORIES.find(c => c.id === birdieCategory);
  const activeCuisine = CUISINES.find(c => c.id === cuisine);
  const activeCol = CONCIERGE_COLLECTIONS.find(c => c.id === activeCollection);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) &&
          !r.cuisine?.toLowerCase().includes(search.toLowerCase()) &&
          !r.description?.toLowerCase().includes(search.toLowerCase()) &&
          !r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (activeCuisine && cuisine !== 'All' && !activeCuisine.check(r)) return false;
      if (activeBirdieCat && !activeBirdieCat.filter(r)) return false;
      if (activeCol && !activeCol.filter(r)) return false;
      if (activeFilters.length > 0) {
        for (const filterId of activeFilters) {
          const filter = LIFESTYLE_FILTERS.find(f => f.id === filterId);
          if (filter && !filter.check(r)) return false;
        }
      }
      if (activeDietary.length > 0) {
        for (const filterId of activeDietary) {
          const filter = DIETARY_FILTERS.find(f => f.id === filterId);
          if (filter && !filter.check(r)) return false;
        }
      }
      return true;
    });
  }, [restaurants, search, cuisine, activeCuisine, activeFilters, activeDietary, activeBirdieCat, activeCol]);

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
  const activeFilterCount = activeFilters.length + activeDietary.length + (cuisine !== 'All' ? 1 : 0);

  const clearAll = () => {
    setActiveFilters([]);
    setActiveDietary([]);
    setCuisine('All');
    setActiveCollection(null);
    setBirdieCategory(null);
  };

  return (
    <div>
      {/* AI Dining Search */}
      <AIDiningSearch restaurants={restaurants} />

      {/* Concierge Collections */}
      <ConciergeCollections restaurants={restaurants} selected={activeCollection} onSelect={setActiveCollection} />

      {/* Active collection banner */}
      {activeCol && (
        <div className="px-4 py-2.5 flex items-center justify-between bg-accent/5 border-b border-accent/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{activeCol.title}</p>
              <p className="text-[10px] text-muted-foreground">{sorted.length} {sorted.length === 1 ? 'spot' : 'spots'}</p>
            </div>
          </div>
          <button onClick={() => setActiveCollection(null)} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Birdie Recommendations */}
      <BirdieRecommendations selected={birdieCategory} onSelect={setBirdieCategory} />

      {/* Active Birdie category banner */}
      {activeBirdieCat && (
        <div className="px-4 py-2.5 flex items-center justify-between bg-accent/5 border-b border-accent/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
              <Bird className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{activeBirdieCat.label}</p>
              <p className="text-[10px] text-muted-foreground">{sorted.length} {sorted.length === 1 ? 'pick' : 'picks'} from Birdie</p>
            </div>
          </div>
          <button onClick={() => setBirdieCategory(null)} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Cuisine pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {CUISINES.map(c => {
          const Icon = c.icon;
          const active = cuisine === c.id;
          return (
            <button key={c.id} onClick={() => setCuisine(c.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-foreground border-border hover:border-accent/50'
              }`}>
              {Icon && <Icon className="w-3 h-3" strokeWidth={1.5} />}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Lifestyle filters */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
        {LIFESTYLE_FILTERS.map(f => {
          const Icon = f.icon;
          const active = activeFilters.includes(f.id);
          return (
            <button key={f.id} onClick={() => toggleFilter(f.id, activeFilters, setActiveFilters)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}>
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Dietary filters */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {DIETARY_FILTERS.map(f => {
          const active = activeDietary.includes(f.id);
          return (
            <button key={f.id} onClick={() => toggleFilter(f.id, activeDietary, setActiveDietary)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-card text-muted-foreground border-border hover:border-emerald-500/50'
              }`}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Active filters count */}
      {activeFilterCount > 0 && (
        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? 'restaurant' : 'restaurants'} · {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </p>
          <button onClick={clearAll} className="text-[11px] font-semibold text-accent hover:underline">
            Clear all
          </button>
        </div>
      )}

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
            {activeBirdieCat && (
              <p className="text-xs font-bold text-accent uppercase tracking-luxe-sm flex items-center gap-1.5">
                <Bird className="w-3.5 h-3.5" strokeWidth={1.5} />
                Birdie's Picks — {activeBirdieCat.label}
              </p>
            )}
            {activeCol && (
              <p className="text-xs font-bold text-accent uppercase tracking-luxe-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                {activeCol.title}
              </p>
            )}
            {featured.length > 0 && !activeBirdieCat && !activeCol && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-luxe-sm mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Featured Partners
                </p>
                <div className="space-y-3">
                  {featured.map(r => <RestaurantCard key={r.id} restaurant={r} featured />)}
                </div>
              </div>
            )}
            <div>
              {featured.length > 0 && regular.length > 0 && !activeBirdieCat && !activeCol && (
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