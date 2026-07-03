import {
  Sun, Home, Store, Anchor, Briefcase,
  Ship, CloudSun, UtensilsCrossed, Music, Puzzle,
  Fish, Flag, Circle, Leaf, Feather, Shell,
  CalendarDays, Users, Siren, ShoppingBag, BedDouble,
  Shirt, Baby, Gift, Heart, Waves, Turtle, KeyRound,
  CalendarHeart, Sparkles, Crown, Car, Sailboat, Coffee,
  Hammer, Map, MapPin, MessageCircle, Bell, ConciergeBell,
  Wrench, Building2, HardHat, Users2,
} from 'lucide-react';

// Legacy tiers — used by useUserAccess for admin/captain/business access
export const USER_TIERS = [
  { value: 'visitor', Icon: Sun, label: 'Visitor', description: 'Visiting for a vacation or getaway' },
  { value: 'resident', Icon: Home, label: 'Resident', description: 'I live on Bald Head Island' },
  { value: 'homeowner', Icon: Home, label: 'Homeowner', description: 'I own property on the island' },
  { value: 'business_owner', Icon: Store, label: 'Business Owner', description: 'I operate a business on BHI' },
  { value: 'captain', Icon: Anchor, label: 'Captain', description: 'I operate charters or tours' },
  { value: 'employee', Icon: Briefcase, label: 'Employee', description: 'I work on the island' },
];

// Expanded user roles for personalization
export const USER_ROLES = [
  { value: 'homeowner', Icon: Home, label: 'Homeowner', desc: 'I own property on the island' },
  { value: 'renter', Icon: KeyRound, label: 'Renter', desc: 'I rent a home on BHI' },
  { value: 'visitor', Icon: Sun, label: 'Visitor', desc: 'Visiting for a getaway' },
  { value: 'future_homeowner', Icon: Map, label: 'Future Homeowner', desc: 'Looking to buy or build' },
  { value: 'young_family', Icon: Baby, label: 'Young Family', desc: 'Visiting with young kids' },
  { value: 'grandparent', Icon: Users2, label: 'Grandparent', desc: 'Visiting with grandkids' },
  { value: 'couple', Icon: Heart, label: 'Couple', desc: 'Here with my partner' },
  { value: 'friend_group', Icon: Users, label: 'Friend Group', desc: 'Here with friends' },
  { value: 'wedding_guest', Icon: Heart, label: 'Wedding Guest', desc: 'Attending a wedding' },
  { value: 'event_host', Icon: CalendarHeart, label: 'Bride/Groom or Host', desc: 'Planning an event or wedding' },
  { value: 'babysitter_nanny', Icon: Baby, label: 'Babysitter/Nanny', desc: 'I provide childcare' },
  { value: 'restaurant_worker', Icon: UtensilsCrossed, label: 'Restaurant Worker', desc: 'I work in dining' },
  { value: 'housekeeper', Icon: Sparkles, label: 'Housekeeper', desc: 'I provide cleaning services' },
  { value: 'vendor', Icon: Store, label: 'Vendor', desc: 'I provide event/vendor services' },
  { value: 'turtle_volunteer', Icon: Turtle, label: 'Turtle Volunteer', desc: 'I help with turtle conservation' },
  { value: 'real_estate_agent', Icon: Briefcase, label: 'Real Estate Agent', desc: 'I sell island property' },
  { value: 'property_manager', Icon: Building2, label: 'Property Manager', desc: 'I manage rentals' },
  { value: 'island_staff', Icon: HardHat, label: 'Island Staff', desc: 'I work on the island' },
  { value: 'local_business_owner', Icon: Store, label: 'Local Business Owner', desc: 'I own a business on BHI' },
];

