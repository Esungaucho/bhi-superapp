import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  Heart, MessageCircle, Flag, Pin, Bookmark, Share2, Ban, MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { getCategory } from '@/lib/communityCategories';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';

const LIKED_KEY = 'bhi_liked_posts';
const SAVED_KEY = 'bhi_saved_posts';

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

export default function PostCard({ post, blockedEmails = [] }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [blockMsg, setBlockMsg] = useState(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  useEffect(() => {
    setLiked(getStoredIds(LIKED_KEY).includes(post.id));
    setSaved(getStoredIds(SAVED_KEY).includes(post.id));
  }, [post.id]);

  // Don't render posts from blocked users
  if (blockedEmails.includes(post.author_email)) return null;

  const cat = getCategory(post.category);
  const isUrgent = post.category === 'urgent_update';
  const authorInitial = post.author_name?.charAt(0)?.toUpperCase() || '?';
  const isOwnPost = user?.email === post.author_email;

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

  const handleSave = () => {
    if (saved) {
      removeStoredId(SAVED_KEY, post.id);
      setSaved(false);
    } else {
      addStoredId(SAVED_KEY, post.id);
      setSaved(true);
    }
  };

  const handleShare = async () => {
    const text = `${post.author_name} on BHI Community: ${post.body?.slice(0, 100)}...`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BHI Island Community', text, url: window.location.href });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setBlockMsg('Post copied to clipboard');
      setTimeout(() => setBlockMsg(null), 2000);
    } catch {}
  };

  const handleReport = async ({ reason, reason_details }) => {
    await base44.entities.CommunityReport.create({
      reported_user_name: post.author_name,
      reported_user_email: post.author_email,
      reporting_user_name: user?.full_name || 'Anonymous',
      reporting_user_email: user?.email,
      content_type: 'post',
      content_id: post.id,
      content_snapshot: post.body,
      reason,
      reason_details,
    });
    const newCount = (post.report_count || 0) + 1;
    const updates = { report_count: newCount };
    if (newCount >= 3) updates.is_hidden = true;
    await base44.entities.CommunityPost.update(post.id, updates);
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  const handleBlock = async () => {
    setShowMenu(false);
    if (!user?.email || isOwnPost) return;
    await base44.entities.UserBlock.create({
      blocker_email: user.email,
      blocker_name: user.full_name || 'Anonymous',
      blocked_email: post.author_email,
      blocked_name: post.author_name,
    });
    setBlockMsg(`You will no longer see posts from ${post.author_name}`);
    setTimeout(() => setBlockMsg(null), 3000);
    queryClient.invalidateQueries({ queryKey: ['userBlocks'] });
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  return (
    <>
      <div className={`bg-card rounded-2xl border border-border overflow-hidden ${isUrgent ? 'ring-1 ring-amber-300/60' : ''} ${post.is_pinned ? 'ring-1 ring-accent/30' : ''}`}>
        {/* Pinned / Urgent banner */}
        {(post.is_pinned || isUrgent) && (
          <div className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${isUrgent ? 'bg-amber-50 text-amber-700' : 'bg-accent/10 text-accent'}`}>
            {post.is_pinned && <><Pin className="w-3 h-3" /> Pinned by Admin</>}
            {post.is_pinned && isUrgent && <span>·</span>}
            {isUrgent && <><AlertTriangle className="w-3 h-3" /> Urgent Update</>}
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
              <span className="inline-flex items-center gap-1 text-ocean font-medium">
                {cat.Icon && <cat.Icon className="w-3 h-3" strokeWidth={1.5} />}
                {cat.label}
              </span>
              <span>·</span>
              <span>{format(new Date(post.created_date), 'MMM d · h:mm a')}</span>
            </div>
          </div>
          {/* More menu */}
          {!isOwnPost && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-luxe-lg py-1 w-44">
                    <button
                      onClick={handleBlock}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" strokeWidth={1.5} /> Block User
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setShowReport(true); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-sand/40 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" strokeWidth={1.5} /> Report Post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} strokeWidth={1.5} />
            Like
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${showComments ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            Comment
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${saved ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} strokeWidth={1.5} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            Share
          </button>
        </div>

        {/* Toast */}
        {blockMsg && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-full shadow-luxe-lg z-30 whitespace-nowrap">
            {blockMsg}
          </div>
        )}

        {/* Comments */}
        {showComments && <CommentSection postId={post.id} postAuthorEmail={post.author_email} blockedEmails={blockedEmails} />}
      </div>

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        onSubmit={handleReport}
        reportedUserName={post.author_name}
        contentType="post"
      />
    </>
  );
}