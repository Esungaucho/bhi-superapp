import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function RestaurantCard({ restaurant }) {
  const image = restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80';

  return (
    <Link to={`/food/${restaurant.id}`} className="block bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-muted overflow-hidden">
        <img src={image} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Closed</span>
          </div>
        )}
        <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          {restaurant.cuisine}
        </span>
      </div>

      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-sm text-foreground line-clamp-1">{restaurant.name}</p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{restaurant.estimated_delivery_minutes || 30}–{(restaurant.estimated_delivery_minutes || 30) + 10} min
          </span>
          <span>
            {restaurant.delivery_fee > 0 ? `$${restaurant.delivery_fee} delivery` : 'Free delivery'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {restaurant.fulfillment_types?.map(t => (
              <span key={t} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded capitalize">{t.replace('_', '-')}</span>
            ))}
          </div>
          {restaurant.rating && (
            <span className="flex items-center gap-0.5 text-xs font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {restaurant.rating.toFixed(1)}
              {restaurant.review_count > 0 && <span className="text-muted-foreground font-normal">({restaurant.review_count})</span>}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}