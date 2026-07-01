import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Send } from 'lucide-react';

export default function CommentSection({ postId }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => base44.entities.CommunityComment.filter({ post_id: postId }, '-created_date', 100),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const text = commentText.trim();
    setCommentText('');
    await base44.entities.CommunityComment.create({
      post_id: postId,
      author_name: user.full_name || 'Anonymous',
      author_email: user.email,
      body: text,
    });
    const post = await base44.entities.CommunityPost.get(postId);
    await base44.entities.CommunityPost.update(postId, { comments_count: (post.comments_count || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  return (
    <div className="bg-secondary/30 border-t border-border/50 px-4 py-3">
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-accent" /></div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-2.5 mb-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-driftwood to-navy flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                {c.author_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-xl px-3 py-2 border border-border/50">
                  <p className="text-xs font-semibold text-foreground">{c.author_name}</p>
                  <p className="text-xs text-foreground mt-0.5">{c.body}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 ml-2">{format(new Date(c.created_date), 'MMM d · h:mm a')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sea-glass to-navy flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
          {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <input
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button type="submit" disabled={!commentText.trim()} className="text-accent disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}