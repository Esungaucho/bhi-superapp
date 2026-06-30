export const CATEGORIES = [
  { id: 'local_guide', label: 'Local Guides', emoji: '📖', desc: 'How to enjoy the island' },
  { id: 'beach_access', label: 'Beach Access', emoji: '🏖️', desc: 'Best access points' },
  { id: 'hidden_gem', label: 'Hidden Gems', emoji: '💎', desc: 'Secret spots worth finding' },
  { id: 'animal_sighting', label: 'Wildlife', emoji: '🐬', desc: 'Animal & nature sightings' },
  { id: 'lost_found', label: 'Lost & Found', emoji: '🔍', desc: 'Lost or found items' },
  { id: 'seasonal_tip', label: 'Seasonal Tips', emoji: '🍂', desc: 'Time-of-year recommendations' },
];

export const getCategory = (id) => CATEGORIES.find(c => c.id === id) || { label: id, emoji: '📋', desc: '' };