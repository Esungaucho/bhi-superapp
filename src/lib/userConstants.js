export const USER_TIERS = [
  { value: 'visitor', emoji: '🏖️', label: 'Visitor', description: 'Visiting for a vacation or getaway' },
  { value: 'resident', emoji: '🌴', label: 'Resident', description: 'I live on Bald Head Island' },
  { value: 'homeowner', emoji: '🏡', label: 'Homeowner', description: 'I own property on the island' },
  { value: 'business_owner', emoji: '🏪', label: 'Business Owner', description: 'I operate a business on BHI' },
  { value: 'captain', emoji: '⚓', label: 'Captain', description: 'I operate charters or tours' },
  { value: 'employee', emoji: '🔧', label: 'Employee', description: 'I work on the island' },
];

export const INTEREST_OPTIONS = [
  { id: 'ferry', label: 'Ferry', emoji: '⛴️' },
  { id: 'weather', label: 'Weather', emoji: '🌤️' },
  { id: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { id: 'live_music', label: 'Live Music', emoji: '🎵' },
  { id: 'kids_activities', label: 'Kids Activities', emoji: '🎪' },
  { id: 'fishing', label: 'Fishing', emoji: '🎣' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'pickleball', label: 'Pickleball', emoji: '🏓' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'wildlife', label: 'Wildlife', emoji: '🦅' },
  { id: 'turtle_season', label: 'Turtle Season', emoji: '🐢' },
  { id: 'events', label: 'Events', emoji: '📅' },
  { id: 'community', label: 'Community Updates', emoji: '📢' },
  { id: 'emergency', label: 'Emergency Alerts', emoji: '🚨' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'lodging_deals', label: 'Lodging Deals', emoji: '🏡' },
];

export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', description: 'Get notified as things happen' },
  { value: 'daily_summary', label: 'Daily Summary', description: 'One digest each morning' },
  { value: 'weekly_summary', label: 'Weekly Summary', description: 'One digest each week' },
  { value: 'emergency_only', label: 'Emergency Alerts Only', description: 'Only critical safety alerts' },
];

export const getTierLabel = (value) => USER_TIERS.find(t => t.value === value)?.label || value;