import React from 'react';
import { getCategory } from '@/lib/birdieConstants';

export default function CategoryGrid({ selected, onSelect }) {
  const categories = [
    'grocery', 'pharmacy', 'baby_supplies', 'beach_toys', 'beach_chairs', 'sunscreen',
    'clothing', 'shoes', 'swimsuits', 'holiday_items', 'easter_baskets', 'birthday_gifts',
    'decorations', 'pet_supplies', 'fishing_supplies', 'hardware', 'electronics', 'chargers',
    'flowers', 'wine_specialty', 'last_minute',
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map(id => {
        const cat = getCategory(id);
        const Icon = cat.Icon;
        const isActive = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              isActive ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/30'
            }`}
          >
            <Icon className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}