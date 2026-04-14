import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const CATEGORY_META = {
  golf_cart: { emoji: '🛺', label: 'Golf Cart', color: 'bg-emerald-100 text-emerald-700' },
  bike: { emoji: '🚲', label: 'Bike', color: 'bg-sky-100 text-sky-700' },
  scooter: { emoji: '🛵', label: 'Scooter', color: 'bg-violet-100 text-violet-700' },
  gear: { emoji: '🎒', label: 'Gear', color: 'bg-amber-100 text-amber-700' },
};

export default function RentalCard({ item }) {
  const meta = CATEGORY_META[item.category] || { emoji: '📦', label: item.category, color: 'bg-secondary text-foreground' };
  const image = item.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
  const weeklyNote = item.price_per_week
    ? `$${item.price_per_week}/wk`
    : null;

  return (
    <Link to={`/rentals/${item.id}`} className="block bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-muted overflow-hidden">
        <img src={image} alt={item.name} className="w-full h-full object-cover" />
        {item.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
          {meta.emoji} {meta.label}
        </span>
        {item.available_units === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-sm text-foreground line-clamp-1">{item.name}</p>
        {item.vendor_name && <p className="text-[11px] text-muted-foreground">by {item.vendor_name}</p>}

        <div className="flex justify-between items-center pt-0.5">
          <div>
            <span className="text-sm font-bold text-foreground">${item.price_per_day}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
            {weeklyNote && <span className="text-[11px] text-muted-foreground ml-2">{weeklyNote}</span>}
          </div>
          <div className="flex items-center gap-2">
            {item.rating && (
              <span className="flex items-center gap-0.5 text-xs font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              item.available_units > 2 ? 'bg-emerald-50 text-emerald-700' :
              item.available_units > 0 ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-700'
            }`}>
              {item.available_units > 0 ? `${item.available_units} left` : 'Full'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}