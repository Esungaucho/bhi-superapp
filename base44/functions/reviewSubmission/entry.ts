import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow automation calls (from entity automations) OR admin manual calls.
    // Automations pass no user context; manual calls require an authenticated admin.
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { /* automation trigger */ }

    const body = await req.json().catch(() => ({}));

    // If called manually (not from automation), require admin
    const isManualCall = body.submission_id && !body.event;
    if (isManualCall && (!user || user.role !== 'admin')) {
      return Response.json({ error: 'Forbidden — admin access required for manual review' }, { status: 403 });
    }

    // Automation payload: { event: { entity_id }, data: {...} }
    // Manual admin call: { submission_id: "..." }
    const submissionId = body.submission_id || body.event?.entity_id;
    let submission = body.data;

    if (!submission && submissionId) {
      submission = await base44.asServiceRole.entities.CommunitySubmission.get(submissionId);
    }

    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    const id = submission.id || submissionId;

    if (submission.status === 'approved' || submission.status === 'rejected') {
      return Response.json({ message: 'Already reviewed', status: submission.status, id });
    }

    const review = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a content moderator for the Bald Head Island community app. Evaluate this user-submitted content for helpfulness, positivity, and appropriateness.

Title: ${submission.title}
Category: ${submission.category}
Location: ${submission.location_name || 'Not specified'}
Content: ${submission.body}

Score 0-100 based on:
- Helpfulness: Does it provide genuinely useful, accurate island info?
- Positivity: Is it constructive, welcoming, and safe?
- Appropriateness: No spam, offensive content, or harmful info?

Recommend "approve" if score >= 70, "reject" if < 40, "manual_review" if 40-69.`,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number", description: "0-100" },
          recommendation: { type: "string", enum: ["approve", "reject", "manual_review"] },
          summary: { type: "string", description: "Brief review summary" }
        },
        required: ["score", "recommendation", "summary"]
      }
    });

    const newStatus = review.recommendation === 'approve' ? 'approved'
      : review.recommendation === 'reject' ? 'rejected'
      : 'pending';

    await base44.asServiceRole.entities.CommunitySubmission.update(id, {
      ai_score: review.score,
      ai_summary: review.summary,
      status: newStatus,
      reviewed_date: new Date().toISOString()
    });

    return Response.json({
      id,
      score: review.score,
      recommendation: review.recommendation,
      summary: review.summary,
      status: newStatus
    });
  } catch (error) {
    console.error('reviewSubmission error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});