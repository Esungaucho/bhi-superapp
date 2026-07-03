import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { nest_id, approximate_location, custom_message } = await req.json();

    // Only admins or turtle conservancy volunteers can send alerts
    if (user.role !== 'admin') {
      return Response.json({ error: 'Only conservancy admins can send hatching alerts.' }, { status: 403 });
    }

    const message = custom_message || `A turtle nest may hatch tonight. Please respect all turtle safety guidelines and join the community in helping the hatchlings safely reach the ocean.`;

    // Create a pinned community post with the alert
    const post = await base44.asServiceRole.entities.CommunityPost.create({
      author_name: 'Sea Turtle Conservancy',
      author_email: user.email,
      body: `Turtle Nest Alert: Nest ${nest_id || ''} near ${approximate_location || 'the island'} — ${message}`,
      category: 'urgent_update',
      tags: ['turtle', 'hatching', 'wildlife', 'conservation'],
      is_pinned: true,
    });

    // Send email to users who opted into notifications
    const subscribers = await base44.asServiceRole.entities.UserPreference.filter({
      comm_email: true,
      interests: { $in: ['wildlife_sighting', 'turtle_nest_alert'] }
    });

    let emailsSent = 0;
    for (const sub of subscribers) {
      if (sub.user_email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: sub.user_email,
            subject: 'Sea Turtle Nest Hatching Alert',
            body: `Hello ${sub.user_name || 'Island Friend'},\n\n${message}\n\nNest: ${nest_id || 'Unknown'}\nLocation: ${approximate_location || 'Bald Head Island beaches'}\n\nPlease remember:\n- Stay quiet\n- Keep lights off\n- Do not touch hatchlings\n- Do not crowd the nest\n- Follow volunteer instructions\n\nThank you for protecting our sea turtles!\n\nBald Head Island Community`,
          });
          emailsSent++;
        } catch (e) {
          console.error('Failed to send email to', sub.user_email, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      post_id: post.id,
      emails_sent: emailsSent,
      message: 'Hatching alert sent and community post created.'
    });
  } catch (error) {
    console.error('Turtle alert error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});