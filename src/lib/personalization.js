import {
  Home, KeyRound, Sun, Map, Baby, Users2, Heart, Users,
  CalendarHeart, UtensilsCrossed, Sparkles, Store, Turtle,
  Briefcase, Building2, HardHat, Waves, Puzzle, CalendarDays,
  ShoppingBag, Music, Sailboat, Fish, Car, Crown, MessageCircle,
  Bell, ConciergeBell, Wrench, MapPin, Ship, Anchor, Hammer,
  BedDouble, Coffee, ShieldCheck,
} from 'lucide-react';

// Recommendation cards — each maps to roles and/or interests
// A card shows if the user's role is in `roles` OR any of their interests intersect with `interests`
const RECOMMENDATION_CARDS = [
  // ── Property & Home ──
  { id: 'property_services', title: 'Property Services', desc: 'Maintenance, landscaping & home watch', path: '/builders', Icon: Hammer, roles: ['homeowner', 'property_manager', 'future_homeowner'], interests: [] },
  { id: 'home_maintenance', title: 'Home Maintenance', desc: 'Trusted contractors & repair services', path: '/builders', Icon: Wrench, roles: ['homeowner', 'renter', 'property_manager'], interests: [] },
  { id: 'real_estaste_listings', title: 'Real Estate Listings', desc: 'Browse homes for sale on BHI', path: '/real-estate', Icon: Home, roles: ['future_homeowner', 'real_estate_agent'], interests: ['real_estate_rentals'] },
  { id: 'rental_properties', title: 'Rental Properties', desc: 'Vacation & long-term rentals', path: '/rentals', Icon: Building2, roles: ['renter', 'future_homeowner', 'visitor', 'property_manager'], interests: ['real_estate_rentals'] },

  // ── Family & Kids ──
  { id: 'kids_activities', title: 'Kids Activities', desc: 'Fun for the little ones', path: '/experiences', Icon: Puzzle, roles: ['young_family', 'grandparent', 'event_host'], interests: ['kids_activities', 'family_friendly'] },
  { id: 'babysitting', title: 'Babysitting & Childcare', desc: 'Verified sitters & nannies', path: '/babysitting', Icon: Baby, roles: ['young_family', 'grandparent', 'couple', 'event_host', 'babysitter_nanny'], interests: ['babysitting'] },
  { id: 'family_dining', title: 'Family Dining', desc: 'Kid-friendly restaurants', path: '/food', Icon: UtensilsCrossed, roles: ['young_family', 'grandparent'], interests: ['dining', 'family_friendly'] },
  { id: 'beach_safety', title: 'Beach & Water Safety', desc: 'Flags, currents & kid safety', path: '/turtles', Icon: ShieldCheck, roles: ['young_family', 'grandparent'], interests: ['beach_days', 'family_friendly'] },

  // ── Events & Weddings ──
  { id: 'event_schedules', title: 'Event Schedules', desc: 'What\'s happening on the island', path: '/calendar', Icon: CalendarDays, roles: ['wedding_guest', 'event_host', 'visitor', 'couple'], interests: ['events'] },
  { id: 'wedding_planning', title: 'Wedding & Event Planning', desc: 'Vendors, timelines & logistics', path: '/events', Icon: CalendarHeart, roles: ['event_host', 'wedding_guest'], interests: ['weddings'] },
  { id: 'event_vendors', title: 'Event Vendors', desc: 'Caterers, florists, photographers', path: '/events/vendors', Icon: Users, roles: ['event_host', 'vendor'], interests: ['weddings'] },
  { id: 'beauty_services', title: 'Beauty & Hair Services', desc: 'Hair, makeup & spa for events', path: '/events/vendors', Icon: Sparkles, roles: ['wedding_guest', 'event_host', 'couple'], interests: ['weddings', 'wellness'] },

  // ── Activities & Experiences ──
  { id: 'beach_days', title: 'Beach Days', desc: 'Conditions, access & essentials', path: '/weather', Icon: Waves, roles: ['visitor', 'renter', 'couple', 'friend_group', 'young_family'], interests: ['beach_days'] },
  { id: 'boating', title: 'Boating & Charters', desc: 'Boat rentals & sunset cruises', path: '/experiences', Icon: Sailboat, roles: ['visitor', 'couple', 'friend_group'], interests: ['boating'] },
  { id: 'fishing', title: 'Fishing', desc: 'Charters, spots & reports', path: '/experiences', Icon: Fish, roles: ['visitor', 'friend_group', 'couple'], interests: ['fishing'] },
  { id: 'golf_carts', title: 'Golf Cart Rentals', desc: 'Get around the island', path: '/equipment', Icon: Car, roles: ['visitor', 'renter', 'homeowner', 'future_homeowner'], interests: ['golf_carts'] },
  { id: 'wellness', title: 'Wellness & Spa', desc: 'Spa, yoga & fitness', path: '/experiences', Icon: Sparkles, roles: ['couple', 'visitor'], interests: ['wellness'] },
  { id: 'luxury_experiences', title: 'Luxury Experiences', desc: 'Premium island experiences', path: '/experiences', Icon: Crown, roles: ['couple', 'visitor', 'friend_group'], interests: ['luxury_experiences'] },

  // ── Dining & Social ──
  { id: 'island_dining', title: 'Island Dining', desc: 'Restaurants, cafes & bars', path: '/food', Icon: UtensilsCrossed, roles: ['visitor', 'renter', 'couple', 'friend_group', 'wedding_guest'], interests: ['dining'] },
  { id: 'nightlife', title: 'Nightlife & Social', desc: 'Live music & evening plans', path: '/calendar', Icon: Music, roles: ['couple', 'friend_group', 'visitor'], interests: ['nightlife_social'] },
  { id: 'coffee_bakeries', title: 'Coffee & Bakeries', desc: 'Morning coffee & fresh pastries', path: '/food', Icon: Coffee, roles: ['visitor', 'renter', 'couple', 'homeowner'], interests: ['dining'] },

  // ── Turtle Conservation ──
  { id: 'turtle_education', title: 'Turtle Conservation', desc: 'Learn about our sea turtles', path: '/turtles', Icon: Turtle, roles: ['turtle_volunteer', 'young_family', 'grandparent', 'visitor'], interests: ['turtle_conservation', 'family_friendly'] },
  { id: 'nest_tracker', title: 'Nest Tracker Map', desc: 'Track active turtle nests', path: '/turtles/map', Icon: MapPin, roles: ['turtle_volunteer'], interests: ['turtle_conservation'] },

  // ── Shopping ──
  { id: 'island_shop', title: 'Island Shop', desc: 'Curated island essentials', path: '/island-shop', Icon: ShoppingBag, roles: ['visitor', 'renter', 'couple', 'young_family'], interests: ['shopping'] },
  { id: 'local_boutiques', title: 'Local Boutiques', desc: 'Shop local island stores', path: '/shops', Icon: Store, roles: ['visitor', 'renter', 'homeowner'], interests: ['shopping'] },

  // ── Community ──
  { id: 'community_updates', title: 'Island Chat', desc: 'Community feed & updates', path: '/community', Icon: MessageCircle, roles: ['homeowner', 'local_business_owner', 'turtle_volunteer', 'island_staff'], interests: [] },
  { id: 'island_alerts', title: 'Island Alerts', desc: 'Weather, ferry & emergency alerts', path: '/notifications', Icon: Bell, roles: ['homeowner', 'property_manager', 'island_staff'], interests: [] },

  // ── Travel & Logistics ──
  { id: 'ferry_schedule', title: 'Ferry Schedule', desc: 'Real-time ferry departures', path: '/ferry', Icon: Ship, roles: ['visitor', 'renter', 'wedding_guest', 'island_staff', 'restaurant_worker'], interests: [] },
  { id: 'island_guides', title: 'Island Discovery', desc: 'Explore everything BHI offers', path: '/discovery', Icon: Map, roles: ['future_homeowner', 'visitor', 'renter', 'couple', 'friend_group'], interests: [] },
  { id: 'vacation_rentals', title: 'Vacation Stays', desc: 'Find your perfect island home', path: '/rentals', Icon: BedDouble, roles: ['future_homeowner', 'visitor', 'renter'], interests: ['real_estate_rentals'] },

  // ── Work & Business ──
  { id: 'work_resources', title: 'Work Resources', desc: 'Schedules, logistics & tools', path: '/concierge/dashboard', Icon: Briefcase, roles: ['island_staff', 'vendor', 'restaurant_worker', 'housekeeper', 'local_business_owner'], interests: [] },
  { id: 'service_requests', title: 'Service Requests', desc: 'Concierge & errand services', path: '/concierge', Icon: ConciergeBell, roles: ['island_staff', 'vendor', 'homeowner', 'property_manager'], interests: [] },
  { id: 'business_dashboard', title: 'Business Dashboard', desc: 'Manage your listing & inquiries', path: '/admin/partners', Icon: Store, roles: ['local_business_owner', 'vendor', 'real_estate_agent'], interests: [] },

  // ── Real Estate Professional ──
  { id: 'real_estate_crm', title: 'CRM & Relationships', desc: 'Manage client relationships', path: '/admin/crm', Icon: Users, roles: ['real_estate_agent', 'property_manager'], interests: [] },
];

