import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PRICE_PER_PERSON = 23;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { schedule_id, passengers, departure_time, direction } = await req.json();

    if (!schedule_id || !passengers || passengers < 1) {
      return Response.json({ error: 'Invalid booking parameters' }, { status: 400 });
    }

    const total = passengers * PRICE_PER_PERSON;
    const ref = 'BHI-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const booking = await base44.entities.FerryBooking.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      schedule_id,
      passengers,
      total_price: total,
      commission_amount: 2,
      status: 'confirmed',
      booking_ref: ref,
      departure_time,
      direction,
    });

    const schedule = await base44.asServiceRole.entities.FerrySchedule.get(schedule_id);
    if (schedule) {
      await base44.asServiceRole.entities.FerrySchedule.update(schedule_id, {
        current_passengers: (schedule.current_passengers || 0) + passengers,
      });
    }

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'ferry_commission',
      reference_id: booking.id,
      reference_type: 'FerryBooking',
      amount: 2,
      description: `Ferry booking — ${passengers} passenger(s)`,
      user_email: user.email,
    });

    return Response.json({ ...booking, booking_ref: ref });
  } catch (error) {
    console.error('book-ferry error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});