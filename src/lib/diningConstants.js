import {
  Sunset, Heart, Users, Wine, Coffee, ShoppingBag, Fish, Baby,
  Star, Sparkles, Waves, CloudRain, CalendarHeart, MapPin, Bike,
  Anchor, UtensilsCrossed, IceCream, Pizza
} from 'lucide-react';

export const CONCIERGE_BADGES = [
  { id: 'best_sunset', label: 'Best Sunset Dinner', icon: Sunset, color: 'text-amber-600 bg-amber-50' },
  { id: 'best_date_night', label: 'Best Date Night', icon: Heart, color: 'text-rose-600 bg-rose-50' },
  { id: 'best_family', label: 'Best Family Dinner', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { id: 'best_cocktails', label: 'Best Cocktails', icon: Wine, color: 'text-purple-600 bg-purple-50' },
  { id: 'best_brunch', label: 'Best Brunch', icon: Coffee, color: 'text-orange-600 bg-orange-50' },
  { id: 'best_coffee', label: 'Best Coffee', icon: Coffee, color: 'text-amber-700 bg-amber-50' },
  { id: 'best_grab_go', label: 'Best Grab & Go', icon: ShoppingBag, color: 'text-teal-600 bg-teal-50' },
  { id: 'best_seafood', label: 'Best Seafood', icon: Fish, color: 'text-cyan-600 bg-cyan-50' },
  { id: 'kids_favorite', label: "Kids' Favorite", icon: Baby, color: 'text-pink-600 bg-pink-50' },
  { id: 'local_favorite', label: 'Local Favorite', icon: Star, color: 'text-amber-600 bg-amber-50' },
  { id: 'hidden_gem', label: 'Hidden Gem', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'best_waterfront', label: 'Best Waterfront', icon: Waves, color: 'text-sky-600 bg-sky-50' },
];

export const getBadgeMeta = (id) => CONCIERGE_BADGES.find(b => b.id === id);

export const CONCIERGE_COLLECTIONS = [
  {
    id: 'first_day',
    title: 'Perfect First Day on BHI',
    subtitle: 'Your arrival day essentials',
    icon: Star,
    gradient: 'from-amber-400/20 to-orange-400/20',
    filter: r => r.concierge_badges?.includes('best_grab_go') || r.dining_categories?.includes('lunch') || r.cuisine?.includes('Coffee'),
  },
  {
    id: 'rainy_day',
    title: 'Rainy Day Dining',
    subtitle: 'Cozy spots when weather turns',
    icon: CloudRain,
    gradient: 'from-slate-400/20 to-blue-400/20',
    filter: r => r.has_indoor_seating,
  },
  {
    id: 'best_family',
    title: 'Best Family Restaurants',
    subtitle: 'Great for all ages',
    icon: Users,
    gradient: 'from-blue-400/20 to-cyan-400/20',
    filter: r => r.is_kid_friendly,
  },
  {
    id: 'anniversary',
    title: 'Best Anniversary Dinner',
    subtitle: 'Celebrations & special nights',
    icon: CalendarHeart,
    gradient: 'from-rose-400/20 to-pink-400/20',
    filter: r => r.concierge_badges?.includes('best_date_night') || r.price_range === '$$$$' || r.dining_categories?.includes('date_night'),
  },
  {
    id: 'coffee_tour',
    title: 'Coffee Tour',
    subtitle: 'Island caffeine crawl',
    icon: Coffee,
    gradient: 'from-amber-600/20 to-yellow-400/20',
    filter: r => r.cuisine?.includes('Coffee') || r.dining_categories?.includes('coffee'),
  },
  {
    id: 'food_tour',
    title: 'One-Day Food Tour',
    subtitle: 'Eat your way across BHI',
    icon: UtensilsCrossed,
    gradient: 'from-orange-400/20 to-red-400/20',
    filter: r => r.is_open,
  },
  {
    id: 'after_golf',
    title: 'Best Places After Golf',
    subtitle: 'Post-round dining & drinks',
    icon: Bike,
    gradient: 'from-green-400/20 to-emerald-400/20',
    filter: r => r.dining_categories?.includes('lunch') || r.dining_categories?.includes('drinks'),
  },
  {
    id: 'near_marina',
    title: 'Best Places Near the Marina',
    subtitle: 'Steps from the ferry landing',
    icon: Anchor,
    gradient: 'from-sky-400/20 to-blue-400/20',
    filter: r => r.location === 'Marina' || r.is_waterfront,
  },
];

export const DIETARY_FILTERS = [
  { id: 'gluten_free', label: 'Gluten-Free', check: r => r.has_gluten_free_options },
  { id: 'vegan', label: 'Vegan', check: r => r.has_vegan_options },
  { id: 'vegetarian', label: 'Vegetarian', check: r => r.has_vegetarian_options || r.has_vegan_options },
  { id: 'seafood', label: 'Seafood', check: r => r.cuisine?.toLowerCase().includes('seafood') || r.concierge_badges?.includes('best_seafood') },
  { id: 'kids_menu', label: 'Kids Menu', check: r => r.is_kid_friendly },
  { id: 'cocktails', label: 'Cocktails', check: r => r.dining_categories?.includes('drinks') || r.concierge_badges?.includes('best_cocktails') },
  { id: 'wine', label: 'Wine', check: r => r.dining_categories?.includes('drinks') },
  { id: 'dessert', label: 'Dessert', check: r => r.dining_categories?.includes('ice_cream') || r.cuisine?.includes('Ice Cream') },
  { id: 'coffee', label: 'Coffee', check: r => r.cuisine?.includes('Coffee') || r.dining_categories?.includes('coffee') },
  { id: 'pet_friendly', label: 'Pet Friendly', check: r => r.is_dog_friendly },
];

export const SMART_NOTICES = [
  { id: 'reservations', label: 'Reservations Recommended', condition: r => r.price_range === '$$$$' || r.member_only },
  { id: 'members_only', label: 'Members & Guests Only', condition: r => r.member_only },
  { id: 'seasonal', label: 'Seasonal Hours', condition: r => r.hours?.toLowerCase().includes('seasonal') || r.hours?.toLowerCase().includes('call') },
  { id: 'cashless', label: 'Cashless', condition: r => r.tags?.includes('Cashless') },
  { id: 'pet_patio', label: 'Pet Friendly Patio', condition: r => r.is_dog_friendly && r.has_outdoor_seating },
  { id: 'private_events', label: 'Private Events Available', condition: r => r.supports_private_events },
  { id: 'dress_code', label: r => `Dress Code: ${r.dress_code}`, condition: r => !!r.dress_code },
  { id: 'catering', label: 'Catering Available', condition: r => r.offers_catering },
];

export const parseHoursStatus = (hoursString) => {
  if (!hoursString) return { isOpen: null, nextEvent: null, raw: null };
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lower = hoursString.toLowerCase();

  const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi;
  const matches = [...lower.matchAll(timePattern)];
  
  if (matches.length < 2) return { isOpen: null, nextEvent: null, raw: hoursString };

  const toMinutes = (h, m, ap) => {
    let hour = parseInt(h);
    const min = m ? parseInt(m) : 0;
    if (ap === 'pm' && hour !== 12) hour += 12;
    if (ap === 'am' && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const openTime = toMinutes(matches[0][1], matches[0][2], matches[0][3]);
  const closeTime = toMinutes(matches[1][1], matches[1][2], matches[1][3]);

  if (lower.includes('closed') && !lower.includes('sun-thu') && !lower.includes('daily')) {
    return { isOpen: false, nextEvent: null, raw: hoursString };
  }

  const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;
  
  let nextEvent = null;
  if (isOpen) {
    const minsUntilClose = closeTime - currentMinutes;
    if (minsUntilClose <= 30) {
      nextEvent = `Closing in ${minsUntilClose} min`;
    } else {
      nextEvent = `Open until ${formatTime(closeTime)}`;
    }
  } else {
    if (currentMinutes < openTime) {
      nextEvent = `Opens at ${formatTime(openTime)}`;
    } else {
      nextEvent = `Opens tomorrow at ${formatTime(openTime)}`;
    }
  }

  return { isOpen, nextEvent, raw: hoursString };
};

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return m === 0 ? `${displayH} ${period}` : `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}