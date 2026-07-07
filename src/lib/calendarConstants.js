import {
  Music, UtensilsCrossed, ShoppingBag, Users, Baby, Leaf, Dumbbell,
  Palette, Landmark, Heart, Gift, Crown, Calendar, Sparkles, TreePine,
  Feather, Fish, CloudSun, Waves, Ship, Wine, Puzzle, Mountain, Flag,
  Circle, CloudRain, Flower2, Shell, Bug, Star, Bell, MapPin, Clock,
} from 'lucide-react';

export const EVENT_CATEGORIES = [
  { id: 'family', label: 'Family', Icon: Users },
  { id: 'kids', label: 'Kids', Icon: Baby },
  { id: 'nature', label: 'Nature', Icon: Leaf },
  { id: 'conservancy', label: 'Conservancy', Icon: Feather },
  { id: 'fitness', label: 'Fitness', Icon: Dumbbell },
  { id: 'arts_culture', label: 'Arts & Culture', Icon: Palette },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'dining', label: 'Dining', Icon: UtensilsCrossed },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { id: 'community', label: 'Community', Icon: Users },
  { id: 'government', label: 'Government', Icon: Landmark },
  { id: 'weddings', label: 'Weddings', Icon: Heart },
  { id: 'holiday', label: 'Holiday', Icon: Gift },
  { id: 'club_events', label: 'Club Events', Icon: Crown },
  { id: 'member_only', label: 'Member Only', Icon: Crown },
  { id: 'seasonal', label: 'Seasonal', Icon: Sparkles },
];

export const EVENT_ORGANIZATIONS = [
  { id: 'bhi_limited', label: 'Bald Head Island Limited', source: 'bhi_limited' },
  { id: 'village_of_bhi', label: 'Village of Bald Head Island', source: 'village_of_bhi' },
  { id: 'bhi_conservancy', label: 'BHI Conservancy', source: 'bhi_conservancy' },
  { id: 'bald_head_association', label: 'Bald Head Association', source: 'bald_head_association' },
  { id: 'old_baldy_foundation', label: 'Old Baldy Foundation', source: 'old_baldy_foundation' },
  { id: 'shoals_club', label: 'Shoals Club', source: 'shoals_club' },
  { id: 'bhi_club', label: 'Bald Head Island Club', source: 'bhi_club' },
  { id: 'admin_manual', label: 'Admin (Manual)', source: 'admin_manual' },
  { id: 'community_submission', label: 'Community Submission', source: 'community_submission' },
  { id: 'other', label: 'Other', source: 'other' },
];

export const SEASONS = [
  { id: 'turtle_nesting', label: 'Sea Turtle Nesting', Icon: Shell, desc: 'May – October' },
  { id: 'turtle_hatching', label: 'Sea Turtle Hatching', Icon: Shell, desc: 'July – October' },
  { id: 'shorebird_nesting', label: 'Shorebird Nesting', Icon: Feather, desc: 'April – August' },
  { id: 'bird_migration', label: 'Bird Migration', Icon: Feather, desc: 'Spring & Fall' },
  { id: 'butterfly_season', label: 'Butterfly Season', Icon: Flower2, desc: 'Summer – Fall' },
  { id: 'wildflower_blooms', label: 'Wildflower Blooms', Icon: Flower2, desc: 'Spring' },
  { id: 'fishing_peak', label: 'Peak Fishing Season', Icon: Fish, desc: 'Varies by species' },
  { id: 'mosquito_season', label: 'Mosquito & Fly Season', Icon: Bug, desc: 'May – October' },
  { id: 'hurricane_season', label: 'Hurricane Season', Icon: CloudRain, desc: 'June – November' },
  { id: 'holiday_weekend', label: 'Holiday Weekend', Icon: Gift, desc: '' },
  { id: 'fourth_of_july', label: 'Fourth of July', Icon: Sparkles, desc: 'July 4th' },
  { id: 'thanksgiving', label: 'Thanksgiving', Icon: UtensilsCrossed, desc: 'November' },
  { id: 'christmas', label: 'Christmas', Icon: TreePine, desc: 'December' },
  { id: 'new_year', label: "New Year's", Icon: Sparkles, desc: 'January 1st' },
];

