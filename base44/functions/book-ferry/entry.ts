import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PRICE_PER_PERSON = 23;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { schedule_id, passengers } = await req.json();

    // Validate passengers: integer, 1-10
    const numPassengers = Math.floor(Number(passengers));
    if (!schedule_id || !Number.isInteger(numPassengers) || numPassengers < 1 || numPassengers > 10) {
      return Response.json({ error: 'Invalid booking parameters' }, { status: 400 });
    }

    // Fetch and verify schedule exists before booking
    const schedule = await base44.asServiceRole.entities.FerrySchedule.get(schedule_id);
    if (!schedule) {
      return Response.json({ error: 'Schedule not found' }, { status: 404 });
    }
    if (schedule.status === 'canceled') {
      return Response.json({ error: 'This ferry has been canceled' }, { status: 400 });
    }

    // Check capacity
    const currentPax = schedule.current_passengers || 0;
    const maxCapacity = schedule.capacity || 150;
    if (currentPax + numPassengers > maxCapacity) {
      return Response.json({ error: 'Not enough capacity on this ferry' }, { status: 400 });
    }

    const total = numPassengers * PRICE_PER_PERSON;
    const ref = 'BHI-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const booking = await base44.asServiceRole.entities.FerryBooking.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      schedule_id,
      passengers: numPassengers,
      total_price: total,
      commission_amount: 2,
      status: 'confirmed',
      booking_ref: ref,
      departure_time: schedule.departure_time,
      direction: schedule.direction,
    });

    // Update passenger count (re-fetch to minimize race window)
    const freshSchedule = await base44.asServiceRole.entities.FerrySchedule.get(schedule_id);
    if (freshSchedule) {
      await base44.asServiceRole.entities.FerrySchedule.update(schedule_id, {
        current_passengers: (freshSchedule.current_passengers || 0) + numPassengers,
      });
    }

    await base44.asServiceRole.entities.RevenueEntry.create({
      source: 'ferry_commission',
      reference_id: booking.id,
      reference_type: 'FerryBooking',
      amount: 2,
      description: `Ferry booking — ${numPassengers} passenger(s)`,
      user_email: user.email,
    });

    return Response.json({ ...booking, booking_ref: ref });
  } catch (error) {
    console.error('book-ferry error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});