import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { charter_id, captain_name } = body;

    if (!charter_id) return Response.json({ error: 'charter_id required' }, { status: 400 });

    // Find users who saved this captain with notifications on
    const saved = await base44.asServiceRole.entities.SavedCaptain.filter({
      charter_id,
      notify_new_dates: true
    });

    if (saved.length === 0) {
      return Response.json({ notified: 0, message: 'No subscribers to notify' });
    }

    let notified = 0;
    for (const sub of saved) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.user_email,
          subject: `${captain_name || 'Your favorite captain'} posted new availability`,
          body: `Great news! ${captain_name || 'Your saved captain'} just posted new trip availability on Bald Head Island.\n\nOpen the BHI SuperApp to view dates and rebook quickly.\n\n— The BHI SuperApp Team`
        });
        notified++;
      } catch (e) {
        // continue to next subscriber
      }
    }

    return Response.json({ notified, total: saved.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});