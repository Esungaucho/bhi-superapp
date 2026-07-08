import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Star, Clock, Bird, Award, Waves, Baby, Umbrella, Leaf, Wheat,
  UtensilsCrossed, Phone, MapPin, Globe, Plus, Share2, Crown,
  Check, Dog
} from 'lucide-react';

export default function RestaurantCard({ restaurant, featured }) {
  const queryClient = useQueryClient();
  const [addedToPlans, setAddedToPlans] = useState(false);

  const image = restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c0?w=600&q=80';

  const handleAddToPlans = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const user = await base44.auth.me();
      if (!user) return;
      await base44.entities.PlanItem.create({
        user_email: user.email,
        title: restaurant.name,
        category: 'dining',
        location: restaurant.address || restaurant.location || '',
        notes: restaurant.cuisine || '',
        confirmation_link: restaurant.website_url || '',
      });
      setAddedToPlans(true);
      queryClient.invalidateQueries({ queryKey: ['planItems'] });
      setTimeout(() => setAddedToPlans(false), 2500);
    } catch {}
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = restaurant.website_url || `${window.location.origin}/food/${restaurant.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant.name, text: restaurant.description || '', url: shareUrl });
      } catch {}
    } else {
      navigator.clipboard?.writeText(shareUrl);
      setAddedToPlans(true);
      setTimeout(() => setAddedToPlans(false), 1500);
    }
  };

  return (
    <div className={`bg-card rounded-2xl border overflow-hidden shadow-luxe-sm hover:shadow-luxe transition-all ${featured ? 'border-accent/20' : 'border-border/50'}`}>
      {/* Image + overlay */}
      <Link to={`/food/${restaurant.id}`}>
        <div className="relative h-44 bg-muted overflow-hidden">
          <img src={image} alt={restaurant.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {restaurant.is_featured_partner && (
            <span className="absolute top-2.5 left-2.5 bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">Featured Partner</span>
          )}
          {restaurant.member_only && (
            <span className="absolute top-2.5 right-2.5 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> Members Only
            </span>
          )}
          {!restaurant.is_open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Currently Closed</span>
            </div>
          )}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            {restaurant.price_range && (
              <span className="text-[10px] font-bold bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {restaurant.price_range}
              </span>
            )}
            <span className="text-[10px] font-semibold bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {restaurant.cuisine}
            </span>
          </div>
          {restaurant.rating && (
            <span className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 text-[10px] font-bold bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        <Link to={`/food/${restaurant.id}`}>
          <p className="font-heading font-semibold text-[15px] text-foreground leading-tight">{restaurant.name}</p>
          {restaurant.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{restaurant.description}</p>
          )}
        </Link>

        {/* Info badges */}
        <div className="flex flex-wrap items-center gap-1">
          {restaurant.is_waterfront && <MiniBadge icon={Waves} label="Waterfront" />}
          {restaurant.has_outdoor_seating && <MiniBadge icon={Umbrella} label="Outdoor" />}
          {restaurant.is_kid_friendly && <MiniBadge icon={Baby} label="Family" />}
          {restaurant.is_dog_friendly && <MiniBadge icon={Dog} label="Pet Friendly" />}
          {restaurant.offers_takeout && <MiniBadge label="Takeout" />}
          {restaurant.has_vegan_options && <MiniBadge icon={Leaf} label="Vegan" />}
          {restaurant.has_gluten_free_options && <MiniBadge icon={Wheat} label="GF" />}
          {restaurant.is_birdie_trusted_partner && <MiniBadge icon={Bird} label="Birdie" accent />}
          {restaurant.is_concierge_recommended && <MiniBadge icon={Award} label="Concierge" accent />}
        </div>

        {/* Hours */}
        {restaurant.hours && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span className="line-clamp-1">{restaurant.hours}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 pt-1">
          {restaurant.menu_url && <ActionIcon icon={UtensilsCrossed} label="Menu" href={restaurant.menu_url} />}
          {restaurant.phone && <ActionIcon icon={Phone} label="Call" href={`tel:${restaurant.phone}`} />}
          {restaurant.address && (
            <ActionIcon icon={MapPin} label="Directions" href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} />
          )}
          {restaurant.website_url && <ActionIcon icon={Globe} label="Website" href={restaurant.website_url} />}
          <button
            onClick={handleAddToPlans}
            className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {addedToPlans ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span className="text-[9px] font-semibold leading-tight">{addedToPlans ? 'Added' : 'Plans'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg bg-secondary/60 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[9px] font-semibold leading-tight">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionIcon({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { e.stopPropagation(); }}
      className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg bg-secondary/60 text-muted-foreground hover:bg-secondary transition-colors"
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
      <span className="text-[9px] font-semibold leading-tight">{label}</span>
    </a>
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