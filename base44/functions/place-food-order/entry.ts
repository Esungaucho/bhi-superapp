import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { addMinutes } from 'npm:date-fns@3.6.0';

const COMMISSION_RATES = { pickup: 0.12, delivery: 0.15, dine_in: 0.18 };

function generateRef() {
  return 'BHI-F-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      restaurant_id, restaurant_name, cart, fulfillment_type,
      delivery_address, special_instructions, delivery_fee, estimated_delivery_minutes,
    } = await req.json();

    if (!restaurant_id || !cart || cart.length === 0) {
      return Response.json({ error: 'Invalid order parameters' }, { status: 400 });
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee = fulfillment_type === 'delivery' ? (delivery_fee || 3) : 0;
    const total = subtotal + fee;
    const commissionRate = COMMISSION_RATES[fulfillment_type] || 0.15;
    const commission = Math.round(total * commissionRate * 100) / 100;
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const ref = generateRef();
    const estimatedReady = addMinutes(new Date(), estimated_delivery_minutes || 30);

    const order = await base44.entities.FoodOrder.create({
      restaurant_id,
      restaurant_name,
      user_email: user.email,
      user_name: user.full_name || user.email,
      fulfillment_type,
      items_count: cartCount,
      subtotal,
      delivery_fee: fee,
      commission_rate: commissionRate,
      commission_amount: commission,
      total_price: total,
      status: 'placed',
      order_ref: ref,
      delivery_address,
      special_instructions,
      estimated_ready_time: estimatedReady.toISOString(),
    });

    await Promise.all(cart.map(item =>
      base44.entities.OrderItem.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
      })
    ));

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'other',
      reference_id: order.id,
      reference_type: 'FoodOrder',
      amount: commission,
      description: `${restaurant_name} — ${fulfillment_type} order (${(commissionRate * 100).toFixed(0)}%)`,
      user_email: user.email,
    });

    return Response.json({ ...order, order_ref: ref, estimated_ready_time: estimatedReady });
  } catch (error) {
    console.error('place-food-order error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});