import {
  ShoppingCart, Pill, Baby, Fish, Anchor, Sun, Shirt,
  Gift, PartyPopper, PawPrint, Hammer, Smartphone, Flower2,
  Wine, Zap, Waves, Package, Store,
  Umbrella, Footprints, Droplets, Egg, Palette, BatteryCharging, Clock,
  Leaf, Compass, Ticket, Trees, Dumbbell, BookOpen,
} from 'lucide-react';

export const BIRDIE_CATEGORIES = [
  { id: 'grocery', label: 'Grocery Items', Icon: ShoppingCart, description: 'Fresh produce, pantry staples, snacks' },
  { id: 'pharmacy', label: 'Pharmacy', Icon: Pill, description: 'Medicine, first aid, health essentials' },
  { id: 'baby_supplies', label: 'Baby Supplies', Icon: Baby, description: 'Diapers, formula, baby food' },
  { id: 'beach_toys', label: 'Beach Toys', Icon: Waves, description: 'Sand toys, floats, games' },
  { id: 'beach_chairs', label: 'Beach Chairs', Icon: Umbrella, description: 'Chairs, umbrellas, shade' },
  { id: 'sunscreen', label: 'Sunscreen', Icon: Sun, description: 'SPF, aloe, sun care' },
  { id: 'clothing', label: 'Clothing', Icon: Shirt, description: 'Apparel for the whole family' },
  { id: 'shoes', label: 'Shoes', Icon: Footprints, description: 'Footwear for any occasion' },
  { id: 'swimsuits', label: 'Swimsuits', Icon: Droplets, description: 'Swimwear for everyone' },
  { id: 'holiday_items', label: 'Holiday Items', Icon: Gift, description: 'Seasonal and festive decor' },
  { id: 'easter_baskets', label: 'Easter Baskets', Icon: Egg, description: 'Pre-made and custom baskets' },
  { id: 'birthday_gifts', label: 'Birthday Gifts', Icon: PartyPopper, description: 'Gifts, cards, wrapping' },
  { id: 'decorations', label: 'Decorations', Icon: Palette, description: 'Party and event decor' },
  { id: 'pet_supplies', label: 'Pet Supplies', Icon: PawPrint, description: 'Food, toys, accessories' },
  { id: 'fishing_supplies', label: 'Fishing Supplies', Icon: Fish, description: 'Bait, tackle, gear' },
  { id: 'hardware', label: 'Hardware', Icon: Hammer, description: 'Tools and supplies' },
  { id: 'electronics', label: 'Electronics', Icon: Smartphone, description: 'Cables, accessories, gadgets' },
  { id: 'chargers', label: 'Chargers', Icon: BatteryCharging, description: 'Phone and device chargers' },
  { id: 'flowers', label: 'Flowers', Icon: Flower2, description: 'Bouquets and arrangements' },
  { id: 'wine_specialty', label: 'Wine & Specialty', Icon: Wine, description: 'Wine and gourmet foods' },
  { id: 'wellness', label: 'Wellness', Icon: Leaf, description: 'Spa, massage, self-care products' },
  { id: 'experiences', label: 'Experiences', Icon: Compass, description: 'Excursions, tours, activities' },
  { id: 'events', label: 'Events', Icon: Ticket, description: 'Tickets, event supplies, parties' },
  { id: 'nature', label: 'Nature & Outdoor', Icon: Trees, description: 'Outdoor gear, field guides, nature supplies' },
  { id: 'fitness', label: 'Fitness', Icon: Dumbbell, description: 'Workout gear, supplements, equipment' },
  { id: 'books', label: 'Books & Media', Icon: BookOpen, description: 'Books, magazines, games, puzzles' },
  { id: 'last_minute', label: 'Last-Minute Essentials', Icon: Clock, description: 'Forgot something? We have got you' },
];

export const DELIVERY_OPTIONS = [
  { id: 'ferry_terminal', label: 'Ferry Terminal Pickup', Icon: Store, description: 'Pick up at the BHI ferry terminal', fee: 0 },
  { id: 'tram', label: 'Deliver to Tram', Icon: Package, description: 'Placed on your assigned island tram', fee: 5 },
  { id: 'home_delivery', label: 'Home / Rental Delivery', Icon: Package, description: 'Delivered directly to your door', fee: 15 },
];

export const TRACKING_STAGES = [
  { id: 'request_received', label: 'Request Received', Icon: Package, description: 'Your request has been submitted' },
  { id: 'shopper_assigned', label: 'Shopper Assigned', Icon: Shirt, description: 'A personal shopper is on it' },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCart, description: 'Your shopper is purchasing the item' },
  { id: 'heading_to_ferry', label: 'Heading to Ferry', Icon: Anchor, description: 'Shopper is en route to the ferry' },
  { id: 'checked_in_at_ferry', label: 'Checked In at Ferry', Icon: Store, description: 'Item checked in at the ferry terminal' },
  { id: 'loaded_on_ferry', label: 'Loaded on Ferry', Icon: Waves, description: 'Item is aboard the ferry' },
  { id: 'arrived_on_island', label: 'Arrived on BHI', Icon: Anchor, description: 'Item has arrived on Bald Head Island' },
  { id: 'placed_in_tram', label: 'Placed in Tram', Icon: Package, description: 'Item is on an island tram' },
  { id: 'delivered', label: 'Delivered', Icon: Package, description: 'Your order has been delivered' },
];

export const SCHEDULE_OPTIONS = [
  { id: 'asap', label: 'ASAP', description: 'Get it as soon as possible' },
  { id: 'later_today', label: 'Later Today', description: 'Schedule for later today' },
  { id: 'tomorrow', label: 'Tomorrow', description: 'Schedule for tomorrow' },
  { id: 'specific_date', label: 'Specific Date & Time', description: 'Pick an exact time' },
];

export const SHOPPER_STATUS = {
  pending: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
};

export const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'truck', label: 'Truck' },
  { id: 'van', label: 'Van' },
];

export const FERRY_TERMINAL = {
  name: 'BHI Ferry Terminal',
  address: '1301 Ferry Road, Southport, NC 28461',
  lat: 33.8496,
  lng: -78.3145,
};

export const PRICING = {
  base_shopping_fee: 15,
  per_mile_rate: 0.65,
  ferry_freight_fee: 23,
  service_fee: 5,
  tram_delivery_fee: 5,
  home_delivery_fee: 15,
};

export function calculatePricing(merchandiseCost, distanceMiles, deliveryOption, tip = 0) {
  const shoppingFee = PRICING.base_shopping_fee;
  const mileageFee = Math.round(distanceMiles * PRICING.per_mile_rate * 100) / 100;
  const ferryFee = PRICING.ferry_freight_fee;
  const serviceFee = PRICING.service_fee;
  const deliveryFee = DELIVERY_OPTIONS.find(o => o.id === deliveryOption)?.fee || 0;
  const total = Math.round((merchandiseCost + shoppingFee + mileageFee + ferryFee + serviceFee + deliveryFee + tip) * 100) / 100;
  return { merchandiseCost, shoppingFee, mileageFee, ferryFee, serviceFee, deliveryFee, tip, total };
}

export function getTrackingStage(id) {
  return TRACKING_STAGES.find(s => s.id === id);
}

export function getCategory(id) {
  return BIRDIE_CATEGORIES.find(c => c.id === id) || { label: (id || '').replace(/_/g, ' '), Icon: Package };
}