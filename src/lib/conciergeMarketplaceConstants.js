import {
  Baby, PawPrint, HeartHandshake, Accessibility, Home, ShoppingCart, Sparkles, Eye, ClipboardList, Gift, Shirt, Pill, Flower2, Hand, UtensilsCrossed, ChefHat, Package, CalendarHeart, Utensils, Camera, Video, Bot as Drone, Megaphone, Heart, Users, Flower, Tent, Table, Music, Mic, User, Scissors, Building2, KeyRound, BedDouble, PaintBucket, Hammer, Wrench, Leaf, HandHeart, Sparkle, Dumbbell, Wind, Activity
} from 'lucide-react';

// ── CONCIERGE SERVICE CATEGORIES ──
export const CONCIERGE_SERVICE_CATEGORIES = [
  {
    id: 'family_care',
    label: 'Family & Care',
    Icon: Baby,
    color: 'bg-rose-50 text-rose-600',
    services: [
      { id: 'babysitting', label: 'Babysitting', Icon: Baby },
      { id: 'pet_sitting', label: 'Pet Sitting', Icon: PawPrint },
      { id: 'mothers_helpers', label: "Mother's Helpers", Icon: HeartHandshake },
      { id: 'senior_assistance', label: 'Senior Assistance', Icon: Accessibility },
      { id: 'house_sitting', label: 'House Sitting', Icon: Home },
    ],
  },
  {
    id: 'home_services',
    label: 'Home Services',
    Icon: Home,
    color: 'bg-blue-50 text-blue-600',
    services: [
      { id: 'grocery_stocking', label: 'Grocery Stocking', Icon: ShoppingCart },
      { id: 'pantry_fridge_stocking', label: 'Pantry & Fridge Stocking', Icon: ShoppingCart },
      { id: 'housekeeping', label: 'Housekeeping', Icon: Sparkles },
      { id: 'house_watching', label: 'House Watching', Icon: Eye },
      { id: 'house_managers', label: 'House Managers', Icon: ClipboardList },
      { id: 'laundry_service', label: 'Laundry Service', Icon: Shirt },
      { id: 'rental_setup', label: 'Rental Setup', Icon: Home },
      { id: 'welcome_packages', label: 'Welcome Packages', Icon: Gift },
    ],
  },
  {
    id: 'personal_services',
    label: 'Personal Services',
    Icon: Hand,
    color: 'bg-amber-50 text-amber-600',
    services: [
      { id: 'personal_shopping', label: 'Personal Shopping', Icon: ShoppingCart },
      { id: 'forgotten_items', label: 'Forgotten Items', Icon: Package },
      { id: 'pharmacy_pickup', label: 'Pharmacy Pickup', Icon: Pill },
      { id: 'gift_baskets', label: 'Gift Baskets', Icon: Gift },
      { id: 'flower_delivery', label: 'Flower Delivery', Icon: Flower2 },
      { id: 'massage_appointments', label: 'Massage Appointments', Icon: HandHeart },
      { id: 'esthetician_appointments', label: 'Esthetician / Skincare', Icon: Sparkle },
      { id: 'hair_makeup_appointments', label: 'Hair & Makeup', Icon: Scissors },
    ],
  },
  {
    id: 'food_hospitality',
    label: 'Food & Hospitality',
    Icon: ChefHat,
    color: 'bg-emerald-50 text-emerald-600',
    services: [
      { id: 'private_chef', label: 'Private Chef Requests', Icon: ChefHat },
      { id: 'catering_requests', label: 'Catering Requests', Icon: UtensilsCrossed },
      { id: 'picnic_setup', label: 'Picnic Setup', Icon: Package },
      { id: 'special_occasion_meals', label: 'Special Occasion Meals', Icon: Utensils },
      { id: 'restaurant_reservations', label: 'Restaurant Reservation Assistance', Icon: CalendarHeart },
    ],
  },
  {
    id: 'special_requests',
    label: 'Special Requests',
    Icon: Megaphone,
    color: 'bg-purple-50 text-purple-600',
    services: [],
  },
];

