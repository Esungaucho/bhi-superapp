import {
  Flag, Flower2, Waves, Puzzle, Shell, Camera,
  CloudRain, Gift, Baby, Sun, Star, Shirt,
} from 'lucide-react';

export const COLLECTIONS = [
  { id: 'fourth_of_july_outfits', label: 'Fourth of July Outfits', Icon: Flag, description: 'Festive red, white & blue looks for Independence Day' },
  { id: 'easter_church_outfits', label: 'Easter & Church Outfits', Icon: Flower2, description: 'Polished spring ensembles for services and gatherings' },
  { id: 'beach_day_essentials', label: 'Beach Day Essentials', Icon: Waves, description: 'Everything you need for a perfect beach day' },
  { id: 'kids_beach_toys', label: 'Kids Beach Toys', Icon: Puzzle, description: 'Sand toys, floats, and games for little ones' },
  { id: 'bathing_suits', label: 'Bathing Suits', Icon: Shell, description: 'Swimwear for every style and silhouette' },
  { id: 'family_photo_shoot_outfits', label: 'Family Photo Shoot Outfits', Icon: Camera, description: 'Coordinated looks for memorable family portraits' },
  { id: 'golf_cart_essentials', label: 'Golf Cart Essentials', Icon: Sun, description: 'Must-haves for cruising the island in style' },
  { id: 'rainy_day_items', label: 'Rainy Day Items', Icon: CloudRain, description: 'Gear to stay dry and comfortable' },
  { id: 'turtle_walk_essentials', label: 'Turtle Walk Essentials', Icon: Shell, description: 'What to bring for a magical turtle walk' },
  { id: 'holiday_weekend_essentials', label: 'Holiday Weekend Essentials', Icon: Gift, description: 'Curated picks for long weekend getaways' },
  { id: 'baby_toddler_travel', label: 'Baby & Toddler Travel', Icon: Baby, description: 'Travel-friendly gear for the littlest islanders' },
  { id: 'gifts_local_favorites', label: 'Gifts & Local Favorites', Icon: Star, description: 'Thoughtful gifts and BHI-inspired treasures' },
];

export const PRODUCT_CATEGORIES = [
  { id: 'apparel', label: 'Apparel', Icon: Shirt },
  { id: 'accessories', label: 'Accessories' },
  { id: 'beach_gear', label: 'Beach Gear', Icon: Waves },
  { id: 'toys', label: 'Toys', Icon: Puzzle },
  { id: 'swimwear', label: 'Swimwear', Icon: Shell },
  { id: 'home', label: 'Home' },
  { id: 'gifts', label: 'Gifts', Icon: Gift },
  { id: 'golf', label: 'Golf', Icon: Flag },
  { id: 'rain_gear', label: 'Rain Gear', Icon: CloudRain },
  { id: 'baby', label: 'Baby', Icon: Baby },
  { id: 'outdoor', label: 'Outdoor', Icon: Sun },
];

export const SHOP_CONTENT_TYPES = [
  { id: 'featured_collection', label: 'Featured Shopping Collection' },
  { id: 'featured_products', label: 'Featured Products' },
  { id: 'seasonal_outfit_guide', label: 'Seasonal Outfit Guide' },
  { id: 'holiday_packing_list', label: 'Holiday Packing List' },
  { id: 'beach_essentials_list', label: 'Beach Essentials List' },
  { id: 'family_photo_shoot_ideas', label: 'Family Photo Shoot Outfit Ideas' },
];

export const NEWSLETTER_SECTIONS = [
  { id: 'this_week', label: 'This Week on the Island' },
  { id: 'upcoming_events', label: 'Upcoming Events' },
  { id: 'ferry_weather', label: 'Ferry & Weather Updates' },
  { id: 'restaurant_highlights', label: 'Restaurant Highlights' },
  { id: 'wildlife_turtle', label: 'Wildlife & Turtle Season' },
  { id: 'featured_experience', label: 'Featured Experience' },
  { id: 'island_shop_picks', label: 'Island Shop Picks' },
];

export const getCollection = (id) => COLLECTIONS.find(c => c.id === id) || { label: (id || '').replace(/_/g, ' '), description: '' };
export const getCategory = (id) => PRODUCT_CATEGORIES.find(c => c.id === id) || { label: (id || '').replace(/_/g, ' ') };