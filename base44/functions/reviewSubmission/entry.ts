import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Works for both automation calls (no user) and manual admin calls
    let user = null;
    try { user = await base44.auth.me(); } catch (e) { /* automation trigger */ }

    const body = await req.json().catch(() => ({}));

    // Automation payload: { event: { entity_id }, data: {...} }
    // Manual call: { submission_id: "..." }
    const submissionId = body.submission_id || body.event?.entity_id;
    let submission = body.data;

    if (!submission && submissionId) {
      submission = await base44.asServiceRole.entities.CommunitySubmission.get(submissionId);
    }

    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    const id = submission.id || submissionId;

    // Skip if already reviewed
    if (submission.status === 'approved' || submission.status === 'rejected') {
      return Response.json({ message: 'Already reviewed', status: submission.status, id });
    }

    // AI review via InvokeLLM
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});