export const ALL_SERVICE_OPTIONS = CONCIERGE_SERVICE_CATEGORIES.flatMap(cat =>
  cat.services.map(s => ({ ...s, category_id: cat.id }))
);

export const SERVICE_LABELS = ALL_SERVICE_OPTIONS.reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

// ── PREFERRED PARTNER CATEGORIES ──
export const PARTNER_CATEGORIES = [
  {
    id: 'photography_media',
    label: 'Photography & Media',
    Icon: Camera,
    subcategories: [
      { id: 'family_photographers', label: 'Family Photographers' },
      { id: 'wedding_photographers', label: 'Wedding Photographers' },
      { id: 'videographers', label: 'Videographers' },
      { id: 'drone_photographers', label: 'Drone Photographers' },
      { id: 'content_creators', label: 'Content Creators' },
    ],
  },
  {
    id: 'weddings_events',
    label: 'Weddings & Events',
    Icon: Heart,
    subcategories: [
      { id: 'wedding_planners', label: 'Wedding Planners' },
      { id: 'event_planners', label: 'Event Planners' },
      { id: 'florists', label: 'Florists' },
      { id: 'caterers', label: 'Caterers' },
      { id: 'private_chefs', label: 'Private Chefs' },
      { id: 'table_rentals', label: 'Table Rentals' },
      { id: 'chair_rentals', label: 'Chair Rentals' },
      { id: 'tent_rentals', label: 'Tent Rentals' },
      { id: 'linens', label: 'Linens' },
      { id: 'djs', label: 'DJs' },
      { id: 'live_musicians', label: 'Live Musicians' },
      { id: 'officiants', label: 'Officiants' },
      { id: 'hair_makeup_artists', label: 'Hair & Makeup Artists' },
      { id: 'event_rentals', label: 'Event Rentals' },
      { id: 'party_rentals', label: 'Party Rentals' },
    ],
  },
  {
    id: 'real_estate_property',
    label: 'Real Estate & Property',
    Icon: Building2,
    subcategories: [
      { id: 'real_estate_agents', label: 'Real Estate Agents' },
      { id: 'sothebys_partners', label: "Sotheby's Real Estate" },
      { id: 'intracoastal_realty_partners', label: 'Intracoastal Realty' },
      { id: 'property_managers', label: 'Property Managers' },
      { id: 'vacation_rental_companies', label: 'Vacation Rental Companies' },
      { id: 'airbnb_vacation_home_partners', label: 'Airbnb & Vacation Home Partners' },
      { id: 'interior_designers', label: 'Interior Designers' },
      { id: 'builders', label: 'Builders' },
      { id: 'construction_contractors', label: 'Construction Contractors' },
      { id: 'general_contractors', label: 'General Contractors' },
      { id: 'handyman_services', label: 'Handyman Services' },
      { id: 'home_maintenance', label: 'Home Maintenance' },
      { id: 'landscapers', label: 'Landscapers' },
    ],
  },
  {
    id: 'wellness_beauty',
    label: 'Wellness & Beauty',
    Icon: Sparkle,
    subcategories: [
      { id: 'massage_therapists', label: 'Massage Therapists' },
      { id: 'estheticians', label: 'Estheticians' },
      { id: 'skincare_providers', label: 'Skincare Providers' },
      { id: 'hair_stylists', label: 'Hair Stylists' },
      { id: 'makeup_artists', label: 'Makeup Artists' },
      { id: 'fitness_trainers', label: 'Fitness Trainers' },
      { id: 'yoga_instructors', label: 'Yoga Instructors' },
      { id: 'pilates_instructors', label: 'Pilates Instructors' },
    ],
  },
  {
    id: 'food_hosting',
    label: 'Food & Hosting',
    Icon: UtensilsCrossed,
    subcategories: [
      { id: 'private_chefs_food', label: 'Private Chefs' },
      { id: 'catering_companies', label: 'Catering Companies' },
      { id: 'bakeries', label: 'Bakeries' },
      { id: 'grocery_stocking_partners', label: 'Grocery Stocking Partners' },
      { id: 'topsail_steamer', label: 'Topsail Steamer' },
      { id: 'specialty_food_services', label: 'Specialty Food Services' },
    ],
  },
];

