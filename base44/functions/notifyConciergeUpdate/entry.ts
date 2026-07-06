import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { request_id, stage, note, actor } = body;

    if (!request_id || !stage) {
      return Response.json({ error: 'request_id and stage are required' }, { status: 400 });
    }

    const request = await base44.asServiceRole.entities.ConciergeRequest.get(request_id);
    if (!request) return Response.json({ error: 'Request not found' }, { status: 404 });

    // Allow the request owner or an admin to trigger updates
    const isOwner = request.user_email === user.email;
    const isAdmin = user.role === 'admin';
    const isAssignedProvider = request.provider_id && request.provider_id === user.id;
    if (!isOwner && !isAdmin && !isAssignedProvider) {
      return Response.json({ error: 'Forbidden — you can only update your own requests' }, { status: 403 });
    }

    const stageMessages = {
      request_submitted: 'Your concierge request has been submitted.',
      concierge_assigned: `Your Island Concierge has accepted your request.`,
      in_progress: 'Your Island Concierge is shopping now.',
      heading_to_ferry: 'Your Island Concierge is heading to the ferry.',
      checked_in_at_ferry: 'Your items have been checked in at the ferry terminal.',
      loaded_on_ferry: 'Your items are loaded on the ferry.',
      arrived_on_island: 'Your items have arrived on Bald Head Island.',
      placed_on_tram: request.tram_number
        ? `Your Island Concierge placed your package on Tram #${request.tram_number}, Box #${request.box_number}.`
        : 'Your package has been placed on the tram.',
      completed: 'Your request has been completed. Thank you!',
    };

    const message = note || stageMessages[stage] || 'Your request has been updated.';

    await base44.asServiceRole.entities.BirdieTrackingEvent.create({
      request_id,
      stage,
      note: message,
      actor: actor || (isAdmin ? 'admin' : 'user'),
    });

    if (request.user_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: request.user_email,
          subject: 'Bald Head Island Concierge — Update',
          body: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2B2B2B;">
            <h1 style="font-size: 20px; color: #3F6D80;">Bald Head Island Concierge</h1>
            <p style="font-size: 14px;">${message}</p>
            <p style="font-size: 12px; color: #7B7B7B; margin-top: 16px;">Request #${request_id.slice(-8).toUpperCase()}</p>
          </div>`,
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr.message);
      }
    }

    return Response.json({ success: true, message, stage });
  } catch (error) {
    console.error('notifyConciergeUpdate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});