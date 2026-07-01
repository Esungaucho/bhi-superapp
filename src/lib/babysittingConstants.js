import {
  Baby, HeartPulse, LifeBuoy, Waves, ShieldCheck, Car, Utensils, Moon, Sparkles, MapPin, Clock, Star, Award, CheckCircle2, AlertCircle
} from 'lucide-react';

export const AGE_RANGE_LABELS = {
  '18-21': '18–21 years',
  '22-25': '22–25 years',
  '26-30': '26–30 years',
  '31-40': '31–40 years',
  '40+': '40+ years',
  'adult_sitter': 'Adult Sitter',
};

export const COMFORT_LABELS = {
  none: 'Not comfortable',
  comfortable: 'Comfortable',
  very_comfortable: 'Very comfortable',
  certified: 'Certified / Expert',
};

export const CERTIFICATIONS = [
  { key: 'cpr_certified', label: 'CPR', Icon: HeartPulse },
  { key: 'first_aid_certified', label: 'First Aid', Icon: LifeBuoy },
  { key: 'lifeguard_certified', label: 'Lifeguard', Icon: Waves },
  { key: 'water_safety_certified', label: 'Water Safety', Icon: ShieldCheck },
  { key: 'childcare_training', label: 'Childcare Training', Icon: Baby },
];

export const SKILL_BADGES = [
  { key: 'infant_experience', label: 'Infant Experience', Icon: Baby },
  { key: 'toddler_experience', label: 'Toddler Experience', Icon: Baby },
  { key: 'multi_child_experience', label: 'Multiple Children', Icon: Sparkles },
  { key: 'light_housework', label: 'Light Housework', Icon: Sparkles },
  { key: 'meal_prep', label: 'Meal Prep', Icon: Utensils },
  { key: 'bedtime_routine', label: 'Bedtime Routine', Icon: Moon },
];

export const APPROVAL_STATUS_META = {
  pending: { label: 'Pending Review', color: 'text-amber-600 bg-amber-50', Icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-600 bg-emerald-50', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-muted-foreground bg-muted', Icon: AlertCircle },
  suspended: { label: 'Suspended', color: 'text-orange-600 bg-orange-50', Icon: AlertCircle },
  banned: { label: 'Banned', color: 'text-destructive bg-destructive/10', Icon: AlertCircle },
};

export const BACKGROUND_CHECK_META = {
  pending: { label: 'Background Check Pending', color: 'text-amber-600' },
  passed: { label: 'Background Check Passed', color: 'text-emerald-600' },
  failed: { label: 'Background Check Failed', color: 'text-destructive' },
  not_required: { label: 'Background Check Not Required', color: 'text-muted-foreground' },
};

export const BOOKING_STATUS_META = {
  pending: { label: 'Awaiting Sitter Response', color: 'text-amber-600 bg-amber-50' },
  accepted: { label: 'Confirmed', color: 'text-emerald-600 bg-emerald-50' },
  declined: { label: 'Declined', color: 'text-muted-foreground bg-muted' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground bg-muted' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', color: 'text-emerald-600 bg-emerald-50' },
  disputed: { label: 'Disputed', color: 'text-destructive bg-destructive/10' },
};

export const BOOKING_STATUS_FLOW = [
  'pending', 'accepted', 'in_progress', 'completed'
];

export const SAFETY_CHECKIN_TYPES = [
  { key: 'water_life_jacket', label: 'Life Jacket Confirmation', description: 'Photo of children wearing life jackets', Icon: ShieldCheck },
  { key: 'water_safety', label: 'Water Safety Check-In', description: 'Water safety notes and location', Icon: Waves },
  { key: 'golf_cart_start', label: 'Golf Cart — Trip Start', description: 'Photo of children buckled with seatbelts', Icon: Car },
  { key: 'golf_cart_end', label: 'Golf Cart — Trip End', description: 'End of trip check-in', Icon: Car },
  { key: 'location', label: 'Location Check-In', description: 'Current location and status', Icon: MapPin },
];

export const PARENT_SAFETY_CHECKBOXES = [
  { key: 'allow_beach_pool', label: 'I allow this sitter to supervise my child near the beach or pool.' },
  { key: 'allow_golf_cart', label: 'I allow this sitter to transport my child by golf cart.' },
  { key: 'require_water_photo_checkins', label: 'I require photo check-ins around water.' },
  { key: 'require_cart_photo_checkins', label: 'I require photo check-ins when children are buckled into a golf cart.' },
  { key: 'no_water_activities', label: 'I do not allow water activities.' },
  { key: 'no_golf_cart', label: 'I do not allow golf cart transportation.' },
];

export const MESSAGE_TYPE_META = {
  text: { label: 'Message', color: 'text-muted-foreground' },
  booking_question: { label: 'Booking Question', color: 'text-blue-600' },
  safety_instruction: { label: 'Safety Instruction', color: 'text-orange-600' },
  photo_update: { label: 'Photo Update', color: 'text-accent' },
  arrival_confirmation: { label: 'Arrival Confirmation', color: 'text-emerald-600' },
  completion_confirmation: { label: 'Completion Confirmation', color: 'text-emerald-600' },
};

export const CANCELLATION_POLICY = {
  free_window_hours: 24,
  late_fee_pct: 50,
  no_show_fee_pct: 100,
  text: 'Free cancellation up to 24 hours before the booking. Within 24 hours, a 50% cancellation fee applies. No-shows are charged the full amount.',
};

export const MARKETPLACE_DISCLAIMER = 'Bald Head Island Concierge Babysitting is a marketplace connecting families with independent childcare providers. Families are responsible for choosing, vetting, and supervising the childcare relationship. The app does not employ sitters and does not guarantee the quality of care provided.';

export const calculateBookingCost = (hourlyRate, startTime, endTime, tip = 0) => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let hours = (eh + em / 60) - (sh + sm / 60);
  if (hours < 0) hours += 24;
  const serviceTotal = hourlyRate * hours;
  const bookingFee = 5;
  const total = serviceTotal + bookingFee + (tip || 0);
  return {
    hours: Math.round(hours * 100) / 100,
    serviceTotal: Math.round(serviceTotal * 100) / 100,
    bookingFee,
    tip: tip || 0,
    total: Math.round(total * 100) / 100,
  };
};