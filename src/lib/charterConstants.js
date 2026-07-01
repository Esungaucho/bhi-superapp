import { Fish, Anchor, Users, Sunset, Leaf, Ship, Sailboat, Waves } from 'lucide-react';

export const CHARTER_CATEGORIES = [
  { id: 'inshore_charter', label: 'Inshore Charters', Icon: Fish },
  { id: 'offshore_charter', label: 'Offshore Charters', Icon: Anchor },
  { id: 'family_fishing_trip', label: 'Family Fishing Trips', Icon: Users },
  { id: 'sunset_cruise', label: 'Sunset Cruises', Icon: Sunset },
  { id: 'eco_tour', label: 'Eco Tours', Icon: Leaf },
  { id: 'private_boat_rental', label: 'Private Boat Rentals', Icon: Ship },
  { id: 'sailboat_charter', label: 'Sailboat Charters', Icon: Sailboat },
];

export const DIFFICULTY_META = {
  beginner: { label: 'Beginner', color: 'text-success', bg: 'bg-success/10' },
  family: { label: 'Family-Friendly', color: 'text-accent', bg: 'bg-accent/10' },
  experienced: { label: 'Experienced', color: 'text-warning', bg: 'bg-warning/10' },
};

export const PRICE_RANGE_LABELS = { '$': 'Essential', '$$': 'Mid-Range', '$$$': 'Premium' };

export const getCharterCategory = (id) => CHARTER_CATEGORIES.find(c => c.id === id) || { label: id, Icon: Waves };