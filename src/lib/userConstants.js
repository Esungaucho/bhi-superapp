import {
  Sun, Home, Store, Anchor, Briefcase,
  Ship, CloudSun, UtensilsCrossed, Music, Puzzle,
  Fish, Flag, Circle, Leaf, Feather, Shell,
  CalendarDays, Users, Siren, ShoppingBag, BedDouble,
} from 'lucide-react';

export const USER_TIERS = [
  { value: 'visitor', Icon: Sun, label: 'Visitor', description: 'Visiting for a vacation or getaway' },
  { value: 'resident', Icon: Home, label: 'Resident', description: 'I live on Bald Head Island' },
  { value: 'homeowner', Icon: Home, label: 'Homeowner', description: 'I own property on the island' },
  { value: 'business_owner', Icon: Store, label: 'Business Owner', description: 'I operate a business on BHI' },
  { value: 'captain', Icon: Anchor, label: 'Captain', description: 'I operate charters or tours' },
  { value: 'employee', Icon: Briefcase, label: 'Employee', description: 'I work on the island' },
];

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
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { id: 'lodging_deals', label: 'Lodging Deals', Icon: BedDouble },
];

export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', description: 'Get notified as things happen' },
  { value: 'daily_summary', label: 'Daily Summary', description: 'One digest each morning' },
  { value: 'weekly_summary', label: 'Weekly Summary', description: 'One digest each week' },
  { value: 'emergency_only', label: 'Emergency Alerts Only', description: 'Only critical safety alerts' },
];

export const getTierLabel = (value) => USER_TIERS.find(t => t.value === value)?.label || value;