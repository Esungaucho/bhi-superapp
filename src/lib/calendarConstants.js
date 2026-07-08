import {
  Music, UtensilsCrossed, ShoppingBag, Users, Baby, Leaf, Dumbbell,
  Palette, Landmark, Heart, Gift, Crown, Calendar, Sparkles, TreePine,
  Feather, Fish, CloudSun, Waves, Ship, Wine, Puzzle, Mountain, Flag,
  Circle, CloudRain, Flower2, Shell, Bug, Star, Bell, MapPin, Clock,
  Church, Building2, MessageCircle, Shield, ScrollText, Turtle, Sprout,
  BookOpen, Anchor,
} from 'lucide-react';

export const EVENT_CATEGORIES = [
  { id: 'family', label: 'Family', Icon: Users, color: 'blue', badge: 'bg-blue-500/10 text-blue-600', dot: 'bg-blue-500' },
  { id: 'kids', label: 'Kids', Icon: Baby, color: 'pink', badge: 'bg-pink-500/10 text-pink-600', dot: 'bg-pink-500' },
  { id: 'nature', label: 'Nature', Icon: Leaf, color: 'green', badge: 'bg-green-500/10 text-green-600', dot: 'bg-green-500' },
  { id: 'conservancy', label: 'Conservancy', Icon: Feather, color: 'emerald', badge: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  { id: 'fitness', label: 'Fitness', Icon: Dumbbell, color: 'orange', badge: 'bg-orange-500/10 text-orange-600', dot: 'bg-orange-500' },
  { id: 'arts_culture', label: 'Arts & Culture', Icon: Palette, color: 'purple', badge: 'bg-purple-500/10 text-purple-600', dot: 'bg-purple-500' },
  { id: 'music', label: 'Live Music', Icon: Music, color: 'indigo', badge: 'bg-indigo-500/10 text-indigo-600', dot: 'bg-indigo-500' },
  { id: 'dining', label: 'Food & Drink', Icon: UtensilsCrossed, color: 'red', badge: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBag, color: 'amber', badge: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  { id: 'community', label: 'Community', Icon: Users, color: 'teal', badge: 'bg-teal-500/10 text-teal-600', dot: 'bg-teal-500' },
  { id: 'government', label: 'Government', Icon: Landmark, color: 'slate', badge: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
  { id: 'weddings', label: 'Weddings', Icon: Heart, color: 'rose', badge: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500' },
  { id: 'holiday', label: 'Holiday', Icon: Gift, color: 'red', badge: 'bg-red-600/10 text-red-700', dot: 'bg-red-600' },
  { id: 'club_events', label: 'Club Events', Icon: Crown, color: 'violet', badge: 'bg-violet-500/10 text-violet-600', dot: 'bg-violet-500' },
  { id: 'member_only', label: 'Member Only', Icon: Crown, color: 'fuchsia', badge: 'bg-fuchsia-500/10 text-fuchsia-600', dot: 'bg-fuchsia-500' },
  { id: 'seasonal', label: 'Seasonal', Icon: Sparkles, color: 'cyan', badge: 'bg-cyan-500/10 text-cyan-600', dot: 'bg-cyan-500' },
  { id: 'history', label: 'History', Icon: ScrollText, color: 'amber', badge: 'bg-amber-600/10 text-amber-700', dot: 'bg-amber-600' },
  { id: 'lighthouse', label: 'Lighthouse', Icon: Landmark, color: 'yellow', badge: 'bg-yellow-500/10 text-yellow-600', dot: 'bg-yellow-500' },
  { id: 'turtle_programs', label: 'Turtle Programs', Icon: Turtle, color: 'teal', badge: 'bg-teal-500/10 text-teal-600', dot: 'bg-teal-500' },
  { id: 'conservation', label: 'Conservation', Icon: Sprout, color: 'emerald', badge: 'bg-emerald-600/10 text-emerald-700', dot: 'bg-emerald-600' },
  { id: 'fundraiser', label: 'Fundraiser', Icon: Heart, color: 'rose', badge: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500' },
  { id: 'educational', label: 'Educational', Icon: BookOpen, color: 'blue', badge: 'bg-blue-600/10 text-blue-700', dot: 'bg-blue-600' },
];

export const EVENT_ORGANIZATIONS = [
  { id: 'bhi_limited', label: 'Bald Head Island Limited', source: 'bhi_limited' },
  { id: 'village_of_bhi', label: 'Village of Bald Head Island', source: 'village_of_bhi' },
  { id: 'bhi_conservancy', label: 'BHI Conservancy', source: 'bhi_conservancy' },
  { id: 'bald_head_association', label: 'Bald Head Association', source: 'bald_head_association' },
  { id: 'old_baldy_foundation', label: 'Old Baldy Foundation', source: 'old_baldy_foundation' },
  { id: 'village_chapel', label: 'Village Chapel of BHI', source: 'village_chapel' },
  { id: 'shoals_club', label: 'Shoals Club', source: 'shoals_club' },
  { id: 'bhi_club', label: 'Bald Head Island Club', source: 'bhi_club' },
  { id: 'bhi_marina', label: 'BHI Marina', source: 'bhi_marina' },
  { id: 'maritime_market', label: 'Maritime Market', source: 'maritime_market' },
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
  return c || { label: id, Icon: Calendar, badge: 'bg-ocean/8 text-ocean', dot: 'bg-ocean' };
};
export const getSeason = (id) => SEASONS.find(s => s.id === id) || { label: id, Icon: Leaf, desc: '' };
export const getInterest = (id) => INTERESTS.find(i => i.id === id) || { label: id, Icon: Star };
export const getOrganization = (id) => EVENT_ORGANIZATIONS.find(o => o.id === id || o.source === id) || { label: id || 'Unknown', source: id };

// Source badges with Lucide icons for display on event cards and detail pages
export const SOURCE_BADGES = {
  old_baldy_foundation: { label: 'Old Baldy Foundation', Icon: Landmark, badge: 'bg-amber-500/10 text-amber-700' },
  bhi_conservancy: { label: 'BHI Conservancy', Icon: Leaf, badge: 'bg-emerald-500/10 text-emerald-600' },
  bhi_limited: { label: 'Bald Head Island Limited', Icon: Ship, badge: 'bg-blue-500/10 text-blue-600' },
  village_of_bhi: { label: 'Village of BHI', Icon: Building2, badge: 'bg-slate-500/10 text-slate-600' },
  bald_head_association: { label: 'Bald Head Association', Icon: Users, badge: 'bg-teal-500/10 text-teal-600' },
  village_chapel: { label: 'Village Chapel', Icon: Church, badge: 'bg-purple-500/10 text-purple-600' },
  shoals_club: { label: 'Shoals Club', Icon: Crown, badge: 'bg-violet-500/10 text-violet-600' },
  bhi_club: { label: 'BHI Club', Icon: Crown, badge: 'bg-fuchsia-500/10 text-fuchsia-600' },
  bhi_marina: { label: 'BHI Marina', Icon: Anchor, badge: 'bg-blue-500/10 text-blue-600' },
  maritime_market: { label: 'Maritime Market', Icon: UtensilsCrossed, badge: 'bg-orange-500/10 text-orange-600' },
  admin_manual: { label: 'Island Concierge', Icon: Shield, badge: 'bg-ocean/10 text-ocean' },
  community_submission: { label: 'Community', Icon: MessageCircle, badge: 'bg-cyan-500/10 text-cyan-600' },
  other: { label: 'Island Event', Icon: Calendar, badge: 'bg-secondary text-muted-foreground' },
};

export const getSourceBadge = (sourceKey) => SOURCE_BADGES[sourceKey] || SOURCE_BADGES.other;