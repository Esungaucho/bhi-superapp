import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const STATUS_COLORS = {
  placed:            'text-blue-600 bg-blue-50',
  confirmed:         'text-violet-600 bg-violet-50',
  preparing:         'text-amber-600 bg-amber-50',
  ready:             'text-emerald-600 bg-emerald-50',
  out_for_delivery:  'text-sky-600 bg-sky-50',
  delivered:         'text-muted-foreground bg-muted',
  canceled:          'text-red-600 bg-red-50',
};

const STATUS_EMOJI = {
  placed: '📋', confirmed: '✅', preparing: '👨‍🍳', ready: '🍱',
  out_for_delivery: '🛵', delivered: '🎉', canceled: '❌',
};

const FULFILLMENT_EMOJI = { pickup: '🥡', delivery: '🛵', dine_in: '🪑' };

export default function MyOrders() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['myFoodOrders', user?.email],
    queryFn: () => base44.entities.FoodOrder.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const cancelMutation = useMutation({
    mutationFn: (order) => base44.entities.FoodOrder.update(order.id, { status: 'canceled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myFoodOrders'] }),
  });

  const active = orders.filter(o => !['delivered', 'canceled'].includes(o.status));
  const past = orders.filter(o => ['delivered', 'canceled'].includes(o.status));

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div>
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-bold">My Orders</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your food order history</p>
      </div>

      <div className="px-4 pb-6 space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="font-medium">No orders yet</p>
            <Link to="/food" className="text-accent font-semibold text-sm mt-3 inline-block hover:underline">Browse Restaurants →</Link>
          </div>
        )}

        {active.length > 0 && (
          <Section title="Active">
            {active.map(o => <OrderCard key={o.id} order={o}
              onCancel={() => cancelMutation.mutate(o)}
              canceling={cancelMutation.isPending} />)}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Past">
            {past.map(o => <OrderCard key={o.id} order={o} isPast />)}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OrderCard({ order, onCancel, canceling, isPast }) {
  return (
    <div className="bg-card rounded-xl border p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {FULFILLMENT_EMOJI[order.fulfillment_type]} {order.restaurant_name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order.items_count} item{order.items_count > 1 ? 's' : ''} · ${order.total_price?.toFixed(2)} · {order.fulfillment_type?.replace('_', '-')}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{order.order_ref}</p>
          {order.estimated_ready_time && !isPast && (
            <p className="text-xs font-medium text-accent mt-1">
              {order.fulfillment_type === 'delivery' ? '🛵 Est. delivery' : '⏱️ Ready by'}{' '}
              {format(new Date(order.estimated_ready_time), 'h:mm a')}
            </p>
          )}
          {order.created_date && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {format(new Date(order.created_date), 'MMM d, h:mm a')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${STATUS_COLORS[order.status]}`}>
            {STATUS_EMOJI[order.status]} {order.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {!isPast && order.status === 'placed' && (
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={canceling}
          className="text-xs text-red-600 hover:bg-red-50 h-auto px-2 py-1">
          Cancel Order
        </Button>
      )}

      {!isPast && (
        <div className="flex gap-1 overflow-x-auto">
          {['placed','confirmed','preparing','ready','out_for_delivery','delivered'].map((s, i, arr) => {
            const statuses = arr.slice(0, arr.indexOf(order.status) + 1);
            const active = statuses.includes(s);
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${active ? 'bg-accent' : 'bg-border'}`} />
                {i < arr.length - 1 && <div className={`w-4 h-0.5 ${active ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}