import {
  ShoppingBag, ShoppingCart, Baby, Home, Calendar, Truck, Sparkles,
  Gift, Pill, Smartphone, PartyPopper, Utensils, Camera, Waves,
  Flower2, Package, Anchor, Ship, Clock, MapPin, Store,
  Stethoscope, Heart, ChefHat, Fish, Check, X,
} from 'lucide-react';

export const CONCIERGE_CATEGORIES = [
  {
    id: 'personal_shopping',
    label: 'Personal Shopping',
    Icon: ShoppingBag,
    description: 'Forgotten items, gifts, clothing, beach essentials, pharmacy, electronics',
    color: 'bg-ocean/8 border-ocean/15',
    iconColor: 'text-ocean',
    subcategories: [
      { id: 'forgotten_items', label: 'Forgotten Items', Icon: Package },
      { id: 'holiday_items', label: 'Holiday Items', Icon: Gift },
      { id: 'birthday_gifts', label: 'Birthday Gifts', Icon: Gift },
      { id: 'clothing', label: 'Clothing', Icon: ShoppingBag },
      { id: 'beach_essentials', label: 'Beach Essentials', Icon: Waves },
      { id: 'pharmacy', label: 'Pharmacy Items', Icon: Pill },
      { id: 'electronics_chargers', label: 'Electronics & Chargers', Icon: Smartphone },
    ],
  },
  {
    id: 'grocery_delivery',
    label: 'Grocery Delivery',
    Icon: ShoppingCart,
    description: 'Grocery shopping, rental stocking, last-minute ingredients, party & picnic supplies',
    color: 'bg-sea-glass/10 border-sea-glass/20',
    iconColor: 'text-sea-glass-deep',
    subcategories: [
      { id: 'grocery_shopping', label: 'Grocery Shopping', Icon: ShoppingCart },
      { id: 'rental_stocking', label: 'Rental Stocking', Icon: Home },
      { id: 'last_minute_ingredients', label: 'Last-Minute Ingredients', Icon: Utensils },
      { id: 'party_supplies', label: 'Party Supplies', Icon: PartyPopper },
      { id: 'picnic_supplies', label: 'Picnic Supplies', Icon: Package },
    ],
  },
  {
    id: 'family_services',
    label: 'Family Services',
    Icon: Baby,
    description: 'Babysitters, mother\'s helpers, date-night childcare, baby gear rentals',
    color: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    subcategories: [
      { id: 'babysitters', label: 'Babysitters', Icon: Baby },
      { id: 'mothers_helpers', label: 'Mother\'s Helpers', Icon: Heart },
      { id: 'date_night_childcare', label: 'Date-Night Childcare', Icon: Heart },
      { id: 'baby_gear_rentals', label: 'Baby Gear Rentals', Icon: Package },
    ],
  },
  {
    id: 'home_vacation_services',
    label: 'Home & Vacation Services',
    Icon: Home,
    description: 'Flower delivery, gift baskets, welcome packages, house check-ins, rental setup',
    color: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-500',
    subcategories: [
      { id: 'flower_delivery', label: 'Flower Delivery', Icon: Flower2 },
      { id: 'gift_baskets', label: 'Gift Baskets', Icon: Gift },
      { id: 'welcome_packages', label: 'Welcome Packages', Icon: Gift },
      { id: 'house_check_ins', label: 'House Check-Ins', Icon: Home },
      { id: 'rental_setup', label: 'Rental Setup', Icon: Home },
    ],
  },
  {
    id: 'experiences_reservations',
    label: 'Experiences & Reservations',
    Icon: Calendar,
    description: 'Restaurant reservations, fishing charters, boat tours, private chefs, massage, photography',
    color: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-500',
    subcategories: [
      { id: 'restaurant_reservations', label: 'Restaurant Reservations', Icon: Utensils },
      { id: 'fishing_charters', label: 'Fishing Charters', Icon: Fish },
      { id: 'boat_tours', label: 'Boat Tours', Icon: Ship },
      { id: 'private_chefs', label: 'Private Chefs', Icon: ChefHat },
      { id: 'massage_services', label: 'Massage Services', Icon: Heart },
      { id: 'photography_sessions', label: 'Photography Sessions', Icon: Camera },
    ],
  },
  {
    id: 'transportation_errands',
    label: 'Transportation & Errands',
    Icon: Truck,
    description: 'Package pickup, ferry delivery coordination, tram delivery, prescription pickup, store pickup',
    color: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-500',
    subcategories: [
      { id: 'package_pickup', label: 'Package Pickup', Icon: Package },
      { id: 'ferry_delivery_coordination', label: 'Ferry Delivery Coordination', Icon: Ship },
      { id: 'tram_delivery', label: 'Tram Delivery', Icon: Truck },
      { id: 'prescription_pickup', label: 'Prescription Pickup', Icon: Stethoscope },
      { id: 'store_pickup', label: 'Store Pickup', Icon: Store },
    ],
  },
  {
    id: 'special_requests',
    label: 'Special Requests',
    Icon: Sparkles,
    description: 'Tell us what you need — anything is possible.',
    color: 'bg-accent/8 border-accent/15',
    iconColor: 'text-accent',
    subcategories: [],
  },
];

