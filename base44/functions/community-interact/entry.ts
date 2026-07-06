import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, post_id, comment_id, increment } = body;

    if (action === 'like_post' && post_id) {
      const post = await base44.asServiceRole.entities.CommunityPost.get(post_id);
      if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
      const newCount = Math.max(0, (post.likes_count || 0) + (increment || 1));
      await base44.asServiceRole.entities.CommunityPost.update(post_id, { likes_count: newCount });
      return Response.json({ likes_count: newCount });
    }

    if (action === 'comment_count' && post_id) {
      const post = await base44.asServiceRole.entities.CommunityPost.get(post_id);
      if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
      const newCount = Math.max(0, (post.comments_count || 0) + (increment || 1));
      await base44.asServiceRole.entities.CommunityPost.update(post_id, { comments_count: newCount });
      return Response.json({ comments_count: newCount });
    }

    if (action === 'report_post' && post_id) {
      const post = await base44.asServiceRole.entities.CommunityPost.get(post_id);
      if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
      const newCount = (post.report_count || 0) + 1;
      const updates = { report_count: newCount };
      if (newCount >= 3) updates.is_hidden = true;
      await base44.asServiceRole.entities.CommunityPost.update(post_id, updates);
      return Response.json({ report_count: newCount, is_hidden: newCount >= 3 });
    }

    if (action === 'report_comment' && comment_id) {
      const comment = await base44.asServiceRole.entities.CommunityComment.get(comment_id);
      if (!comment) return Response.json({ error: 'Comment not found' }, { status: 404 });
      const newCount = (comment.report_count || 0) + 1;
      await base44.asServiceRole.entities.CommunityComment.update(comment_id, { report_count: newCount });
      return Response.json({ report_count: newCount });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('community-interact error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});