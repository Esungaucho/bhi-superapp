import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Entity automation payload: { event: { type, entity_name, entity_id }, data: {...} }
    const eventData = body.data;
    if (!eventData) {
      return Response.json({ error: 'No event data in payload' }, { status: 400 });
    }

    // Only alert on synced events (from official sources)
    if (eventData.status !== 'synced') {
      return Response.json({ skipped: true, reason: 'Event is not from a sync source' });
    }

    // Get app base URL for deep links
    const baseUrl = req.headers.get('origin') || req.headers.get('Origin') || 'https://app.base44.com';

    // Format event details
    const startDate = new Date(eventData.start_time);
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = eventData.all_day
      ? 'All Day'
      : startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const endDate = eventData.end_time ? new Date(eventData.end_time) : null;
    const endStr = endDate && !eventData.all_day
      ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '';

    const description = eventData.short_description || eventData.description || '';
    const organization = eventData.organization || eventData.source_name || '';
    const location = eventData.location_name || '';
    const priceNote = eventData.price_note || '';

    // Find users who want immediate email notifications and are interested in events
    const preferences = await base44.asServiceRole.entities.UserPreference.filter({
      comm_email: true,
      notification_frequency: 'immediate',
    });

    // Filter to users interested in events
    const eventInterested = preferences.filter(p =>
      p.activity_interests?.includes('events') ||
      p.interests?.some(i => i.includes('event') || i.includes('calendar') || i.includes('community_meetings'))
    );

    if (eventInterested.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No users subscribed to immediate event alerts' });
    }

    const emailBody = `Hi there,

A new event was just added to the Bald Head Island calendar from ${organization}:

${eventData.title}
${dateStr}${eventData.all_day ? '' : ' at ' + timeStr}${endStr ? ' – ' + endStr : ''}
${location ? 'Location: ' + location : ''}
${priceNote ? 'Price: ' + priceNote : ''}

${description}

View full details and save this event:
${baseUrl}/calendar/event/${eventData.id}

You're receiving this because you opted into immediate event alerts. To change your notification preferences, visit ${baseUrl}/communication.

— The BHI SuperApp Team`;

    const subject = `New Island Event: ${eventData.title}`;

    let sent = 0;
    let failed = 0;
    for (const pref of eventInterested) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: pref.user_email,
          subject,
          body: emailBody,
          from_name: 'BHI SuperApp',
        });
        sent++;
      } catch (emailErr) {
        console.error(`Failed to send event alert to ${pref.user_email}:`, emailErr.message);
        failed++;
      }
    }

    return Response.json({
      success: true,
      event_title: eventData.title,
      sent,
      failed,
      total_subscribers: eventInterested.length,
    });
  } catch (error) {
    console.error('notify-new-event error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});