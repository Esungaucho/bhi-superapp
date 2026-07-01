export const CATEGORIES = [
  { id: 'urgent_update', label: 'Urgent', emoji: '🚨', desc: 'Time-sensitive alerts' },
  { id: 'lost_found', label: 'Lost & Found', emoji: '🔍', desc: 'Lost or found items' },
  { id: 'weather_alert', label: 'Weather', emoji: '⛅', desc: 'Weather updates & alerts' },
  { id: 'ferry_update', label: 'Ferry', emoji: '⛴️', desc: 'Ferry schedule & updates' },
  { id: 'bug_report', label: 'Bugs & Mosquitoes', emoji: '🦟', desc: 'Bug/fly/mosquito activity' },
  { id: 'beach_conditions', label: 'Beach', emoji: '🏖️', desc: 'Current beach conditions' },
  { id: 'wildlife_sighting', label: 'Wildlife', emoji: '🐬', desc: 'Animal & nature sightings' },
  { id: 'recommendations', label: 'Recommendations', emoji: '⭐', desc: 'Things to do & see' },
  { id: 'events', label: 'Events', emoji: '📅', desc: 'Island events & gatherings' },
  { id: 'help_needed', label: 'Help Needed', emoji: '🤝', desc: 'Request assistance' },
  { id: 'general_chat', label: 'Community', emoji: '💬', desc: 'General island chatter' },
];

export const getCategory = (id) => CATEGORIES.find(c => c.id === id) || { label: id, emoji: '📋', desc: '' };