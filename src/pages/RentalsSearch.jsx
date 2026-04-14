import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import RentalCard from '@/components/rentals/RentalCard';

const CATEGORIES = [
  { value: 'all', label: '🏷️ All' },
  { value: 'golf_cart', label: '🛺 Golf Carts' },
  { value: 'bike', label: '🚲 Bikes' },
  { value: 'scooter', label: '🛵 Scooters' },
  { value: 'gear', label: '🎒 Gear' },
];

export default function RentalsSearch() {
  const [category, setCategory] = useState('all');
  const [showAvailable, setShowAvailable] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['rentalItems'],
    queryFn: () => base44.entities.RentalItem.list('-is_featured', 100),
  });

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (showAvailable && item.available_units === 0) return false;
      return true;
    });
  }, [items, category, showAvailable]);

  const featured = filtered.filter(i => i.is_featured);
  const regular = filtered.filter(i => !i.is_featured);

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary px-4 pt-4 pb-5">
        <h2 className="text-primary-foreground font-bold text-lg">🛺 Island Rentals</h2>
        <p className="text-primary-foreground/70 text-sm mt-0.5">Golf carts, bikes, scooters & gear</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              category === c.value
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-card text-foreground border-border hover:border-accent/50'
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          onClick={() => setShowAvailable(!showAvailable)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            showAvailable
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-card text-foreground border-border'
          }`}
        >
          Available only
        </button>
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🛺</p>
            <p className="font-medium">No rentals found</p>
            <p className="text-sm">Try a different category</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Featured</p>
                <div className="grid grid-cols-2 gap-3">
                  {featured.map(item => <RentalCard key={item.id} item={item} />)}
                </div>
              </div>
            )}
            <div>
              {featured.length > 0 && regular.length > 0 && (
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">All Rentals</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {regular.map(item => <RentalCard key={item.id} item={item} />)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-5">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>
    </div>
  );
}