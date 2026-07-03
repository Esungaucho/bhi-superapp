import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { body, tags, content_type } = await req.json();

    if (!body || !body.trim()) {
      return Response.json({ approved: false, reason: 'Content cannot be empty.' });
    }

    // Check if user is banned or restricted
    const userStatuses = await base44.asServiceRole.entities.CommunityUserStatus.filter({ user_email: user.email });
    const userStatus = userStatuses[0];

    if (userStatus) {
      if (userStatus.status === 'banned') {
        return Response.json({ approved: false, reason: 'Your posting privileges have been permanently revoked. Please contact the island administrator if you believe this is an error.' });
      }
      if (userStatus.status === 'restricted') {
        const expires = userStatus.restriction_expires ? new Date(userStatus.restriction_expires) : null;
        if (!expires || expires > new Date()) {
          return Response.json({ approved: false, reason: `Your posting is temporarily restricted${expires ? ' until ' + expires.toLocaleDateString() : ''}. Please try again later.` });
        }
      }
    }

    const fullContent = body.trim() + (tags && tags.length ? ' (Tags: ' + tags.join(', ') + ')' : '');

    const typeContext = content_type === 'comment'
      ? 'This is a COMMENT on a community post. Apply the same standards but allow for shorter, conversational replies.'
      : 'This is a new POST to the community feed.';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a moderation assistant for the Bald Head Island community feed — a positive, helpful, family-friendly community of island locals and visitors of all ages.

${typeContext}

Review the following content for ANY of these issues:
- Profanity or crude/inappropriate language
- Bullying, harassment, or intimidation
- Threats of any kind
- Personal attacks, name-calling, or insults
- Gossip or rumors about specific people
- Hate speech or discriminatory language
- Spam, scams, or suspicious promotional content
- Political content or partisan statements
- Biting, sarcastic, or unnecessarily negative language
- Anything that sounds rude, aggressive, toxic, or unsafe

The community values kindness, helpfulness, and positivity. If the content is clean, helpful, and positive, approve it. If it contains ANY problematic elements, flag it with a brief specific reason.

Content to review: "${fullContent}"

Respond with JSON indicating whether the content is approved and, if not, a brief specific reason.`,
      response_json_schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          reason: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});