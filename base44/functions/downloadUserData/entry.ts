import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const email = user.email;

    const [preferences, ferryBookings, lodgingBookings, rentalBookings, foodOrders, savedEvents, savedCaptains, communityPosts, submissions] = await Promise.all([
      base44.asServiceRole.entities.UserPreference.filter({ user_email: email }).then(r => r[0] || null),
      base44.asServiceRole.entities.FerryBooking.filter({ user_email: email }),
      base44.asServiceRole.entities.LodgingBooking.filter({ user_email: email }),
      base44.asServiceRole.entities.RentalBooking.filter({ user_email: email }),
      base44.asServiceRole.entities.FoodOrder.filter({ user_email: email }),
      base44.asServiceRole.entities.SavedEvent.filter({ user_email: email }),
      base44.asServiceRole.entities.SavedCaptain.filter({ user_email: email }),
      base44.asServiceRole.entities.CommunityPost.filter({ author_email: email }),
      base44.asServiceRole.entities.CommunitySubmission.filter({ author_email: email }),
    ]);

    const accountData = {
      exported_at: new Date().toISOString(),
      profile: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        tier: user.tier,
        phone: user.phone,
        role: user.role,
      },
      preferences,
      ferry_bookings: ferryBookings,
      lodging_bookings: lodgingBookings,
      rental_bookings: rentalBookings,
      food_orders: foodOrders,
      saved_events: savedEvents,
      saved_captains: savedCaptains,
      community_posts: communityPosts,
      community_submissions: submissions,
    };

    return Response.json(accountData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});