export const INTERESTS = [
  { id: 'restaurants', label: 'Restaurants', Icon: UtensilsCrossed },
  { id: 'ferry_updates', label: 'Ferry Updates', Icon: Ship },
  { id: 'weather_alerts', label: 'Weather Alerts', Icon: CloudSun },
  { id: 'beach_conditions', label: 'Beach Conditions', Icon: Waves },
  { id: 'turtle_season', label: 'Turtle Season', Icon: Shell },
  { id: 'turtle_hatchings', label: 'Turtle Hatchings', Icon: Shell },
  { id: 'bird_migrations', label: 'Bird Migrations', Icon: Feather },
  { id: 'wildlife_sightings', label: 'Wildlife Sightings', Icon: Feather },
  { id: 'fishing_conditions', label: 'Fishing Conditions', Icon: Fish },
  { id: 'kids_activities', label: 'Kids Activities', Icon: Puzzle },
  { id: 'live_music', label: 'Live Music', Icon: Music },
  { id: 'fitness_classes', label: 'Fitness Classes', Icon: Dumbbell },
  { id: 'club_events', label: 'Club Events', Icon: Users },
  { id: 'golf_events', label: 'Golf Events', Icon: Flag },
  { id: 'tennis_pickleball', label: 'Tennis & Pickleball', Icon: Circle },
  { id: 'nature_walks', label: 'Nature Walks', Icon: Leaf },
  { id: 'conservancy_events', label: 'Conservancy Events', Icon: Leaf },
  { id: 'holiday_events', label: 'Holiday Events', Icon: Gift },
  { id: 'markets', label: 'Markets', Icon: ShoppingBag },
  { id: 'community_meetings', label: 'Community Meetings', Icon: Users },
  { id: 'emergency_alerts', label: 'Emergency Alerts', Icon: CloudRain },
  { id: 'sunset_reminders', label: 'Sunset Reminders', Icon: CloudSun },
  { id: 'sunrise_reminders', label: 'Sunrise Reminders', Icon: CloudSun },
];

export const NOTIFICATION_TIMINGS = [
  { id: 'notify_24h', label: '24 hours before', Icon: Clock },
  { id: 'notify_2h', label: '2 hours before', Icon: Clock },
  { id: 'notify_30m', label: '30 minutes before', Icon: Bell },
];

export function getActiveSeasons(date = new Date()) {
  const month = date.getMonth();
  const active = [];
  if (month >= 4 && month <= 9) active.push('turtle_nesting');
  if (month >= 6 && month <= 9) active.push('turtle_hatching');
  if (month >= 3 && month <= 7) active.push('shorebird_nesting');
  if (month <= 4 || month >= 8) active.push('bird_migration');
  if (month >= 5 && month <= 9) active.push('mosquito_season');
  if (month >= 5 && month <= 10) active.push('hurricane_season');
  if (month >= 5 && month <= 9) active.push('butterfly_season');
  if (month >= 2 && month <= 5) active.push('wildflower_blooms');
  if (month === 6) active.push('fourth_of_july');
  return active;
}

export const getCategory = (id) => {
  const c = EVENT_CATEGORIES.find(c => c.id === id);
  return c || { label: id, Icon: Calendar };
};
export const getSeason = (id) => SEASONS.find(s => s.id === id) || { label: id, Icon: Leaf, desc: '' };
export const getInterest = (id) => INTERESTS.find(i => i.id === id) || { label: id, Icon: Star };
export const getOrganization = (id) => EVENT_ORGANIZATIONS.find(o => o.id === id || o.source === id) || { label: id || 'Unknown', source: id };