export const TRACKING_STAGES = [
  { id: 'request_submitted', label: 'Request Submitted', Icon: Package, description: 'Your request has been received.' },
  { id: 'concierge_assigned', label: 'Island Concierge Assigned', Icon: Sparkles, description: 'Your Island Concierge has accepted your request.' },
  { id: 'in_progress', label: 'Shopping / Service In Progress', Icon: ShoppingBag, description: 'Your Island Concierge is shopping now.' },
  { id: 'heading_to_ferry', label: 'Heading to Ferry', Icon: Anchor, description: 'Your Island Concierge is en route to the ferry.' },
  { id: 'checked_in_at_ferry', label: 'Checked In at Ferry', Icon: Store, description: 'Your items have been checked in at the ferry terminal.' },
  { id: 'loaded_on_ferry', label: 'Loaded on Ferry', Icon: Ship, description: 'Your items are aboard the ferry.' },
  { id: 'arrived_on_island', label: 'Arrived on Bald Head Island', Icon: Anchor, description: 'Your items have arrived on Bald Head Island.' },
  { id: 'placed_on_tram', label: 'Placed on Tram', Icon: Truck, description: 'Your package has been placed on an island tram.' },
  { id: 'completed', label: 'Delivered / Completed', Icon: Check, description: 'Your request has been completed.' },
];

export const TIMING_OPTIONS = [
  { id: 'asap', label: 'ASAP', description: 'As soon as possible' },
  { id: 'today', label: 'Today', description: 'Schedule for later today' },
  { id: 'tomorrow', label: 'Tomorrow', description: 'Schedule for tomorrow' },
  { id: 'scheduled', label: 'Scheduled', description: 'Pick a specific date & time' },
];

export const DELIVERY_OPTIONS = [
  { id: 'ferry_pickup', label: 'Ferry Terminal Pickup', Icon: Store, description: 'Pick up at the BHI ferry terminal', fee: 0 },
  { id: 'tram_delivery', label: 'Tram Delivery', Icon: Truck, description: 'Delivered via island tram', fee: 5 },
  { id: 'home_delivery', label: 'Home Delivery', Icon: Home, description: 'Delivered to your island address', fee: 15 },
];

export const BUDGET_OPTIONS = [
  { id: 'under_25', label: 'Under $25' },
  { id: '25_50', label: '$25 - $50' },
  { id: '50_100', label: '$50 - $100' },
  { id: '100_250', label: '$100 - $250' },
  { id: '250_plus', label: '$250+' },
  { id: 'flexible', label: 'Flexible' },
];

export const PRICING = {
  base_service_fee: 15,
  per_mile_rate: 0.65,
  ferry_coordination_fee: 23,
  app_fee: 5,
};

export const PROVIDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
};

export function calculatePricing(itemCost, deliveryPreference, tip = 0) {
  const serviceFee = PRICING.base_service_fee;
  const mileageFee = Math.round(8 * PRICING.per_mile_rate * 100) / 100;
  const ferryFee = PRICING.ferry_coordination_fee;
  const appFee = PRICING.app_fee;
  const deliveryFee = DELIVERY_OPTIONS.find(o => o.id === deliveryPreference)?.fee || 0;
  const total = Math.round((itemCost + serviceFee + mileageFee + ferryFee + appFee + deliveryFee + tip) * 100) / 100;
  return { itemCost, serviceFee, mileageFee, ferryFee, appFee, deliveryFee, tip, total };
}

export function getCategory(id) {
  return CONCIERGE_CATEGORIES.find(c => c.id === id);
}

export function getTrackingStage(id) {
  return TRACKING_STAGES.find(s => s.id === id);
}