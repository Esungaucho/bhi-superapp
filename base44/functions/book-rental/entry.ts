import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { differenceInDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { rental_item_id, start_date, end_date } = await req.json();

    if (!rental_item_id || !start_date || !end_date) {
      return Response.json({ error: 'Invalid rental parameters' }, { status: 400 });
    }

    // Fetch item to get trusted pricing
    const item = await base44.asServiceRole.entities.RentalItem.get(rental_item_id);
    if (!item) {
      return Response.json({ error: 'Rental item not found' }, { status: 404 });
    }
    if (!item.is_available || (item.available_units || 0) <= 0) {
      return Response.json({ error: 'No units available' }, { status: 400 });
    }

    // Compute days server-side
    const days = differenceInDays(new Date(end_date), new Date(start_date));
    if (days < 1) {
      return Response.json({ error: 'Rental period must be at least 1 day' }, { status: 400 });
    }
    if (item.min_days && days < item.min_days) {
      return Response.json({ error: `Minimum rental period is ${item.min_days} day(s)` }, { status: 400 });
    }
    if (item.max_days && days > item.max_days) {
      return Response.json({ error: `Maximum rental period is ${item.max_days} day(s)` }, { status: 400 });
    }

    // Compute pricing server-side from trusted fields
    const pricingTier = days >= 7 && item.price_per_week ? 'weekly' : 'daily';
    let rateApplied;
    if (pricingTier === 'weekly') {
      const weeks = Math.floor(days / 7);
      const extraDays = days % 7;
      rateApplied = weeks * item.price_per_week + extraDays * item.price_per_day;
    } else {
      rateApplied = days * item.price_per_day;
    }

    const commissionRate = item.commission_rate || 0.15;
    const commission = Math.round(rateApplied * commissionRate * 100) / 100;

    const ref = 'BHI-R-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const booking = await base44.asServiceRole.entities.RentalBooking.create({
      rental_item_id,
      user_email: user.email,
      user_name: user.full_name || user.email,
      start_date,
      end_date,
      days,
      pricing_tier: pricingTier,
      rate_applied: rateApplied,
      subtotal: rateApplied,
      commission_amount: commission,
      total_price: rateApplied,
      status: 'confirmed',
      booking_ref: ref,
      item_category: item.category,
      item_name: item.name,
    });

    // Decrement available units
    await base44.asServiceRole.entities.RentalItem.update(rental_item_id, {
      available_units: Math.max(0, (item.available_units || 1) - 1),
    });

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'rental_commission',
      reference_id: booking.id,
      reference_type: 'RentalBooking',
      amount: commission,
      description: `${item.name} rental — ${days} day(s)`,
      user_email: user.email,
    });

    return Response.json({ ...booking, booking_ref: ref });
  } catch (error) {
    console.error('book-rental error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});