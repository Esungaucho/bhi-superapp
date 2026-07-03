import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bird, Award, Waves } from 'lucide-react';

export default function RestaurantCard({ restaurant, featured }) {
  const image = restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80';

  return (
    <Link to={`/food/${restaurant.id}`} className="block bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-muted overflow-hidden">
        <img src={image} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.is_featured_partner && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured Partner</span>
        )}
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Closed</span>
          </div>
        )}
        <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          {restaurant.cuisine}
        </span>
        {restaurant.price_range && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {restaurant.price_range}
          </span>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-foreground line-clamp-1">{restaurant.name}</p>
          {restaurant.rating && (
            <span className="flex items-center gap-0.5 text-xs font-semibold flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1">
          {restaurant.is_waterfront && <MiniBadge icon={Waves} label="Waterfront" />}
          {restaurant.is_kid_friendly && <MiniBadge label="Family" />}
          {restaurant.has_outdoor_seating && <MiniBadge label="Outdoor" />}
          {restaurant.has_vegan_options && <MiniBadge label="Vegan" />}
          {restaurant.has_gluten_free_options && <MiniBadge label="GF" />}
          {restaurant.is_birdie_trusted_partner && <MiniBadge icon={Bird} label="Birdie" accent />}
          {restaurant.is_concierge_recommended && <MiniBadge icon={Award} label="Concierge" accent />}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{restaurant.estimated_delivery_minutes || 30}–{(restaurant.estimated_delivery_minutes || 30) + 10} min
          </span>
          <span>
            {restaurant.offers_delivery && restaurant.delivery_fee > 0 ? `$${restaurant.delivery_fee} delivery` : restaurant.offers_delivery ? 'Free delivery' : restaurant.offers_takeout ? 'Takeout' : 'Dine in'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniBadge({ icon: Icon, label, accent }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${accent ? 'bg-accent/15 text-accent' : 'bg-secondary text-muted-foreground'}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}