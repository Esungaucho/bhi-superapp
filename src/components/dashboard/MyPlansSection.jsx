import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  Ship, UtensilsCrossed, CalendarDays, ShoppingBag, ClipboardList,
  Plus, ChevronRight, Clock, MapPin,
} from 'lucide-react';

const CATEGORY_ICONS = {
  ferry: Ship,
  dining: UtensilsCrossed,
  event: CalendarDays,
  shopping: ShoppingBag,
  babysitting: ClipboardList,
  other: ClipboardList,
};

export default function MyPlansSection() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  const { data: planItems = [], isLoading } = useQuery({
    queryKey: ['todayPlanItems', user?.email, todayKey],
    queryFn: () => base44.entities.PlanItem.filter({ user_email: user.email, date: todayKey }),
    enabled: !!user?.email,
  });

  const sortedItems = [...planItems].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <section className="px-5 mt-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading text-lg text-foreground">My Plans</h2>
        <Link to="/my-plans" className="text-[11px] font-medium text-accent tracking-luxe-xs uppercase hover:underline">
          View All
        </Link>
      </div>
      {isLoading ? (
        <div className="h-20 bg-card rounded-2xl border border-border/30 animate-pulse" />
      ) : sortedItems.length === 0 ? (
        <div className="bg-card border border-border/40 rounded-2xl p-5 text-center shadow-luxe-sm">
          <ClipboardList className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">You don't have anything planned today</p>
          <Link to="/birdie/new" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent mt-3 hover:underline">
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            Create Day Plan
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border/40 rounded-2xl divide-y divide-border/30 shadow-luxe-sm">
          {sortedItems.map(item => {
            const Icon = CATEGORY_ICONS[item.category] || ClipboardList;
            return (
              <div key={item.id} className="flex items-center gap-3.5 p-3.5 first:rounded-t-2xl last:rounded-b-2xl">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/8 text-accent flex-shrink-0">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.time && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {item.time}
                      </span>
                    )}
                    {item.location && (
                      <span className="text-[11px] text-muted-foreground truncate flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}