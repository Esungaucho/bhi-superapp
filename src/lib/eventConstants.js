import {
  MapPin, UtensilsCrossed, Flower2, Camera, Video, Scissors,
  Cake, Wine, Music, Package, Tent, Bus, Car, Baby, ShoppingCart, Sparkles,
  Shield, ChefHat, Compass, Users, FileText, ListChecks, LayoutDashboard,
  ConciergeBell, Plus, CalendarDays, Heart, PartyPopper, Building2, HandHeart,
  Salad, CheckCircle2
} from 'lucide-react';

export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', Icon: Heart },
  { id: 'rehearsal_dinner', label: 'Rehearsal Dinner', Icon: Salad },
  { id: 'family_reunion', label: 'Family Reunion', Icon: Users },
  { id: 'birthday_anniversary', label: 'Birthday / Anniversary', Icon: PartyPopper },
  { id: 'corporate_retreat', label: 'Corporate Retreat', Icon: Building2 },
  { id: 'charity_event', label: 'Charity Event', Icon: HandHeart },
  { id: 'private_dinner', label: 'Private Dinner', Icon: UtensilsCrossed },
  { id: 'other', label: 'Other', Icon: CalendarDays },
];

export const EVENT_TYPE_LABELS = EVENT_TYPES.reduce((acc, t) => ({ ...acc, [t.id]: t.label }), {});

export const BUDGET_RANGES = [
  { id: 'under_5k', label: 'Under $5,000' },
  { id: '5k_10k', label: '$5,000 – $10,000' },
  { id: '10k_25k', label: '$10,000 – $25,000' },
  { id: '25k_50k', label: '$25,000 – $50,000' },
  { id: '50k_100k', label: '$50,000 – $100,000' },
  { id: '100k_plus', label: '$100,000+' },
  { id: 'flexible', label: 'Flexible' },
];

export const BUDGET_LABELS = BUDGET_RANGES.reduce((acc, b) => ({ ...acc, [b.id]: b.label }), {});

export const PLANNING_HELP_OPTIONS = [
  { id: 'have_planner', label: 'I have a planner', desc: 'You already work with a wedding or event planner' },
  { id: 'need_planner', label: 'I need a planner', desc: "We'll help connect you with a trusted local planner" },
  { id: 'compass_concierge', label: 'Compass Concierge', desc: 'Our concierge team coordinates your event end-to-end' },
];

export const VENDOR_CATEGORIES = [
  { id: 'wedding_planners', label: 'Wedding Planners', Icon: Heart },
  { id: 'venues_locations', label: 'Venues & Locations', Icon: MapPin },
  { id: 'caterers', label: 'Caterers', Icon: UtensilsCrossed },
  { id: 'florists', label: 'Florists', Icon: Flower2 },
  { id: 'photographers', label: 'Photographers', Icon: Camera },
  { id: 'videographers', label: 'Videographers', Icon: Video },
  { id: 'hair_makeup', label: 'Hair & Makeup', Icon: Scissors },
  { id: 'bakers', label: 'Bakers', Icon: Cake },
  { id: 'bartenders', label: 'Bartenders', Icon: Wine },
  { id: 'musicians_djs', label: 'Musicians & DJs', Icon: Music },
  { id: 'event_rentals', label: 'Event Rentals', Icon: Package },
  { id: 'tents_chairs_tables', label: 'Tents, Chairs & Tables', Icon: Tent },
  { id: 'transportation', label: 'Transportation', Icon: Bus },
  { id: 'golf_carts', label: 'Golf Carts', Icon: Car },
  { id: 'childcare', label: 'Childcare', Icon: Baby },
  { id: 'grocery_stocking', label: 'Grocery Stocking', Icon: ShoppingCart },
  { id: 'cleaning', label: 'Cleaning', Icon: Sparkles },
  { id: 'security', label: 'Security', Icon: Shield },
  { id: 'private_chefs', label: 'Private Chefs', Icon: ChefHat },
  { id: 'activities_excursions', label: 'Activities & Excursions', Icon: Compass },
];

export const VENDOR_CATEGORY_LABELS = VENDOR_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {});

export const PRICE_RANGE_LABELS = { '$': 'Budget-friendly', '$$': 'Moderate', '$$$': 'Premium', '$$$$': 'Luxury', 'custom': 'Custom pricing' };

