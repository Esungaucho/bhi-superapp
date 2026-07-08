import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  ChevronLeft, Phone, MapPin, Globe, UtensilsCrossed, CalendarClock, Heart,
  Plus, Clock, Bike, Anchor, Navigation, Info, Star, Bird, Check,
  Coffee, Sun, Moon, Wine, Sparkles, MessageCircle, Crown, Waves
} from 'lucide-react';
import PhotoGallery from '@/components/food/PhotoGallery';
import ConciergeBadges from '@/components/food/ConciergeBadges';
import RealTimeStatus from '@/components/food/RealTimeStatus';
import SmartNotices from '@/components/food/SmartNotices';
import RestaurantReviews from '@/components/food/RestaurantReviews';

export default function RestaurantDetail() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [planAdded, setPlanAdded] = useState(null);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });
  const restaurant = restaurants.find(r => r.id === restaurantId);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ferrySchedules = [] } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.filter({ direction: 'to_island' }, 'departure_time', 5),
  });

  const galleryImages = restaurant?.gallery?.length > 0
    ? restaurant.gallery
    : restaurant?.image_url
      ? [restaurant.image_url]
      : [];

  const now = new Date();
  const upcomingFerries = ferrySchedules.filter(f => new Date(f.departure_time) >= now).slice(0, 3);

  const handleSave = async () => {
    if (!user) return;
    try {
      await base44.entities.PlanItem.create({
        user_email: user.email,
        title: `${restaurant.name} — Favorite`,
        category: 'dining',
        location: restaurant.address || restaurant.location || '',
        notes: `Saved as favorite`,
      });
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['planItems'] });
      queryClient.invalidateQueries({ queryKey: ['savedRestaurants'] });
    } catch {}
  };

  const handleAddToPlan = async (mealType) => {
    if (!user) return;
    try {
      const timeMap = { lunch: '12:30 PM', dinner: '7:00 PM', coffee: '9:00 AM' };
      await base44.entities.PlanItem.create({
        user_email: user.email,
        title: `${mealType === 'coffee' ? 'Coffee Stop' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} at ${restaurant.name}`,
        category: 'dining',
        time: timeMap[mealType] || '',
        location: restaurant.address || restaurant.location || '',
        notes: restaurant.cuisine || '',
        confirmation_link: restaurant.website_url || '',
      });
      setPlanAdded(mealType);
      queryClient.invalidateQueries({ queryKey: ['planItems'] });
      setTimeout(() => setPlanAdded(null), 2500);
    } catch {}
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!restaurant) {
    return (
      <div className="px-4 py-12 text-center text-muted-foreground">
        <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-40" strokeWidth={1.5} />
        <p className="font-medium">Restaurant not found</p>
        <Link to="/food" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">Back to Dining</Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="fixed top-3 left-3 z-50 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-luxe-sm">
        <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {/* Hero Gallery */}
      <div className="px-4 pt-14">
        {galleryImages.length > 0 ? (
          <PhotoGallery images={galleryImages} name={restaurant.name} />
        ) : (
          <div className="h-56 bg-muted rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Name + Status */}
      <div className="px-4 mt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground leading-tight">{restaurant.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {restaurant.cuisine}
              {restaurant.price_range && <span className="ml-1 font-semibold text-foreground">{restaurant.price_range}</span>}
              {restaurant.location && <span> · {restaurant.location}</span>}
            </p>
          </div>
          <button onClick={handleSave} className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${saved ? 'bg-rose-50 text-rose-500' : 'bg-secondary text-muted-foreground hover:text-rose-500'}`}>
            {saved ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Heart className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
        <div className="mt-2">
          <RealTimeStatus hours={restaurant.hours} is_open={restaurant.is_open} />
        </div>
      </div>

      {/* Concierge Badges */}
      {restaurant.concierge_badges?.length > 0 && (
        <div className="px-4 mt-3">
          <ConciergeBadges badges={restaurant.concierge_badges} />
        </div>
      )}

      {/* Smart Notices */}
      <div className="px-4 mt-3">
        <SmartNotices restaurant={restaurant} />
      </div>

      {/* Description */}
      {restaurant.description && (
        <div className="px-4 mt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>
        </div>
      )}

      {/* Today's Specials */}
      {restaurant.specials?.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            Today's Specials
          </p>
          <div className="space-y-1.5">
            {restaurant.specials.map((special, i) => (
              <div key={i} className="flex items-start gap-2 bg-accent/5 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <p className="text-xs text-foreground">{special}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2">
        {restaurant.phone && <ActionBtn icon={Phone} label="Call" href={`tel:${restaurant.phone}`} />}
        {restaurant.address && <ActionBtn icon={Navigation} label="Directions" href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} />}
        {restaurant.website_url && <ActionBtn icon={Globe} label="Website" href={restaurant.website_url} />}
        {restaurant.menu_url && <ActionBtn icon={UtensilsCrossed} label="Menu" href={restaurant.menu_url} />}
        {restaurant.reservation_url && <ActionBtn icon={CalendarClock} label="Reserve" href={restaurant.reservation_url} />}
        <Link to={`/food/${restaurant.id}`} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <UtensilsCrossed className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold leading-tight">Order</span>
        </Link>
      </div>

      {/* Trip Planner Integration */}
      <div className="px-4 mt-4">
        <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-2">Add to Itinerary</p>
        <div className="grid grid-cols-3 gap-2">
          <PlanButton icon={Coffee} label="Coffee" mealType="coffee" planAdded={planAdded} onClick={handleAddToPlan} />
          <PlanButton icon={Sun} label="Lunch" mealType="lunch" planAdded={planAdded} onClick={handleAddToPlan} />
          <PlanButton icon={Moon} label="Dinner" mealType="dinner" planAdded={planAdded} onClick={handleAddToPlan} />
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3">Details</p>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border/50">
          {restaurant.hours && (
            <DetailRow icon={Clock} label="Hours" value={restaurant.hours} />
          )}
          {restaurant.phone && (
            <DetailRow icon={Phone} label="Phone" value={restaurant.phone} />
          )}
          {restaurant.address && (
            <DetailRow icon={MapPin} label="Address" value={restaurant.address} />
          )}
          {restaurant.dress_code && (
            <DetailRow icon={Info} label="Dress Code" value={restaurant.dress_code} />
          )}
          {restaurant.member_only && (
            <DetailRow icon={Crown} label="Access" value="Members & Guests Only" />
          )}
          {restaurant.accessibility_info && (
            <DetailRow icon={Info} label="Accessibility" value={restaurant.accessibility_info} />
          )}
          {restaurant.wait_time_estimate && (
            <DetailRow icon={Clock} label="Wait Time" value={restaurant.wait_time_estimate} />
          )}
        </div>
      </div>

      {/* Transportation */}
      {(restaurant.transportation_notes || restaurant.address) && (
        <div className="px-4 mt-5">
          <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3">Getting There</p>
          <div className="bg-card rounded-2xl border border-border p-4">
            {restaurant.transportation_notes && (
              <div className="flex items-start gap-2 mb-2">
                <Bike className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">{restaurant.transportation_notes}</p>
              </div>
            )}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address || restaurant.name + ' Bald Head Island')}}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-accent hover:underline">
              <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
              Open in Maps
            </a>
          </div>
        </div>
      )}

      {/* Nearby Attractions */}
      {restaurant.nearby_attractions?.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3">Nearby on the Island</p>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.nearby_attractions.map((attr, i) => (
              <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                {attr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ferry Integration */}
      {upcomingFerries.length > 0 && restaurant.location === 'Marina' && (
        <div className="px-4 mt-5">
          <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            Ferry Connection
          </p>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
            {upcomingFerries.map(ferry => {
              const depTime = new Date(ferry.departure_time);
              const minsUntil = Math.round((depTime - now) / 60000);
              const canDine = minsUntil > 45;
              return (
                <div key={ferry.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{format(depTime, 'h:mm a')} ferry</p>
                    <p className="text-[10px] text-muted-foreground">{ferry.direction === 'to_island' ? 'Arriving on BHI' : 'Departing to mainland'}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${canDine ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {canDine ? 'Plenty of time to dine' : `${minsUntil} min until ferry`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Amenities */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3">Amenities</p>
        <div className="flex flex-wrap gap-1.5">
          {restaurant.is_waterfront && <AmenityBadge icon={Waves} label="Waterfront" />}
          {restaurant.has_outdoor_seating && <AmenityBadge icon={Sun} label="Outdoor Seating" />}
          {restaurant.has_indoor_seating && <AmenityBadge label="Indoor Seating" />}
          {restaurant.is_kid_friendly && <AmenityBadge label="Kid-Friendly" />}
          {restaurant.is_dog_friendly && <AmenityBadge label="Pet Friendly" />}
          {restaurant.has_vegan_options && <AmenityBadge label="Vegan Options" />}
          {restaurant.has_gluten_free_options && <AmenityBadge label="Gluten-Free" />}
          {restaurant.has_vegetarian_options && <AmenityBadge label="Vegetarian" />}
          {restaurant.offers_takeout && <AmenityBadge label="Takeout" />}
          {restaurant.offers_catering && <AmenityBadge label="Catering" />}
          {restaurant.supports_private_events && <AmenityBadge label="Private Events" />}
        </div>
      </div>

      {/* Reviews */}
      <div className="px-4 mt-6">
        <RestaurantReviews restaurantId={restaurant.id} restaurantName={restaurant.name} />
      </div>

      {/* Concierge Contact */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-foreground uppercase tracking-luxe-sm mb-3">Need Assistance?</p>
        <div className="grid grid-cols-2 gap-2">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
              <Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-foreground">Call Restaurant</span>
            </a>
          )}
          <Link to="/birdie" className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
            <Bird className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-foreground">Message Concierge</span>
          </Link>
          {restaurant.reservation_url && (
            <a href={restaurant.reservation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
              <CalendarClock className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-foreground">Book Reservation</span>
            </a>
          )}
          <Link to="/events" className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
            <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-foreground">Special Occasion</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-card border border-border hover:border-accent/40 hover:bg-sand/30 transition-colors">
      <Icon className="w-4 h-4 text-foreground/70" strokeWidth={1.5} />
      <span className="text-[10px] font-semibold leading-tight text-center text-foreground">{label}</span>
    </a>
  );
}

function PlanButton({ icon: Icon, label, mealType, planAdded, onClick }) {
  const added = planAdded === mealType;
  return (
    <button onClick={() => onClick(mealType)}
      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors ${added ? 'bg-accent/15 text-accent border-accent' : 'bg-card border-border hover:border-accent/40'}`}>
      {added ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Icon className="w-4 h-4" strokeWidth={1.5} />}
      <span className="text-[10px] font-semibold leading-tight">{added ? 'Added' : label}</span>
    </button>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xs text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AmenityBadge({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}