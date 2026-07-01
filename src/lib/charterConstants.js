export const CHARTER_CATEGORIES = [
  { id: 'inshore_charter', label: 'Inshore Charters', emoji: '🎣' },
  { id: 'offshore_charter', label: 'Offshore Charters', emoji: '⚓' },
  { id: 'family_fishing_trip', label: 'Family Fishing Trips', emoji: '👨‍👩‍👧‍👦' },
  { id: 'sunset_cruise', label: 'Sunset Cruises', emoji: '🌅' },
  { id: 'eco_tour', label: 'Eco Tours', emoji: '🌿' },
  { id: 'private_boat_rental', label: 'Private Boat Rentals', emoji: '🚤' },
  { id: 'sailboat_charter', label: 'Sailboat Charters', emoji: '⛵' },
];

export const DIFFICULTY_META = {
  beginner: { label: 'Beginner', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  family: { label: 'Family-Friendly', color: 'text-sky-600', bg: 'bg-sky-50' },
  experienced: { label: 'Experienced', color: 'text-amber-600', bg: 'bg-amber-50' },
};

export const PRICE_RANGE_LABELS = { '$': 'Budget', '$$': 'Mid-Range', '$$$': 'Premium' };

export const getCharterCategory = (id) => CHARTER_CATEGORIES.find(c => c.id === id) || { label: id, emoji: '🚢' };