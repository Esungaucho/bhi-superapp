export const OCEARCH_URL = 'https://www.ocearch.org/tracker/';
export const PROMINENT_EXPIRY_HOURS = 72;

export const BHI_CENTER = [33.85, -77.98];

export const STATUS_META = {
  unconfirmed: { label: 'Unconfirmed', badge: 'text-amber-700 bg-amber-50 border-amber-200', dot: '#D97706' },
  community_report: { label: 'Community Report', badge: 'text-sky-700 bg-sky-50 border-sky-200', dot: '#0284C7' },
  verified_staff: { label: 'Verified by Staff', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: '#059669' },
  tagged_detection: { label: 'Tagged Shark Detection', badge: 'text-purple-700 bg-purple-50 border-purple-200', dot: '#7C3AED' },
};

export const OBSERVER_TYPES = [
  { value: 'beachgoer', label: 'Beachgoer' },
  { value: 'boater', label: 'Boater' },
  { value: 'fisherman', label: 'Fisherman' },
  { value: 'lifeguard', label: 'Lifeguard' },
  { value: 'resident', label: 'Resident' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'other', label: 'Other' },
];

export function isSightingActive(sighting) {
  if (!sighting?.sighting_date) return false;
  const hoursAgo = (Date.now() - new Date(sighting.sighting_date).getTime()) / 3600000;
  return hoursAgo <= PROMINENT_EXPIRY_HOURS;
}