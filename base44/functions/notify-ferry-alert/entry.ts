import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const eventData = body.data;
    if (!eventData) {
      return Response.json({ error: 'No event data in payload' }, { status: 400 });
    }

    const baseUrl = req.headers.get('origin') || req.headers.get('Origin') || 'https://app.base44.com';

    const statusLabel = (eventData.status || '').replace(/_/g, ' ');
    const severity = eventData.severity || 'normal';

    // Find users who want push/email notifications
    const preferences = await base44.asServiceRole.entities.UserPreference.filter({
      comm_email: true,
      notification_frequency: { $in: ['immediate', 'daily_summary'] },
    });

    if (preferences.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No users subscribed to ferry alerts' });
    }

    const subject = `Ferry Alert: ${statusLabel}`;
    const emailBody = `Hi there,

An important ferry status update has been posted:

${statusLabel.toUpperCase()}${severity !== 'normal' ? ` — ${severity.toUpperCase()}` : ''}

${eventData.message || 'See the official ferry website for details.'}

View live ferry status:
${baseUrl}/ferry/status

Official source: ${eventData.source_url || 'https://www.baldheadislandferry.com/status/'}

You're receiving this because you opted into ferry alerts. To change your notification preferences, visit ${baseUrl}/communication.

— The BHI SuperApp Team`;

    let sent = 0;
    let failed = 0;
    for (const pref of preferences) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: pref.user_email,
          subject,
          body: emailBody,
          from_name: 'BHI SuperApp',
        });
        sent++;
      } catch (emailErr) {
        console.error(`Failed to send ferry alert to ${pref.user_email}:`, emailErr.message);
        failed++;
      }
    }

    return Response.json({
      success: true,
      status: eventData.status,
      sent,
      failed,
      total_subscribers: preferences.length,
    });
  } catch (error) {
    console.error('notify-ferry-alert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});