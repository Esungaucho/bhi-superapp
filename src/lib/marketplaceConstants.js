import {
  Home, Hammer, PencilRuler, Sofa, Trees, Anchor, Ship, Waves, Eye, Building,
  Wind, Wrench, Zap, Shield, Brush, Grid, Box, Cpu, Sparkles, CloudRain, Droplets, Car,
  UtensilsCrossed, ChefHat, ShoppingCart, Camera, Compass, CalendarDays, ConciergeBell,
  Handshake, Heart, Users, Landmark, Megaphone, GraduationCap, Sparkle
} from 'lucide-react';

export const BUILDER_CATEGORIES = [
  { id: 'custom_builders', label: 'Custom Builders', Icon: Home },
  { id: 'general_contractors', label: 'General Contractors', Icon: Hammer },
  { id: 'architects', label: 'Architects', Icon: PencilRuler },
  { id: 'interior_designers', label: 'Interior Designers', Icon: Sofa },
  { id: 'landscape_designers', label: 'Landscape Designers', Icon: Trees },
  { id: 'dock_builders', label: 'Dock Builders', Icon: Anchor },
  { id: 'marine_contractors', label: 'Marine Contractors', Icon: Ship },
  { id: 'pool_builders', label: 'Pool Builders', Icon: Waves },
  { id: 'home_watch', label: 'Home Watch', Icon: Eye },
  { id: 'property_managers', label: 'Property Managers', Icon: Building },
  { id: 'hvac', label: 'HVAC', Icon: Wind },
  { id: 'plumbing', label: 'Plumbing', Icon: Wrench },
  { id: 'electrical', label: 'Electrical', Icon: Zap },
  { id: 'roofing', label: 'Roofing', Icon: Shield },
  { id: 'painting', label: 'Painting', Icon: Brush },
  { id: 'flooring', label: 'Flooring', Icon: Grid },
  { id: 'cabinetry', label: 'Cabinetry', Icon: Box },
  { id: 'smart_home', label: 'Smart Home', Icon: Cpu },
  { id: 'cleaning_services', label: 'Cleaning Services', Icon: Sparkles },
  { id: 'hurricane_preparation', label: 'Hurricane Prep', Icon: CloudRain },
  { id: 'pressure_washing', label: 'Pressure Washing', Icon: Droplets },
  { id: 'golf_cart_service', label: 'Golf Cart Service', Icon: Car },
];

export const LUXURY_LEVELS = {
  standard: { label: 'Standard', className: 'text-muted-foreground bg-sand' },
  premium: { label: 'Premium', className: 'text-ocean bg-ocean/10' },
  luxury: { label: 'Luxury', className: 'text-accent bg-accent/10' },
  ultra_luxury: { label: 'Ultra Luxury', className: 'text-amber-700 bg-amber-50' },
};

export const COMMUNITY_PARTNER_TYPES = {
  chamber_of_commerce: { label: 'Chamber of Commerce', Icon: Landmark },
  tourism_organization: { label: 'Tourism', Icon: Compass },
  community_association: { label: 'Community Association', Icon: Users },
  local_nonprofit: { label: 'Nonprofit', Icon: Heart },
  event_organization: { label: 'Events', Icon: CalendarDays },
};

export const RELATIONSHIP_STRENGTH = {
  new: { label: 'New', className: 'text-muted-foreground bg-sand' },
  acquaintance: { label: 'Acquaintance', className: 'text-blue-600 bg-blue-50' },
  warm: { label: 'Warm', className: 'text-ocean bg-ocean/10' },
  trusted: { label: 'Trusted', className: 'text-accent bg-accent/10' },
  key_partner: { label: 'Key Partner', className: 'text-amber-700 bg-amber-50' },
};

export const SPONSOR_CATEGORIES = {
  featured_realtor: { label: 'Featured Realtor', Icon: Home },
  featured_builder: { label: 'Featured Builder', Icon: Hammer },
  featured_restaurant: { label: 'Featured Restaurant', Icon: UtensilsCrossed },
  featured_wedding_vendor: { label: 'Featured Wedding Vendor', Icon: Heart },
  featured_concierge_partner: { label: 'Featured Concierge Partner', Icon: ConciergeBell },
};

export const REAL_ESTATE_SPECIALTIES = [
  'luxury_waterfront', 'vacation_rentals', 'investment_properties', 'vacant_land',
  'new_construction', 'historic_homes', 'golf_course_homes', 'condominiums',
  'property_management', 'relocation_services',
];

export const CROSS_LINK_MAP = {
  vacation_rental: [
    { label: 'Restaurants', Icon: UtensilsCrossed, link: '/food' },
    { label: 'Private Chefs', Icon: ChefHat, link: '/concierge/partners' },
    { label: 'Golf Cart Rentals', Icon: Car, link: '/equipment' },
    { label: 'Grocery Delivery', Icon: ShoppingCart, link: '/concierge/services' },
    { label: 'Photographers', Icon: Camera, link: '/concierge/partners' },
    { label: 'Activities', Icon: Waves, link: '/experiences' },
  ],
  builder: [
    { label: 'Architects', Icon: PencilRuler, link: '/builders' },
    { label: 'Interior Designers', Icon: Sofa, link: '/builders' },
    { label: 'Landscape Designers', Icon: Trees, link: '/builders' },
    { label: 'Property Managers', Icon: Building, link: '/builders' },
  ],
  restaurant: [
    { label: 'Attractions', Icon: Compass, link: '/discovery' },
    { label: 'Shopping', Icon: ShoppingCart, link: '/shops' },
    { label: 'Marinas', Icon: Anchor, link: '/experiences' },
    { label: 'Events', Icon: CalendarDays, link: '/calendar' },
  ],
  real_estate_listing: [
    { label: 'Builders', Icon: Hammer, link: '/builders' },
    { label: 'Interior Designers', Icon: Sofa, link: '/builders' },
    { label: 'Concierge Services', Icon: ConciergeBell, link: '/concierge/services' },
    { label: 'Property Managers', Icon: Building, link: '/builders' },
  ],
};