import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const WEBHOOK_PUBLIC_KEY = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!WEBHOOK_PUBLIC_KEY) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return Response.json({ error: 'Webhook key not configured' }, { status: 500 });
    }

    const rawBody = await req.text();

    // Step 1: Verify JWT signature — fail closed if verification fails
    const rawPayload = jwt.verify(rawBody, WEBHOOK_PUBLIC_KEY, { algorithms: ['RS256'] });

    // Step 2: Parse double-nested JSON
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const paymentStatus = order.paymentStatus;

      console.log(`Order approved: checkoutId=${checkoutId}, status=${paymentStatus}`);

      // Update babysitter booking payment status if reference exists
      // The checkout session ID is stored on the booking to match
      if (paymentStatus === 'PAID') {
        try {
          const bookings = await base44.asServiceRole.entities.BabysitterBooking.filter({
            payment_id: checkoutId,
          });
          for (const booking of bookings) {
            await base44.asServiceRole.entities.BabysitterBooking.update(booking.id, {
              payment_status: 'paid',
              admin_notes: `Payment confirmed via Base44 Payments. Order: ${order.id}`,
            });
          }
        } catch (updateErr) {
          console.error('Booking update failed:', updateErr.message);
        }
      }
    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      console.log(`Subscription event: ${event.eventType}, id=${subscriptionContract.id}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});