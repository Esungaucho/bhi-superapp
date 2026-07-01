export const EVENT_CATEGORIES = [
  { id: 'live_music', label: 'Live Music', emoji: '🎵' },
  { id: 'dining_special', label: 'Dining Specials', emoji: '🍽️' },
  { id: 'happy_hour', label: 'Happy Hours', emoji: '🍸' },
  { id: 'kids_activities', label: 'Kids Activities', emoji: '🎨' },
  { id: 'family_events', label: 'Family Events', emoji: '👨‍👩‍👧‍👦' },
  { id: 'outdoor_adventures', label: 'Outdoor Adventures', emoji: '🚵' },
  { id: 'conservancy_programs', label: 'Conservancy', emoji: '🌿' },
  { id: 'ferry_schedule', label: 'Ferry Schedule', emoji: '⛴️' },
  { id: 'weather_alert', label: 'Weather Alerts', emoji: '⛅' },
  { id: 'beach_updates', label: 'Beach Updates', emoji: '🏖️' },
  { id: 'wildlife', label: 'Wildlife', emoji: '🐬' },
  { id: 'holiday_celebrations', label: 'Holidays', emoji: '🎉' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'arts_crafts', label: 'Arts & Crafts', emoji: '🖌️' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'pickleball', label: 'Pickleball', emoji: '🏓' },
  { id: 'fishing', label: 'Fishing', emoji: '🎣' },
  { id: 'community_events', label: 'Community', emoji: '🤝' },
];

export const INTERESTS = [
  { id: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { id: 'ferry_updates', label: 'Ferry Updates', emoji: '⛴️' },
  { id: 'weather_alerts', label: 'Weather Alerts', emoji: '⛅' },
  { id: 'beach_conditions', label: 'Beach Conditions', emoji: '🏖️' },
  { id: 'turtle_season', label: 'Turtle Season', emoji: '🐢' },
  { id: 'turtle_hatchings', label: 'Turtle Hatchings', emoji: '🐣' },
  { id: 'bird_migrations', label: 'Bird Migrations', emoji: '🦅' },
  { id: 'wildlife_sightings', label: 'Wildlife Sightings', emoji: '🐬' },
  { id: 'fishing_conditions', label: 'Fishing Conditions', emoji: '🎣' },
  { id: 'kids_activities', label: 'Kids Activities', emoji: '🎨' },
  { id: 'live_music', label: 'Live Music', emoji: '🎵' },
  { id: 'fitness_classes', label: 'Fitness Classes', emoji: '💪' },
  { id: 'club_events', label: 'Club Events', emoji: '🎪' },
  { id: 'golf_events', label: 'Golf Events', emoji: '⛳' },
  { id: 'tennis_pickleball', label: 'Tennis & Pickleball', emoji: '🏓' },
  { id: 'nature_walks', label: 'Nature Walks', emoji: '🌿' },
  { id: 'conservancy_events', label: 'Conservancy Events', emoji: '🦉' },
  { id: 'holiday_events', label: 'Holiday Events', emoji: '🎉' },
  { id: 'markets', label: 'Markets', emoji: '🛍️' },
  { id: 'community_meetings', label: 'Community Meetings', emoji: '🏛️' },
  { id: 'emergency_alerts', label: 'Emergency Alerts', emoji: '🚨' },
  { id: 'sunset_reminders', label: 'Sunset Reminders', emoji: '🌅' },
  { id: 'sunrise_reminders', label: 'Sunrise Reminders', emoji: '🌄' },
];

export const SEASONS = [
  { id: 'turtle_nesting', label: 'Sea Turtle Nesting', emoji: '🐢', desc: 'May – October' },
  { id: 'turtle_hatching', label: 'Sea Turtle Hatching', emoji: '🐣', desc: 'July – October' },
  { id: 'shorebird_nesting', label: 'Shorebird Nesting', emoji: '🐦', desc: 'April – August' },
  { id: 'bird_migration', label: 'Bird Migration', emoji: '🦅', desc: 'Spring & Fall' },
  { id: 'butterfly_season', label: 'Butterfly Season', emoji: '🦋', desc: 'Summer – Fall' },
  { id: 'wildflower_blooms', label: 'Wildflower Blooms', emoji: '🌸', desc: 'Spring' },
  { id: 'fishing_peak', label: 'Peak Fishing Season', emoji: '🎣', desc: 'Varies by species' },
  { id: 'mosquito_season', label: 'Mosquito & Fly Season', emoji: '🦟', desc: 'May – October' },
  { id: 'hurricane_season', label: 'Hurricane Season', emoji: '🌀', desc: 'June – November' },
  { id: 'holiday_weekend', label: 'Holiday Weekend', emoji: '🎉', desc: '' },
  { id: 'fourth_of_july', label: 'Fourth of July', emoji: '🎆', desc: 'July 4th' },
  { id: 'thanksgiving', label: 'Thanksgiving', emoji: '🦃', desc: 'November' },
  { id: 'christmas', label: 'Christmas', emoji: '🎄', desc: 'December' },
  { id: 'new_year', label: "New Year's", emoji: '🎊', desc: 'January 1st' },
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

export const getCategory = (id) => EVENT_CATEGORIES.find(c => c.id === id) || { label: id, emoji: '📋' };
export const getSeason = (id) => SEASONS.find(s => s.id === id) || { label: id, emoji: '🌿', desc: '' };
export const getInterest = (id) => INTERESTS.find(i => i.id === id) || { label: id, emoji: '📌' };