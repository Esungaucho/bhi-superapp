import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Heart, MessageCircle, Flag, Pin } from 'lucide-react';
import { getCategory } from '@/lib/communityCategories';
import CommentSection from './CommentSection';

const LIKED_KEY = 'bhi_liked_posts';
const REPORTED_KEY = 'bhi_reported_posts';
const REPORT_THRESHOLD = 3;

function getStoredIds(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function addStoredId(key, id) {
  const ids = getStoredIds(key);
  if (!ids.includes(id)) { ids.push(id); localStorage.setItem(key, JSON.stringify(ids)); }
}
function removeStoredId(key, id) {
  const ids = getStoredIds(key).filter(x => x !== id);
  localStorage.setItem(key, JSON.stringify(ids));
}

export default function PostCard({ post }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setLiked(getStoredIds(LIKED_KEY).includes(post.id));
    setReported(getStoredIds(REPORTED_KEY).includes(post.id));
  }, [post.id]);

  const cat = getCategory(post.category);
  const isUrgent = post.category === 'urgent_update';
  const authorInitial = post.author_name?.charAt(0)?.toUpperCase() || '?';

  const handleLike = async () => {
    if (liked) {
      removeStoredId(LIKED_KEY, post.id);
      setLiked(false);
      await base44.entities.CommunityPost.update(post.id, { likes_count: Math.max((post.likes_count || 0) - 1, 0) });
    } else {
      addStoredId(LIKED_KEY, post.id);
      setLiked(true);
      await base44.entities.CommunityPost.update(post.id, { likes_count: (post.likes_count || 0) + 1 });
    }
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  const handleReport = async () => {
    if (reported) return;
    addStoredId(REPORTED_KEY, post.id);
    setReported(true);
    const newCount = (post.report_count || 0) + 1;
    const updates = { report_count: newCount };
    if (newCount >= REPORT_THRESHOLD) {
      updates.is_hidden = true;
    }
    await base44.entities.CommunityPost.update(post.id, updates);
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  return (
    <div className={`bg-card rounded-2xl border border-border overflow-hidden ${isUrgent ? 'ring-1 ring-amber-300/60' : ''} ${post.is_pinned ? 'ring-1 ring-accent/30' : ''}`}>
      {/* Pinned / Urgent banner */}
      {(post.is_pinned || isUrgent) && (
        <div className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${isUrgent ? 'bg-amber-50 text-amber-700' : 'bg-accent/10 text-accent'}`}>
          {post.is_pinned && <><Pin className="w-3 h-3" /> Pinned by Admin</>}
          {post.is_pinned && isUrgent && <span>·</span>}
          {isUrgent && <>🚨 Urgent Update</>}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sea-glass to-navy flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            <span className="text-accent font-medium">{cat.emoji} {cat.label}</span>
            <span>·</span>
            <span>{format(new Date(post.created_date), 'MMM d · h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] text-accent bg-accent/10 rounded-full px-2 py-0.5">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground border-t border-border/50">
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count || 0}</span>
        <span>{post.comments_count || 0} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border/50">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${liked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button
          onClick={handleReport}
          disabled={reported}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${reported ? 'text-muted-foreground/50' : 'text-muted-foreground hover:text-destructive'}`}
        >
          <Flag className="w-4 h-4" />
          {reported ? 'Reported' : 'Report'}
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}