import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      rental_item_id, start_date, end_date, days, pricing_tier, rate_applied,
      commission_amount, item_category, item_name,
    } = await req.json();

    if (!rental_item_id || !start_date || !end_date || days < 1) {
      return Response.json({ error: 'Invalid rental parameters' }, { status: 400 });
    }

    const ref = 'BHI-R-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const booking = await base44.entities.RentalBooking.create({
      rental_item_id,
      user_email: user.email,
      user_name: user.full_name || user.email,
      start_date,
      end_date,
      days,
      pricing_tier,
      rate_applied,
      subtotal: rate_applied,
      commission_amount,
      total_price: rate_applied,
      status: 'confirmed',
      booking_ref: ref,
      item_category,
      item_name,
    });

    const item = await base44.asServiceRole.entities.RentalItem.get(rental_item_id);
    if (item) {
      await base44.asServiceRole.entities.RentalItem.update(rental_item_id, {
        available_units: Math.max(0, (item.available_units || 1) - 1),
      });
    }

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'rental_commission',
      reference_id: booking.id,
      reference_type: 'RentalBooking',
      amount: commission_amount,
      description: `${item_name} rental — ${days} day(s)`,
      user_email: user.email,
    });

    return Response.json({ ...booking, booking_ref: ref });
  } catch (error) {
    console.error('book-rental error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});