export const PARTNER_CATEGORY_LABELS = PARTNER_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {});
export const PARTNER_SUBCATEGORY_LABELS = PARTNER_CATEGORIES.flatMap(c => c.subcategories).reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

// ── LISTING TYPES ──
export const LISTING_TYPES = [
  { id: 'free', label: 'Free Listing', color: 'bg-muted text-muted-foreground' },
  { id: 'paid', label: 'Paid Listing', color: 'bg-blue-50 text-blue-600' },
  { id: 'featured', label: 'Featured Listing', color: 'bg-amber-50 text-amber-600' },
  { id: 'referral_commission', label: 'Referral Commission Partner', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'affiliate', label: 'Affiliate Partner', color: 'bg-purple-50 text-purple-600' },
];

export const LISTING_TYPE_LABELS = LISTING_TYPES.reduce((acc, l) => ({ ...acc, [l.id]: l.label }), {});

// ── REFERRAL EVENT TYPES ──
export const REFERRAL_EVENT_TYPES = [
  { id: 'profile_view', label: 'Profile View' },
  { id: 'button_click', label: 'Button Click' },
  { id: 'website_click', label: 'Website Click' },
  { id: 'booking_request', label: 'Booking Request' },
  { id: 'quote_request', label: 'Quote Request' },
  { id: 'promo_code_usage', label: 'Promo Code Usage' },
  { id: 'referral_click', label: 'Referral Click' },
];

export const REFERRAL_EVENT_LABELS = REFERRAL_EVENT_TYPES.reduce((acc, e) => ({ ...acc, [e.id]: e.label }), {});

// ── WEDDING SERVICES ──
export const WEDDING_SERVICES = [
  'wedding_planner', 'venue', 'caterer', 'florist', 'photographer', 'videographer',
  'hair_makeup', 'bakery', 'dj', 'live_music', 'officiant', 'rentals', 'tents',
  'transportation', 'golf_carts', 'childcare',
];

export const WEDDING_SERVICE_LABELS = WEDDING_SERVICES.reduce((acc, s) => {
  const label = s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { ...acc, [s]: label };
}, {});

export const WEDDING_BUDGET_RANGES = [
  { id: 'under_10k', label: 'Under $10,000' },
  { id: '10k_25k', label: '$10,000 – $25,000' },
  { id: '25k_50k', label: '$25,000 – $50,000' },
  { id: '50k_100k', label: '$50,000 – $100,000' },
  { id: '100k_plus', label: '$100,000+' },
  { id: 'flexible', label: 'Flexible' },
];

export const PARTNER_STATUS_META = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
  hidden: { label: 'Hidden', color: 'bg-muted text-muted-foreground' },
  suspended: { label: 'Suspended', color: 'bg-red-50 text-red-600' },
};

export const WEDDING_INQUIRY_STATUS_META = {
  submitted: { label: 'Submitted', color: 'bg-blue-50 text-blue-600' },
  reviewing: { label: 'Reviewing', color: 'bg-amber-50 text-amber-600' },
  matched: { label: 'Matched', color: 'bg-emerald-50 text-emerald-600' },
  consultation_scheduled: { label: 'Consultation Scheduled', color: 'bg-purple-50 text-purple-600' },
  quoted: { label: 'Quoted', color: 'bg-blue-50 text-blue-600' },
  booked: { label: 'Booked', color: 'bg-emerald-50 text-emerald-700' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};