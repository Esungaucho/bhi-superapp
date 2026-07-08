import React, { useRef } from 'react';
import {
  Wine, Users, Sunset, Coffee, PartyPopper, Fish, UtensilsCrossed,
  IceCream, ShoppingBag, Salad, Leaf, Star, Bird, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export const BIRDIE_CATEGORIES = [
  {
    id: 'date_night',
    icon: Wine,
    label: 'Date Night',
    subtitle: 'Romantic spots for two',
    filter: r => r.dining_categories?.includes('date_night') || r.tags?.some(t => t.toLowerCase().includes('date night')),
  },
  {
    id: 'family_friendly',
    icon: Users,
    label: 'Family Friendly',
    subtitle: 'Great for all ages',
    filter: r => r.is_kid_friendly,
  },
  {
    id: 'sunset',
    icon: Sunset,
    label: 'Best Sunset Views',
    subtitle: 'Golden hour dining',
    filter: r => r.is_waterfront && (r.has_outdoor_seating || r.tags?.some(t => t.toLowerCase().includes('sunset'))),
  },
  {
    id: 'coffee_breakfast',
    icon: Coffee,
    label: 'Coffee & Breakfast',
    subtitle: 'Morning essentials',
    filter: r => r.dining_categories?.includes('coffee') || r.dining_categories?.includes('breakfast') || r.cuisine === 'Coffee',
  },
  {
    id: 'celebration',
    icon: PartyPopper,
    label: 'Celebration Dinner',
    subtitle: 'Special occasions',
    filter: r => r.price_range === '$$$$' || r.tags?.includes('Fine Dining'),
  },
  {
    id: 'seafood',
    icon: Fish,
    label: 'Seafood',
    subtitle: 'Fresh from the catch',
    filter: r => r.cuisine === 'Seafood' || r.tags?.includes('Seafood'),
  },
  {
    id: 'casual',
    icon: UtensilsCrossed,
    label: 'Casual Dining',
    subtitle: 'Relaxed and easy',
    filter: r => r.price_range === '$' || r.price_range === '$$' || r.tags?.includes('Casual Dining'),
  },
  {
    id: 'dessert',
    icon: IceCream,
    label: 'Dessert & Ice Cream',
    subtitle: 'Sweet treats',
    filter: r => r.tags?.some(t => ['Dessert', 'Ice Cream'].includes(t)),
  },
  {
    id: 'grab_go',
    icon: ShoppingBag,
    label: 'Grab & Go',
    subtitle: 'Quick and tasty',
    filter: r => r.tags?.includes('Grab & Go') || r.tags?.includes('Grab & Go') || r.offers_takeout,
  },
  {
    id: 'healthy',
    icon: Salad,
    label: 'Healthy Options',
    subtitle: 'Wholesome choices',
    filter: r => r.has_vegan_options || r.has_gluten_free_options || r.has_vegetarian_options,
  },
  {
    id: 'vegan',
    icon: Leaf,
    label: 'Vegetarian & Vegan',
    subtitle: 'Plant-based dining',
    filter: r => r.has_vegan_options || r.has_vegetarian_options,
  },
  {
    id: 'birdie_favorites',
    icon: Star,
    label: "Birdie's Favorites",
    subtitle: 'Handpicked by Birdie',
    filter: r => r.is_birdie_trusted_partner || r.is_concierge_recommended,
    featured: true,
  },
];

export default function BirdieRecommendations({ selected, onSelect }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="px-4 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Bird className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground flex items-center gap-1.5">
              Birdie Recommends
              <Sparkles className="w-3 h-3 text-accent" strokeWidth={1.5} />
            </p>
            <p className="text-[11px] text-muted-foreground">Tell Birdie what you're in the mood for</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {BIRDIE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`flex-shrink-0 w-32 text-left rounded-2xl border p-3 transition-all ${
                isActive
                  ? 'border-accent bg-accent/10 shadow-luxe-sm'
                  : cat.featured
                    ? 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                    : 'border-border bg-card hover:border-accent/40 hover:bg-sand/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                isActive ? 'bg-accent text-white' : cat.featured ? 'bg-accent/15 text-accent' : 'bg-sand text-foreground/70'
              }`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight">{cat.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}