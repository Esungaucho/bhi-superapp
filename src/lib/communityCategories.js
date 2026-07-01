import {
  AlertTriangle, Search, CloudSun, Ship, Bug,
  Waves, Feather, Star, CalendarDays, HandHeart, MessageCircle, FileText,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'urgent_update', label: 'Urgent', Icon: AlertTriangle, desc: 'Time-sensitive alerts' },
  { id: 'lost_found', label: 'Lost & Found', Icon: Search, desc: 'Lost or found items' },
  { id: 'weather_alert', label: 'Weather', Icon: CloudSun, desc: 'Weather updates & alerts' },
  { id: 'ferry_update', label: 'Ferry', Icon: Ship, desc: 'Ferry schedule & updates' },
  { id: 'bug_report', label: 'Bugs & Mosquitoes', Icon: Bug, desc: 'Bug/fly/mosquito activity' },
  { id: 'beach_conditions', label: 'Beach', Icon: Waves, desc: 'Current beach conditions' },
  { id: 'wildlife_sighting', label: 'Wildlife', Icon: Feather, desc: 'Animal & nature sightings' },
  { id: 'recommendations', label: 'Recommendations', Icon: Star, desc: 'Things to do & see' },
  { id: 'events', label: 'Events', Icon: CalendarDays, desc: 'Island events & gatherings' },
  { id: 'help_needed', label: 'Help Needed', Icon: HandHeart, desc: 'Request assistance' },
  { id: 'general_chat', label: 'Community', Icon: MessageCircle, desc: 'General island chatter' },
];

export const getCategory = (id) => CATEGORIES.find(c => c.id === id) || { label: id, Icon: FileText, desc: '' };