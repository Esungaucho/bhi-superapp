import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

export default function Notifications() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ferryBookings = [] } = useQuery({
    queryKey: ['notifFerry', user?.email],
    queryFn: () => base44.entities.FerryBooking.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: foodOrders = [] } = useQuery({
    queryKey: ['notifOrders', user?.email],
    queryFn: () => base44.entities.FoodOrder.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['promoDeals'],
    queryFn: () => base44.entities.PromoDeal.filter({ is_active: true }),
  });

  // Build notification items
  const now = new Date();
  const notifications = [
    // Upcoming ferry reminders
    ...ferryBookings
      .filter(b => b.status === 'confirmed' && new Date(b.departure_time) >= now)
      .slice(0, 3)
      .map(b => {
        const dep = new Date(b.departure_time);
        const hoursUntil = Math.round((dep - now) / 3600000);
        return {
          id: `ferry-${b.id}`,
          emoji: '⛴️',
          title: 'Upcoming Ferry',
          body: `${b.direction === 'to_island' ? 'To Island' : 'To Mainland'} on ${format(dep, 'MMM d')} at ${format(dep, 'h:mm a')} — ${hoursUntil < 24 ? `${hoursUntil}h away` : format(dep, 'EEE')}`,
          time: dep,
          type: 'booking',
        };
      }),
    // Active food order updates
    ...foodOrders
      .filter(o => o.status !== 'canceled' && o.status !== 'delivered')
      .slice(0, 3)
      .map(o => {
        const statusLabels = {
          placed: 'Order placed',
          confirmed: 'Order confirmed',
          preparing: 'Being prepared',
          ready: 'Ready for pickup',
          out_for_delivery: 'Out for delivery',
        };
        return {
          id: `order-${o.id}`,
          emoji: '🍽️',
          title: statusLabels[o.status] || 'Order update',
          body: `${o.restaurant_name} — ${o.items_count} item${o.items_count !== 1 ? 's' : ''} · $${o.total_price.toFixed(2)}`,
          time: o.created_date ? new Date(o.created_date) : new Date(),
          type: 'order',
        };
      }),
    // Active deals
    ...deals
      .filter(d => d.deal_type !== 'sponsored' && d.deal_type !== 'event')
      .slice(0, 4)
      .map(d => ({
        id: `deal-${d.id}`,
        emoji: d.deal_type === 'flash_sale' ? '⚡' : '🏷️',
        title: d.title,
        body: d.description || `From ${d.sponsor_name}`,
        time: d.created_date ? new Date(d.created_date) : new Date(),
        type: 'deal',
      })),
    // Weekly island events
    ...deals
      .filter(d => d.deal_type === 'event')
      .slice(0, 3)
      .map(d => ({
        id: `event-${d.id}`,
        emoji: '🎉',
        title: d.title,
        body: d.description || `Island event — ${d.sponsor_name}`,
        time: d.created_date ? new Date(d.created_date) : new Date(),
        type: 'event',
      })),
    // Static island tips
    {
      id: 'tip-1',
      emoji: '🌤️',
      title: 'Island Tip',
      body: 'Check weather & beach conditions before heading out!',
      time: new Date(),
      type: 'tip',
    },
  ].sort((a, b) => b.time - a.time);

  const TYPE_COLORS = {
    booking: 'bg-accent/10 text-accent',
    order: 'bg-orange-50 text-orange-600',
    deal: 'bg-emerald-50 text-emerald-600',
    event: 'bg-purple-50 text-purple-600',
    tip: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <p className="text-3xl mb-2">🔔</p>
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="bg-card border rounded-xl px-4 py-3 flex gap-3">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${TYPE_COLORS[n.type]}`}>
                {n.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}