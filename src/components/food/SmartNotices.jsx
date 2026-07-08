import React from 'react';
import { SMART_NOTICES } from '@/lib/diningConstants';
import { Info, Crown, CalendarClock, CreditCard, Dog, Users, Shirt, Utensils } from 'lucide-react';

const NOTICE_ICONS = {
  reservations: CalendarClock,
  members_only: Crown,
  seasonal: CalendarClock,
  cashless: CreditCard,
  pet_patio: Dog,
  private_events: Users,
  dress_code: Shirt,
  catering: Utensils,
};

export default function SmartNotices({ restaurant }) {
  const activeNotices = SMART_NOTICES.filter(n => {
    try { return n.condition(restaurant); } catch { return false; }
  });

  if (activeNotices.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeNotices.map(n => {
        const Icon = NOTICE_ICONS[n.id] || Info;
        const label = typeof n.label === 'function' ? n.label(restaurant) : n.label;
        return (
          <span key={n.id} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            <Icon className="w-3 h-3" strokeWidth={1.5} />
            {label}
          </span>
        );
      })}
    </div>
  );
}