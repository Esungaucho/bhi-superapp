import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { items, customer_info, reference_type, reference_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'items array is required' }, { status: 400 });
    }

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');
    if (!WIX_API_KEY || !WIX_SITE_ID) {
      return Response.json({ error: 'Payment credentials not configured' }, { status: 500 });
    }

    // Validate items and minimum charge
    const cartItems = items.map((item) => {
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      return {
        name: item.name.substring(0, 255),
        quantity: item.quantity || 1,
        price: price.toFixed(2),
      };
    });

    const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    if (total < 0.50) {
      return Response.json({ error: 'Minimum charge amount is $0.50' }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || req.headers.get('origin') || '';

    const payload = {
      cart: {
        items: cartItems,
        ...(customer_info ? { customerInfo: customer_info } : {}),
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

    return Response.json({
      checkout_session_id: data.checkoutSession.id,
      redirect_url: data.checkoutSession.redirectUrl,
      reference_type,
      reference_id,
    });
  } catch (error) {
    console.error('create-checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});