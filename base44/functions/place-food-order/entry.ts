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
      restaurant_id, cart, fulfillment_type,
      delivery_address, special_instructions,
    } = await req.json();

    if (!restaurant_id || !cart || !Array.isArray(cart) || cart.length === 0) {
      return Response.json({ error: 'Invalid order parameters' }, { status: 400 });
    }
    if (!COMMISSION_RATES[fulfillment_type]) {
      return Response.json({ error: 'Invalid fulfillment type' }, { status: 400 });
    }

    // Fetch restaurant for trusted name and delivery fee
    const restaurant = await base44.asServiceRole.entities.Restaurant.get(restaurant_id);
    if (!restaurant) {
      return Response.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Fetch menu items to get trusted prices
    const menuItems = await base44.asServiceRole.entities.MenuItem.filter({ restaurant_id });
    const menuItemMap = new Map(menuItems.map(m => [m.id, m]));

    // Validate cart and compute prices server-side
    let subtotal = 0;
    let cartCount = 0;
    const validatedItems = [];

    for (const line of cart) {
      const menuItem = menuItemMap.get(line.menu_item_id);
      if (!menuItem) {
        return Response.json({ error: `Menu item not found` }, { status: 400 });
      }
      if (menuItem.is_available === false) {
        return Response.json({ error: `${menuItem.name} is no longer available` }, { status: 400 });
      }

      const quantity = Math.floor(Number(line.quantity));
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return Response.json({ error: `Invalid quantity for ${menuItem.name}` }, { status: 400 });
      }

      const lineTotal = Math.round(menuItem.price * quantity * 100) / 100;
      subtotal += lineTotal;
      cartCount += quantity;

      validatedItems.push({
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        line_total: lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const fee = fulfillment_type === 'delivery' ? (restaurant.delivery_fee || 3) : 0;
    const total = Math.round((subtotal + fee) * 100) / 100;
    const commissionRate = COMMISSION_RATES[fulfillment_type];
    const commission = Math.round(total * commissionRate * 100) / 100;
    const ref = generateRef();
    const estimatedReady = addMinutes(new Date(), restaurant.estimated_delivery_minutes || 30);

    const order = await base44.asServiceRole.entities.FoodOrder.create({
      restaurant_id,
      restaurant_name: restaurant.name,
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

    await Promise.all(validatedItems.map(item =>
      base44.asServiceRole.entities.OrderItem.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        line_total: item.line_total,
      })
    ));

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'other',
      reference_id: order.id,
      reference_type: 'FoodOrder',
      amount: commission,
      description: `${restaurant.name} — ${fulfillment_type} order (${(commissionRate * 100).toFixed(0)}%)`,
      user_email: user.email,
    });

    return Response.json({ ...order, order_ref: ref, estimated_ready_time: estimatedReady });
  } catch (error) {
    console.error('place-food-order error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});