// Map detailed roles to legacy tiers for access control
export const ROLE_TO_TIER = {
  homeowner: 'homeowner',
  renter: 'visitor',
  visitor: 'visitor',
  future_homeowner: 'visitor',
  young_family: 'visitor',
  grandparent: 'visitor',
  couple: 'visitor',
  friend_group: 'visitor',
  wedding_guest: 'visitor',
  event_host: 'visitor',
  babysitter_nanny: 'employee',
  restaurant_worker: 'employee',
  housekeeper: 'employee',
  vendor: 'business_owner',
  turtle_volunteer: 'resident',
  real_estate_agent: 'business_owner',
  property_manager: 'business_owner',
  island_staff: 'employee',
  local_business_owner: 'business_owner',
};

// Activity-based interests for content personalization
export const ACTIVITY_INTERESTS = [
  { id: 'dining', label: 'Dining', Icon: UtensilsCrossed },
  { id: 'beach_days', label: 'Beach Days', Icon: Waves },
  { id: 'kids_activities', label: 'Kids Activities', Icon: Puzzle },
  { id: 'babysitting', label: 'Babysitting', Icon: Baby },
  { id: 'events', label: 'Events', Icon: CalendarDays },
  { id: 'weddings', label: 'Weddings', Icon: Heart },
  { id: 'real_estate_rentals', label: 'Real Estate & Rentals', Icon: Home },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { id: 'turtle_conservation', label: 'Turtle Conservation', Icon: Turtle },
  { id: 'nightlife_social', label: 'Nightlife & Social', Icon: Music },
  { id: 'wellness', label: 'Wellness', Icon: Sparkles },
  { id: 'boating', label: 'Boating', Icon: Sailboat },
  { id: 'fishing', label: 'Fishing', Icon: Fish },
  { id: 'golf_carts', label: 'Golf Carts', Icon: Car },
  { id: 'luxury_experiences', label: 'Luxury Experiences', Icon: Crown },
  { id: 'family_friendly', label: 'Family-Friendly', Icon: Users },
];

// Legacy notification interests
export const INTEREST_OPTIONS = [
  { id: 'ferry', label: 'Ferry', Icon: Ship },
  { id: 'weather', label: 'Weather', Icon: CloudSun },
  { id: 'restaurants', label: 'Restaurants', Icon: UtensilsCrossed },
  { id: 'live_music', label: 'Live Music', Icon: Music },
  { id: 'kids_activities', label: 'Kids Activities', Icon: Puzzle },
  { id: 'fishing', label: 'Fishing', Icon: Fish },
  { id: 'golf', label: 'Golf', Icon: Flag },
  { id: 'tennis', label: 'Tennis', Icon: Circle },
  { id: 'pickleball', label: 'Pickleball', Icon: Circle },
  { id: 'nature', label: 'Nature', Icon: Leaf },
  { id: 'wildlife', label: 'Wildlife', Icon: Feather },
  { id: 'turtle_season', label: 'Turtle Season', Icon: Shell },
  { id: 'events', label: 'Events', Icon: CalendarDays },
  { id: 'community', label: 'Community Updates', Icon: Users },
  { id: 'emergency', label: 'Emergency Alerts', Icon: Siren },
  { id: 'shopping', label: 'Shopping Guides', Icon: ShoppingBag },
  { id: 'holiday_outfits', label: 'Holiday Outfit Guides', Icon: Shirt },
  { id: 'family_activities', label: 'Family Activity Ideas', Icon: Puzzle },
  { id: 'lodging_deals', label: 'Lodging Deals', Icon: BedDouble },
];

export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', description: 'Get notified as things happen' },
  { value: 'daily_summary', label: 'Daily Summary', description: 'One digest each morning' },
  { value: 'weekly_summary', label: 'Weekly Summary', description: 'One digest each week' },
  { value: 'emergency_only', label: 'Emergency Alerts Only', description: 'Only critical safety alerts' },
];

export const getTierLabel = (value) => USER_TIERS.find(t => t.value === value)?.label || value;
export const getRoleLabel = (value) => USER_ROLES.find(r => r.value === value)?.label || value;