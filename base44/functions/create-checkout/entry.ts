import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BOOKING_FEE = 5;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseTime = (value: string, label: string) => {
  const [h, m] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new HttpError(400, `Invalid ${label} on booking`);
  }
  return h + m / 60;
};

// Prices are computed exclusively from server-side data. Client-supplied
// prices/quantities are never read — the booking's own price fields are
// parent-writable under RLS, so pricing derives from the sitter's rate.
async function priceBabysitterBooking(base44, user, referenceId: string) {
  const booking = await base44.asServiceRole.entities.BabysitterBooking.get(referenceId);
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (booking.parent_email !== user.email) {
    throw new HttpError(403, 'Only the booking parent can pay for this booking');
  }
  if (booking.status !== 'accepted') {
    throw new HttpError(400, 'Booking must be accepted by the sitter before payment');
  }
  if (booking.payment_status !== 'unpaid') {
    throw new HttpError(400, `Booking payment status is '${booking.payment_status}'`);
  }

  const sitter = await base44.asServiceRole.entities.Babysitter.get(booking.sitter_id);
  const hourlyRate = Number(sitter?.hourly_rate);
  if (!sitter || !Number.isFinite(hourlyRate) || hourlyRate <= 0) {
    throw new HttpError(409, 'Sitter rate unavailable — contact support');
  }

  let hours = parseTime(booking.end_time, 'end_time') - parseTime(booking.start_time, 'start_time');
  if (hours < 0) hours += 24;
  if (hours <= 0) throw new HttpError(400, 'Booking has no billable hours');
  hours = round2(hours);

  const serviceTotal = round2(hourlyRate * hours);
  const tip = round2(Math.max(0, Number(booking.tip) || 0));

  const items = [
    {
      name: `Babysitting — ${booking.date} ${booking.start_time}–${booking.end_time}`.substring(0, 255),
      quantity: 1,
      price: serviceTotal.toFixed(2),
    },
    { name: 'Booking Fee', quantity: 1, price: BOOKING_FEE.toFixed(2) },
    ...(tip > 0 ? [{ name: 'Tip', quantity: 1, price: tip.toFixed(2) }] : []),
  ];

  return { items, entity: 'BabysitterBooking', record: booking };
}

const PRICERS = {
  babysitter_booking: priceBabysitterBooking,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { reference_type, reference_id } = body;

    const pricer = PRICERS[reference_type];
    if (!pricer) {
      return Response.json({ error: 'Unsupported or missing reference_type' }, { status: 400 });
    }
    if (!reference_id || typeof reference_id !== 'string') {
      return Response.json({ error: 'reference_id is required' }, { status: 400 });
    }

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');
    if (!WIX_API_KEY || !WIX_SITE_ID) {
      return Response.json({ error: 'Payment credentials not configured' }, { status: 500 });
    }

    const { items, entity, record } = await pricer(base44, user, reference_id);

    const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    if (total < 0.50) {
      return Response.json({ error: 'Minimum charge amount is $0.50' }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || req.headers.get('origin') || '';

    const payload = {
      cart: {
        items,
        customerInfo: { email: user.email },
      },
      callbackUrls: {
        postFlowUrl: `${origin}/dashboard`,
        thankYouPageUrl: `${origin}/thank-you`,
      },
    };

    const wixResponse = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await wixResponse.json();

    if (!wixResponse.ok) {
      console.error('Wix checkout error:', JSON.stringify(data));
      return Response.json({ error: data?.details?.applicationError?.description || data?.message || 'Checkout creation failed' }, { status: wixResponse.status });
    }

    // Store the session id server-side so the payment webhook can match the
    // booking without trusting a client-side write.
    await base44.asServiceRole.entities[entity].update(record.id, {
      payment_id: data.checkoutSession.id,
    });

    return Response.json({
      checkout_session_id: data.checkoutSession.id,
      redirect_url: data.checkoutSession.redirectUrl,
      reference_type,
      reference_id,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('create-checkout error:', error.message);
    return Response.json({ error: 'Checkout creation failed' }, { status: 500 });
  }
});