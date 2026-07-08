import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CONCIERGE_COLLECTIONS } from '@/lib/diningConstants';

export default function ConciergeCollections({ restaurants, onSelect, selected }) {
  const scrollRef = useRef(null);

  if (!restaurants || restaurants.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="px-4 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-sm font-semibold text-foreground">Concierge Collections</p>
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
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {CONCIERGE_COLLECTIONS.map(col => {
          const Icon = col.icon;
          const matchedRestaurants = restaurants.filter(col.filter);
          const count = matchedRestaurants.length;
          const isActive = selected === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelect(isActive ? null : col.id)}
              className={`flex-shrink-0 w-44 text-left rounded-2xl border p-3 bg-gradient-to-br ${col.gradient} transition-all ${
                isActive ? 'border-accent shadow-luxe-sm' : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${isActive ? 'bg-accent text-white' : 'bg-card text-foreground/70'}`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight">{col.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{col.subtitle}</p>
              {count > 0 && <p className="text-[10px] text-accent font-medium mt-1">{count} {count === 1 ? 'spot' : 'spots'}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}