// Default activity interests per role — used to pre-select during onboarding
export const ROLE_DEFAULT_INTERESTS = {
  homeowner: ['real_estate_rentals', 'turtle_conservation', 'shopping'],
  renter: ['beach_days', 'dining', 'golf_carts', 'events'],
  visitor: ['beach_days', 'dining', 'events', 'boating', 'golf_carts'],
  future_homeowner: ['real_estate_rentals', 'dining', 'shopping'],
  young_family: ['kids_activities', 'babysitting', 'family_friendly', 'beach_days', 'dining'],
  grandparent: ['family_friendly', 'kids_activities', 'turtle_conservation', 'dining'],
  couple: ['dining', 'wellness', 'luxury_experiences', 'beach_days', 'nightlife_social'],
  friend_group: ['dining', 'nightlife_social', 'boating', 'beach_days', 'events'],
  wedding_guest: ['events', 'dining', 'wellness', 'weddings'],
  event_host: ['weddings', 'events', 'dining'],
  babysitter_nanny: ['babysitting', 'kids_activities', 'family_friendly'],
  restaurant_worker: ['dining'],
  housekeeper: [],
  vendor: ['weddings', 'events'],
  turtle_volunteer: ['turtle_conservation', 'beach_days'],
  real_estate_agent: ['real_estate_rentals'],
  property_manager: ['real_estate_rentals'],
  island_staff: [],
  local_business_owner: ['shopping', 'events'],
};

