import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Send, Reply, Flag, Heart } from 'lucide-react';
import ReportModal from './ReportModal';

export default function CommentSection({ postId, postAuthorEmail, blockedEmails = [] }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [moderationMsg, setModerationMsg] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => base44.entities.CommunityComment.filter({ post_id: postId }, '-created_date', 100),
  });

  // Build threaded structure: top-level comments + their replies
  const topLevel = comments.filter(c => !c.parent_comment_id && !c.is_hidden && !blockedEmails.includes(c.author_email));
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId && !c.is_hidden && !blockedEmails.includes(c.author_email));

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setPosting(true);
    setModerationMsg(null);
    try {
      // AI moderation
      const response = await base44.functions.invoke('moderateCommunityPost', {
        body: commentText.trim(),
        content_type: 'comment',
      });
      const result = response.data;

      if (!result.approved) {
        setModerationMsg(result.reason || 'Your comment may not align with our community guidelines.');
        return;
      }

      await base44.entities.CommunityComment.create({
        post_id: postId,
        author_name: user.full_name || 'Anonymous',
        author_email: user.email,
        body: commentText.trim(),
        moderation_status: 'approved',
      });
      const post = await base44.entities.CommunityPost.get(postId);
      await base44.entities.CommunityPost.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentComment) => {
    if (!replyText.trim() || !user) return;
    setPosting(true);
    setModerationMsg(null);
    try {
      const response = await base44.functions.invoke('moderateCommunityPost', {
        body: replyText.trim(),
        content_type: 'comment',
      });
      const result = response.data;

      if (!result.approved) {
        setModerationMsg(result.reason || 'Your reply may not align with our community guidelines.');
        return;
      }

      await base44.entities.CommunityComment.create({
        post_id: postId,
        author_name: user.full_name || 'Anonymous',
        author_email: user.email,
        body: replyText.trim(),
        parent_comment_id: parentComment.id,
        moderation_status: 'approved',
      });
      const post = await base44.entities.CommunityPost.get(postId);
      await base44.entities.CommunityPost.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      setReplyText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } finally {
      setPosting(false);
    }
  };

  const handleReportComment = async ({ reason, reason_details }) => {
    if (!reportTarget) return;
    await base44.entities.CommunityReport.create({
      reported_user_name: reportTarget.author_name,
      reported_user_email: reportTarget.author_email,
      reporting_user_name: user?.full_name || 'Anonymous',
      reporting_user_email: user?.email,
      content_type: 'comment',
      content_id: reportTarget.id,
      content_snapshot: reportTarget.body,
      reason,
      reason_details,
    });
    await base44.entities.CommunityComment.update(reportTarget.id, {
      report_count: (reportTarget.report_count || 0) + 1,
    });
    queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
  };

  const renderComment = (c, isReply = false) => (
    <div key={c.id} className={`flex gap-2 ${isReply ? 'ml-9' : ''}`}>
      <div className={`rounded-full bg-gradient-to-br from-driftwood to-navy flex items-center justify-center text-white font-semibold flex-shrink-0 ${isReply ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 text-[10px]'}`}>
        {c.author_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-xl px-3 py-2 border border-border/50">
          <p className="text-xs font-semibold text-foreground">{c.author_name}</p>
          <p className="text-xs text-foreground mt-0.5">{c.body}</p>
        </div>
        <div className="flex items-center gap-3 mt-0.5 ml-2">
          <span className="text-[10px] text-muted-foreground">{format(new Date(c.created_date), 'MMM d · h:mm a')}</span>
          {!isReply && (
            <button
              onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
              className="text-[10px] text-muted-foreground hover:text-accent flex items-center gap-0.5 font-medium"
            >
              <Reply className="w-2.5 h-2.5" /> Reply
            </button>
          )}
          {user?.email !== c.author_email && (
            <button
              onClick={() => setReportTarget(c)}
              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-0.5 font-medium"
            >
              <Flag className="w-2.5 h-2.5" /> Report
            </button>
          )}
        </div>

        {/* Reply box */}
        {replyingTo === c.id && (
          <div className="flex gap-2 items-center mt-2 ml-2">
            <input
              value={replyText}
              onChange={e => { setReplyText(e.target.value); setModerationMsg(null); }}
              placeholder={`Reply to ${c.author_name}...`}
              className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              onKeyDown={e => { if (e.key === 'Enter' && replyText.trim()) handleReply(c); }}
            />
            <button
              onClick={() => handleReply(c)}
              disabled={!replyText.trim() || posting}
              className="text-accent disabled:opacity-40"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Replies */}
        {!isReply && getReplies(c.id).map(reply => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="bg-secondary/30 border-t border-border/50 px-4 py-3">
      {moderationMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex gap-2 items-start mb-3">
          <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold text-amber-800">Let's keep our island kind.</p>
            <p className="text-xs text-amber-700 mt-0.5">{moderationMsg}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-accent" /></div>
      ) : topLevel.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-2.5 mb-3">
          {topLevel.map(c => renderComment(c))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleComment} className="flex gap-2 items-center">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sea-glass to-navy flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
          {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <input
          value={commentText}
          onChange={e => { setCommentText(e.target.value); setModerationMsg(null); }}
          placeholder="Write a comment..."
          className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button type="submit" disabled={!commentText.trim() || posting} className="text-accent disabled:opacity-40">
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportComment}
        reportedUserName={reportTarget?.author_name}
        contentType="comment"
      />
    </div>
  );
}