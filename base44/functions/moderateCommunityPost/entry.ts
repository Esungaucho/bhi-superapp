import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { body, tags } = await req.json();

    if (!body || !body.trim()) {
      return Response.json({ approved: false, reason: 'Post cannot be empty.' });
    }

    const fullContent = body.trim() + (tags && tags.length ? ' (Tags: ' + tags.join(', ') + ')' : '');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a moderation assistant for the Bald Head Island community feed — a positive, helpful, family-friendly community of island locals and visitors of all ages.

Review the following post for ANY of these issues:
- Profanity or crude/inappropriate language
- Bullying, harassment, or intimidation
- Threats of any kind
- Personal attacks, name-calling, or insults
- Gossip or rumors about specific people
- Political content or partisan statements
- Biting, sarcastic, or unnecessarily negative language
- Anything that sounds rude, aggressive, or toxic

The community values kindness, helpfulness, and positivity. If the post is clean, helpful, and positive, approve it. If it contains ANY problematic elements, flag it with a brief specific reason.

Post content: "${fullContent}"

Respond with JSON indicating whether the post is approved and, if not, a brief specific reason.`,
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