export const TIMELINE_PHASES = [
  { id: 'twelve_months', label: '12 Months Out', Icon: CalendarDays },
  { id: 'nine_months', label: '9 Months Out', Icon: CalendarDays },
  { id: 'six_months', label: '6 Months Out', Icon: CalendarDays },
  { id: 'three_months', label: '3 Months Out', Icon: CalendarDays },
  { id: 'one_month', label: '1 Month Out', Icon: CalendarDays },
  { id: 'event_week', label: 'Event Week', Icon: Heart },
  { id: 'day_before', label: 'Day Before', Icon: Heart },
  { id: 'event_day', label: 'Event Day', Icon: PartyPopper },
  { id: 'post_event', label: 'Post-Event', Icon: CheckCircle2 },
];

export const TIMELINE_ASSIGNMENTS = [
  { id: 'host', label: 'Host' },
  { id: 'planner', label: 'Planner' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'concierge', label: 'Compass Concierge' },
];

export const EVENT_STATUS_META = {
  planning: { label: 'Planning', color: 'bg-blue-50 text-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-600' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-600' },
  completed: { label: 'Completed', color: 'bg-sand text-muted-foreground' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};

export const QUOTE_STATUS_META = {
  pending: { label: 'Awaiting Response', color: 'bg-amber-50 text-amber-600' },
  quoted: { label: 'Quote Received', color: 'bg-blue-50 text-blue-600' },
  accepted: { label: 'Accepted', color: 'bg-emerald-50 text-emerald-600' },
  declined: { label: 'Declined', color: 'bg-muted text-muted-foreground' },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
  booked: { label: 'Booked', color: 'bg-emerald-50 text-emerald-700' },
};

export const CONCIERGE_HELP_TYPES = [
  { id: 'finding_vendors', label: 'Finding Vendors', desc: 'Connect me with trusted local vendors' },
  { id: 'building_itinerary', label: 'Building an Itinerary', desc: 'Help plan the event schedule and flow' },
  { id: 'coordinating_guests', label: 'Coordinating Guests', desc: 'Manage guest logistics and communications' },
  { id: 'solving_logistics', label: 'Solving Logistics', desc: 'Work through transportation, lodging, ferry needs' },
  { id: 'urgent_issues', label: 'Urgent Issues', desc: 'I need help with something time-sensitive' },
  { id: 'custom_package', label: 'Custom Package', desc: 'Create a tailored planning package for my event' },
];

export const URGENCY_LEVELS = [
  { id: 'low', label: 'Low', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-600' },
  { id: 'high', label: 'High', color: 'bg-amber-50 text-amber-600' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-600' },
];

export const RSVP_STATUS_META = {
  invited: { label: 'Invited', color: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-600' },
  declined: { label: 'Declined', color: 'bg-muted text-muted-foreground' },
  maybe: { label: 'Maybe', color: 'bg-amber-50 text-amber-600' },
};

export const EVENTS_NAV = [
  { label: 'Start an Event', path: '/events/start', Icon: Plus, desc: 'Begin a new event plan' },
  { label: 'My Event Dashboard', path: '/events', Icon: LayoutDashboard, desc: 'View and manage your events' },
  { label: 'Vendors & Services', path: '/events/vendors', Icon: Compass, desc: 'Browse curated local partners' },
  { label: 'Guest Logistics', path: '/events', Icon: Users, desc: 'Manage guest arrivals and lodging' },
  { label: 'Event Timeline', path: '/events', Icon: ListChecks, desc: 'Track planning milestones' },
  { label: 'Requests & Quotes', path: '/events', Icon: FileText, desc: 'Vendor quotes and bookings' },
  { label: 'Concierge Help', path: '/events/concierge', Icon: ConciergeBell, desc: 'Ask our team for help' },
];

export const DEFAULT_WEDDING_TIMELINE = [
  { phase: 'twelve_months', title: 'Set the date', description: 'Choose your wedding date and confirm island availability', assigned_to: 'host', sort_order: 1 },
  { phase: 'twelve_months', title: 'Book ceremony & reception venue', description: 'Secure your ceremony and reception locations on BHI', assigned_to: 'host', sort_order: 2 },
  { phase: 'twelve_months', title: 'Hire a planner or request Compass Concierge', description: 'Decide on planning support and secure your team', assigned_to: 'host', sort_order: 3 },
  { phase: 'twelve_months', title: 'Establish budget', description: 'Set your overall budget and allocate to categories', assigned_to: 'host', sort_order: 4 },
  { phase: 'twelve_months', title: 'Create guest list framework', description: 'Draft initial guest count and build the list', assigned_to: 'host', sort_order: 5 },
  { phase: 'nine_months', title: 'Book caterer', description: 'Select and confirm catering for the event', assigned_to: 'planner', sort_order: 1 },
  { phase: 'nine_months', title: 'Book photographer', description: 'Secure your event photographer', assigned_to: 'planner', sort_order: 2 },
  { phase: 'nine_months', title: 'Book videographer', description: 'Secure videography if desired', assigned_to: 'planner', sort_order: 3 },
  { phase: 'nine_months', title: 'Book florist', description: 'Select floral arrangements and decor', assigned_to: 'planner', sort_order: 4 },
  { phase: 'nine_months', title: 'Reserve rental equipment', description: 'Tents, chairs, tables, and event rentals', assigned_to: 'planner', sort_order: 5 },
  { phase: 'six_months', title: 'Send save-the-dates', description: 'Send save-the-dates to your guest list', assigned_to: 'host', sort_order: 1 },
  { phase: 'six_months', title: 'Book transportation', description: 'Arrange ferry and island transportation for guests', assigned_to: 'planner', sort_order: 2 },
  { phase: 'six_months', title: 'Book entertainment / DJ', description: 'Secure music and entertainment', assigned_to: 'planner', sort_order: 3 },
  { phase: 'six_months', title: 'Plan rehearsal dinner', description: 'Book venue and catering for rehearsal dinner', assigned_to: 'planner', sort_order: 4 },
  { phase: 'six_months', title: 'Book hair & makeup', description: 'Secure hair and makeup artists', assigned_to: 'planner', sort_order: 5 },
  { phase: 'three_months', title: 'Send invitations', description: 'Mail formal invitations with RSVP details', assigned_to: 'host', sort_order: 1 },
  { phase: 'three_months', title: 'Order wedding rings', description: 'Purchase or confirm wedding bands', assigned_to: 'host', sort_order: 2 },
  { phase: 'three_months', title: 'Finalize menu', description: 'Confirm catering menu and beverage selections', assigned_to: 'planner', sort_order: 3 },
  { phase: 'three_months', title: 'Plan welcome bags', description: 'Prepare guest welcome bags with island essentials', assigned_to: 'concierge', sort_order: 4 },
  { phase: 'three_months', title: 'Reserve golf carts', description: 'Book golf carts for guest transportation on island', assigned_to: 'concierge', sort_order: 5 },
  { phase: 'one_month', title: 'Finalize guest count', description: 'Confirm final guest count with all vendors', assigned_to: 'planner', sort_order: 1 },
  { phase: 'one_month', title: 'Create seating chart', description: 'Finalize seating arrangements', assigned_to: 'host', sort_order: 2 },
  { phase: 'one_month', title: 'Obtain marriage license', description: 'Secure marriage license in Brunswick County', assigned_to: 'host', sort_order: 3 },
  { phase: 'one_month', title: 'Confirm all vendors', description: 'Reconfirm all bookings and delivery times', assigned_to: 'planner', sort_order: 4 },
  { phase: 'one_month', title: 'Confirm weather backup plan', description: 'Finalize indoor/alternative arrangements', assigned_to: 'planner', sort_order: 5 },
  { phase: 'event_week', title: 'Confirm ferry schedules', description: 'Verify ferry times for all arriving guests', assigned_to: 'concierge', sort_order: 1 },
  { phase: 'event_week', title: 'Confirm lodging check-ins', description: 'Verify all rental homes are ready', assigned_to: 'concierge', sort_order: 2 },
  { phase: 'event_week', title: 'Distribute welcome bags', description: 'Deliver welcome bags to guest accommodations', assigned_to: 'concierge', sort_order: 3 },
  { phase: 'event_week', title: 'Final vendor check-ins', description: 'Touch base with all vendors for final confirmation', assigned_to: 'planner', sort_order: 4 },
  { phase: 'event_week', title: 'Confirm childcare arrangements', description: 'Verify babysitter bookings if needed', assigned_to: 'concierge', sort_order: 5 },
  { phase: 'day_before', title: 'Rehearsal dinner', description: 'Host rehearsal and dinner', assigned_to: 'host', sort_order: 1 },
  { phase: 'day_before', title: 'Set up welcome table', description: 'Prepare guest welcome and seating cards', assigned_to: 'vendor', sort_order: 2 },
  { phase: 'day_before', title: 'Confirm day-of timeline', description: 'Review final timeline with all parties', assigned_to: 'planner', sort_order: 3 },
  { phase: 'day_before', title: 'Prepare ceremony items', description: 'Rings, vows, programs, unity items', assigned_to: 'host', sort_order: 4 },
  { phase: 'event_day', title: 'Hair & makeup', description: 'Get ready with hair and makeup team', assigned_to: 'vendor', sort_order: 1 },
  { phase: 'event_day', title: 'Ceremony', description: 'The main event — enjoy every moment', assigned_to: 'host', sort_order: 2 },
  { phase: 'event_day', title: 'Reception', description: 'Celebrate with your guests', assigned_to: 'host', sort_order: 3 },
  { phase: 'event_day', title: 'Vendor breakdown', description: 'Coordinate end-of-night vendor teardown', assigned_to: 'planner', sort_order: 4 },
  { phase: 'post_event', title: 'Send thank-you notes', description: 'Express gratitude to guests and vendors', assigned_to: 'host', sort_order: 1 },
  { phase: 'post_event', title: 'Complete vendor payments', description: 'Settle all remaining vendor balances', assigned_to: 'host', sort_order: 2 },
  { phase: 'post_event', title: 'Return rental equipment', description: 'Coordinate return of rentals and golf carts', assigned_to: 'concierge', sort_order: 3 },
  { phase: 'post_event', title: 'Share photos', description: 'Distribute wedding photos to guests', assigned_to: 'host', sort_order: 4 },
  { phase: 'post_event', title: 'Leave vendor reviews', description: 'Review your trusted local partners', assigned_to: 'host', sort_order: 5 },
];

export const DEFAULT_EVENT_TIMELINE = [
  { phase: 'three_months', title: 'Set the date', description: 'Confirm your event date and island availability', assigned_to: 'host', sort_order: 1 },
  { phase: 'three_months', title: 'Establish budget', description: 'Set your budget and allocate to categories', assigned_to: 'host', sort_order: 2 },
  { phase: 'three_months', title: 'Create guest list', description: 'Draft your guest count and build the list', assigned_to: 'host', sort_order: 3 },
  { phase: 'three_months', title: 'Book venue', description: 'Secure your event location on BHI', assigned_to: 'host', sort_order: 4 },
  { phase: 'one_month', title: 'Book caterer', description: 'Select and confirm catering', assigned_to: 'planner', sort_order: 1 },
  { phase: 'one_month', title: 'Book photographer', description: 'Secure event photography', assigned_to: 'planner', sort_order: 2 },
  { phase: 'one_month', title: 'Reserve rentals', description: 'Tents, chairs, tables, equipment', assigned_to: 'planner', sort_order: 3 },
  { phase: 'one_month', title: 'Send invitations', description: 'Send invitations with RSVP details', assigned_to: 'host', sort_order: 4 },
  { phase: 'one_month', title: 'Reserve golf carts', description: 'Book golf carts for guest transportation', assigned_to: 'concierge', sort_order: 5 },
  { phase: 'event_week', title: 'Confirm ferry schedules', description: 'Verify ferry times for arriving guests', assigned_to: 'concierge', sort_order: 1 },
  { phase: 'event_week', title: 'Confirm lodging', description: 'Verify all accommodations are ready', assigned_to: 'concierge', sort_order: 2 },
  { phase: 'event_week', title: 'Final vendor check-ins', description: 'Confirm all bookings and times', assigned_to: 'planner', sort_order: 3 },
  { phase: 'event_week', title: 'Prepare welcome bags', description: 'Assemble and deliver guest welcome bags', assigned_to: 'concierge', sort_order: 4 },
  { phase: 'event_day', title: 'Event setup', description: 'Coordinate venue setup and decor', assigned_to: 'vendor', sort_order: 1 },
  { phase: 'event_day', title: 'Event', description: 'Enjoy your event', assigned_to: 'host', sort_order: 2 },
  { phase: 'event_day', title: 'Breakdown', description: 'Coordinate end-of-event teardown', assigned_to: 'planner', sort_order: 3 },
  { phase: 'post_event', title: 'Send thank-yous', description: 'Thank guests and vendors', assigned_to: 'host', sort_order: 1 },
  { phase: 'post_event', title: 'Complete payments', description: 'Settle remaining vendor balances', assigned_to: 'host', sort_order: 2 },
  { phase: 'post_event', title: 'Return rentals', description: 'Return rental equipment and golf carts', assigned_to: 'concierge', sort_order: 3 },
];