// Personalized greeting per role
export const ROLE_GREETINGS = {
  homeowner: { subtitle: 'Your island home, curated for you' },
  renter: { subtitle: 'Making the most of your island rental' },
  visitor: { subtitle: 'Your island adventure starts here' },
  future_homeowner: { subtitle: 'Discover your future island life' },
  young_family: { subtitle: 'Family fun, simplified' },
  grandparent: { subtitle: 'Making memories with the grandkids' },
  couple: { subtitle: 'Romance and relaxation await' },
  friend_group: { subtitle: 'Adventure with your crew' },
  wedding_guest: { subtitle: 'Celebrating love on the island' },
  event_host: { subtitle: 'Your perfect event, perfectly planned' },
  babysitter_nanny: { subtitle: 'Your childcare dashboard' },
  restaurant_worker: { subtitle: 'Your island work hub' },
  housekeeper: { subtitle: 'Your service dashboard' },
  vendor: { subtitle: 'Your business hub' },
  turtle_volunteer: { subtitle: 'Protecting our sea turtles' },
  real_estate_agent: { subtitle: 'Your real estate toolkit' },
  property_manager: { subtitle: 'Managing your properties' },
  island_staff: { subtitle: 'Your work & island hub' },
  local_business_owner: { subtitle: 'Growing your island business' },
};

/**
 * Get personalized recommendation cards based on user role and activity interests.
 * A card appears if the user's role is in the card's roles
 * OR any of the user's interests intersect with the card's interests.
 */
export function getPersonalizedRecommendations(userRole, activityInterests = []) {
  const interests = activityInterests || [];
  return RECOMMENDATION_CARDS.filter(card => {
    const roleMatch = card.roles.includes(userRole);
    const interestMatch = card.interests.some(i => interests.includes(i));
    return roleMatch || interestMatch;
  });
}

/**
 * Get a personalized greeting for the user's role.
 */
export function getRoleGreeting(userRole) {
  return ROLE_GREETINGS[userRole] || { subtitle: 'Your personalized island experience' };
}