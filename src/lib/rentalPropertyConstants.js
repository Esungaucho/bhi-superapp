import {
  Home, Waves, MapPin, Users, CalendarHeart, Building, TreePalm, Bed, Bath,
  UtensilsCrossed, ChefHat, Camera, Flower2, Music, Truck, Scissors, Baby,
  Sparkles, Calendar, DollarSign, Star
} from 'lucide-react';

export const RENTAL_TYPES = [
  { id: 'luxury_vacation_rental', label: 'Luxury Vacation Rentals', Icon: Star },
  { id: 'bhi_rental_home', label: 'BHI Rental Homes', Icon: Home },
  { id: 'southport_rental', label: 'Southport Rentals', Icon: MapPin },
  { id: 'long_term_rental', label: 'Long-Term Rentals', Icon: Calendar },
  { id: 'property_management', label: 'Property Management', Icon: Building },
  { id: 'event_friendly_rental', label: 'Event-Friendly Rentals', Icon: CalendarHeart },
  { id: 'family_friendly_rental', label: 'Family-Friendly Rentals', Icon: Users },
  { id: 'waterfront_rental', label: 'Waterfront Rentals', Icon: Waves },
];

export const EVENT_VENDOR_CATEGORIES = [
  { id: 'private_chefs', label: 'Private Chefs', Icon: ChefHat, entityCategory: 'private_chefs' },
  { id: 'caterers', label: 'Caterers', Icon: UtensilsCrossed, entityCategory: 'caterers' },
  { id: 'florists', label: 'Florists', Icon: Flower2, entityCategory: 'florists' },
  { id: 'photographers', label: 'Photographers', Icon: Camera, entityCategory: 'photographers' },
  { id: 'videographers', label: 'Videographers', Icon: Camera, entityCategory: 'videographers' },
  { id: 'musicians_djs', label: 'DJs & Musicians', Icon: Music, entityCategory: 'musicians_djs' },
  { id: 'event_rentals', label: 'Event Rentals', Icon: Truck, entityCategory: 'event_rentals' },
  { id: 'transportation', label: 'Transportation', Icon: Truck, entityCategory: 'transportation' },
  { id: 'hair_makeup', label: 'Hair & Makeup', Icon: Scissors, entityCategory: 'hair_makeup' },
  { id: 'childcare', label: 'Childcare', Icon: Baby, entityCategory: 'childcare' },
  { id: 'cleaning', label: 'Cleaning Crews', Icon: Sparkles, entityCategory: 'cleaning' },
  { id: 'wedding_planners', label: 'Event Planners', Icon: CalendarHeart, entityCategory: 'wedding_planners' },
];